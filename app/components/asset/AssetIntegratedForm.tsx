"use client";

import { useState } from "react";
import { PRIORITY_REPAYMENT, MAIN_COURTS } from "@/app/constants";
import type { HousingType, RegionType } from "@/app/types";

// 숫자 포맷팅 함수
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

// 소액 확인 모달 컴포넌트
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
            {label} 금액을 확인해주세요
          </h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            입력하신 금액이 <span className="font-bold text-amber-600">{value.toLocaleString()}원</span>입니다.
            <br />
            혹시 <span className="font-bold text-blue-600">{value.toLocaleString()}만원</span>을 입력하려고 하신 건가요?
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
  const [housingValue, setHousingValue] = useState(""); // KB시세 또는 보증금
  const [mortgageAmount, setMortgageAmount] = useState(""); // 담보대출
  const [otherAsset, setOtherAsset] = useState(""); // 기타자산
  const [hasSpouse, setHasSpouse] = useState<boolean | null>(null);
  const [spouseAsset, setSpouseAsset] = useState(""); // 배우자 재산

  // 소액 확인 모달 상태
  const [showSmallValueModal, setShowSmallValueModal] = useState(false);
  const [smallValueField, setSmallValueField] = useState<"housing" | "mortgage" | null>(null);
  const [pendingSmallValue, setPendingSmallValue] = useState(0);

  const isMainCourt = MAIN_COURTS.includes(courtJurisdiction);
  const priorityAmount = PRIORITY_REPAYMENT[priorityRepaymentRegion] || 0;

  // 소액 확인이 필요한지 체크 (99,000원 이하)
  const checkSmallValue = (value: number, field: "housing" | "mortgage"): boolean => {
    if (value > 0 && value <= 99000) {
      setPendingSmallValue(value);
      setSmallValueField(field);
      setShowSmallValueModal(true);
      return true;
    }
    return false;
  };

  // 만원 단위로 변환
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

  // 원래 값 유지
  const handleConfirmSmallValue = () => {
    setShowSmallValueModal(false);
    setSmallValueField(null);
  };

  // 다시 입력
  const handleCancelSmallValue = () => {
    if (smallValueField === "housing") {
      setHousingValue("");
    } else if (smallValueField === "mortgage") {
      setMortgageAmount("");
    }
    setShowSmallValueModal(false);
    setSmallValueField(null);
  };

  // 자산 계산
  const calculateTotal = () => {
    let total = 0;

    // 주거 자산 계산
    const housingVal = parseNumber(housingValue);
    const mortgageVal = parseNumber(mortgageAmount);

    if (housingType === "owned") {
      total += Math.max(0, housingVal - mortgageVal);
    } else if (housingType === "jeonse" || housingType === "monthly") {
      total += Math.max(0, housingVal - priorityAmount);
    }
    // 'free'는 0

    // 기타 자산
    total += parseNumber(otherAsset);

    // 배우자 재산 (회생법원이 아닌 경우만 50% 반영)
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

  const housingTypes: { type: HousingType; label: string; desc: string }[] = [
    { type: "monthly", label: "월세", desc: "월세 거주" },
    { type: "jeonse", label: "전세", desc: "전세 거주" },
    { type: "owned", label: "자가", desc: "본인 소유 주택" },
    { type: "free", label: "무상거주", desc: "부모님 집 등" },
  ];

  return (
    <div className="space-y-5 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          자산 정보를 입력해주세요
        </h2>
        <p className="text-gray-600 text-sm">정확하지 않아도 괜찮아요</p>
      </div>

      {/* 주거 형태 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">주거 형태</label>
        <div className="grid grid-cols-4 gap-2">
          {housingTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => setHousingType(item.type)}
              className={`p-3 rounded-xl text-center transition-all ${
                housingType === item.type
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <p className="font-semibold text-sm">{item.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 주거 가액 (자가/전세/월세) */}
      {housingType && housingType !== "free" && (
        <div className="space-y-2 animate-fadeIn">
          <label className="text-sm font-semibold text-gray-700">
            {housingType === "owned" ? "KB시세 (주택 가격)" : "보증금"}
          </label>
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 pb-2">
            <input
              type="text"
              inputMode="numeric"
              value={housingValue}
              onChange={(e) => setHousingValue(formatNumber(e.target.value))}
              onBlur={() => checkSmallValue(parseNumber(housingValue), "housing")}
              className="flex-1 text-2xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="0"
            />
            <span className="text-lg font-medium text-gray-400 ml-2">원</span>
          </div>
          {parseNumber(housingValue) > 0 && (
            <p className="text-sm text-blue-500">{formatKoreanCurrency(parseNumber(housingValue))}</p>
          )}
        </div>
      )}

      {/* 담보대출 (자가만) */}
      {housingType === "owned" && (
        <div className="space-y-2 animate-fadeIn">
          <label className="text-sm font-semibold text-gray-700">담보대출 (근저당)</label>
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 pb-2">
            <input
              type="text"
              inputMode="numeric"
              value={mortgageAmount}
              onChange={(e) => setMortgageAmount(formatNumber(e.target.value))}
              onBlur={() => checkSmallValue(parseNumber(mortgageAmount), "mortgage")}
              className="flex-1 text-2xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="0"
            />
            <span className="text-lg font-medium text-gray-400 ml-2">원</span>
          </div>
          {parseNumber(mortgageAmount) > 0 && (
            <p className="text-sm text-blue-500">{formatKoreanCurrency(parseNumber(mortgageAmount))}</p>
          )}
        </div>
      )}

      {/* 기타 자산 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">기타 자산</label>
        <p className="text-xs text-gray-500">예금, 주식, 자동차, 보험 해지환급금 등</p>
        <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 pb-2">
          <input
            type="text"
            inputMode="numeric"
            value={otherAsset}
            onChange={(e) => setOtherAsset(formatNumber(e.target.value))}
            className="flex-1 text-2xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
            placeholder="0"
          />
          <span className="text-lg font-medium text-gray-400 ml-2">원</span>
        </div>
        {parseNumber(otherAsset) > 0 && (
          <p className="text-sm text-blue-500">{formatKoreanCurrency(parseNumber(otherAsset))}</p>
        )}
      </div>

      {/* 배우자 여부 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">배우자 유무</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setHasSpouse(false);
              setSpouseAsset("");
            }}
            className={`p-3 rounded-xl text-center transition-all ${
              hasSpouse === false
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <p className="font-semibold">미혼/이혼</p>
          </button>
          <button
            onClick={() => setHasSpouse(true)}
            className={`p-3 rounded-xl text-center transition-all ${
              hasSpouse === true
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <p className="font-semibold">기혼</p>
          </button>
        </div>
      </div>

      {/* 배우자 재산 (기혼인 경우) */}
      {hasSpouse === true && (
        <div className="space-y-2 animate-fadeIn">
          <label className="text-sm font-semibold text-gray-700">배우자 재산</label>
          <p className="text-xs text-gray-500">
            {isMainCourt
              ? "회생법원 관할이므로 청산가치에 포함되지 않습니다"
              : "기타법원 관할이므로 50%가 청산가치에 반영됩니다"}
          </p>
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 pb-2">
            <input
              type="text"
              inputMode="numeric"
              value={spouseAsset}
              onChange={(e) => setSpouseAsset(formatNumber(e.target.value))}
              className="flex-1 text-2xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="0"
            />
            <span className="text-lg font-medium text-gray-400 ml-2">원</span>
          </div>
          {parseNumber(spouseAsset) > 0 && (
            <p className="text-sm text-blue-500">{formatKoreanCurrency(parseNumber(spouseAsset))}</p>
          )}
        </div>
      )}

      {/* 계산 결과 미리보기 */}
      {isValid && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fadeIn">
          <p className="text-sm text-gray-600">예상 청산가치</p>
          <p className="text-xl font-bold text-blue-600">
            {calculateTotal().toLocaleString()}원
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatKoreanCurrency(calculateTotal())}
          </p>
        </div>
      )}

      {/* 버튼 */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onBack}
          className="py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`py-4 rounded-xl text-[17px] font-semibold transition-all ${
            isValid
              ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          다음 →
        </button>
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
