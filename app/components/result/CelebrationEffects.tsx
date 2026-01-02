"use client";

import { useEffect, useState } from "react";

interface CelebrationEffectsProps {
  reductionRate: number;
  isActive: boolean;
}

interface Confetti {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

export function CelebrationEffects({ reductionRate, isActive }: CelebrationEffectsProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // 색상 팔레트 - 차분한 골드/블루 계열
  const getColors = (rate: number) => {
    if (rate >= 80) {
      return ['#D4AF37', '#C5A028', '#B8960F', '#E6C84B', '#F0D55A'];
    } else if (rate >= 60) {
      return ['#5B8DEE', '#4A7DD8', '#6B9DF8', '#7BAAF0', '#4B7BD4'];
    }
    return ['#8B9DC3', '#6B7AA1', '#9CABC8', '#A8B5D0'];
  };

  useEffect(() => {
    if (!isActive || reductionRate < 40) return;

    // 간결한 컨페티 생성
    const colors = getColors(reductionRate);
    const count = reductionRate >= 80 ? 25 : reductionRate >= 60 ? 18 : 12;
    const newConfetti: Confetti[] = [];

    for (let i = 0; i < count; i++) {
      newConfetti.push({
        id: i,
        x: 5 + Math.random() * 90,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 4,
      });
    }

    setConfetti(newConfetti);

    // 약간의 딜레이 후 시작
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 200);

    // 일정 시간 후 페이드아웃
    const fadeTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, [isActive, reductionRate]);

  if (!isActive || reductionRate < 40 || !showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 심플한 컨페티 */}
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${item.x}%`,
            top: '-2%',
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          <div
            className="rounded-full opacity-80"
            style={{
              width: item.size,
              height: item.size,
              backgroundColor: item.color,
              boxShadow: `0 0 ${item.size}px ${item.color}40`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
