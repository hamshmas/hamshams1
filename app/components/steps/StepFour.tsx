"use client";

import { useState } from "react";

interface StepFourProps {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
}

export function StepFour({ onNext, onBack, initialValue }: StepFourProps) {
  const [value, setValue] = useState(initialValue > 0 ? initialValue.toString() : "");
  const isValid = value && Number(value) >= 1 && Number(value) <= 5;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          가구원은 몇 명인가요?
        </h2>
        <p className="text-gray-600 text-sm">본인 포함 가구원 수 (소수점 가능)</p>
      </div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && isValid && onNext(Number(value))}
          className="input-modern"
          placeholder="1"
          autoFocus
          min="1"
          max="5"
          step="0.1"
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">명</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onBack} className="py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          ← 이전
        </button>
        <button
          onClick={() => onNext(Number(value))}
          disabled={!isValid}
          className={`py-4 rounded-xl text-[17px] font-semibold transition-all ${
            isValid
              ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          결과 확인 →
        </button>
      </div>
    </div>
  );
}
