"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted } from "@/utils/formatNumber";
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

    // 최저생계비 데이터에서 가져오기
    const dependentsKey = String(Math.min(dependents, 10)) as keyof typeof minimumLivingCostData;
    const minimumLivingCost = minimumLivingCostData[dependentsKey] || minimumLivingCostData["0"];

    // 변제 가능 금액 = (월 소득 - 최저생계비) × 60개월
    const monthlyRepayment = Math.max(monthlyIncome - minimumLivingCost, 0);
    const totalRepayment = monthlyRepayment * 60;

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
      monthlyPayment: repaymentAmount > 0 ? repaymentAmount / 60 : 0,
    };
  };

  const result = currentStep === 5 ? calculateReductionRate() : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        {currentStep <= totalSteps && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-1/4 h-2 mx-1 rounded-full ${
                    step <= currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {currentStep} / {totalSteps} 단계
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
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
  const [value, setValue] = useState(initialValue > 0 ? initialValue.toLocaleString() : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleNumberInput(e.target.value);
    setValue(formatted);
  };

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    onNext(numericValue);
  };

  return (
    <div className="space-y-6">
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
          className="w-full text-3xl font-bold border-b-2 border-gray-300 focus:border-blue-600 outline-none py-4 text-gray-900"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-gray-600 mt-2">원</p>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!value || parseNumberFromFormatted(value) <= 0}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
  const [value, setValue] = useState(initialValue > 0 ? initialValue.toLocaleString() : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleNumberInput(e.target.value);
    setValue(formatted);
  };

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    onNext(numericValue);
  };

  return (
    <div className="space-y-6">
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
          className="w-full text-3xl font-bold border-b-2 border-gray-300 focus:border-blue-600 outline-none py-4 text-gray-900"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-gray-600 mt-2">원</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!value || parseNumberFromFormatted(value) < 0}
          className="w-2/3 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
  const [value, setValue] = useState(initialValue > 0 ? initialValue.toLocaleString() : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleNumberInput(e.target.value);
    setValue(formatted);
  };

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    onNext(numericValue);
  };

  return (
    <div className="space-y-6">
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
          className="w-full text-3xl font-bold border-b-2 border-gray-300 focus:border-blue-600 outline-none py-4 text-gray-900"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-gray-600 mt-2">원</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!value || parseNumberFromFormatted(value) < 0}
          className="w-2/3 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          부양가족은 몇 명인가요?
        </h2>
        <p className="text-gray-600">본인을 제외한 부양가족 수</p>
      </div>
      <div>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full text-3xl font-bold border-b-2 border-gray-300 focus:border-blue-600 outline-none py-4 text-gray-900"
          placeholder="0"
          autoFocus
          min="0"
          max="10"
        />
        <p className="text-right text-gray-600 mt-2">명</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!value || Number(value) < 0}
          className="w-2/3 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">예상 탕감률</h2>
        <div className="text-6xl font-bold text-blue-600 my-6">
          {result.reductionRate.toFixed(1)}%
        </div>
        <p className="text-gray-600">
          약 {result.reductionAmount.toLocaleString()}원 탕감 예상
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 mb-3">상세 내역</h3>

        <div className="flex justify-between">
          <span className="text-gray-600">총 부채액</span>
          <span className="font-semibold text-gray-900">
            {formData.totalDebt.toLocaleString()}원
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">예상 변제액</span>
          <span className="font-semibold text-gray-900">
            {result.repaymentAmount.toLocaleString()}원
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">월 상환액 (60개월)</span>
          <span className="font-semibold text-gray-900">
            {result.monthlyPayment.toLocaleString()}원
          </span>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">월 소득</span>
            <span className="text-gray-900">
              {formData.monthlyIncome.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">자산 가액</span>
            <span className="text-gray-900">
              {formData.assetValue.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">부양가족</span>
            <span className="text-gray-900">{formData.dependents}명</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ 이 결과는 참고용이며, 실제 탕감률은 법원의 판단과 개인의 상황에 따라 달라질 수 있습니다.
        </p>
      </div>

      <button
        onClick={onRestart}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        다시 계산하기
      </button>
    </div>
  );
}
