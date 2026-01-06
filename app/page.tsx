/**
 * 개인회생 탕감률 계산기
 * Copyright (c) 2025. All rights reserved.
 * 무단 복제 및 재배포를 금지합니다.
 */

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { FormData, CalculationResult, CourtCode } from "@/app/types";
import { AssetIntegratedForm } from "@/app/components/asset/AssetIntegratedForm";
import { InputStep } from "@/app/components/steps";
import { LoadingScreen } from "@/app/components/ui";
import { ResultPage } from "@/app/components/result";
import { RegionSelectStep } from "@/app/components/address/RegionSelectStep";
import { DependentInputModeSelection, MaritalStatusSelection, ChildrenCountInput, SpouseIncomeCheck } from "@/app/components/dependent";
import { IncomeTypeSelection } from "@/app/components/income";
import { useDependentCalculation } from "@/app/hooks/useDependentCalculation";
import { getCourtName } from "@/utils/courtJurisdiction";
import type { IncomeType } from "@/app/types";
import { KAKAO_CONSULTATION_URL } from "@/app/config/consultation";

const LAST_UPDATED = "2025.01.06";
const PHONE_NUMBER = "02-6101-3100";

// 업데이트 이력
const UPDATE_HISTORY = [
  { date: "2025.01.06", content: "웰컴 화면 격려 명언 추가" },
  { date: "2025.01.06", content: "결과 화면 한 화면에 맞게 콤팩트하게 개선" },
  { date: "2025.01.02", content: "결과 화면 UI/UX 대폭 개선 (도파민 효과)" },
  { date: "2025.01.02", content: "상담 신뢰도 강화 (변호사 직접 상담 배지)" },
  { date: "2025.01.02", content: "법정 최소 변제액 조건 적용 (5천만원 기준)" },
  { date: "2025.01.02", content: "최대 탕감률 96.9% 제한 적용" },
  { date: "2025.01.02", content: "24시간 내 최대 탕감률 표시" },
  { date: "2025.01.01", content: "소액 입력 시 단위 확인 기능 추가" },
];

