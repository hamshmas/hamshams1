"use client";

import { useEffect, useState, useCallback } from "react";

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
  type: 'circle' | 'star' | 'heart' | 'sparkle';
  rotation: number;
}

export function CelebrationEffects({ reductionRate, isActive }: CelebrationEffectsProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wave, setWave] = useState(0);

  // 화려한 색상 팔레트
  const getColors = (rate: number) => {
    if (rate >= 80) {
      // 골드 + 레인보우
      return ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F0E68C'];
    } else if (rate >= 60) {
      // 블루 + 퍼플 + 핑크
      return ['#5B8DEE', '#9B59B6', '#E91E63', '#00BCD4', '#7C4DFF', '#FF4081', '#18FFFF'];
    }
    return ['#8B9DC3', '#6B7AA1', '#9CABC8', '#A8B5D0', '#7986CB', '#9FA8DA'];
  };

  const generateConfetti = useCallback(() => {
    const colors = getColors(reductionRate);
    const count = reductionRate >= 80 ? 60 : reductionRate >= 60 ? 45 : 30;
    const types: ('circle' | 'star' | 'heart' | 'sparkle')[] = ['circle', 'star', 'heart', 'sparkle'];
    const newConfetti: Confetti[] = [];

    for (let i = 0; i < count; i++) {
      newConfetti.push({
        id: Date.now() + i + Math.random() * 1000,
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 12,
        type: types[Math.floor(Math.random() * types.length)],
        rotation: Math.random() * 360,
      });
    }
    return newConfetti;
  }, [reductionRate]);

  useEffect(() => {
    if (!isActive || reductionRate < 40) return;

    // 첫 번째 웨이브
    setConfetti(generateConfetti());
    setShowConfetti(true);

    // 2초마다 새로운 웨이브 생성 (계속 반복)
    const waveInterval = setInterval(() => {
      setWave(prev => prev + 1);
      setConfetti(generateConfetti());
    }, 2500);

    return () => {
      clearInterval(waveInterval);
    };
  }, [isActive, reductionRate, generateConfetti]);

  if (!isActive || reductionRate < 40 || !showConfetti) return null;

  const renderShape = (item: Confetti) => {
    switch (item.type) {
      case 'star':
        return (
          <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill={item.color}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'heart':
        return (
          <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill={item.color}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      case 'sparkle':
        return (
          <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill={item.color}>
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        );
      default:
        return (
          <div
            className="rounded-full"
            style={{
              width: item.size,
              height: item.size,
              backgroundColor: item.color,
              boxShadow: `0 0 ${item.size * 2}px ${item.color}`,
            }}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 배경 글로우 효과 */}
      <div
        className="absolute inset-0 opacity-30 animate-pulse"
        style={{
          background: reductionRate >= 80
            ? 'radial-gradient(circle at 50% 30%, rgba(255,215,0,0.3) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 30%, rgba(91,141,238,0.3) 0%, transparent 60%)',
        }}
      />

      {/* 컨페티 파티클 */}
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${item.x}%`,
            top: '-5%',
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            transform: `rotate(${item.rotation}deg)`,
          }}
        >
          {renderShape(item)}
        </div>
      ))}

      {/* 스파클 효과 (화면 곳곳에 반짝임) */}
      {reductionRate >= 60 && Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`sparkle-${wave}-${i}`}
          className="absolute animate-sparkle"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              backgroundColor: '#FFD700',
              boxShadow: '0 0 10px #FFD700, 0 0 20px #FFA500',
            }}
          />
        </div>
      ))}

      {/* 축하 이모지 버스트 */}
      {reductionRate >= 70 && (
        <>
          {['🎉', '🎊', '✨', '💫', '⭐', '🌟'].map((emoji, i) => (
            <div
              key={`emoji-${wave}-${i}`}
              className="absolute text-2xl animate-emoji-burst"
              style={{
                left: `${15 + i * 12}%`,
                top: '20%',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
