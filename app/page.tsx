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
import { MaritalStatusSelection, ChildrenCountInput, SpouseIncomeCheck } from "@/app/components/dependent";
import { WelcomeScreen } from "@/app/components/welcome";
import { useAssetCalculation } from "@/app/hooks/useAssetCalculation";
import { useDependentCalculation } from "@/app/hooks/useDependentCalculation";
import { getPriorityRepaymentRegion, getCourtName } from "@/utils/courtJurisdiction";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
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
    resetAssetState,
  } = useAssetCalculation();

  // 부양가족 계산 관련 상태
  const {
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
    resetAssetState();
    resetDependentState();
  };

  // Show Welcome Screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/10 via-white to-accent-500/10 flex items-center justify-center p-3 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>

      <div className="w-full max-w-md relative z-10">
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
                  title="총 부채액은 얼마인가요?"
                  subtitle="모든 부채를 합산한 금액"
                  onNext={(value) => handleNext("totalDebt", value)}
                  onBack={handleBack}
                  initialValue={formData.totalDebt}
                  quickAmounts={[100, 500, 1000, 3000, 5000]}
                  minValue={1}
                />
              )}
              {currentStep === 3 && (
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
                  {/* Jeonse Flow */}
                  {assetInputMode === 'calculate' && housingType === 'jeonse' && assetSubStep === 1 && (
                    <JeonseDepositInput
                      onNext={(value) => {
                        setDepositAmount(value);
                        // formData.priorityRepaymentRegion 사용 (집 주소 기반 자동 계산)
                        const priorityAmount = PRIORITY_REPAYMENT[formData.priorityRepaymentRegion];
                        const assetDeposit = Math.max(0, value - priorityAmount);
                        handleNext("assetValue", assetDeposit);
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
                        handleNext("assetValue", assetDeposit);
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
                    <SpouseHousingJurisdictionInfo
                      courtJurisdiction={formData.courtJurisdiction}
                      onBack={() => {
                        setAssetSubStep(1);
                        setIsSpouseHousing(null);
                      }}
                      onNext={(isMainCourt) => {
                        if (isMainCourt) {
                          handleNext("assetValue", 0);
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
              {currentStep === 5 && (
                <>
                  {/* 혼인 상태 선택 */}
                  {dependentSubStep === 0 && (
                    <MaritalStatusSelection
                      onSelect={(status) => {
                        setMaritalStatus(status);
                        setDependentSubStep(1);
                      }}
                      onBack={handleBack}
                    />
                  )}
                  {/* 자녀 수 입력 */}
                  {dependentSubStep === 1 && maritalStatus && (
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
                  {/* 배우자 소득 확인 (주요 법원인 경우만) */}
                  {dependentSubStep === 2 && maritalStatus === 'married' && (
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
                  assetInputMode={assetInputMode}
                  housingType={housingType}
                  hasMortgage={hasMortgage}
                  mortgageAmount={mortgageAmount}
                  kbPrice={kbPrice}
                  depositAmount={depositAmount}
                  isSpouseHousing={isSpouseHousing}
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
