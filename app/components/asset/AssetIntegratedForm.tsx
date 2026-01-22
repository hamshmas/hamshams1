"use client";

import { useState } from "react";
import { PRIORITY_REPAYMENT, MAIN_COURTS } from "@/app/constants";
import type { HousingType, RegionType } from "@/app/types";

function formatNumber(value: string): string {
  const num = value.replace(/[^\d]/g, "");
  return num ? Number(num).toLocaleString() : "";
}

function parseNumber(value: string): number {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

function formatKoreanCurrency(value: number): string {
  if (value === 0) return "";
  const uk = Math.floor(value / 100000000);
  const man = Math.floor((value % 100000000) / 10000);
  let result = "";
  if (uk > 0) result += `${uk}억 `;
  if (man > 0) result += `${man.toLocaleString()}만`;
  return result ? result + "원" : "";
}

function SmallValueModal({
  value,
  label,
  onConfirm,
  onConvertToMan,
  onCancel,
}: {
  value: number;
  label: string;
  onConfirm: () => void;
  onConvertToMan: () => void;
  onCancel: () => void;
}) {
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
            {label} 금액을 확인해주세요
          </h3>
          <p className="text-[15px] text-apple-gray-500 leading-relaxed">
            입력하신 금액이 <span className="font-semibold text-amber-600">{value.toLocaleString()}원</span>입니다.
            <br />
            혹시 <span className="font-semibold text-apple-blue-500">{value.toLocaleString()}만원</span>을 입력하려고 하신 건가요?
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

interface AssetIntegratedFormProps {
  onNext: (totalAsset: number, isMarried: boolean) => void;
  onBack: () => void;
  courtJurisdiction: string;
  priorityRepaymentRegion: RegionType;
}

export function AssetIntegratedForm({
  onNext,
  onBack,
  courtJurisdiction,
  priorityRepaymentRegion,
}: AssetIntegratedFormProps) {
  const [housingType, setHousingType] = useState<HousingType | null>(null);
  const [housingValue, setHousingValue] = useState("");
  const [mortgageAmount, setMortgageAmount] = useState("");
  const [otherAsset, setOtherAsset] = useState("");
  const [hasSpouse, setHasSpouse] = useState<boolean | null>(null);
  const [spouseAsset, setSpouseAsset] = useState("");

  const [showSmallValueModal, setShowSmallValueModal] = useState(false);
  const [smallValueField, setSmallValueField] = useState<"housing" | "mortgage" | null>(null);
  const [pendingSmallValue, setPendingSmallValue] = useState(0);

  const isMainCourt = MAIN_COURTS.includes(courtJurisdiction);
  const priorityAmount = PRIORITY_REPAYMENT[priorityRepaymentRegion] || 0;

  const checkSmallValue = (value: number, field: "housing" | "mortgage"): boolean => {
    if (value > 0 && value <= 99000) {
      setPendingSmallValue(value);
      setSmallValueField(field);
      setShowSmallValueModal(true);
      return true;
    }
    return false;
  };

  const handleConvertToMan = () => {
    const convertedValue = (pendingSmallValue * 10000).toLocaleString();
    if (smallValueField === "housing") {
      setHousingValue(convertedValue);
    } else if (smallValueField === "mortgage") {
      setMortgageAmount(convertedValue);
    }
    setShowSmallValueModal(false);
    setSmallValueField(null);
  };

  const handleConfirmSmallValue = () => {
    setShowSmallValueModal(false);
    setSmallValueField(null);
  };

  const handleCancelSmallValue = () => {
    if (smallValueField === "housing") {
      setHousingValue("");
    } else if (smallValueField === "mortgage") {
      setMortgageAmount("");
    }
    setShowSmallValueModal(false);
    setSmallValueField(null);
  };

  const calculateTotal = () => {
    let total = 0;

    const housingVal = parseNumber(housingValue);
    const mortgageVal = parseNumber(mortgageAmount);

    if (housingType === "owned") {
      total += Math.max(0, housingVal - mortgageVal);
    } else if (housingType === "jeonse" || housingType === "monthly") {
      total += Math.max(0, housingVal - priorityAmount);
    }

    total += parseNumber(otherAsset);

    if (hasSpouse && !isMainCourt) {
      total += Math.floor(parseNumber(spouseAsset) / 2);
    }

    return total;
  };

  const isValid = housingType !== null && hasSpouse !== null;

  const handleSubmit = () => {
    if (!isValid) return;
    onNext(calculateTotal(), hasSpouse === true);
  };

  const housingTypes: { type: HousingType; label: string }[] = [
    { type: "monthly", label: "월세" },
    { type: "jeonse", label: "전세" },
    { type: "owned", label: "자가" },
    { type: "free", label: "무상거주" },
  ];

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 제목 - Apple 스타일 */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-apple-gray-800 leading-tight tracking-tight mb-3">
          자산 정보를 입력해주세요
        </h2>
        <p className="text-[15px] text-apple-gray-500">정확하지 않아도 괜찮아요</p>
      </div>

      <div className="flex-1 space-y-6">
        {/* 주거 형태 선택 */}
        <div className="space-y-3">
          <label className="text-[14px] font-semibold text-apple-gray-600">주거 형태</label>
          <div className="grid grid-cols-4 gap-2">
            {housingTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => setHousingType(item.type)}
                className={`p-3 rounded-apple text-center transition-all duration-200 ${
                  housingType === item.type
                    ? "bg-apple-blue-500 text-white shadow-apple-sm"
                    : "bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200"
                }`}
              >
                <p className="font-semibold text-[14px]">{item.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 주거 가액 */}
        {housingType && housingType !== "free" && (
          <div className="space-y-2 animate-fadeIn">
            <label className="text-[14px] font-semibold text-apple-gray-600">
              {housingType === "owned" ? "KB시세 (주택 가격)" : "보증금"}
            </label>
            <div className="flex items-baseline border-b-2 border-apple-gray-200 focus-within:border-apple-blue-500 transition-all duration-200 pb-2">
              <input
                type="text"
                inputMode="numeric"
                value={housingValue}
                onChange={(e) => setHousingValue(formatNumber(e.target.value))}
                onBlur={() => checkSmallValue(parseNumber(housingValue), "housing")}
                className="flex-1 text-[24px] font-bold text-apple-gray-800 outline-none bg-transparent placeholder:text-apple-gray-300 tracking-tight"
                placeholder="0"
              />
              <span className="text-[16px] font-medium text-apple-gray-400 ml-2">원</span>
            </div>
            {parseNumber(housingValue) > 0 && (
              <p className="text-[14px] text-apple-blue-500 font-medium">{formatKoreanCurrency(parseNumber(housingValue))}</p>
            )}
          </div>
        )}

        {/* 담보대출 */}
        {housingType === "owned" && (
          <div className="space-y-2 animate-fadeIn">
            <label className="text-[14px] font-semibold text-apple-gray-600">담보대출 (근저당)</label>
            <div className="flex items-baseline border-b-2 border-apple-gray-200 focus-within:border-apple-blue-500 transition-all duration-200 pb-2">
              <input
                type="text"
                inputMode="numeric"
                value={mortgageAmount}
                onChange={(e) => setMortgageAmount(formatNumber(e.target.value))}
                onBlur={() => checkSmallValue(parseNumber(mortgageAmount), "mortgage")}
                className="flex-1 text-[24px] font-bold text-apple-gray-800 outline-none bg-transparent placeholder:text-apple-gray-300 tracking-tight"
                placeholder="0"
              />
              <span className="text-[16px] font-medium text-apple-gray-400 ml-2">원</span>
            </div>
            {parseNumber(mortgageAmount) > 0 && (
              <p className="text-[14px] text-apple-blue-500 font-medium">{formatKoreanCurrency(parseNumber(mortgageAmount))}</p>
            )}
          </div>
        )}

        {/* 기타 자산 */}
        <div className="space-y-2">
          <label className="text-[14px] font-semibold text-apple-gray-600">기타 자산</label>
          <p className="text-[12px] text-apple-gray-400">예금, 주식, 자동차, 보험 해지환급금 등</p>
          <div className="flex items-baseline border-b-2 border-apple-gray-200 focus-within:border-apple-blue-500 transition-all duration-200 pb-2">
            <input
              type="text"
              inputMode="numeric"
              value={otherAsset}
              onChange={(e) => setOtherAsset(formatNumber(e.target.value))}
              className="flex-1 text-[24px] font-bold text-apple-gray-800 outline-none bg-transparent placeholder:text-apple-gray-300 tracking-tight"
              placeholder="0"
            />
            <span className="text-[16px] font-medium text-apple-gray-400 ml-2">원</span>
          </div>
          {parseNumber(otherAsset) > 0 && (
            <p className="text-[14px] text-apple-blue-500 font-medium">{formatKoreanCurrency(parseNumber(otherAsset))}</p>
          )}
        </div>

        {/* 배우자 여부 */}
        <div className="space-y-3">
          <label className="text-[14px] font-semibold text-apple-gray-600">배우자 유무</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setHasSpouse(false);
                setSpouseAsset("");
              }}
              className={`p-3.5 rounded-apple text-center transition-all duration-200 ${
                hasSpouse === false
                  ? "bg-apple-blue-500 text-white shadow-apple-sm"
                  : "bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200"
              }`}
            >
              <p className="font-semibold text-[15px]">미혼/이혼</p>
            </button>
            <button
              onClick={() => setHasSpouse(true)}
              className={`p-3.5 rounded-apple text-center transition-all duration-200 ${
                hasSpouse === true
                  ? "bg-apple-blue-500 text-white shadow-apple-sm"
                  : "bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200"
              }`}
            >
              <p className="font-semibold text-[15px]">기혼</p>
            </button>
          </div>
        </div>

        {/* 배우자 재산 */}
        {hasSpouse === true && (
          <div className="space-y-2 animate-fadeIn">
            <label className="text-[14px] font-semibold text-apple-gray-600">배우자 재산</label>
            <p className="text-[12px] text-apple-gray-400">
              {isMainCourt
                ? "회생법원 관할이므로 청산가치에 포함되지 않습니다"
                : "기타법원 관할이므로 50%가 청산가치에 반영됩니다"}
            </p>
            <div className="flex items-baseline border-b-2 border-apple-gray-200 focus-within:border-apple-blue-500 transition-all duration-200 pb-2">
              <input
                type="text"
                inputMode="numeric"
                value={spouseAsset}
                onChange={(e) => setSpouseAsset(formatNumber(e.target.value))}
                className="flex-1 text-[24px] font-bold text-apple-gray-800 outline-none bg-transparent placeholder:text-apple-gray-300 tracking-tight"
                placeholder="0"
              />
              <span className="text-[16px] font-medium text-apple-gray-400 ml-2">원</span>
            </div>
            {parseNumber(spouseAsset) > 0 && (
              <p className="text-[14px] text-apple-blue-500 font-medium">{formatKoreanCurrency(parseNumber(spouseAsset))}</p>
            )}
          </div>
        )}

        {/* 계산 결과 미리보기 */}
        {isValid && (
          <div className="bg-apple-blue-50 border border-apple-blue-100 rounded-apple-lg p-4 animate-fadeIn">
            <p className="text-[13px] text-apple-gray-500 mb-1">예상 청산가치</p>
            <p className="text-[22px] font-bold text-apple-blue-500 tracking-tight">
              {calculateTotal().toLocaleString()}원
            </p>
            <p className="text-[13px] text-apple-gray-400 mt-1">
              {formatKoreanCurrency(calculateTotal())}
            </p>
          </div>
        )}
      </div>

      {/* 버튼 - Apple 스타일 */}
      <div className="mt-auto pt-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onBack}
            className="py-4 rounded-apple-lg text-[17px] font-semibold bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200 transition-all duration-200 active:scale-[0.98]"
          >
            이전
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`py-4 rounded-apple-lg text-[17px] font-semibold transition-all duration-200 ${
              isValid
                ? "bg-apple-blue-500 hover:bg-apple-blue-600 active:bg-apple-blue-700 active:scale-[0.98] text-white shadow-apple-button"
                : "bg-apple-gray-100 text-apple-gray-400 cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>
      </div>

      {/* 소액 확인 모달 */}
      {showSmallValueModal && (
        <SmallValueModal
          value={pendingSmallValue}
          label={smallValueField === "housing" ? (housingType === "owned" ? "KB시세" : "보증금") : "담보대출"}
          onConfirm={handleConfirmSmallValue}
          onConvertToMan={handleConvertToMan}
          onCancel={handleCancelSmallValue}
        />
      )}
    </div>
  );
}
