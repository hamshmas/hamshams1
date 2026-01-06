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
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 질문 영역 */}
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          {getTitle()}
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">{getSubtitle()}</p>
      </div>

      {/* 입력 영역 */}
      <div className="flex-1">
        <div className="relative mb-6">
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 transition-colors pb-2">
            <input
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && isValid && onNext(Number(value))}
              className="flex-1 text-[32px] font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="0"
              autoFocus
              min="0"
              max="10"
            />
            <span className="text-[20px] font-medium text-gray-400 ml-2">명</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => setValue(String(num))}
              className="px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg font-medium text-sm transition-colors"
            >
              {num}명
            </button>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto pt-6">
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
    </div>
  );
}
