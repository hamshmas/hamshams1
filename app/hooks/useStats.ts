"use client";
import { useState, useRef, useCallback } from "react";

interface StatsState {
  userCount: number | null;
  dailyMaxRate: number;
  displayCount: number;
  displayRate: number;
}

export function useStats() {
  const [stats, setStats] = useState<StatsState>({
    userCount: null,
    dailyMaxRate: 0,
    displayCount: 0,
    displayRate: 0,
  });
  const hasAnimated = useRef(false);

  const fetchAndAnimate = useCallback(async () => {
    // 이미 애니메이션 완료했으면 스킵
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    let targetCount = 1300; // 기본값
    let targetRate = 85; // 기본값

    // API에서 통계 조회
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        targetCount = data.userCount || 1300;
        if (data.dailyMaxRate && data.dailyMaxRate > 0) {
          targetRate = data.dailyMaxRate;
        }
      }
    } catch {
      // API 호출 실패 시 기본값 사용
    }

    setStats((prev) => ({
      ...prev,
      userCount: targetCount,
      dailyMaxRate: targetRate,
    }));

    // 카운트업 애니메이션 실행
    const duration = 400;
    const steps = 15;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
      const progress = i / steps;
      // easeOutQuad 효과
      const eased = 1 - (1 - progress) * (1 - progress);
      setStats((prev) => ({
        ...prev,
        displayCount: Math.round(targetCount * eased),
        displayRate: Math.round(targetRate * eased),
      }));
    }
  }, []);

  const resetAnimation = useCallback(() => {
    hasAnimated.current = false;
  }, []);

  return {
    userCount: stats.userCount,
    dailyMaxRate: stats.dailyMaxRate,
    displayCount: stats.displayCount,
    displayRate: stats.displayRate,
    fetchAndAnimate,
    resetAnimation,
  };
}
