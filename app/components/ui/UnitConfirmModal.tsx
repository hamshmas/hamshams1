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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mb-3">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {label}을 확인해주세요
          </h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            입력하신 금액이{" "}
            <span className="font-bold text-amber-600">
              {value.toLocaleString()}원
            </span>
            입니다.
            <br />
            혹시{" "}
            <span className="font-bold text-blue-600">
              {value.toLocaleString()}만원
            </span>
            을 입력하려고 하신 건가요?
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onConvertToMan}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm hover:scale-105 transform"
          >
            {value.toLocaleString()}만원 ({formatKoreanCurrency(convertedValue)})
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all text-sm"
          >
            {value.toLocaleString()}원이 맞습니다
          </button>
          <button
            onClick={onCancel}
            className="w-full text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors py-2"
          >
            다시 입력하기
          </button>
        </div>
      </div>
    </div>
  );
}
