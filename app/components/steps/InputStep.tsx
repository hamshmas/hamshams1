"use client";

import { useState } from "react";
import { handleNumberInput, parseNumberFromFormatted, convertManwonToWon, convertWonToManwon } from "@/utils/formatNumber";

interface InputStepProps {
  title: string;
  subtitle: string;
  onNext: (value: number) => void;
  onBack?: () => void;
  initialValue: number;
  quickAmounts: number[];
  minValue: number;
  unitType?: 'manwon' | 'count'; // 만원 단위 또는 일반 숫자
}

export function InputStep({
  title,
  subtitle,
  onNext,
  onBack,
  initialValue,
  quickAmounts,
  minValue,
  unitType = 'manwon', // 기본값은 만원 단위
}: InputStepProps) {
  const displayValue = unitType === 'count'
    ? initialValue
    : (initialValue > 0 ? convertWonToManwon(initialValue) : 0);
  const [value, setValue] = useState(displayValue > 0 ? displayValue.toLocaleString() : "");

  const handleSubmit = () => {
    const numericValue = parseNumberFromFormatted(value);
    const finalValue = unitType === 'count' ? numericValue : convertManwonToWon(numericValue);
    onNext(finalValue);
  };

  const handleQuickAdd = (amount: number) => {
    const currentValue = value ? parseNumberFromFormatted(value) : 0;
    setValue((currentValue + amount).toLocaleString());
  };

  const isValid = value && parseNumberFromFormatted(value) >= minValue;

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-gray-600 text-sm">{subtitle}</p>
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
        <p className="text-right text-primary-600 font-bold mt-2 text-sm">
          {unitType === 'count' ? '명' : '만원'}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickAmounts.map((amount) => (
          <button key={amount} onClick={() => handleQuickAdd(amount)} className="quick-button text-xs py-1.5 px-3">
            +{amount}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {onBack && (
          <button onClick={onBack} className="w-1/3 secondary-button text-sm py-2.5">
            이전
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`${onBack ? 'w-2/3' : 'w-full'} primary-button disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
