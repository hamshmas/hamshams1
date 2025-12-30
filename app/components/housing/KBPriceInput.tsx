"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted, formatKoreanCurrency } from "@/utils/formatNumber";

interface KBPriceInputProps {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
}

export function KBPriceInput({ onNext, onBack, initialValue }: KBPriceInputProps) {
  const displayValue = initialValue > 0 ? initialValue : 0;
  const [value, setValue] = useState(displayValue > 0 ? displayValue.toLocaleString() : "");
  const [showLink, setShowLink] = useState(false);

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    onNext(numericValue);
  };

  const isValid = value && parseNumberFromFormatted(value) > 0;

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          KB시세를 입력해주세요
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">부동산의 KB시세 기준 가격</p>
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

        {!showLink ? (
          <button
            onClick={() => setShowLink(true)}
            className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-xl py-3 text-sm hover:bg-blue-100 transition-all"
          >
            KB시세를 모르시나요?
          </button>
        ) : (
          <a
            href="https://kbland.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-500 text-white font-bold rounded-xl py-3 text-sm text-center hover:bg-blue-600 transition-all"
          >
            KB부동산 시세 확인하기
          </a>
        )}
      </div>

      <div className="mt-auto pt-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-[2] py-4 rounded-xl text-[17px] font-semibold transition-all ${
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
