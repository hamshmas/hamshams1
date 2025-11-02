"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted, convertManwonToWon, convertWonToManwon } from "@/utils/formatNumber";

interface KBPriceInputProps {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
}

export function KBPriceInput({ onNext, onBack, initialValue }: KBPriceInputProps) {
  const manwonValue = initialValue > 0 ? convertWonToManwon(initialValue) : 0;
  const [value, setValue] = useState(manwonValue > 0 ? manwonValue.toLocaleString() : "");
  const [showLink, setShowLink] = useState(false);

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    onNext(convertManwonToWon(numericManwon));
  };

  const isValid = value && parseNumberFromFormatted(value) > 0;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          KB시세를 입력해주세요
        </h2>
        <p className="text-gray-600 text-sm">부동산의 KB시세 기준 가격</p>
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(handleNumberInput(e.target.value))}
          onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
          className="input-modern"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">만원</p>
      </div>

      {!showLink ? (
        <button
          onClick={() => setShowLink(true)}
          className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-lg py-2 text-sm hover:bg-blue-100 transition-all"
        >
          KB시세를 모르시나요?
        </button>
      ) : (
        <a
          href="https://kbland.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg py-2.5 text-sm text-center hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          🔗 KB부동산 시세 확인하기 (새 창)
        </a>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} className="w-1/3 secondary-button text-sm py-2.5">
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5"
        >
          다음
        </button>
      </div>
    </div>
  );
}
