"use client";
import { useState, useCallback } from "react";
import type { FormData, CalculationResult } from "@/app/types";

export function useCalculation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(
    async (formData: FormData): Promise<CalculationResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // 최소 2초 로딩 시간 보장 (CTA 메시지 노출)
        const minLoadingTime = new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );

        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("계산 중 오류가 발생했습니다.");
        }

        const result = await response.json();

        // 최소 로딩 시간 대기
        await minLoadingTime;

        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { calculate, isLoading, error, setIsLoading };
}
