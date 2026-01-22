"use client";
import { forwardRef } from "react";
import {
  handleNumberInput,
  parseNumberFromFormatted,
  formatKoreanCurrency,
} from "@/utils/formatNumber";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  showKorean?: boolean;
  unit?: string;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onKeyPress,
      placeholder = "0",
      showKorean = true,
      unit = "원",
      size = "lg",
      autoFocus = false,
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "text-xl",
      md: "text-2xl",
      lg: "text-[32px]",
    };

    const unitSizeClasses = {
      sm: "text-base",
      md: "text-lg",
      lg: "text-[20px]",
    };

    const numericValue = parseNumberFromFormatted(value);

    return (
      <div className="relative">
        <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 transition-colors pb-2">
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(handleNumberInput(e.target.value))}
            onBlur={onBlur}
            onKeyPress={onKeyPress}
            className={`flex-1 ${sizeClasses[size]} font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300`}
            placeholder={placeholder}
            autoFocus={autoFocus}
          />
          <span
            className={`${unitSizeClasses[size]} font-medium text-gray-400 ml-2`}
          >
            {unit}
          </span>
        </div>
        {showKorean && numericValue > 0 && unit === "원" && (
          <p className="text-[15px] text-blue-500 mt-2">
            {formatKoreanCurrency(numericValue)}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
