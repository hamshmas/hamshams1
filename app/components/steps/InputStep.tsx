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
  checkSmallValue?: boolean; // 99,000원 이하 단위 확인 여부
}

// 단위 확인 모달 컴포넌트
function UnitConfirmModal({
  value,
  onConfirm,
  onConvertToMan,
  onCancel,
}: {
  value: number;
  onConfirm: () => void;
  onConvertToMan: () => void;
  onCancel: () => void;
}) {
  const convertedValue = value * 10000;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            금액을 확인해주세요
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            입력하신 금액이 <span className="font-bold text-amber-600">{value.toLocaleString()}원</span>입니다.
            <br />
            혹시 <span className="font-bold text-blue-600">{value.toLocaleString()}만원</span>을 입력하려고 하신 건가요?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onConvertToMan}
            className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            {value.toLocaleString()}만원 ({formatKoreanCurrency(convertedValue)})
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            {value.toLocaleString()}원이 맞습니다
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors"
          >
            다시 입력하기
          </button>
        </div>
      </div>
    </div>
  );
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
