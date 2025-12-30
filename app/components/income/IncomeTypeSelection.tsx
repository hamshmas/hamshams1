"use client";

import type { IncomeType } from "@/app/types";

interface IncomeTypeSelectionProps {
  onNext: (type: IncomeType) => void;
  onBack: () => void;
  initialValue?: IncomeType | null;
}

export function IncomeTypeSelection({
  onNext,
  onBack,
  initialValue = null,
}: IncomeTypeSelectionProps) {
  return (
    <div className="space-y-4 animate-slideIn">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-1">
          소득 유형을 선택하세요
        </h2>
        <p className="text-gray-600 text-sm">소득 형태에 따라 선택해주세요 · 절반 이상 완료!</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onNext('salary')}
          className={`w-full border-2 rounded-xl p-4 transition-all text-left ${
            initialValue === 'salary'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          }`}
        >
          <p className="font-bold text-gray-900 text-sm mb-1">💼 급여소득자</p>
          <p className="text-xs text-gray-600">
            회사로부터 급여를 받는 경우 (정규직, 계약직, 아르바이트 등)
          </p>
        </button>

        <button
          onClick={() => onNext('business')}
          className={`w-full border-2 rounded-xl p-4 transition-all text-left ${
            initialValue === 'business'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          }`}
        >
          <p className="font-bold text-gray-900 text-sm mb-1">🏪 영업소득자</p>
          <p className="text-xs text-gray-600">
            사업을 운영하거나 프리랜서로 활동하는 경우
          </p>
        </button>
      </div>

      <button onClick={onBack} className="secondary-button w-full text-sm py-2.5">
        이전
      </button>
    </div>
  );
}
