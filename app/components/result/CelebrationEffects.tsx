"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface CelebrationEffectsProps {
  reductionRate: number;
  isActive: boolean;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'square' | 'circle' | 'ribbon';
  opacity: number;
}

export function CelebrationEffects({ reductionRate, isActive }: CelebrationEffectsProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showEffects, setShowEffects] = useState(false);
  const animationRef = useRef<number | null>(null);

  // 화려한 색상 팔레트
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
    '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#EE5A24',
    '#00D2D3', '#54A0FF', '#5F27CD', '#FF6B81', '#FFC312',
    '#C4E538', '#12CBC4', '#FDA7DF', '#ED4C67', '#B53471',
    '#FFD700', '#FF69B4', '#00FF7F', '#87CEEB', '#DDA0DD'
  ];

  // 새 컨페티 가루 생성
  const createConfetti = useCallback((): Confetti => {
    const types: ('square' | 'circle' | 'ribbon')[] = ['square', 'circle', 'ribbon', 'square', 'ribbon'];
    const type = types[Math.floor(Math.random() * types.length)];

    // 왼쪽 위 모서리 영역에서 시작 (0-10% x, -5% y 위쪽에서 시작)
    const startX = Math.random() * 15;
    const startY = -5 + Math.random() * 5;

    // 오른쪽 아래 대각선 방향으로 (약간의 랜덤 퍼짐)
    const baseAngle = Math.PI / 4; // 45도
    const angleVariation = (Math.random() - 0.5) * (Math.PI / 6); // ±15도 변화
    const angle = baseAngle + angleVariation;
    const speed = 2 + Math.random() * 3;

    return {
      id: Date.now() + Math.random() * 100000,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 1, // 아래로 기본 속도 추가
      color: colors[Math.floor(Math.random() * colors.length)],
      size: type === 'ribbon' ? 15 + Math.random() * 10 : 6 + Math.random() * 6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      type,
      opacity: 0.9 + Math.random() * 0.1,
    };
  }, []);

  // 컨페티 애니메이션
  useEffect(() => {
    if (!isActive || reductionRate < 40) return;

    setShowEffects(true);

    // 초기 컨페티 생성
    const initialConfetti: Confetti[] = [];
    const initialCount = reductionRate >= 80 ? 60 : reductionRate >= 60 ? 45 : 30;
    for (let i = 0; i < initialCount; i++) {
      initialConfetti.push(createConfetti());
    }
    setConfetti(initialConfetti);

    // 지속적으로 새 컨페티 추가
    const spawnInterval = setInterval(() => {
      const spawnCount = reductionRate >= 80 ? 8 : reductionRate >= 60 ? 6 : 4;
      const newConfetti: Confetti[] = [];
      for (let i = 0; i < spawnCount; i++) {
        newConfetti.push(createConfetti());
      }
      setConfetti(prev => [...prev.slice(-150), ...newConfetti]); // 최대 150개 유지
    }, 100);

    // 애니메이션 업데이트
    const updateInterval = setInterval(() => {
      setConfetti(prev => prev
        .map(c => ({
          ...c,
          x: c.x + c.vx * 0.4,
          y: c.y + c.vy * 0.4,
          vy: c.vy + 0.08, // 중력
          vx: c.vx * 0.995, // 약간의 공기저항
          rotation: c.rotation + c.rotationSpeed,
          opacity: c.y > 100 ? Math.max(0, c.opacity - 0.05) : c.opacity, // 화면 아래로 가면 페이드아웃
        }))
        .filter(c => c.y < 120 && c.opacity > 0) // 화면 밖으로 나가면 제거
      );
    }, 20);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(updateInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, reductionRate, createConfetti]);

  if (!isActive || reductionRate < 40 || !showEffects) return null;

  const renderConfetti = (c: Confetti) => {
    if (c.type === 'ribbon') {
      return (
        <div
          style={{
            width: c.size * 0.25,
            height: c.size,
            backgroundColor: c.color,
            opacity: c.opacity,
            borderRadius: '2px',
            transform: `rotate(${c.rotation}deg)`,
            boxShadow: `0 0 4px ${c.color}40`,
          }}
        />
      );
    }

    if (c.type === 'circle') {
      return (
        <div
          style={{
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            opacity: c.opacity,
            borderRadius: '50%',
            boxShadow: `0 0 3px ${c.color}40`,
          }}
        />
      );
    }

    // square
    return (
      <div
        style={{
          width: c.size,
          height: c.size,
          backgroundColor: c.color,
          opacity: c.opacity,
          borderRadius: '1px',
          transform: `rotate(${c.rotation}deg)`,
          boxShadow: `0 0 3px ${c.color}40`,
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 배경 글로우 - 왼쪽 위 모서리 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(255,215,0,0.15) 0%, transparent 40%)',
        }}
      />

      {/* 컨페티 가루 */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            transform: `translate(-50%, -50%)`,
            transition: 'none',
          }}
        >
          {renderConfetti(c)}
        </div>
      ))}
    </div>
  );
}
