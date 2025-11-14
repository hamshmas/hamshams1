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
}

export function InputStep({
  title,
  subtitle,
  onNext,
  onBack,
  initialValue,
  quickAmounts,
  minValue,
}: InputStepProps) {
  const manwonValue = initialValue > 0 ? convertWonToManwon(initialValue) : 0;
  const [value, setValue] = useState(manwonValue > 0 ? manwonValue.toLocaleString() : "");

  const handleSubmit = () => {
    const numericManwon = parseNumberFromFormatted(value);
    onNext(convertManwonToWon(numericManwon));
  };

  const handleQuickAdd = (amount: number) => {
    const currentValue = value ? parseNumberFromFormatted(value) : 0;
    setValue((currentValue + amount).toLocaleString());
  };

  const isValid = value && parseNumberFromFormatted(value) >= minValue;

  // Determine icon based on title
  const getIcon = () => {
    if (title.includes("부채")) {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (title.includes("소득")) {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (title.includes("자산")) {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    }
    return null;
  };

  const getGradientColor = () => {
    if (title.includes("부채")) return "from-red-500 to-pink-600";
    if (title.includes("소득")) return "from-green-500 to-emerald-600";
    if (title.includes("자산")) return "from-indigo-500 to-purple-600";
    return "from-blue-500 to-blue-600";
  };

  const getShadowColor = () => {
    if (title.includes("부채")) return "shadow-red-500/30";
    if (title.includes("소득")) return "shadow-green-500/30";
    if (title.includes("자산")) return "shadow-indigo-500/30";
    return "shadow-blue-500/30";
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="text-center space-y-3">
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getGradientColor()} rounded-3xl shadow-lg ${getShadowColor()} mb-2`}>
          {getIcon()}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        <p className="text-base text-gray-600 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 focus-within:border-primary-400 focus-within:shadow-xl rounded-3xl transition-all duration-300 overflow-hidden">
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(handleNumberInput(e.target.value))}
            onKeyPress={(e) => e.key === 'Enter' && isValid && handleSubmit()}
            className="w-full text-5xl font-bold bg-transparent outline-none py-8 px-6 text-gray-900 text-center"
            placeholder="0"
            autoFocus
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <span className="text-2xl font-bold text-primary-600">만원</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAdd(amount)}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-400 text-gray-700 hover:text-primary-600 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-md active:scale-95"
            >
              +{amount}만
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-95"
          >
            이전
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`${onBack ? 'flex-1' : 'w-full'} bg-gradient-to-r from-primary-600 to-accent-600 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
            isValid
              ? "hover:shadow-xl hover:scale-105 active:scale-100"
              : "opacity-40 cursor-not-allowed"
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
