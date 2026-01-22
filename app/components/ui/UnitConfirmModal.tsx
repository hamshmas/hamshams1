"use client";
import { formatKoreanCurrency } from "@/utils/formatNumber";

interface UnitConfirmModalProps {
  value: number;
  label?: string;
  onConfirm: () => void;
  onConvertToMan: () => void;
  onCancel: () => void;
}

export function UnitConfirmModal({
  value,
  label = "금액",
  onConfirm,
  onConvertToMan,
  onCancel,
}: UnitConfirmModalProps) {
  const convertedValue = value * 10000;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-apple-xl p-6 max-w-md w-full mx-4 space-y-5 animate-scaleIn shadow-apple-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-[19px] font-bold text-apple-gray-800 mb-2">
            {label}을 확인해주세요
          </h3>
          <p className="text-[15px] text-apple-gray-500 leading-relaxed">
            입력하신 금액이{" "}
            <span className="font-semibold text-amber-600">
              {value.toLocaleString()}원
            </span>
            입니다.
            <br />
            혹시{" "}
            <span className="font-semibold text-apple-blue-500">
              {value.toLocaleString()}만원
            </span>
            을 입력하려고 하신 건가요?
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConvertToMan}
            className="w-full bg-apple-blue-500 hover:bg-apple-blue-600 active:bg-apple-blue-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-apple-lg transition-all duration-200 text-[15px] shadow-apple-button"
          >
            {value.toLocaleString()}만원 ({formatKoreanCurrency(convertedValue)})
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-apple-gray-100 hover:bg-apple-gray-200 active:scale-[0.98] text-apple-gray-700 font-semibold py-3.5 px-4 rounded-apple-lg transition-all duration-200 text-[15px]"
          >
            {value.toLocaleString()}원이 맞습니다
          </button>
          <button
            onClick={onCancel}
            className="w-full text-apple-gray-400 font-medium text-[14px] hover:text-apple-gray-600 transition-colors py-2"
          >
            다시 입력하기
          </button>
        </div>
      </div>
    </div>
  );
}
