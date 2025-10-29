"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted, convertManwonToWon, convertWonToManwon } from "@/utils/formatNumber";
import minimumLivingCostData from "@/data/minimumLivingCost.json";

interface FormData {
  totalDebt: number;
  monthlyIncome: number;
  assetValue: number;
  dependents: number;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    totalDebt: 0,
    monthlyIncome: 0,
    assetValue: 0,
    dependents: 0,
  });

  const totalSteps = 4;

  const handleNext = (field: keyof FormData, value: number) => {
    setFormData({ ...formData, [field]: value });
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(5); // 결과 페이지
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateReductionRate = () => {
    const { totalDebt, monthlyIncome, assetValue, dependents } = formData;

    // 최저생계비 계산 (소수점 지원 - 선형 보간)
    const clampedDependents = Math.max(0, Math.min(dependents, 4));
    const floorDependents = Math.floor(clampedDependents);
    const ceilDependents = Math.ceil(clampedDependents);
    const fraction = clampedDependents - floorDependents;

    const floorKey = String(floorDependents) as keyof typeof minimumLivingCostData;
    const ceilKey = String(ceilDependents) as keyof typeof minimumLivingCostData;

    const floorCost = minimumLivingCostData[floorKey] || 0;
    const ceilCost = minimumLivingCostData[ceilKey] || floorCost;

    // 선형 보간으로 최저생계비 계산
    const minimumLivingCost = floorCost * (1 - fraction) + ceilCost * fraction;

    // 변제 가능 금액 = (월 소득 - 최저생계비) × 36개월
    const monthlyRepayment = Math.max(monthlyIncome - minimumLivingCost, 0);
    const totalRepayment = monthlyRepayment * 36;

    // 청산가치 (자산 가액)
    const liquidationValue = assetValue;

    // 변제액은 청산가치와 변제 가능 금액 중 큰 금액
    const repaymentAmount = Math.max(totalRepayment, liquidationValue);

    // 탕감률 계산
    const reductionAmount = totalDebt - repaymentAmount;
    const reductionRate = totalDebt > 0 ? (reductionAmount / totalDebt) * 100 : 0;

    return {
      reductionRate: Math.max(0, Math.min(100, reductionRate)),
      repaymentAmount: Math.max(0, repaymentAmount),
      reductionAmount: Math.max(0, reductionAmount),
      monthlyPayment: repaymentAmount > 0 ? repaymentAmount / 36 : 0,
    };
  };

  const result = currentStep === 5 ? calculateReductionRate() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        {currentStep <= totalSteps && (
          <div className="mb-8 animate-fadeIn">
            <div className="flex justify-between mb-3">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`progress-bar-segment ${
                    step <= currentStep ? "progress-bar-completed" : "progress-bar-incomplete"
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm font-medium text-gray-600">
              {currentStep} / {totalSteps} 단계
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-scaleIn border border-gray-100">
          {currentStep === 1 && (
            <StepOne
              onNext={(value) => handleNext("totalDebt", value)}
              initialValue={formData.totalDebt}
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              onNext={(value) => handleNext("monthlyIncome", value)}
              onBack={handleBack}
              initialValue={formData.monthlyIncome}
            />
          )}
          {currentStep === 3 && (
            <StepThree
              onNext={(value) => handleNext("assetValue", value)}
              onBack={handleBack}
              initialValue={formData.assetValue}
            />
          )}
          {currentStep === 4 && (
            <StepFour
              onNext={(value) => handleNext("dependents", value)}
              onBack={handleBack}
              initialValue={formData.dependents}
            />
          )}
          {currentStep === 5 && result && (
            <ResultPage
              result={result}
              formData={formData}
              onRestart={() => {
                setCurrentStep(1);
                setFormData({
                  totalDebt: 0,
                  monthlyIncome: 0,
                  assetValue: 0,
                  dependents: 0,
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function StepOne({
  onNext,
  initialValue,
}: {
  onNext: (value: number) => void;
  initialValue: number;
}) {
  const manwonValue = initialValue > 0 ? convertWonToManwon(initialValue) : 0;
  const [value, setValue] = useState(manwonValue > 0 ? manwonValue.toLocaleString() : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleNumberInput(e.target.value);
    setValue(formatted);
  };

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    const wonValue = convertManwonToWon(numericManwon);
    onNext(wonValue);
  };

  const handleQuickAdd = (amount: number) => {
    const currentValue = value ? parseNumberFromFormatted(value) : 0;
    const newValue = currentValue + amount;
    setValue(newValue.toLocaleString());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value && parseNumberFromFormatted(value) > 0) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          총 부채액은 얼마인가요?
        </h2>
        <p className="text-gray-600">모든 부채를 합산한 금액을 입력해주세요</p>
      </div>
      <div>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="w-full text-4xl font-bold bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:bg-white rounded-xl outline-none py-4 px-4 text-gray-900 transition-all"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-semibold mt-2">만원</p>
      </div>

      {/* Quick Input Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => handleQuickAdd(100)} className="quick-button">+100</button>
        <button onClick={() => handleQuickAdd(500)} className="quick-button">+500</button>
        <button onClick={() => handleQuickAdd(1000)} className="quick-button">+1000</button>
        <button onClick={() => handleQuickAdd(3000)} className="quick-button">+3000</button>
        <button onClick={() => handleQuickAdd(5000)} className="quick-button">+5000</button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!value || parseNumberFromFormatted(value) <= 0}
        className="w-full primary-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  );
}

function StepTwo({
  onNext,
  onBack,
  initialValue,
}: {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
}) {
  const manwonValue = initialValue > 0 ? convertWonToManwon(initialValue) : 0;
  const [value, setValue] = useState(manwonValue > 0 ? manwonValue.toLocaleString() : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleNumberInput(e.target.value);
    setValue(formatted);
  };

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    const wonValue = convertManwonToWon(numericManwon);
    onNext(wonValue);
  };

  const handleQuickAdd = (amount: number) => {
    const currentValue = value ? parseNumberFromFormatted(value) : 0;
    const newValue = currentValue + amount;
    setValue(newValue.toLocaleString());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value && parseNumberFromFormatted(value) >= 0) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          월 소득은 얼마인가요?
        </h2>
        <p className="text-gray-600">세전 월 평균 소득을 입력해주세요</p>
      </div>
      <div>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="w-full text-4xl font-bold bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:bg-white rounded-xl outline-none py-4 px-4 text-gray-900 transition-all"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-semibold mt-2">만원</p>
      </div>

      {/* Quick Input Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => handleQuickAdd(100)} className="quick-button">+100</button>
        <button onClick={() => handleQuickAdd(200)} className="quick-button">+200</button>
        <button onClick={() => handleQuickAdd(300)} className="quick-button">+300</button>
        <button onClick={() => handleQuickAdd(500)} className="quick-button">+500</button>
        <button onClick={() => handleQuickAdd(1000)} className="quick-button">+1000</button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 secondary-button"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!value || parseNumberFromFormatted(value) < 0}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  );
}

function StepThree({
  onNext,
  onBack,
  initialValue,
}: {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
}) {
  const manwonValue = initialValue > 0 ? convertWonToManwon(initialValue) : 0;
  const [value, setValue] = useState(manwonValue > 0 ? manwonValue.toLocaleString() : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleNumberInput(e.target.value);
    setValue(formatted);
  };

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    const wonValue = convertManwonToWon(numericManwon);
    onNext(wonValue);
  };

  const handleQuickAdd = (amount: number) => {
    const currentValue = value ? parseNumberFromFormatted(value) : 0;
    const newValue = currentValue + amount;
    setValue(newValue.toLocaleString());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value && parseNumberFromFormatted(value) >= 0) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          보유 자산 가액은 얼마인가요?
        </h2>
        <p className="text-gray-600">부동산, 차량 등 모든 자산의 시장 가치</p>
      </div>
      <div>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="w-full text-4xl font-bold bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:bg-white rounded-xl outline-none py-4 px-4 text-gray-900 transition-all"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-semibold mt-2">만원</p>
      </div>

      {/* Quick Input Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => handleQuickAdd(100)} className="quick-button">+100</button>
        <button onClick={() => handleQuickAdd(500)} className="quick-button">+500</button>
        <button onClick={() => handleQuickAdd(1000)} className="quick-button">+1000</button>
        <button onClick={() => handleQuickAdd(3000)} className="quick-button">+3000</button>
        <button onClick={() => handleQuickAdd(5000)} className="quick-button">+5000</button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 secondary-button"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!value || parseNumberFromFormatted(value) < 0}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  );
}

function StepFour({
  onNext,
  onBack,
  initialValue,
}: {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
}) {
  const [value, setValue] = useState(initialValue > 0 ? initialValue.toString() : "");

  const handleSubmit = () => {
    onNext(Number(value));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit();
    }
  };

  const isValid = value && Number(value) >= 0 && Number(value) <= 4;

  return (
    <div className="space-y-6 animate-slideIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          부양가족은 몇 명인가요?
        </h2>
        <p className="text-gray-600">본인을 제외한 부양가족 수 (소수점 입력 가능)</p>
      </div>
      <div>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full text-4xl font-bold bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:bg-white rounded-xl outline-none py-4 px-4 text-gray-900 transition-all"
          placeholder="0"
          autoFocus
          min="0"
          max="4"
          step="0.1"
        />
        <p className="text-right text-primary-600 font-semibold mt-2">명</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 secondary-button"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          결과 확인
        </button>
      </div>
    </div>
  );
}

function ResultPage({
  result,
  formData,
  onRestart,
}: {
  result: {
    reductionRate: number;
    repaymentAmount: number;
    reductionAmount: number;
    monthlyPayment: number;
  };
  formData: FormData;
  onRestart: () => void;
}) {
  // 탕감률에 따른 색상 결정
  const getColorByRate = (rate: number) => {
    if (rate >= 70) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', stroke: '#16a34a' };
    if (rate >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', stroke: '#ca8a04' };
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', stroke: '#dc2626' };
  };

  const colors = getColorByRate(result.reductionRate);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (result.reductionRate / 100) * circumference;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Progress Circle */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">예상 탕감률</h2>
        <div className="relative inline-block">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke={colors.stroke}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-5xl font-bold ${colors.text}`}>
                {result.reductionRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mt-4 text-lg">
          약 <span className="font-bold text-gray-900">{result.reductionAmount.toLocaleString()}원</span> 탕감 예상
        </p>
      </div>

      {/* Details Section */}
      <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 space-y-3 animate-slideIn`}>
        <h3 className="font-bold text-gray-900 mb-4 text-lg">💰 상세 내역</h3>

        <div className="flex justify-between items-center py-2">
          <span className="text-gray-700 flex items-center gap-2">
            <span>💸</span> 총 부채액
          </span>
          <span className="font-bold text-gray-900 text-lg">
            {formData.totalDebt.toLocaleString()}원
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-gray-700 flex items-center gap-2">
            <span>💵</span> 예상 변제액
          </span>
          <span className="font-bold text-gray-900 text-lg">
            {result.repaymentAmount.toLocaleString()}원
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-gray-700 flex items-center gap-2">
            <span>📅</span> 월 상환액 (36개월)
          </span>
          <span className="font-bold text-primary-600 text-lg">
            {result.monthlyPayment.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* Input Summary */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-3 animate-slideIn" style={{animationDelay: '0.1s'}}>
        <h3 className="font-bold text-gray-900 mb-4">📋 입력 정보</h3>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center gap-2">
            <span>💼</span> 월 소득
          </span>
          <span className="text-gray-900 font-semibold">
            {formData.monthlyIncome.toLocaleString()}원
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center gap-2">
            <span>🏠</span> 자산 가액
          </span>
          <span className="text-gray-900 font-semibold">
            {formData.assetValue.toLocaleString()}원
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center gap-2">
            <span>👨‍👩‍👧‍👦</span> 부양가족
          </span>
          <span className="text-gray-900 font-semibold">{formData.dependents}명</span>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 animate-slideIn" style={{animationDelay: '0.2s'}}>
        <p className="text-sm text-amber-800 leading-relaxed">
          ⚠️ <strong>안내:</strong> 이 결과는 참고용이며, 실제 탕감률은 법원의 판단과 개인의 상황에 따라 달라질 수 있습니다. 정확한 상담을 위해 전문가와 상의하시기 바랍니다.
        </p>
      </div>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="w-full primary-button animate-slideIn"
        style={{animationDelay: '0.3s'}}
      >
        다시 계산하기
      </button>
    </div>
  );
}
