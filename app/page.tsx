/**
 * 개인회생 탕감률 계산기
 * Copyright (c) 2025. All rights reserved.
 * 무단 복제 및 재배포를 금지합니다.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { PRIORITY_REPAYMENT } from "@/app/constants";
import { supabase } from "@/lib/supabase";
import type { FormData, CalculationResult, CourtCode } from "@/app/types";
import {
  AssetInputModeSelection,
  HousingTypeSelection,
  SpouseHousingCheck,
  MonthlyRentDepositInput,
  SpouseHousingJurisdictionInfo,
  MarriageCheckForAsset,
  SpouseAssetCheck,
  SpouseAssetInput,
} from "@/app/components/asset";
import { MortgageCheck, KBPriceInput, MortgageAmountInput, JeonseDepositInput } from "@/app/components/housing";
import { InputStep } from "@/app/components/steps";
import { LoadingScreen } from "@/app/components/ui";
import { ResultPage } from "@/app/components/result";
import { AddressInputStep } from "@/app/components/address";
import { DependentInputModeSelection, MaritalStatusSelection, ChildrenCountInput, SpouseIncomeCheck } from "@/app/components/dependent";
import { IncomeTypeSelection } from "@/app/components/income";
import { useAssetCalculation } from "@/app/hooks/useAssetCalculation";
import { useDependentCalculation } from "@/app/hooks/useDependentCalculation";
import { getPriorityRepaymentRegion, getCourtName } from "@/utils/courtJurisdiction";
import type { IncomeType } from "@/app/types";
import { KAKAO_CONSULTATION_URL } from "@/app/config/consultation";

const APP_VERSION = "1.1.0";
const PHONE_NUMBER = "02-6101-3100";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0); // 0: 웰컴, 1: 주소, 2~6: 입력 단계
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
  const [userCount, setUserCount] = useState<number | null>(null); // 실제 이용자 수 (로딩 전: null)
  const [displayCount, setDisplayCount] = useState(0); // 화면에 표시되는 숫자
  const hasAnimatedRef = useRef(false); // 애니메이션 완료 여부

  // 사용자 수 조회 및 애니메이션
  useEffect(() => {
    const fetchAndAnimate = async () => {
      // 이미 애니메이션 완료했으면 스킵
      if (hasAnimatedRef.current) return;

      let targetCount = 1300; // 기본값

      // Supabase에서 실제 카운트 조회
      if (supabase) {
        try {
          const { count, error } = await supabase
            .from('calculation_results')
            .select('*', { count: 'exact', head: true });

          if (!error && count !== null) {
            targetCount = count + 1300;
          }
        } catch {
          // DB 연결 실패 시 기본값 사용
        }
      }

      setUserCount(targetCount);
      hasAnimatedRef.current = true;

      // 카운트업 애니메이션 실행
      const duration = 1200;
      const steps = 30;
      const stepDuration = duration / steps;

      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        const progress = i / steps;
        // easeOutQuad 효과
        const eased = 1 - (1 - progress) * (1 - progress);
        setDisplayCount(Math.round(targetCount * eased));
      }
    };

    if (currentStep === 0) {
      fetchAndAnimate();
    }
  }, [currentStep]);

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
    isMarriedForAsset,
    setIsMarriedForAsset,
    hasSpouseAsset,
    setHasSpouseAsset,
    spouseAsset,
    setSpouseAsset,
    resetAssetState,
  } = useAssetCalculation();

  // 회생법원 여부 확인 (서울, 수원, 대전, 부산)
  const isMainCourt = ['seoul', 'suwon', 'daejeon', 'busan'].includes(formData.courtJurisdiction);

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

  const totalSteps = 5; // 1: 주소, 2: 부채, 3: 소득, 4: 자산, 5: 부양가족 (결과는 step 6)

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
    if (currentStep > 0) {
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
    setCurrentStep(0);
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
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Toss 스타일 헤더 - 웰컴 화면(step 0)과 결과 화면(step 6)에서는 숨김 */}
      {currentStep >= 1 && currentStep <= totalSteps && (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-900">회생의 기적</span>
            </div>
            {/* 상담 버튼들 */}
            <div className="flex items-center gap-2">
              <a
                href={KAKAO_CONSULTATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-semibold rounded-full transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.76 1.81 5.18 4.5 6.57-.15.53-.5 1.93-.57 2.24-.09.38.14.37.29.27.12-.08 1.89-1.26 2.66-1.77.7.1 1.42.16 2.12.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                </svg>
                상담
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-full transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                전화
              </a>
            </div>
          </div>
          {/* 프로그레스 바 */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </header>
      )}

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
          {/* 웰컴 화면 (step 0) */}
          {currentStep === 0 && (
            <div className="flex-1 flex flex-col px-5 pt-12 pb-24 animate-fadeIn">
              {/* 히어로 섹션 */}
              <div className="flex-1">
                <div className="mb-8">
                  {/* 브랜드 뱃지 */}
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    회생의 기적
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-[32px] font-bold text-gray-900 leading-tight mb-3">
                    빚, 얼마나<br/>줄일 수 있을까요?
                  </h1>
                  <p className="text-lg text-gray-500">
                    3분이면 예상 탕감율을 알 수 있어요
                  </p>
                </div>

                {/* 신뢰 지표 */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[15px]">무료로 계산할 수 있어요</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[15px]">개인정보는 저장하지 않아요</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[15px]">전문가가 직접 확인해드려요</span>
                  </div>
                </div>
              </div>

              {/* 하단 고정 영역 */}
              <div className="mt-auto">
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-0.5">지금까지</p>
                      <p className="text-xl font-bold text-blue-600">{displayCount.toLocaleString()}명</p>
                      <p className="text-xs text-gray-400 mt-0.5">이 이용했어요</p>
                    </div>
                  </div>
                </div>
                {/* 법률사무소 정보 */}
                <p className="text-center text-xs text-gray-400">
                  <span className="font-medium text-gray-500">블랙스톤 법률사무소</span> · v{APP_VERSION}
                </p>
              </div>
            </div>
          )}

          {/* 입력 단계 컨테이너 */}
          {currentStep >= 1 && (
          <div className="flex-1 flex flex-col px-5 pt-6 pb-safe">
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
                  {assetInputMode === 'direct' && assetSubStep === 0 && (
                    <InputStep
                      title="가진 재산은 얼마인가요?"
                      subtitle="집, 차, 예금, 주식 등 모두 포함해주세요 · 대략적인 금액으로도 괜찮아요"
                      onNext={(value) => {
                        setHousingAsset(value); // 직접 입력값을 housingAsset에 저장
                        setOtherAsset(0);
                        setAssetSubStep(1000); // 결혼 여부 확인으로
                      }}
                      onBack={() => {
                        setAssetInputMode(null);
                      }}
                      initialValue={formData.assetValue}
                      minValue={0}
                    />
                  )}

                  {/* 직접 입력 모드 - 배우자 재산 결혼 여부 확인 */}
                  {assetInputMode === 'direct' && assetSubStep === 1000 && (
                    <MarriageCheckForAsset
                      onSelect={(isMarried) => {
                        setIsMarriedForAsset(isMarried);
                        if (isMarried) {
                          setAssetSubStep(1001);
                        } else {
                          const totalAsset = housingAsset + otherAsset;
                          handleNext("assetValue", totalAsset);
                        }
                      }}
                      onBack={() => setAssetSubStep(0)}
                    />
                  )}

                  {/* 직접 입력 모드 - 배우자 재산 유무 확인 */}
                  {assetInputMode === 'direct' && assetSubStep === 1001 && (
                    <SpouseAssetCheck
                      onSelect={(hasAsset) => {
                        setHasSpouseAsset(hasAsset);
                        if (hasAsset) {
                          setAssetSubStep(1002);
                        } else {
                          const totalAsset = housingAsset + otherAsset;
                          handleNext("assetValue", totalAsset);
                        }
                      }}
                      onBack={() => setAssetSubStep(1000)}
                    />
                  )}

                  {/* 직접 입력 모드 - 배우자 재산 금액 입력 */}
                  {assetInputMode === 'direct' && assetSubStep === 1002 && (
                    <SpouseAssetInput
                      onNext={(value) => {
                        setSpouseAsset(value);
                        const spouseAssetContribution = isMainCourt ? 0 : Math.floor(value / 2);
                        const totalAsset = housingAsset + otherAsset + spouseAssetContribution;
                        handleNext("assetValue", totalAsset);
                      }}
                      onBack={() => setAssetSubStep(1001)}
                      initialValue={spouseAsset}
                      isMainCourt={isMainCourt}
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
                      subtitle="예금, 주식, 자동차 등을 말해주세요"
                      onNext={(value) => {
                        setOtherAsset(value);
                        setAssetSubStep(1000); // 결혼 여부 확인으로
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
                      minValue={0}
                    />
                  )}

                  {/* 배우자 재산 - 결혼 여부 확인 */}
                  {assetInputMode === 'calculate' && assetSubStep === 1000 && (
                    <MarriageCheckForAsset
                      onSelect={(isMarried) => {
                        setIsMarriedForAsset(isMarried);
                        if (isMarried) {
                          setAssetSubStep(1001); // 배우자 재산 유무 확인으로
                        } else {
                          // 미혼: 바로 완료
                          const totalAsset = housingAsset + otherAsset;
                          handleNext("assetValue", totalAsset);
                        }
                      }}
                      onBack={() => setAssetSubStep(999)}
                    />
                  )}

                  {/* 배우자 재산 - 유무 확인 */}
                  {assetInputMode === 'calculate' && assetSubStep === 1001 && (
                    <SpouseAssetCheck
                      onSelect={(hasAsset) => {
                        setHasSpouseAsset(hasAsset);
                        if (hasAsset) {
                          setAssetSubStep(1002); // 배우자 재산 금액 입력으로
                        } else {
                          // 없음: 바로 완료
                          const totalAsset = housingAsset + otherAsset;
                          handleNext("assetValue", totalAsset);
                        }
                      }}
                      onBack={() => setAssetSubStep(1000)}
                    />
                  )}

                  {/* 배우자 재산 - 금액 입력 */}
                  {assetInputMode === 'calculate' && assetSubStep === 1002 && (
                    <SpouseAssetInput
                      onNext={(value) => {
                        setSpouseAsset(value);
                        // 회생법원이 아닌 경우 배우자 재산의 50% 추가
                        const spouseAssetContribution = isMainCourt ? 0 : Math.floor(value / 2);
                        const totalAsset = housingAsset + otherAsset + spouseAssetContribution;
                        handleNext("assetValue", totalAsset);
                      }}
                      onBack={() => setAssetSubStep(1001)}
                      initialValue={spouseAsset}
                      isMainCourt={isMainCourt}
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
                          // 이미 자산 단계에서 기혼이라고 응답한 경우, 혼인 상태 선택 건너뛰기
                          if (isMarriedForAsset === true) {
                            setMaritalStatus('married');
                            setDependentSubStep(1); // 바로 자녀 수 입력으로
                          } else {
                            setDependentSubStep(0);
                          }
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
                      minValue={1}
                      unitType="count"
                    />
                  )}
                  {/* 계산 모드 - 혼인 상태 선택 (이미 기혼이라고 응답한 경우 건너뜀) */}
                  {dependentInputMode === 'calculate' && dependentSubStep === 0 && (
                    <MaritalStatusSelection
                      onSelect={(status) => {
                        setMaritalStatus(status);
                        setDependentSubStep(1);
                      }}
                      onBack={() => {
                        setDependentInputMode(null);
                      }}
                      excludeMarried={isMarriedForAsset === false}
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
                        // 자산 단계에서 기혼으로 응답해서 혼인상태를 건너뛴 경우, 입력 모드 선택으로 돌아감
                        if (isMarriedForAsset === true) {
                          setDependentInputMode(null);
                          setMaritalStatus(null);
                        } else {
                          setDependentSubStep(0);
                          setMaritalStatus(null);
                        }
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
                  isMarriedForAsset={isMarriedForAsset}
                  hasSpouseAsset={hasSpouseAsset}
                  spouseAsset={spouseAsset}
                  isMainCourt={isMainCourt}
                />
              )}
            </>
          )}
          </div>
        )}
        </div>
      </main>

      {/* 하단 고정 CTA 버튼 - 웰컴 화면(step 0)에서만 표시 */}
      {currentStep === 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 pt-4 pb-safe">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-[17px]"
            >
              시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
