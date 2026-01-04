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
  const [selected, setSelected] = useState<string | null>(null);

  const selectedSido = SIDO_LIST.find(s => s.value === selected);
  const courtInfo = selectedSido ? COURT_DETAILS[selectedSido.court] : null;
  const priorityAmount = selectedSido ? PRIORITY_REPAYMENT[selectedSido.region] : 0;
  const isMainCourt = selectedSido ? MAIN_COURTS.includes(selectedSido.court) : false;

  const handleNext = () => {
    if (!selectedSido) return;
    onNext({
      selectedRegion: selectedSido.label,
      courtJurisdiction: selectedSido.court as CourtCode,
      priorityRepaymentRegion: selectedSido.region as RegionType,
    });
  };

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          어디에 거주하시나요?
        </h2>
        <p className="text-gray-600 text-sm">관할법원과 최우선변제금 계산에 사용됩니다</p>
      </div>

      {/* 시/도 선택 그리드 */}
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto">
        {SIDO_LIST.map((sido) => {
          const isSelected = selected === sido.value;
          return (
            <button
              key={sido.value}
              onClick={() => setSelected(sido.value)}
              className={`p-3 rounded-xl text-left transition-all ${
                isSelected
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800"
              }`}
            >
              <p className={`font-semibold text-sm ${isSelected ? "text-white" : "text-gray-900"}`}>
                {sido.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* 선택 결과 표시 */}
      {selectedSido && courtInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">관할법원</span>
            <span className="text-gray-800">{courtInfo.name}</span>
            {isMainCourt && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                회생법원
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">최우선변제금</span>
            <span className="text-gray-800">{(priorityAmount / 10000).toLocaleString()}만원</span>
          </div>
          {isMainCourt && (
            <p className="text-xs text-green-700 mt-1">
              회생법원 관할이므로 배우자 재산이 청산가치에 포함되지 않습니다
            </p>
          )}
        </div>
      )}

      {/* 버튼 */}
      <div className="grid grid-cols-2 gap-3 pt-2">
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
          disabled={!selected}
          className={`py-4 rounded-xl text-[17px] font-semibold transition-all ${
            onBack ? "" : "col-span-2"
          } ${
            selected
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
