"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted, formatKoreanCurrency } from "@/utils/formatNumber";
import { REGIONS, MAIN_COURT_REGIONS } from "@/app/constants";
import type { HousingType, RegionType } from "@/app/types";

// 자산 입력 방식 선택
export function AssetInputModeSelection({
  onSelect,
  onBack,
}: {
  onSelect: (mode: 'direct' | 'calculate') => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          보유 자산 가액은 얼마인가요?
        </h2>
        <p className="text-gray-600 text-sm">부동산, 차량 등 모든 자산의 시장 가치</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect('direct')}
          className="w-full bg-white border-2 border-primary-300 hover:border-primary-500 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✍️</span>
            <div>
              <p className="font-bold text-gray-900">직접 입력</p>
              <p className="text-xs text-gray-600">자산 가액을 알고 있어요</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('calculate')}
          className="w-full bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧮</span>
            <div>
              <p className="font-bold text-gray-900">계산하기</p>
              <p className="text-xs text-gray-600">주거 형태로 자동 계산할게요</p>
            </div>
          </div>
        </button>
      </div>

      <button onClick={onBack} className="w-full secondary-button text-sm py-2.5">
        이전
      </button>
    </div>
  );
}

// 주거 형태 선택
export function HousingTypeSelection({
  onSelect,
  onBack,
}: {
  onSelect: (type: HousingType) => void;
  onBack: () => void;
}) {
  const options = [
    { type: 'owned' as const, icon: '🏠', label: '본인 명의 자가', desc: '주택을 소유하고 있어요' },
    { type: 'jeonse' as const, icon: '🔑', label: '전세', desc: '전세로 거주하고 있어요' },
    { type: 'monthly' as const, icon: '📅', label: '월세', desc: '월세로 거주하고 있어요' },
    { type: 'free' as const, icon: '🏡', label: '무상거주', desc: '무상으로 거주하고 있어요' },
  ];

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          현재 주거 형태는?
        </h2>
        <p className="text-gray-600 text-sm">해당하는 항목을 선택해주세요</p>
      </div>

      <div className="space-y-2.5">
        {options.map((option) => (
          <button
            key={option.type}
            onClick={() => onSelect(option.type)}
            className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-3.5 text-left transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.icon}</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">{option.label}</p>
                <p className="text-xs text-gray-600">{option.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onBack} className="w-full secondary-button text-sm py-2.5">
        이전
      </button>
    </div>
  );
}

// 주소지 선택
export function AddressSelection({
  onNext,
  onBack,
  type,
}: {
  onNext: (region: RegionType) => void;
  onBack: () => void;
  type: 'deposit' | 'spouse';
}) {
  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          {type === 'deposit' ? '거주지 주소를 선택해주세요' : '배우자 주택 소재지를 선택해주세요'}
        </h2>
        <p className="text-gray-600 text-sm">지역별 최우선변제금액이 다릅니다</p>
      </div>

      <div className="space-y-2.5">
        {REGIONS.map((region) => (
          <button
            key={region.value}
            onClick={() => onNext(region.value)}
            className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-3.5 text-left transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-sm">{region.label}</p>
                {region.sublabel && <p className="text-xs text-gray-500 mt-0.5">{region.sublabel}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">최우선변제</p>
                <p className="font-bold text-primary-600 text-sm">{region.amount.toLocaleString()}만원</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onBack} className="w-full secondary-button text-sm py-2.5">
        이전
      </button>
    </div>
  );
}

// 월세보증금 입력
export function MonthlyRentDepositInput({
  onNext,
  onBack,
  initialValue,
}: {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
}) {
  const displayValue = initialValue > 0 ? initialValue : 0;
  const [value, setValue] = useState(displayValue > 0 ? displayValue.toLocaleString() : "");

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    onNext(numericValue);
  };

  const isValid = value && parseNumberFromFormatted(value) >= 0;

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          월세 보증금은 얼마인가요?
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">현재 거주 중인 월세 보증금</p>
      </div>

      <div className="flex-1">
        <div className="relative mb-6">
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 transition-colors pb-2">
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(handleNumberInput(e.target.value))}
              onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
              className="flex-1 text-[32px] font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="0"
              autoFocus
            />
            <span className="text-[20px] font-medium text-gray-400 ml-2">원</span>
          </div>
          {/* 한글 금액 표시 */}
          {value && parseNumberFromFormatted(value) > 0 && (
            <p className="text-[15px] text-blue-500 mt-2">
              {formatKoreanCurrency(parseNumberFromFormatted(value))}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-[2] py-4 rounded-xl text-[17px] font-semibold transition-all ${
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

// 배우자 주택 관할법원 정보
export { SpouseHousingJurisdictionInfo } from "./SpouseHousingJurisdictionInfo";

// 배우자 명의주택 여부 확인
export function SpouseHousingCheck({
  onSelect,
  onBack,
}: {
  onSelect: (isSpouse: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          배우자 명의 주택에 거주하시나요?
        </h2>
        <p className="text-gray-600 text-sm">배우자 소유 주택에 무상 거주 중인 경우</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect(true)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-gray-900">예</p>
              <p className="text-xs text-gray-600">배우자 명의 주택에 거주해요</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect(false)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-bold text-gray-900">아니오</p>
              <p className="text-xs text-gray-600">배우자 명의가 아니에요</p>
            </div>
          </div>
        </button>
      </div>

      <button onClick={onBack} className="w-full secondary-button text-sm py-2.5">
        이전
      </button>
    </div>
  );
}

// 법원 관할 주소지 선택
export function CourtJurisdictionSelection({
  onNext,
  onBack,
}: {
  onNext: (isMainCourt: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          주택 소재지를 선택해주세요
        </h2>
        <p className="text-gray-600 text-sm">법원 관할에 따라 청산가치 계산이 다릅니다</p>
      </div>

      <div className="space-y-2.5">
        {MAIN_COURT_REGIONS.map((court, idx) => (
          <button
            key={idx}
            onClick={() => onNext(true)}
            className="w-full bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-3.5 text-left transition-all hover:shadow-lg"
          >
            <div>
              <p className="font-bold text-gray-900 text-sm">{court.label}</p>
              <p className="text-xs text-blue-600 mt-0.5">{court.desc}</p>
              <p className="text-xs text-gray-500 mt-1">→ 청산가치: 0원</p>
            </div>
          </button>
        ))}

        <button
          onClick={() => onNext(false)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-3.5 text-left transition-all hover:shadow-lg"
        >
          <div>
            <p className="font-bold text-gray-900 text-sm">그 외 지역</p>
            <p className="text-xs text-gray-600 mt-0.5">기타 법원 관할</p>
            <p className="text-xs text-gray-500 mt-1">→ KB시세 - 근저당권으로 계산</p>
          </div>
        </button>
      </div>

      <button onClick={onBack} className="w-full secondary-button text-sm py-2.5">
        이전
      </button>
    </div>
  );
}

// 배우자 재산을 위한 결혼 여부 확인
export function MarriageCheckForAsset({
  onSelect,
  onBack,
}: {
  onSelect: (isMarried: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          결혼하셨나요?
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">
          배우자 재산이 청산가치에 포함될 수 있어요
        </p>
      </div>

      <div className="flex-1 space-y-3">
        <button
          onClick={() => onSelect(true)}
          className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-5 text-left transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💑</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">네, 기혼이에요</p>
              <p className="text-sm text-gray-500 mt-0.5">배우자 재산을 확인할게요</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect(false)}
          className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-5 text-left transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🙋</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">아니요</p>
              <p className="text-sm text-gray-500 mt-0.5">미혼 또는 이혼</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={onBack}
          className="w-full py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          이전
        </button>
      </div>
    </div>
  );
}

// 배우자 재산 유무 확인
export function SpouseAssetCheck({
  onSelect,
  onBack,
}: {
  onSelect: (hasAsset: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          배우자 명의 재산이 있나요?
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">
          부동산, 예금, 주식, 자동차 등 배우자 명의 재산
        </p>
      </div>

      <div className="flex-1 space-y-3">
        <button
          onClick={() => onSelect(true)}
          className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-5 text-left transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">네, 있어요</p>
              <p className="text-sm text-gray-500 mt-0.5">배우자 재산 금액을 입력할게요</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect(false)}
          className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-5 text-left transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">아니요, 없어요</p>
              <p className="text-sm text-gray-500 mt-0.5">배우자 재산이 없어요</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={onBack}
          className="w-full py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          이전
        </button>
      </div>
    </div>
  );
}

// 배우자 재산 금액 입력
export function SpouseAssetInput({
  onNext,
  onBack,
  initialValue,
  isMainCourt,
}: {
  onNext: (value: number) => void;
  onBack: () => void;
  initialValue: number;
  isMainCourt: boolean;
}) {
  const displayValue = initialValue > 0 ? initialValue : 0;
  const [value, setValue] = useState(displayValue > 0 ? displayValue.toLocaleString() : "");

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    onNext(numericValue);
  };

  const isValid = value && parseNumberFromFormatted(value) > 0;

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          배우자 재산은 얼마인가요?
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">
          부동산, 예금, 주식, 자동차 등 모두 포함해주세요
        </p>
      </div>

      <div className="flex-1">
        <div className="relative mb-6">
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 transition-colors pb-2">
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(handleNumberInput(e.target.value))}
              onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
              className="flex-1 text-[32px] font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="0"
              autoFocus
            />
            <span className="text-[20px] font-medium text-gray-400 ml-2">원</span>
          </div>
          {/* 한글 금액 표시 */}
          {value && parseNumberFromFormatted(value) > 0 && (
            <p className="text-[15px] text-blue-500 mt-2">
              {formatKoreanCurrency(parseNumberFromFormatted(value))}
            </p>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            {isMainCourt ? (
              <>
                <span className="font-semibold">회생법원 관할</span>이므로 배우자 재산은 청산가치에 <span className="font-semibold">포함되지 않아요</span>
              </>
            ) : (
              <>
                <span className="font-semibold">기타 법원 관할</span>이므로 배우자 재산의 <span className="font-semibold">50%</span>가 청산가치에 포함돼요
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-[2] py-4 rounded-xl text-[17px] font-semibold transition-all ${
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
