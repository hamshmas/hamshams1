"use client";

import { useState, useEffect, useRef } from "react";
import { handleNumberInput, parseNumberFromFormatted, formatKoreanCurrency } from "@/utils/formatNumber";

interface InputStepProps {
  title: string;
  subtitle: string;
  onNext: (value: number) => void;
  onBack?: () => void;
  initialValue: number;
  minValue: number;
  unitType?: 'won' | 'count';
}

export function InputStep({
  title,
  subtitle,
  onNext,
  onBack,
  initialValue,
  minValue,
  unitType = 'won',
}: InputStepProps) {
  const displayValue = initialValue > 0 ? initialValue : 0;
  const [value, setValue] = useState(displayValue > 0 ? displayValue.toLocaleString() : "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 자동 포커스
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    onNext(numericValue);
  };

  const isValid = value && parseNumberFromFormatted(value) >= minValue;

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 질문 영역 */}
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          {title}
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">{subtitle}</p>
      </div>

      {/* 입력 영역 */}
      <div className="flex-1">
        <div className="relative mb-6">
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 transition-colors pb-2">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(handleNumberInput(e.target.value))}
              onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
              className="flex-1 text-[32px] font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="0"
            />
            <span className="text-[20px] font-medium text-gray-400 ml-2">
              {unitType === 'count' ? '명' : '원'}
            </span>
          </div>
          {/* 한글 금액 표시 */}
          {unitType === 'won' && value && parseNumberFromFormatted(value) > 0 && (
            <p className="text-[15px] text-blue-500 mt-2">
              {formatKoreanCurrency(parseNumberFromFormatted(value))}
            </p>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto pt-6">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-4 rounded-xl text-[17px] font-semibold transition-all ${
            isValid
              ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
