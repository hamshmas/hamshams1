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

  // 더 유리한 법원 선택 (회생법원 우선)
  const getBetterCourt = () => {
    if (!homeSido) return null;
    if (!workSido) return homeSido;

    const homeIsMain = MAIN_COURTS.includes(homeSido.court);
    const workIsMain = MAIN_COURTS.includes(workSido.court);

    // 회생법원이 있으면 회생법원 우선
    if (homeIsMain && !workIsMain) return homeSido;
    if (!homeIsMain && workIsMain) return workSido;

    // 둘 다 회생법원이거나 둘 다 아니면 집 주소 기준
    return homeSido;
  };

  const selectedSido = getBetterCourt();
  const courtInfo = selectedSido ? COURT_DETAILS[selectedSido.court] : null;
  const priorityAmount = homeSido ? PRIORITY_REPAYMENT[homeSido.region] : 0; // 최우선변제금은 항상 집 주소 기준
  const isMainCourt = selectedSido ? MAIN_COURTS.includes(selectedSido.court) : false;

  // 직장 법원이 더 유리한지 체크
  const workIsBetter = workSido && homeSido &&
    MAIN_COURTS.includes(workSido.court) &&
    !MAIN_COURTS.includes(homeSido.court);

  const handleNext = () => {
    if (!selectedSido || !homeSido) return;
    onNext({
      selectedRegion: homeSido.label,
      courtJurisdiction: selectedSido.court as CourtCode,
      priorityRepaymentRegion: homeSido.region as RegionType, // 최우선변제금은 집 주소 기준
    });
  };

  return (
    <div className="space-y-3 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          어디에 거주하시나요?
        </h2>
        <p className="text-gray-600 text-sm">관할법원과 최우선변제금 계산에 사용됩니다</p>
      </div>

      {/* 집 주소 선택 그리드 */}
      <div className="grid grid-cols-3 gap-1.5">
        {SIDO_LIST.map((sido) => {
          const isSelected = homeRegion === sido.value;
          return (
            <button
              key={sido.value}
              onClick={() => setHomeRegion(sido.value)}
              className={`py-2.5 px-2 rounded-lg text-center transition-all ${
                isSelected
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800"
              }`}
            >
              <p className={`font-medium text-xs ${isSelected ? "text-white" : "text-gray-900"}`}>
                {sido.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* 직장 주소 입력 토글 */}
      {homeRegion && !showWorkInput && (
        <button
          onClick={() => setShowWorkInput(true)}
          className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 직장 주소도 입력하기 (선택)
        </button>
      )}

      {/* 직장 주소 선택 */}
      {showWorkInput && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">직장 지역</label>
            <button
              onClick={() => {
                setShowWorkInput(false);
                setWorkRegion(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕ 취소
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {SIDO_LIST.map((sido) => {
              const isSelected = workRegion === sido.value;
              return (
                <button
                  key={sido.value}
                  onClick={() => setWorkRegion(sido.value)}
                  className={`py-2 px-2 rounded-lg text-center transition-all ${
                    isSelected
                      ? "bg-purple-500 text-white shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className={`font-medium text-xs ${isSelected ? "text-white" : "text-gray-900"}`}>
                    {sido.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 선택 결과 표시 */}
      {selectedSido && courtInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600 font-bold">관할법원</span>
            <span className="text-gray-800">{courtInfo.name}</span>
            {isMainCourt && (
              <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                회생법원
              </span>
            )}
          </div>
          {workIsBetter && (
            <p className="text-xs text-purple-600 font-medium">
              ✨ 직장 주소 기준 회생법원으로 진행 (더 유리)
            </p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600 font-bold">최우선변제금</span>
            <span className="text-gray-800">{(priorityAmount / 10000).toLocaleString()}만원</span>
          </div>
          {isMainCourt && (
            <p className="text-xs text-green-700">
              회생법원 관할이므로 배우자 재산이 청산가치에 포함되지 않습니다
            </p>
          )}
        </div>
      )}

      {/* 버튼 */}
      <div className="grid grid-cols-2 gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ← 이전
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!homeRegion}
          className={`py-4 rounded-xl text-[17px] font-semibold transition-all ${
            onBack ? "" : "col-span-2"
          } ${
            homeRegion
              ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
