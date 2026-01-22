/**
 * 개인회생 탕감률 계산기
 * Copyright (c) 2025. All rights reserved.
 * 무단 복제 및 재배포를 금지합니다.
 */

"use client";

import { useState, useEffect } from "react";
import type { FormData, CalculationResult, CourtCode, IncomeType, MaritalStatus } from "@/app/types";
import { AssetIntegratedForm } from "@/app/components/asset/AssetIntegratedForm";
import { InputStep } from "@/app/components/steps";
import { LoadingScreen } from "@/app/components/ui";
import { ResultPage } from "@/app/components/result";
import { RegionSelectStep } from "@/app/components/address/RegionSelectStep";
import { DependentIntegratedForm } from "@/app/components/dependent";
import { IncomeTypeSelection } from "@/app/components/income";
import { useCalculation } from "@/app/hooks/useCalculation";
import { useStats } from "@/app/hooks/useStats";
import { useToast } from "@/app/hooks/useToast";
import { KAKAO_CONSULTATION_URL } from "@/app/config/consultation";

const LAST_UPDATED = "2025.01.22";
const PHONE_NUMBER = "02-6101-3100";

const UPDATE_HISTORY = [
  { date: "2025.01.22", content: "UX/UI 개선, SEO 최적화, 코드 구조 개선" },
  { date: "2025.01.06", content: "웰컴 화면 격려 명언 추가" },
  { date: "2025.01.06", content: "결과 화면 한 화면에 맞게 콤팩트하게 개선" },
];

const initialFormData: FormData = {
  totalDebt: 0,
  monthlyIncome: 0,
  assetValue: 0,
  dependents: 1,
  homeAddress: "",
  workAddress: "",
  courtJurisdiction: "other" as CourtCode,
  priorityRepaymentRegion: "그밖의지역",
};

export default function Home() {
  // UI 상태
  const [currentStep, setCurrentStep] = useState(0);
  const [showUpdateHistory, setShowUpdateHistory] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // 소득 관련 상태
  const [incomeType, setIncomeType] = useState<IncomeType | null>(null);
  const [incomeSubStep, setIncomeSubStep] = useState(0);

  // 자산/부양가족 관련 상태 (결과 페이지 전달용)
  const [isMarriedForAsset, setIsMarriedForAsset] = useState<boolean | null>(null);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(null);
  const [childrenCount, setChildrenCount] = useState(0);
  const [hasNoSpouseIncome, setHasNoSpouseIncome] = useState<boolean | null>(null);

  // 커스텀 훅
  const { calculate, isLoading, error, setIsLoading } = useCalculation();
  const { displayCount, displayRate, fetchAndAnimate } = useStats();
  const toast = useToast();

  const totalSteps = 5;

  // 웰컴 화면에서 통계 로드
  useEffect(() => {
    if (currentStep === 0) {
      fetchAndAnimate();
    }
  }, [currentStep, fetchAndAnimate]);

  // 에러 발생 시 Toast 표시
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  const handleNext = async (field: keyof FormData, value: number) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      const calculationResult = await calculate(updatedFormData);

      if (calculationResult) {
        setResult(calculationResult);
        setCurrentStep(6);
      } else {
        toast.error("계산 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 4) {
        setIncomeType(null);
        setIncomeSubStep(0);
      }
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setResult(null);
    setIncomeType(null);
    setIncomeSubStep(0);
    setIsMarriedForAsset(null);
    setMaritalStatus(null);
    setChildrenCount(0);
    setHasNoSpouseIncome(null);
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* 헤더 - 웰컴/결과 화면 제외 */}
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
              <div className="flex-1 flex flex-col justify-center -mt-8">
                <div className="mb-10">
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

                <div className="space-y-3.5">
                  {["무료로 계산할 수 있어요", "개인정보는 저장하지 않아요", "전문가가 직접 확인해드려요"].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[15px]">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

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
                      <p className="text-2xl font-bold text-green-600">{displayRate}<span className="text-lg">%</span><span className="text-sm font-medium text-gray-500 ml-0.5">탕감</span></p>
                    </div>
                  </div>
                </div>
                <div className="text-center text-xs text-gray-400">
                  <span className="font-medium text-gray-500">블랙스톤 법률사무소</span> · <span>최종수정 {LAST_UPDATED}</span>
                </div>

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
                    <DependentIntegratedForm
                      onNext={(dependents) => handleNext("dependents", dependents)}
                      onBack={handleBack}
                      courtJurisdiction={formData.courtJurisdiction}
                      isMarriedForAsset={isMarriedForAsset}
                    />
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

      {/* 하단 CTA - 웰컴 화면에서만 */}
      {currentStep === 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 pt-4 pb-safe">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => {
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

      {/* 플로팅 상담 버튼 */}
      {currentStep >= 1 && (
        <div className="fixed right-3 bottom-1/4 z-50 flex flex-col gap-3">
          <a
            href={KAKAO_CONSULTATION_URL}
            target="_blank"
            rel="noopener"
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
