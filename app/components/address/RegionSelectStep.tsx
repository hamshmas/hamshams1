"use client";

import { useState } from "react";
import { SIDO_LIST, COURT_DETAILS, PRIORITY_REPAYMENT, MAIN_COURTS } from "@/app/constants";
import type { CourtCode, RegionType } from "@/app/types";

interface RegionSelectStepProps {
  onNext: (data: {
    selectedRegion: string;
    courtJurisdiction: CourtCode;
    priorityRepaymentRegion: RegionType;
  }) => void;
  onBack?: () => void;
}

export function RegionSelectStep({ onNext, onBack }: RegionSelectStepProps) {
  const [homeRegion, setHomeRegion] = useState<string | null>(null);
  const [workRegion, setWorkRegion] = useState<string | null>(null);
  const [showWorkInput, setShowWorkInput] = useState(false);

  const homeSido = SIDO_LIST.find(s => s.value === homeRegion);
  const workSido = SIDO_LIST.find(s => s.value === workRegion);

  const getBetterCourt = () => {
    if (!homeSido) return null;
    if (!workSido) return homeSido;

    const homeIsMain = MAIN_COURTS.includes(homeSido.court);
    const workIsMain = MAIN_COURTS.includes(workSido.court);

    if (homeIsMain && !workIsMain) return homeSido;
    if (!homeIsMain && workIsMain) return workSido;

    return homeSido;
  };

  const selectedSido = getBetterCourt();
  const courtInfo = selectedSido ? COURT_DETAILS[selectedSido.court] : null;
  const priorityAmount = homeSido ? PRIORITY_REPAYMENT[homeSido.region] : 0;
  const isMainCourt = selectedSido ? MAIN_COURTS.includes(selectedSido.court) : false;

  const workIsBetter = workSido && homeSido &&
    MAIN_COURTS.includes(workSido.court) &&
    !MAIN_COURTS.includes(homeSido.court);

  const handleNext = () => {
    if (!selectedSido || !homeSido) return;
    onNext({
      selectedRegion: homeSido.label,
      courtJurisdiction: selectedSido.court as CourtCode,
      priorityRepaymentRegion: homeSido.region as RegionType,
    });
  };

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 제목 - Apple 스타일 */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-apple-gray-800 leading-tight tracking-tight mb-3">
          어디에 거주하시나요?
        </h2>
        <p className="text-[15px] text-apple-gray-500">관할법원과 최우선변제금 계산에 사용됩니다</p>
      </div>

      {/* 집 주소 선택 그리드 - Apple 스타일 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {SIDO_LIST.map((sido) => {
          const isSelected = homeRegion === sido.value;
          return (
            <button
              key={sido.value}
              onClick={() => setHomeRegion(sido.value)}
              className={`py-3 px-2 rounded-apple text-center transition-all duration-200 ${
                isSelected
                  ? "bg-apple-blue-500 text-white shadow-apple-sm"
                  : "bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-800"
              }`}
            >
              <p className={`font-medium text-[13px] ${isSelected ? "text-white" : "text-apple-gray-800"}`}>
                {sido.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* 직장 주소 입력 토글 - Apple 스타일 */}
      {homeRegion && !showWorkInput && (
        <button
          onClick={() => setShowWorkInput(true)}
          className="w-full py-3 text-[14px] text-apple-blue-500 hover:text-apple-blue-600 font-medium transition-colors"
        >
          직장 주소도 입력하기 (선택)
        </button>
      )}

      {/* 직장 주소 선택 - Apple 스타일 */}
      {showWorkInput && (
        <div className="space-y-3 animate-fadeIn mt-2">
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-semibold text-apple-gray-600">직장 지역</label>
            <button
              onClick={() => {
                setShowWorkInput(false);
                setWorkRegion(null);
              }}
              className="text-[13px] text-apple-gray-400 hover:text-apple-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SIDO_LIST.map((sido) => {
              const isSelected = workRegion === sido.value;
              return (
                <button
                  key={sido.value}
                  onClick={() => setWorkRegion(sido.value)}
                  className={`py-2.5 px-2 rounded-apple text-center transition-all duration-200 ${
                    isSelected
                      ? "bg-apple-blue-500 text-white shadow-apple-sm"
                      : "bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-800"
                  }`}
                >
                  <p className={`font-medium text-[12px] ${isSelected ? "text-white" : "text-apple-gray-800"}`}>
                    {sido.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 선택 결과 표시 - Apple 스타일 */}
      {selectedSido && courtInfo && (
        <div className="bg-apple-blue-50 border border-apple-blue-100 rounded-apple-lg p-4 space-y-2 animate-fadeIn mt-4">
          <div className="flex items-center gap-2 text-[14px]">
            <span className="text-apple-blue-500 font-semibold">관할법원</span>
            <span className="text-apple-gray-800 font-medium">{courtInfo.name}</span>
            {isMainCourt && (
              <span className="bg-apple-green-500 text-white text-[11px] px-2 py-0.5 rounded-full font-medium">
                회생법원
              </span>
            )}
          </div>
          {workIsBetter && (
            <p className="text-[13px] text-apple-blue-500 font-medium">
              직장 주소 기준 회생법원으로 진행 (더 유리)
            </p>
          )}
          <div className="flex items-center gap-2 text-[14px]">
            <span className="text-apple-blue-500 font-semibold">최우선변제금</span>
            <span className="text-apple-gray-800 font-medium">{(priorityAmount / 10000).toLocaleString()}만원</span>
          </div>
          {isMainCourt && (
            <p className="text-[12px] text-apple-gray-500">
              회생법원 관할이므로 배우자 재산이 청산가치에 포함되지 않습니다
            </p>
          )}
        </div>
      )}

      {/* 버튼 - Apple 스타일 */}
      <div className="mt-auto pt-6">
        <div className="grid grid-cols-2 gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="py-4 rounded-apple-lg text-[17px] font-semibold bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200 transition-all duration-200 active:scale-[0.98]"
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!homeRegion}
            className={`py-4 rounded-apple-lg text-[17px] font-semibold transition-all duration-200 ${
              onBack ? "" : "col-span-2"
            } ${
              homeRegion
                ? "bg-apple-blue-500 hover:bg-apple-blue-600 active:bg-apple-blue-700 active:scale-[0.98] text-white shadow-apple-button"
                : "bg-apple-gray-100 text-apple-gray-400 cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
