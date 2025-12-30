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
    <div className="space-y-6 animate-fadeInUp">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg shadow-indigo-500/30 mb-2">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          보유 자산 가액은?
        </h2>
        <p className="text-base text-gray-600 leading-relaxed">
          부동산, 차량 등<br />모든 자산의 시장 가치
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect('direct')}
          className="group w-full bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">직접 입력 <span className="text-indigo-600">추천</span></p>
              <p className="text-sm text-gray-600">자산 가액을 알고 있어요</p>
            </div>
            <svg className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => onSelect('calculate')}
          className="group w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-indigo-100 group-hover:to-indigo-200 rounded-2xl flex items-center justify-center transition-all">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">계산하기</p>
              <p className="text-sm text-gray-600">주거 형태로 자동 계산할게요</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <button
        onClick={onBack}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-95"
      >
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
    {
      type: 'owned' as const,
      label: '본인 명의 자가',
      desc: '주택을 소유하고 있어요',
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      type: 'jeonse' as const,
      label: '전세',
      desc: '전세로 거주하고 있어요',
      gradient: 'from-green-500 to-emerald-600',
      shadow: 'shadow-green-500/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    },
    {
      type: 'monthly' as const,
      label: '월세',
      desc: '월세로 거주하고 있어요',
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      type: 'free' as const,
      label: '무상거주',
      desc: '무상으로 거주하고 있어요',
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl shadow-lg shadow-teal-500/30 mb-2">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          현재 주거 형태는?
        </h2>
        <p className="text-base text-gray-600 leading-relaxed">
          해당하는 항목을 선택해주세요
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.type}
            onClick={() => onSelect(option.type)}
            className="group w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-400 rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center shadow-lg ${option.shadow}`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base">{option.label}</p>
                <p className="text-sm text-gray-600 mt-0.5">{option.desc}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-95"
      >
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
