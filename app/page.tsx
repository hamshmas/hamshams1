/**
 * 개인회생 탕감률 계산기
 * Copyright (c) 2025. All rights reserved.
 * 무단 복제 및 재배포를 금지합니다.
 */

"use client";

import { useState } from "react";
import { PRIORITY_REPAYMENT } from "@/app/constants";
import type { FormData, CalculationResult, CourtCode } from "@/app/types";
import {
  AssetInputModeSelection,
  HousingTypeSelection,
  SpouseHousingCheck,
  MonthlyRentDepositInput,
  SpouseHousingJurisdictionInfo,
} from "@/app/components/asset";
import { MortgageCheck, KBPriceInput, MortgageAmountInput, JeonseDepositInput } from "@/app/components/housing";
import { InputStep } from "@/app/components/steps";
import { LoadingScreen, ProgressSteps } from "@/app/components/ui";
import { ResultPage } from "@/app/components/result";
import { AddressInputStep } from "@/app/components/address";
import { DependentInputModeSelection, MaritalStatusSelection, ChildrenCountInput, SpouseIncomeCheck } from "@/app/components/dependent";
import { IncomeTypeSelection } from "@/app/components/income";
import { useAssetCalculation } from "@/app/hooks/useAssetCalculation";
import { useDependentCalculation } from "@/app/hooks/useDependentCalculation";
import { getPriorityRepaymentRegion, getCourtName } from "@/utils/courtJurisdiction";
import type { IncomeType } from "@/app/types";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    totalDebt: 0,
    monthlyIncome: 0,
    assetValue: 0,
    dependents: 1,
    homeAddress: "",
    workAddress: "",
    courtJurisdiction: "other" as CourtCode,
    priorityRepaymentRegion: "그밖의지역",
  });
  const [result, setResult] = useState<CalculationResult | null>(null);

  // 소득 관련 상태
  const [incomeType, setIncomeType] = useState<IncomeType | null>(null);
  const [incomeSubStep, setIncomeSubStep] = useState(0);

  // 자산 계산 관련 상태
  const {
    assetInputMode,
    setAssetInputMode,
    assetSubStep,
    setAssetSubStep,
    housingType,
    setHousingType,
    hasMortgage,
    setHasMortgage,
    mortgageAmount,
    setMortgageAmount,
    kbPrice,
    setKbPrice,
    depositAmount,
    setDepositAmount,
    selectedRegion,
    setSelectedRegion,
    isSpouseHousing,
    setIsSpouseHousing,
    isMainCourtJurisdiction,
    setIsMainCourtJurisdiction,
    housingAsset,
    setHousingAsset,
    otherAsset,
    setOtherAsset,
    resetAssetState,
  } = useAssetCalculation();

  // 부양가족 계산 관련 상태
  const {
    dependentInputMode,
    setDependentInputMode,
    dependentSubStep,
    setDependentSubStep,
    maritalStatus,
    setMaritalStatus,
    childrenCount,
    setChildrenCount,
    courtJurisdiction,
    setCourtJurisdiction,
    hasNoSpouseIncome,
    setHasNoSpouseIncome,
    calculateDependents,
    resetDependentState,
  } = useDependentCalculation();

  const totalSteps = 5;

  // 주소 데이터 처리
  const handleAddressNext = (data: {
    homeAddress: string;
    workAddress: string;
    courtJurisdiction: CourtCode;
    homeAddressData: import("@/app/types").AddressData;
  }) => {
    // 집 주소 기반으로 최우선변제금 지역 자동 계산
    const priorityRegion = getPriorityRepaymentRegion(data.homeAddressData);

    setFormData({
      ...formData,
      homeAddress: data.homeAddress,
      workAddress: data.workAddress,
      courtJurisdiction: data.courtJurisdiction,
      priorityRepaymentRegion: priorityRegion,
    });
    setCurrentStep(currentStep + 1);
  };

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
        setCurrentStep(6);
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
      // 3단계에서 돌아갈 때 소득 관련 상태 초기화
      if (currentStep === 4) {
        setIncomeType(null);
        setIncomeSubStep(0);
      }
      // 4단계로 돌아갈 때 상태 초기화
      if (currentStep === 5) {
        resetAssetState();
        resetDependentState();
      }
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setFormData({
      totalDebt: 0,
      monthlyIncome: 0,
      assetValue: 0,
      dependents: 1,
      homeAddress: "",
      workAddress: "",
      courtJurisdiction: "other" as CourtCode,
      priorityRepaymentRegion: "그밖의지역",
    });
    setResult(null);
    setIncomeType(null);
    setIncomeSubStep(0);
    resetAssetState();
    resetDependentState();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/10 via-white to-accent-500/10 flex items-center justify-center p-3 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>

      <div className="w-full max-w-md relative z-10">
        {/* 메인 타이틀 - 첫 화면에만 표시 (토스 스타일) */}
        {currentStep === 1 && (
          <div className="text-center mb-6 animate-fadeIn">
            <div className="mb-4">
              <div className="inline-block p-3 bg-blue-50 rounded-2xl mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3 leading-tight">
              빚, 정리할 수 있어요
            </h1>
            <p className="text-lg text-gray-600 font-medium mb-6">
              3분이면 알 수 있습니다
            </p>
            <div className="flex justify-center gap-5 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">✓</span>
                <span>무료 계산</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">✓</span>
                <span>3분 소요</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">✓</span>
                <span>개인정보 저장 안 함</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              이미 10,247명이 확인했어요
            </p>
          </div>
        )}

        {/* Progress Steps */}
        {currentStep <= totalSteps && (
          <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} />
        )}

        {/* Main Card */}
        <div className="glass-card p-5 animate-scaleIn shadow-xl">
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <>
              {currentStep === 1 && (
                <AddressInputStep
                  onNext={handleAddressNext}
                  initialHomeAddress={formData.homeAddress}
                  initialWorkAddress={formData.workAddress}
                />
              )}
              {currentStep === 2 && (
                <InputStep
                  title="갚아야 할 돈은 얼마인가요?"
                  subtitle="카드빚, 대출, 밀린 돈 모두 포함해주세요 · 대략적인 금액으로도 괜찮아요"
                  onNext={(value) => handleNext("totalDebt", value)}
                  onBack={handleBack}
                  initialValue={formData.totalDebt}
                  quickAmounts={[100, 500, 1000, 3000, 5000]}
                  minValue={1}
                />
              )}
              {currentStep === 3 && (
                <>
                  {incomeSubStep === 0 && (
                    <IncomeTypeSelection
                      onNext={(type) => {
                        setIncomeType(type);
                        setIncomeSubStep(1);
                      }}
                      onBack={handleBack}
                      initialValue={incomeType}
                    />
                  )}
                  {incomeSubStep === 1 && (
                    <InputStep
                      title="한 달에 얼마 버세요?"
                      subtitle="실제로 받는 돈을 말씀해주세요 · 정확하지 않아도 괜찮아요"
                      onNext={(value) => handleNext("monthlyIncome", value)}
                      onBack={() => {
                        setIncomeSubStep(0);
                        setIncomeType(null);
                      }}
                      initialValue={formData.monthlyIncome}
                      quickAmounts={[100, 200, 300]}
                      minValue={0}
                    />
                  )}
                </>
              )}
              {currentStep === 4 && (
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
                      title="가진 재산은 얼마인가요?"
                      subtitle="집, 차, 예금, 주식 등 모두 포함해주세요 · 대략적인 금액으로도 괜찮아요"
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
                        setAssetSubStep(1);
                      }}
                      onBack={() => {
                        setAssetInputMode(null);
                        setAssetSubStep(0);
                      }}
                    />
                  )}
                  {/* Owned Housing Flow */}
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
                        setHousingAsset(Math.max(0, finalAsset));
                        setAssetSubStep(999); // 기타자산 입력 단계로
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
                  {/* Jeonse Flow */}
                  {assetInputMode === 'calculate' && housingType === 'jeonse' && assetSubStep === 1 && (
                    <JeonseDepositInput
                      onNext={(value) => {
                        setDepositAmount(value);
                        // formData.priorityRepaymentRegion 사용 (집 주소 기반 자동 계산)
                        const priorityAmount = PRIORITY_REPAYMENT[formData.priorityRepaymentRegion];
                        const assetDeposit = Math.max(0, value - priorityAmount);
                        setHousingAsset(assetDeposit);
                        setAssetSubStep(999); // 기타자산 입력 단계로
                      }}
                      onBack={() => {
                        setAssetSubStep(0);
                        setHousingType(null);
                      }}
                      initialValue={depositAmount}
                    />
                  )}
                  {/* Monthly Rent Flow */}
                  {assetInputMode === 'calculate' && housingType === 'monthly' && assetSubStep === 1 && (
                    <MonthlyRentDepositInput
                      onNext={(value) => {
                        setDepositAmount(value);
                        // formData.priorityRepaymentRegion 사용 (집 주소 기반 자동 계산)
                        const priorityAmount = PRIORITY_REPAYMENT[formData.priorityRepaymentRegion];
                        const assetDeposit = Math.max(0, value - priorityAmount);
                        setHousingAsset(assetDeposit);
                        setAssetSubStep(999); // 기타자산 입력 단계로
                      }}
                      onBack={() => {
                        setAssetSubStep(0);
                        setHousingType(null);
                      }}
                      initialValue={depositAmount}
                    />
                  )}
                  {/* Free Housing Flow */}
                  {assetInputMode === 'calculate' && housingType === 'free' && assetSubStep === 1 && (
                    <SpouseHousingCheck
                      onSelect={(isSpouse) => {
                        setIsSpouseHousing(isSpouse);
                        if (!isSpouse) {
                          setHousingAsset(0);
                          setAssetSubStep(999); // 기타자산 입력 단계로
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
                    <SpouseHousingJurisdictionInfo
                      courtJurisdiction={formData.courtJurisdiction}
                      onBack={() => {
                        setAssetSubStep(1);
                        setIsSpouseHousing(null);
                      }}
                      onNext={(isMainCourt) => {
                        if (isMainCourt) {
                          setHousingAsset(0);
                          setAssetSubStep(999); // 기타자산 입력 단계로
                        } else {
                          setIsMainCourtJurisdiction(false);
                          setAssetSubStep(3);
                        }
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
                        setHousingAsset(Math.max(0, assetSpouse / 2));
                        setAssetSubStep(999); // 기타자산 입력 단계로
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
                  {/* 기타자산 입력 단계 (주거형태 계산 완료 후) */}
                  {assetInputMode === 'calculate' && assetSubStep === 999 && (
                    <InputStep
                      title="다른 재산도 있나요?"
                      subtitle="예금, 주식, 자동차 등을 말해주세요 · 거의 다 끝났어요!"
                      onNext={(value) => {
                        setOtherAsset(value);
                        const totalAsset = housingAsset + value;
                        handleNext("assetValue", totalAsset);
                      }}
                      onBack={() => {
                        // 각 주거형태의 마지막 단계로 돌아가기
                        if (housingType === 'owned') {
                          setAssetSubStep(hasMortgage ? 3 : 2);
                        } else if (housingType === 'jeonse' || housingType === 'monthly') {
                          setAssetSubStep(1);
                        } else if (housingType === 'free') {
                          if (isSpouseHousing === false) {
                            setAssetSubStep(1);
                          } else if (isMainCourtJurisdiction === true) {
                            setAssetSubStep(2);
                          } else {
                            setAssetSubStep(hasMortgage ? 5 : 4);
                          }
                        }
                      }}
                      initialValue={otherAsset}
                      quickAmounts={[100, 500, 1000, 3000, 5000]}
                      minValue={0}
                    />
                  )}
                </>
              )}
              {currentStep === 5 && (
                <>
                  {/* 입력 모드 선택 */}
                  {dependentInputMode === null && (
                    <DependentInputModeSelection
                      onSelect={(mode) => {
                        setDependentInputMode(mode);
                        if (mode === 'calculate') {
                          setDependentSubStep(0);
                        }
                      }}
                      onBack={handleBack}
                    />
                  )}
                  {/* 직접 입력 모드 */}
                  {dependentInputMode === 'direct' && (
                    <InputStep
                      title="함께 사는 가족이 몇 명이에요?"
                      subtitle="본인도 포함해주세요 · 가족 수에 따라 생활비가 달라져요"
                      onNext={(value) => handleNext("dependents", value)}
                      onBack={() => {
                        setDependentInputMode(null);
                      }}
                      initialValue={formData.dependents}
                      quickAmounts={[1, 2, 3, 4, 5]}
                      minValue={1}
                      unitType="count"
                    />
                  )}
                  {/* 계산 모드 - 혼인 상태 선택 */}
                  {dependentInputMode === 'calculate' && dependentSubStep === 0 && (
                    <MaritalStatusSelection
                      onSelect={(status) => {
                        setMaritalStatus(status);
                        setDependentSubStep(1);
                      }}
                      onBack={() => {
                        setDependentInputMode(null);
                      }}
                    />
                  )}
                  {/* 계산 모드 - 자녀 수 입력 */}
                  {dependentInputMode === 'calculate' && dependentSubStep === 1 && maritalStatus && (
                    <ChildrenCountInput
                      maritalStatus={maritalStatus}
                      onNext={(count) => {
                        setChildrenCount(count);
                        // 결혼인 경우: 주요 법원이면 배우자 소득 확인, 아니면 바로 계산
                        if (maritalStatus === 'married') {
                          // formData.courtJurisdiction에서 자동으로 가져옴
                          const isMainCourt = ['seoul', 'suwon', 'daejeon', 'busan'].includes(formData.courtJurisdiction);
                          if (isMainCourt) {
                            setDependentSubStep(2); // 배우자 소득 확인으로
                          } else {
                            // 기타 법원은 바로 계산: (childrenCount / 2) + 1
                            const dependents = calculateDependents(maritalStatus, count, formData.courtJurisdiction as any, false);
                            handleNext("dependents", dependents);
                          }
                        } else {
                          // 미혼/이혼은 바로 계산
                          const dependents = calculateDependents(maritalStatus, count, null, null);
                          handleNext("dependents", dependents);
                        }
                      }}
                      onBack={() => {
                        setDependentSubStep(0);
                        setMaritalStatus(null);
                      }}
                    />
                  )}
                  {/* 계산 모드 - 배우자 소득 확인 (주요 법원인 경우만) */}
                  {dependentInputMode === 'calculate' && dependentSubStep === 2 && maritalStatus === 'married' && (
                    <SpouseIncomeCheck
                      onSelect={(noIncome) => {
                        setHasNoSpouseIncome(noIncome);
                        // noIncome = true: childrenCount + 1
                        // noIncome = false: (childrenCount / 2) + 1
                        const dependents = calculateDependents(maritalStatus, childrenCount, formData.courtJurisdiction as any, noIncome);
                        handleNext("dependents", dependents);
                      }}
                      onBack={() => {
                        setDependentSubStep(1);
                        setHasNoSpouseIncome(null);
                      }}
                    />
                  )}
                </>
              )}
              {currentStep === 6 && result && (
                <ResultPage
                  result={result}
                  formData={formData}
                  onRestart={handleRestart}
                  onBack={() => setCurrentStep(5)}
                  assetInputMode={assetInputMode}
                  housingType={housingType}
                  hasMortgage={hasMortgage}
                  mortgageAmount={mortgageAmount}
                  kbPrice={kbPrice}
                  depositAmount={depositAmount}
                  isSpouseHousing={isSpouseHousing}
                  housingAsset={housingAsset}
                  otherAsset={otherAsset}
                  maritalStatus={maritalStatus}
                  childrenCount={childrenCount}
                  hasNoSpouseIncome={hasNoSpouseIncome}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
