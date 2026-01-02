"use client";

import { useState } from "react";
import type { MaritalStatus } from "@/app/types";

interface ChildrenCountInputProps {
  maritalStatus: MaritalStatus;
  onNext: (count: number) => void;
  onBack: () => void;
}

export function ChildrenCountInput({ maritalStatus, onNext, onBack }: ChildrenCountInputProps) {
  const [value, setValue] = useState("");

  const getTitle = () => {
    switch (maritalStatus) {
      case 'married':
        return '미성년 자녀가 몇 명인가요?';
      case 'single':
        return '미성년 자녀가 몇 명인가요?';
      case 'divorced':
        return '실제 양육 중인 미성년 자녀가 몇 명인가요?';
    }
  };

  const getSubtitle = () => {
    switch (maritalStatus) {
      case 'married':
        return '만 19세 미만의 자녀 수';
      case 'single':
        return '만 19세 미만의 자녀 수';
      case 'divorced':
        return '현재 함께 거주하며 양육 중인 미성년 자녀';
    }
  };

  const isValid = value && Number(value) >= 0 && Number(value) <= 10;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          {getTitle()}
        </h2>
        <p className="text-gray-600 text-sm">{getSubtitle()}</p>
      </div>

      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && isValid && onNext(Number(value))}
          className="input-modern"
          placeholder="0"
          autoFocus
          min="0"
          max="10"
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">명</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[0, 1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => setValue(String(num))}
            className="quick-button text-xs py-1.5 px-3"
          >
            {num}명
          </button>
        ))}
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
          다음 →
        </button>
      </div>
    </div>
  );
}
