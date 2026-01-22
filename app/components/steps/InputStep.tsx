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
  checkSmallValue?: boolean;
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);

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

      {/* 질문 영역 - Apple 스타일 */}
      <div className="mb-10">
        <h2 className="text-[28px] font-bold text-apple-gray-800 leading-tight tracking-tight mb-3">
          {title}
        </h2>
        <p className="text-[15px] text-apple-gray-500 leading-relaxed">{subtitle}</p>
      </div>

      {/* 입력 영역 - Apple 스타일 */}
      <div className="flex-1">
        <div className="relative mb-6">
          <div className="flex items-baseline border-b-2 border-apple-gray-200 focus-within:border-apple-blue-500 transition-all duration-200 pb-3">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(handleNumberInput(e.target.value))}
              onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
              className="flex-1 text-[36px] font-bold text-apple-gray-800 outline-none bg-transparent placeholder:text-apple-gray-300 tracking-tight"
              placeholder="0"
            />
            <span className="text-[18px] font-medium text-apple-gray-400 ml-2">
              {unitType === 'count' ? '명' : '원'}
            </span>
          </div>
          {/* 한글 금액 표시 */}
          {unitType === 'won' && value && parseNumberFromFormatted(value) > 0 && (
            <p className="text-[15px] text-apple-blue-500 mt-3 font-medium">
              {formatKoreanCurrency(parseNumberFromFormatted(value))}
            </p>
          )}
        </div>
      </div>

      {/* 하단 버튼 - Apple 스타일 */}
      <div className="mt-auto pt-6">
        <div className="grid grid-cols-2 gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="py-4 rounded-apple-lg text-[17px] font-semibold bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-700 transition-all duration-200 active:scale-[0.98]"
            >
              이전
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`py-4 rounded-apple-lg text-[17px] font-semibold transition-all duration-200 ${
              onBack ? '' : 'col-span-2'
            } ${
              isValid
                ? 'bg-apple-blue-500 hover:bg-apple-blue-600 active:bg-apple-blue-700 active:scale-[0.98] text-white shadow-apple-button'
                : 'bg-apple-gray-100 text-apple-gray-400 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
