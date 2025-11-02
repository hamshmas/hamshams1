/**
 * 개인회생 탕감률 계산기
 * Copyright (c) 2025. All rights reserved.
 * 무단 복제 및 재배포를 금지합니다.
 */

"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted, convertManwonToWon, convertWonToManwon } from "@/utils/formatNumber";
import { PRIORITY_REPAYMENT } from "@/app/constants";
import type { FormData, CalculationResult, HousingType, RegionType } from "@/app/types";
import {
  AssetInputModeSelection,
  HousingTypeSelection,
  AddressSelection,
  MonthlyRentDepositInput,
  SpouseHousingCheck,
  CourtJurisdictionSelection,
} from "@/app/components/asset";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    totalDebt: 0,
    monthlyIncome: 0,
    assetValue: 0,
    dependents: 1,
  });
  const [result, setResult] = useState<CalculationResult | null>(null);

  // 3단계 자산 계산 관련 state
  const [assetInputMode, setAssetInputMode] = useState<'direct' | 'calculate' | null>(null);
  const [assetSubStep, setAssetSubStep] = useState(0);
  const [housingType, setHousingType] = useState<'owned' | 'jeonse' | 'monthly' | 'free' | null>(null);
  const [hasMortgage, setHasMortgage] = useState<boolean | null>(null);
  const [mortgageAmount, setMortgageAmount] = useState(0);
  const [kbPrice, setKbPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<RegionType | null>(null);
  const [isSpouseHousing, setIsSpouseHousing] = useState<boolean | null>(null);
  const [isMainCourtJurisdiction, setIsMainCourtJurisdiction] = useState<boolean | null>(null);

  const totalSteps = 4;

  const handleNext = async (field: keyof FormData, value: number) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);

      try {
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });

        if (!response.ok) {
          throw new Error('계산 중 오류가 발생했습니다.');
        }

        const calculationResult = await response.json();
        setResult(calculationResult);
        setCurrentStep(5);
      } catch (error) {
        console.error('계산 오류:', error);
        alert('계산 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // 3단계로 돌아갈 때 상태 초기화
      if (currentStep === 4) {
        setAssetInputMode(null);
        setAssetSubStep(0);
        setHousingType(null);
        setHasMortgage(null);
        setMortgageAmount(0);
        setKbPrice(0);
        setDepositAmount(0);
        setSelectedRegion(null);
        setIsSpouseHousing(null);
        setIsMainCourtJurisdiction(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/10 via-white to-accent-500/10 flex items-center justify-center p-3 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Progress Steps */}
        {currentStep <= totalSteps && (
          <div className="mb-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-all duration-500 ${
                    step <= currentStep
                      ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg scale-110'
                      : 'bg-white/60 text-gray-400 border-2 border-gray-200'
                  }`}>
                    {step < currentStep ? '✓' : step}
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-1 rounded-full transition-all duration-500 ${
                      step < currentStep ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-xs font-semibold text-gray-600 bg-white/60 py-1 px-3 rounded-full">
              {currentStep} / {totalSteps} 단계
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="glass-card p-5 animate-scaleIn shadow-xl">
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <>
              {currentStep === 1 && (
                <InputStep
                  title="총 부채액은 얼마인가요?"
                  subtitle="모든 부채를 합산한 금액"
                  onNext={(value) => handleNext("totalDebt", value)}
                  initialValue={formData.totalDebt}
                  quickAmounts={[100, 500, 1000, 3000, 5000]}
                  minValue={1}
                />
              )}
              {currentStep === 2 && (
                <InputStep
                  title="월 소득은 얼마인가요?"
                  subtitle="실수령액 기준"
                  onNext={(value) => handleNext("monthlyIncome", value)}
                  onBack={handleBack}
                  initialValue={formData.monthlyIncome}
                  quickAmounts={[100, 200, 300, 500, 1000]}
                  minValue={0}
                />
              )}
              {currentStep === 3 && (
                <>
                  {assetInputMode === null && (
                    <AssetInputModeSelection
                      onSelect={(mode) => {
                        setAssetInputMode(mode);
                        if (mode === 'calculate') {
                          setAssetSubStep(0);
                        }
                      }}
                      onBack={handleBack}
                    />
                  )}
                  {assetInputMode === 'direct' && (
                    <InputStep
                      title="보유 자산 가액은 얼마인가요?"
                      subtitle="부동산, 차량 등 모든 자산의 시장 가치"
                      onNext={(value) => handleNext("assetValue", value)}
                      onBack={() => {
                        setAssetInputMode(null);
                      }}
                      initialValue={formData.assetValue}
                      quickAmounts={[100, 500, 1000, 3000, 5000]}
                      minValue={0}
                    />
                  )}
                  {assetInputMode === 'calculate' && assetSubStep === 0 && (
                    <HousingTypeSelection
                      onSelect={(type) => {
                        setHousingType(type);
                        if (type === 'free') {
                          // 무상거주는 다음 단계로
                          setAssetSubStep(1);
                        } else {
                          setAssetSubStep(1);
                        }
                      }}
                      onBack={() => {
                        setAssetInputMode(null);
                        setAssetSubStep(0);
                      }}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'owned' && assetSubStep === 1 && (
                    <MortgageCheck
                      onSelect={(has) => {
                        setHasMortgage(has);
                        setAssetSubStep(2);
                      }}
                      onBack={() => {
                        setAssetSubStep(0);
                        setHousingType(null);
                      }}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'owned' && hasMortgage === true && assetSubStep === 2 && (
                    <MortgageAmountInput
                      onNext={(value) => {
                        setMortgageAmount(value);
                        setAssetSubStep(3);
                      }}
                      onBack={() => {
                        setAssetSubStep(1);
                        setHasMortgage(null);
                      }}
                      initialValue={mortgageAmount}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'owned' &&
                   ((hasMortgage === false && assetSubStep === 2) || (hasMortgage === true && assetSubStep === 3)) && (
                    <KBPriceInput
                      onNext={(value) => {
                        setKbPrice(value);
                        const finalAsset = value - mortgageAmount;
                        handleNext("assetValue", Math.max(0, finalAsset));
                      }}
                      onBack={() => {
                        if (hasMortgage) {
                          setAssetSubStep(2);
                        } else {
                          setAssetSubStep(1);
                        }
                      }}
                      initialValue={kbPrice}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'jeonse' && assetSubStep === 1 && (
                    <JeonseDepositInput
                      onNext={(value) => {
                        setDepositAmount(value);
                        setAssetSubStep(2);
                      }}
                      onBack={() => {
                        setAssetSubStep(0);
                        setHousingType(null);
                      }}
                      initialValue={depositAmount}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'jeonse' && assetSubStep === 2 && (
                    <AddressSelection
                      onNext={(region) => {
                        setSelectedRegion(region);
                        const assetDeposit = Math.max(0, depositAmount - PRIORITY_REPAYMENT[region]);
                        handleNext("assetValue", assetDeposit);
                      }}
                      onBack={() => {
                        setAssetSubStep(1);
                      }}
                      type="deposit"
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'monthly' && assetSubStep === 1 && (
                    <MonthlyRentDepositInput
                      onNext={(value) => {
                        setDepositAmount(value);
                        setAssetSubStep(2);
                      }}
                      onBack={() => {
                        setAssetSubStep(0);
                        setHousingType(null);
                      }}
                      initialValue={depositAmount}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'monthly' && assetSubStep === 2 && (
                    <AddressSelection
                      onNext={(region) => {
                        setSelectedRegion(region);
                        const assetDeposit = Math.max(0, depositAmount - PRIORITY_REPAYMENT[region]);
                        handleNext("assetValue", assetDeposit);
                      }}
                      onBack={() => {
                        setAssetSubStep(1);
                      }}
                      type="deposit"
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'free' && assetSubStep === 1 && (
                    <SpouseHousingCheck
                      onSelect={(isSpouse) => {
                        setIsSpouseHousing(isSpouse);
                        if (!isSpouse) {
                          // 배우자 명의가 아니면 자산 0
                          handleNext("assetValue", 0);
                        } else {
                          setAssetSubStep(2);
                        }
                      }}
                      onBack={() => {
                        setAssetSubStep(0);
                        setHousingType(null);
                      }}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'free' && isSpouseHousing === true && assetSubStep === 2 && (
                    <CourtJurisdictionSelection
                      onNext={(isMainCourt) => {
                        setIsMainCourtJurisdiction(isMainCourt);
                        if (isMainCourt) {
                          // 주요 법원 관할이면 자산 0
                          handleNext("assetValue", 0);
                        } else {
                          setAssetSubStep(3);
                        }
                      }}
                      onBack={() => {
                        setAssetSubStep(1);
                        setIsSpouseHousing(null);
                      }}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'free' && isMainCourtJurisdiction === false && assetSubStep === 3 && (
                    <MortgageCheck
                      onSelect={(has) => {
                        setHasMortgage(has);
                        setAssetSubStep(4);
                      }}
                      onBack={() => {
                        setAssetSubStep(2);
                        setIsMainCourtJurisdiction(null);
                      }}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'free' && hasMortgage === true && assetSubStep === 4 && (
                    <MortgageAmountInput
                      onNext={(value) => {
                        setMortgageAmount(value);
                        setAssetSubStep(5);
                      }}
                      onBack={() => {
                        setAssetSubStep(3);
                        setHasMortgage(null);
                      }}
                      initialValue={mortgageAmount}
                    />
                  )}
                  {assetInputMode === 'calculate' && housingType === 'free' &&
                   ((hasMortgage === false && assetSubStep === 4) || (hasMortgage === true && assetSubStep === 5)) && (
                    <KBPriceInput
                      onNext={(value) => {
                        setKbPrice(value);
                        const assetSpouse = value - mortgageAmount;
                        // 배우자 명의 주택이므로 청산가치는 asset_spouse / 2
                        handleNext("assetValue", Math.max(0, assetSpouse / 2));
                      }}
                      onBack={() => {
                        if (hasMortgage) {
                          setAssetSubStep(4);
                        } else {
                          setAssetSubStep(3);
                        }
                      }}
                      initialValue={kbPrice}
                    />
                  )}
                </>
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
                    setFormData({ totalDebt: 0, monthlyIncome: 0, assetValue: 0, dependents: 1 });
                    setResult(null);
                    setAssetInputMode(null);
                    setAssetSubStep(0);
                    setHousingType(null);
                    setHasMortgage(null);
                    setMortgageAmount(0);
                    setKbPrice(0);
                    setDepositAmount(0);
                    setSelectedRegion(null);
                    setIsSpouseHousing(null);
                    setIsMainCourtJurisdiction(null);
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 통합 입력 컴포넌트
function InputStep({
  title,
  subtitle,
  onNext,
  onBack,
  initialValue,
  quickAmounts,
  minValue,
}: {
  title: string;
  subtitle: string;
  onNext: (value: number) => void;
  onBack?: () => void;
  initialValue: number;
  quickAmounts: number[];
  minValue: number;
}) {
  const manwonValue = initialValue > 0 ? convertWonToManwon(initialValue) : 0;
  const [value, setValue] = useState(manwonValue > 0 ? manwonValue.toLocaleString() : "");

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    onNext(convertManwonToWon(numericManwon));
  };

  const handleQuickAdd = (amount: number) => {
    const currentValue = value ? parseNumberFromFormatted(value) : 0;
    setValue((currentValue + amount).toLocaleString());
  };

  const isValid = value && parseNumberFromFormatted(value) >= minValue;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(handleNumberInput(e.target.value))}
          onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
          className="input-modern"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">만원</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickAmounts.map((amount) => (
          <button key={amount} onClick={() => handleQuickAdd(amount)} className="quick-button text-xs py-1.5 px-3">
            +{amount}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {onBack && (
          <button onClick={onBack} className="w-1/3 secondary-button text-sm py-2.5">
            이전
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`${onBack ? 'w-2/3' : 'w-full'} primary-button disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5`}
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
  const isValid = value && Number(value) >= 1 && Number(value) <= 5;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          가구원은 몇 명인가요?
        </h2>
        <p className="text-gray-600 text-sm">본인 포함 가구원 수 (소수점 가능)</p>
      </div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && isValid && onNext(Number(value))}
          className="input-modern"
          placeholder="1"
          autoFocus
          min="1"
          max="5"
          step="0.1"
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">명</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onBack} className="w-1/3 secondary-button text-sm py-2.5">
          이전
        </button>
        <button
          onClick={() => onNext(Number(value))}
          disabled={!isValid}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5"
        >
          결과 확인
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-[350px] flex flex-col items-center justify-center space-y-6 animate-fadeIn">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 animate-pulse flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          탕감률 계산 중...
        </h3>
        <p className="text-gray-600 text-sm animate-pulse">정보를 분석하고 있습니다</p>
      </div>
      <div className="w-full max-w-xs space-y-2">
        {['부채 정보 분석', '청산가치 계산', '라이프니츠식 적용', '최종 탕감률 산출'].map((text, i) => (
          <div key={i} className="flex items-center gap-2 animate-slideIn" style={{ animationDelay: `${i * 0.6}s` }}>
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 animate-pulse"></div>
            <span className="text-gray-700 text-xs font-medium">{text}</span>
          </div>
        ))}
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
    repaymentPeriod: number;
    liquidationValueViolation: boolean;
  };
  formData: FormData;
  onRestart: () => void;
}) {
  const getColorByRate = (rate: number) => {
    if (rate >= 70) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', stroke: '#16a34a' };
    if (rate >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', stroke: '#ca8a04' };
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', stroke: '#dc2626' };
  };

  const colors = getColorByRate(result.reductionRate);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (result.reductionRate / 100) * circumference;

  return (
    <div className="space-y-4 animate-fadeIn">
      {result.liquidationValueViolation ? (
        <div className="text-center mb-4">
          <div className="relative inline-block animate-scaleIn mb-3">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-xl">
              <span className="text-6xl">🚨</span>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">
            개인회생 신청 불가
          </h2>
          <p className="text-gray-700 text-sm max-w-sm mx-auto">
            청산가치를 충족하면서 총 부채액을 초과하지 않는 변제계획을 수립할 수 없습니다
          </p>
        </div>
      ) : (
        <div className="text-center mb-4">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-3">
            예상 탕감률
          </h2>
          <div className="relative inline-block animate-scaleIn">
            <svg className="w-40 h-40 transform -rotate-90 drop-shadow-xl" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" stroke="#e5e7eb" strokeWidth="8" fill="none" />
              <circle
                cx="60" cy="60" r="54" stroke={colors.stroke} strokeWidth="8" fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-4xl font-black ${colors.text}`}>
                {Math.round(result.reductionRate)}%
              </div>
            </div>
          </div>
          <div className="mt-3 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl p-3">
            <p className="text-gray-700 text-sm">
              약 <span className="font-black text-lg text-transparent bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text">{Math.round(result.reductionAmount).toLocaleString()}원</span> 탕감 예상
            </p>
          </div>
        </div>
      )}

      {!result.liquidationValueViolation && (
        <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-4 space-y-2`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-lg">💰</span>
            <h3 className="font-black text-gray-900 text-base">상세 내역</h3>
          </div>
          <div className="grid gap-2">
            {[
              { icon: '💸', label: '총 부채액', value: formData.totalDebt },
              { icon: '💵', label: '예상 변제액', value: result.repaymentAmount },
              { icon: '📅', label: '월 상환액', value: result.monthlyPayment, highlight: true },
              { icon: '⏱️', label: '변제 기간', value: result.repaymentPeriod, unit: '개월', highlight: true },
            ].map((item, i) => (
              <div key={i} className={`flex justify-between items-center py-2 px-3 rounded-lg ${item.highlight ? 'bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200' : 'bg-white/60'}`}>
                <span className={`${item.highlight ? 'text-primary-700 font-bold' : 'text-gray-700 font-semibold'} flex items-center gap-1.5 text-sm`}>
                  <span className="text-base">{item.icon}</span> {item.label}
                </span>
                <span className={`font-black text-base ${item.highlight ? 'text-primary-600' : 'text-gray-900'}`}>
                  {typeof item.value === 'number' ? Math.round(item.value).toLocaleString() : item.value}{item.unit || '원'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-lg">📋</span>
          <h3 className="font-black text-gray-900 text-base">입력 정보</h3>
        </div>
        <div className="grid gap-1.5">
          {[
            { icon: '💼', label: '월 소득', value: formData.monthlyIncome },
            { icon: '🏠', label: '자산 가액', value: formData.assetValue },
            { icon: '👨‍👩‍👧‍👦', label: '가구원', value: formData.dependents, unit: '명' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 px-3 bg-white/60 rounded-lg">
              <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <span className="text-base">{item.icon}</span> {item.label}
              </span>
              <span className="text-gray-900 font-bold text-sm">
                {typeof item.value === 'number' ? (item.unit === '명' ? item.value : Math.round(item.value)).toLocaleString() : item.value}{item.unit || '원'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {result.liquidationValueViolation ? (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
          <p className="text-sm font-bold text-red-900 mb-2">상세 정보</p>
          <div className="space-y-1.5 text-xs text-red-800">
            <p>• 총 부채액: {Math.round(formData.totalDebt).toLocaleString()}원</p>
            <p>• 청산가치: {Math.round(formData.assetValue).toLocaleString()}원</p>
            <p>• 월 변제 가능액: {Math.round(result.monthlyPayment).toLocaleString()}원</p>
            <p className="pt-1.5 border-t border-red-200 font-semibold">
              💡 개인회생을 진행하려면 청산가치 이상을 변제하되 총 부채액을 초과할 수 없습니다. 현재 조건으로는 이를 충족하는 변제계획 수립이 어렵습니다.
            </p>
            <p className="font-semibold text-red-900">
              ⚠️ 전문가(변호사/법무사)와 상담하여 다른 해결방안을 모색하시기 바랍니다.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3">
            <p className="font-bold text-blue-900 text-xs mb-1">📊 계산 방식</p>
            <p className="text-[11px] text-blue-800">
              라이프니츠식(법정이율 연 5%)으로 계산. 기본 변제기간은 36개월이며, 전액 변제 시 단축되거나 청산가치 충족을 위해 최대 60개월까지 연장될 수 있습니다.
            </p>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3">
            <p className="font-bold text-amber-900 text-xs mb-1">⚠️ 안내사항</p>
            <p className="text-[11px] text-amber-800">
              이 결과는 참고용이며, 실제 탕감률은 법원 판단과 개인 상황에 따라 달라질 수 있습니다.
            </p>
          </div>
        </>
      )}

      <button onClick={onRestart} className="w-full primary-button text-sm py-2.5">
        다시 계산하기
      </button>
    </div>
  );
}

// 자가: 근저당권 여부 확인
function MortgageCheck({
  onSelect,
  onBack,
}: {
  onSelect: (has: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          근저당권이 설정되어 있나요?
        </h2>
        <p className="text-gray-600 text-sm">주택담보대출 등이 있는 경우</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect(true)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-gray-900">예, 있어요</p>
              <p className="text-xs text-gray-600">주택담보대출이 있어요</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect(false)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-bold text-gray-900">아니오, 없어요</p>
              <p className="text-xs text-gray-600">대출이 없거나 전액 상환했어요</p>
            </div>
          </div>
        </button>
      </div>

      <button onClick={onBack} className="w-full secondary-button text-sm py-2.5">
        이전
      </button>
    </div>
  );
}

// KB시세 입력
function KBPriceInput({
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
  const [showLink, setShowLink] = useState(false);

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    onNext(convertManwonToWon(numericManwon));
  };

  const isValid = value && parseNumberFromFormatted(value) > 0;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          KB시세를 입력해주세요
        </h2>
        <p className="text-gray-600 text-sm">부동산의 KB시세 기준 가격</p>
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(handleNumberInput(e.target.value))}
          onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
          className="input-modern"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">만원</p>
      </div>

      {!showLink ? (
        <button
          onClick={() => setShowLink(true)}
          className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-lg py-2 text-sm hover:bg-blue-100 transition-all"
        >
          KB시세를 모르시나요?
        </button>
      ) : (
        <a
          href="https://kbland.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg py-2.5 text-sm text-center hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          🔗 KB부동산 시세 확인하기 (새 창)
        </a>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} className="w-1/3 secondary-button text-sm py-2.5">
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5"
        >
          다음
        </button>
      </div>
    </div>
  );
}

// 근저당권 금액 입력
function MortgageAmountInput({
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

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    onNext(convertManwonToWon(numericManwon));
  };

  const isValid = value && parseNumberFromFormatted(value) >= 0;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          근저당권 설정 금액은?
        </h2>
        <p className="text-gray-600 text-sm">주택담보대출 잔액</p>
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(handleNumberInput(e.target.value))}
          onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
          className="input-modern"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">만원</p>
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="w-1/3 secondary-button text-sm py-2.5">
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5"
        >
          다음
        </button>
      </div>
    </div>
  );
}

// 전세보증금 입력
function JeonseDepositInput({
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

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    onNext(convertManwonToWon(numericManwon));
  };

  const isValid = value && parseNumberFromFormatted(value) > 0;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          전세보증금은 얼마인가요?
        </h2>
        <p className="text-gray-600 text-sm">현재 거주 중인 전세 보증금</p>
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(handleNumberInput(e.target.value))}
          onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
          className="input-modern"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">만원</p>
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="w-1/3 secondary-button text-sm py-2.5">
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5"
        >
          다음
        </button>
      </div>
    </div>
  );
}
