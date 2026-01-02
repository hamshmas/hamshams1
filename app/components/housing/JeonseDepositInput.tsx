"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted, formatKoreanCurrency } from "@/utils/formatNumber";

interface JeonseDepositInputProps {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
}

export function JeonseDepositInput({ onNext, onBack, initialValue }: JeonseDepositInputProps) {
  const displayValue = initialValue > 0 ? initialValue : 0;
  const [value, setValue] = useState(displayValue > 0 ? displayValue.toLocaleString() : "");

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    onNext(numericValue);
  };

  const isValid = value && parseNumberFromFormatted(value) > 0;

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          전세보증금은 얼마인가요?
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">현재 거주 중인 전세 보증금</p>
      </div>

      <div className="flex-1">
        <div className="relative mb-6">
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 transition-colors pb-2">
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(handleNumberInput(e.target.value))}
              onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
              className="flex-1 text-[32px] font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="0"
              autoFocus
            />
            <span className="text-[20px] font-medium text-gray-400 ml-2">원</span>
          </div>
          {/* 한글 금액 표시 */}
          {value && parseNumberFromFormatted(value) > 0 && (
            <p className="text-[15px] text-blue-500 mt-2">
              {formatKoreanCurrency(parseNumberFromFormatted(value))}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onBack}
            className="py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ← 이전
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`py-4 rounded-xl text-[17px] font-semibold transition-all ${
              isValid
                ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            다음 →
          </button>
        </div>
      </div>
    </div>
  );
}