// 채무자에게 희망과 격려를 주는 명언 리스트
const MOTIVATIONAL_QUOTES = [
  { text: "이 또한 지나가리라", author: "페르시아 속담" },
  { text: "삶이 있는 한 희망은 있다", author: "키케로" },
  { text: "세상은 고통으로 가득하지만 그것을 극복하는 사람들로도 가득하다", author: "헬렌 켈러" },
  { text: "불가능해 보이는 것도 끝나고 나면 가능했던 것이 된다", author: "넬슨 만델라" },
  { text: "최고에 도달하려면 최저에서 시작하라", author: "P.시루스" },
  { text: "가장 아름다운 전망은 가장 힘든 등반 끝에 있다", author: "" },
  { text: "오늘은 당신의 남은 인생 중 첫 번째 날이다", author: "" },
  { text: "실패란 넘어지는 것이 아니라, 넘어진 자리에 머무는 것이다", author: "" },
  { text: "두려움은 앉아있을 때 생기고, 행동할 때 극복된다", author: "헨리 링크" },
  { text: "항상 맑으면 사막이 된다. 비가 내려야 비옥해진다", author: "스페인 속담" },
  { text: "아직 늦지 않았다. 한 번 더 일어서라", author: "" },
  { text: "어둠이 깊을수록 새벽은 가깝다", author: "" },
];

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
  const [displayDailyMaxRate, setDisplayDailyMaxRate] = useState(0); // 화면에 표시되는 탕감율 (애니메이션)
  const hasAnimatedRef = useRef(false); // 애니메이션 완료 여부
  const [showUpdateHistory, setShowUpdateHistory] = useState(false); // 업데이트 이력 모달

  // 랜덤 명언 선택 (컴포넌트 마운트 시 한 번만)
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, []);

  // 사용자 수 조회 및 애니메이션
  useEffect(() => {
    const fetchAndAnimate = async () => {
      // 이미 애니메이션 완료했으면 스킵
      if (hasAnimatedRef.current) return;

      let targetCount = 1300; // 기본값
      let targetRate = 85; // 기본값

      // API에서 통계 조회
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          targetCount = data.userCount || 1300;
          if (data.dailyMaxRate && data.dailyMaxRate > 0) {
            targetRate = data.dailyMaxRate;
          }
        }
      } catch {
        // API 호출 실패 시 기본값 사용
      }

      setUserCount(targetCount);
      hasAnimatedRef.current = true;

      // 카운트업 애니메이션 실행 (이용자 수 + 탕감율 동시 애니메이션)
      const duration = 400;
      const steps = 15;
      const stepDuration = duration / steps;

      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        const progress = i / steps;
        // easeOutQuad 효과
        const eased = 1 - (1 - progress) * (1 - progress);
        setDisplayCount(Math.round(targetCount * eased));
        setDisplayDailyMaxRate(Math.round(targetRate * eased));
      }
    };

    if (currentStep === 0) {
      fetchAndAnimate();
    }
  }, [currentStep]);

  // 소득 관련 상태
  const [incomeType, setIncomeType] = useState<IncomeType | null>(null);
  const [incomeSubStep, setIncomeSubStep] = useState(0);

  // 자산 계산 관련 상태 (결혼 여부만 부양가족 계산에 필요)
  const [isMarriedForAsset, setIsMarriedForAsset] = useState<boolean | null>(null);

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

  const handleNext = async (field: keyof FormData, value: number) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);

      try {
        // 최소 5.5초 로딩 시간 보장 (CTA 메시지 노출)
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 5500));

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

        // 최소 로딩 시간 대기
        await minLoadingTime;

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
      // 5단계에서 돌아갈 때 부양가족 상태 초기화
      if (currentStep === 5) {
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
    setIsMarriedForAsset(null);
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
<span className="text-xs text-gray-500">{currentStep}/{totalSteps}</span>
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
            <div className="flex-1 flex flex-col px-6 py-8 animate-fadeIn">
              {/* 히어로 섹션 - 상단 중심 배치 */}
              <div className="flex-1 flex flex-col justify-center -mt-8">
                <div className="mb-10">
                  {/* 브랜드 뱃지 */}
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    회생의 기적
                  </div>
                  <h1 className="text-[34px] font-bold text-gray-900 leading-tight mb-4">
                    빚, 얼마나<br/>줄일 수 있을까요?
                  </h1>
                  <p className="text-lg text-gray-500">
                    1분이면 탕감율을 알 수 있어요
                  </p>
                </div>

                {/* 신뢰 지표 */}
                <div className="space-y-3.5">
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

                {/* 격려 명언 */}
                <div className="mt-6 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <p className="text-gray-700 text-sm italic leading-relaxed text-center">
                    &ldquo;{randomQuote.text}&rdquo;
                  </p>
                  {randomQuote.author && (
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      — {randomQuote.author}
                    </p>
                  )}
                </div>
              </div>

              {/* 하단 통계 영역 */}
              <div className="pt-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">누적 이용자</p>
                      <p className="text-2xl font-bold text-blue-600">{displayCount.toLocaleString()}<span className="text-lg">명</span></p>
                    </div>
                    <div className="w-px h-14 bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">24시간 내 최고</p>
                      <p className="text-2xl font-bold text-green-600">{displayDailyMaxRate}<span className="text-lg">%</span><span className="text-sm font-medium text-gray-500 ml-0.5">탕감</span></p>
                    </div>
                  </div>
                </div>
                {/* 법률사무소 정보 */}
                <div className="text-center text-xs text-gray-400">
                  <span className="font-medium text-gray-500">블랙스톤 법률사무소</span> · <span>최종수정 {LAST_UPDATED}</span>
                </div>

                {/* 업데이트 이력 모달 */}
                {showUpdateHistory && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUpdateHistory(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">업데이트 이력</h3>
                        <button onClick={() => setShowUpdateHistory(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {UPDATE_HISTORY.map((item, index) => (
                          <div key={index} className="flex gap-3 text-sm">
                            <span className="text-gray-400 whitespace-nowrap">{item.date}</span>
                            <span className="text-gray-700">{item.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                <RegionSelectStep
                  onNext={(data) => {
                    setFormData({
                      ...formData,
                      homeAddress: data.selectedRegion,
                      workAddress: "",
                      courtJurisdiction: data.courtJurisdiction,
                      priorityRepaymentRegion: data.priorityRepaymentRegion,
                    });
                    setCurrentStep(currentStep + 1);
                  }}
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
                  checkSmallValue={true}
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
                      checkSmallValue={true}
                    />
                  )}
                </>
              )}
              {currentStep === 4 && (
                <AssetIntegratedForm
                  onNext={(totalAsset, isMarried) => {
                    setIsMarriedForAsset(isMarried);
                    handleNext("assetValue", totalAsset);
                  }}
                  onBack={handleBack}
                  courtJurisdiction={formData.courtJurisdiction}
                  priorityRepaymentRegion={formData.priorityRepaymentRegion}
                />
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
                  maritalStatus={maritalStatus}
                  childrenCount={childrenCount}
                  hasNoSpouseIncome={hasNoSpouseIncome}
                  isMarriedForAsset={isMarriedForAsset}
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
              onClick={() => {
                // 시작하기 클릭 추적
                fetch('/api/track-start', { method: 'POST' }).catch(() => {});
                setCurrentStep(1);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-[17px]"
            >
              내 탕감률 확인하기
            </button>
          </div>
        </div>
      )}

      {/* 플로팅 상담 버튼 - 웰컴 화면 제외 */}
      {currentStep >= 1 && (
        <div className="fixed right-3 bottom-1/4 z-50 flex flex-col gap-3">
          <a
            href={KAKAO_CONSULTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-full shadow-lg transition-all hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.76 1.81 5.18 4.5 6.57-.15.53-.5 1.93-.57 2.24-.09.38.14.37.29.27.12-.08 1.89-1.26 2.66-1.77.7.1 1.42.16 2.12.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
            </svg>
            <span className="text-sm font-semibold whitespace-nowrap">바로상담</span>
          </a>
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm font-semibold whitespace-nowrap">전화상담</span>
          </a>
        </div>
      )}
    </div>
  );
}
