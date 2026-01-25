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

      {/* 집 주소 선택 그리드 - Apple 스타일 Refined */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {SIDO_LIST.map((sido) => {
          const isSelected = homeRegion === sido.value;
          return (
            <button
              key={sido.value}
              onClick={() => {
                setHomeRegion(sido.value);
                if (!showWorkInput && !workRegion) {
                  // Optional: maybe ask regarding work? for now just select
                }
              }}
              className={`py-3.5 px-2 rounded-apple-lg text-center transition-all duration-300 ease-spring-bouncy ${isSelected
                  ? "bg-apple-blue-500 text-white shadow-apple-md scale-[1.02] ring-2 ring-apple-blue-200 ring-offset-1"
                  : "bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-700 hover:scale-[1.01]"
                }`}
            >
              <p className={`font-semibold text-[14px] ${isSelected ? "text-white" : "text-apple-gray-700"}`}>
                {sido.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="border-t border-apple-gray-100 my-6"></div>

      {/* 직장 주소 입력 토글 - Apple 스타일 Refined */}
      {homeRegion && !showWorkInput && (
        <button
          onClick={() => setShowWorkInput(true)}
          className="w-full py-4 px-4 bg-apple-blue-50 hover:bg-apple-blue-100 rounded-apple-lg border border-apple-blue-100 text-[15px] text-apple-blue-600 font-semibold transition-all duration-200 flex items-center justify-center gap-2 group mb-4"
        >
          <span>직장 주소도 입력하기</span>
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* 직장 주소 선택 - Apple 스타일 Refined */}
      {showWorkInput && (
        <div className="space-y-4 animate-slideUp bg-apple-gray-50 p-5 rounded-apple-xl border border-apple-gray-100 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-apple-blue-500 rounded-full"></div>
              <label className="text-[15px] font-bold text-apple-gray-800">직장 지역</label>
            </div>
            <button
              onClick={() => {
                setShowWorkInput(false);
                setWorkRegion(null);
              }}
              className="text-[13px] text-apple-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-md hover:bg-red-50 font-medium"
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
                  className={`py-3 px-2 rounded-apple-lg text-center transition-all duration-200 ${isSelected
                      ? "bg-apple-blue-500 text-white shadow-apple-sm scale-[1.02]"
                      : "bg-white border border-apple-gray-200 hover:border-apple-gray-300 text-apple-gray-700 hover:bg-apple-gray-50"
                    }`}
                >
                  <p className={`font-medium text-[13px] ${isSelected ? "text-white" : "text-apple-gray-700"}`}>
                    {sido.label}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-[12px] text-apple-gray-500 leading-relaxed bg-white p-3 rounded-lg border border-apple-gray-200">
            💡 <span className="font-semibold text-apple-blue-600">Tip</span> 직장 관할 법원이 더 유리한 경우, 자동으로 직장 기준 회생법원을 안내해 드립니다.
          </p>
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
            className={`py-4 rounded-apple-lg text-[17px] font-semibold transition-all duration-200 ${onBack ? "" : "col-span-2"
              } ${homeRegion
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
