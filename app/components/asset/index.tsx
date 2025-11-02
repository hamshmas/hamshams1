"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted, convertManwonToWon, convertWonToManwon } from "@/utils/formatNumber";
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
  const manwonValue = initialValue > 0 ? convertWonToManwon(initialValue) : 0;
  const [value, setValue] = useState(manwonValue > 0 ? manwonValue.toLocaleString() : "");

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    onNext(convertManwonToWon(numericManwon));
  };

  const isValid = value && parseNumberFromFormatted(value) >= 0;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          월세 보증금은 얼마인가요?
        </h2>
        <p className="text-gray-600 text-sm">현재 거주 중인 월세 보증금</p>
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(handleNumberInput(e.target.value))}
          onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
          className="input-modern"
          placeholder="0"
          autoFocus
        />
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">만원</p>
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="w-1/3 secondary-button text-sm py-2.5">
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-2/3 primary-button disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5"
        >
          다음
        </button>
      </div>
    </div>
  );
}

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
