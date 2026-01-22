"use client";

import { useState, useEffect, useRef } from "react";
import { handleNumberInput, parseNumberFromFormatted, formatKoreanCurrency } from "@/utils/formatNumber";
import { UnitConfirmModal } from "@/app/components/ui/UnitConfirmModal";

interface InputStepProps {
  title: string;
  subtitle: string;
  onNext: (value: number) => void;
  onBack?: () => void;
  initialValue: number;
  minValue: number;
  unitType?: 'won' | 'count';
  checkSmallValue?: boolean; // 99,000원 이하 단위 확인 여부
}

export function InputStep({
  title,
  subtitle,
  onNext,
  onBack,
  initialValue,
  minValue,
  unitType = 'won',
  checkSmallValue = false,
}: InputStepProps) {
  const displayValue = initialValue > 0 ? initialValue : 0;
  const [value, setValue] = useState(displayValue > 0 ? displayValue.toLocaleString() : "");
  const [showUnitConfirm, setShowUnitConfirm] = useState(false);
  const [pendingValue, setPendingValue] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 자동 포커스
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);

    // 99,000원 이하이고 checkSmallValue가 true인 경우 단위 확인
    if (checkSmallValue && numericValue > 0 && numericValue <= 99000) {
      setPendingValue(numericValue);
      setShowUnitConfirm(true);
      return;
    }

    onNext(numericValue);
  };

  const handleConfirmOriginal = () => {
    setShowUnitConfirm(false);
    onNext(pendingValue);
  };

  const handleConvertToMan = () => {
    const convertedValue = pendingValue * 10000;
    setShowUnitConfirm(false);
    setValue(convertedValue.toLocaleString());
    onNext(convertedValue);
  };

  const handleCancelConfirm = () => {
    setShowUnitConfirm(false);
    setPendingValue(0);
    // 입력창에 포커스
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isValid = value && parseNumberFromFormatted(value) >= minValue;

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 단위 확인 모달 */}
      {showUnitConfirm && (
        <UnitConfirmModal
          value={pendingValue}
          onConfirm={handleConfirmOriginal}
          onConvertToMan={handleConvertToMan}
          onCancel={handleCancelConfirm}
        />
      )}

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
        <div className="grid grid-cols-2 gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="py-4 rounded-xl text-[17px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              ← 이전
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`py-4 rounded-xl text-[17px] font-semibold transition-all ${
              onBack ? '' : 'col-span-2'
            } ${
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
