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
  const [isBursting, setIsBursting] = useState(true);
  const animationRef = useRef<number | null>(null);

  // 화려한 색상 팔레트
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
    '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#EE5A24',
    '#00D2D3', '#54A0FF', '#5F27CD', '#FF6B81', '#FFC312',
    '#C4E538', '#12CBC4', '#FDA7DF', '#ED4C67', '#B53471',
    '#FFD700', '#FF69B4', '#00FF7F', '#87CEEB', '#DDA0DD'
  ];

  // 특정 각도로 컨페티 생성 (균등 분포용)
  const createConfettiAtAngle = useCallback((angleDegree: number): Confetti => {
    const types: ('square' | 'circle' | 'ribbon')[] = ['square', 'circle', 'ribbon', 'square', 'ribbon'];
    const type = types[Math.floor(Math.random() * types.length)];

    // 왼쪽 위 모서리에서 시작
    const startX = Math.random() * 3;
    const startY = -2 + Math.random() * 2;

    // 지정된 각도 + 약간의 변화
    const angleVariation = (Math.random() - 0.5) * 3; // ±1.5도 변화
    const angle = (angleDegree + angleVariation) * (Math.PI / 180);
    const speed = 3.5 + Math.random() * 1.5;

    return {
      id: Date.now() + Math.random() * 100000,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
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

    // 초기 컨페티 생성 (0도~45도 균등 분포)
    const initialConfetti: Confetti[] = [];
    const initialCount = reductionRate >= 80 ? 60 : reductionRate >= 60 ? 45 : 30;
    for (let i = 0; i < initialCount; i++) {
      // 0도~45도를 균등하게 분배
      const angleDegree = (i / initialCount) * 45;
      initialConfetti.push(createConfettiAtAngle(angleDegree));
    }
    setConfetti(initialConfetti);

    // 간헐적 분출을 위한 타이머
    let burstPhase = 0;
    const burstInterval = setInterval(() => {
      burstPhase++;
      // 1.2초 분출, 0.4초 멈춤 패턴
      const isOn = (burstPhase % 8) < 6; // 6틱 켜짐, 2틱 꺼짐 (200ms 간격)
      setIsBursting(isOn);
    }, 200);

    // 지속적으로 새 컨페티 추가 (0도~45도 전체 영역에 균등 분포)
    let angleIndex = 0;
    const spawnInterval = setInterval(() => {
      setIsBursting(currentBursting => {
        if (!currentBursting) return currentBursting;

        const spawnCount = reductionRate >= 80 ? 12 : reductionRate >= 60 ? 9 : 6;
        const newConfetti: Confetti[] = [];

        // 0도~45도를 spawnCount개로 나눠서 균등하게 생성
        for (let i = 0; i < spawnCount; i++) {
          const angleDegree = (i / spawnCount) * 45;
          newConfetti.push(createConfettiAtAngle(angleDegree));
        }
        setConfetti(prev => [...prev.slice(-200), ...newConfetti]);
        angleIndex++;

        return currentBursting;
      });
    }, 60);

    // 애니메이션 업데이트
    const updateInterval = setInterval(() => {
      setConfetti(prev => prev
        .map(c => ({
          ...c,
          x: c.x + c.vx * 0.5,
          y: c.y + c.vy * 0.5,
          vy: c.vy + 0.05, // 중력 (45도 유지하기 위해 약하게)
          vx: c.vx * 0.998, // 공기저항 최소화
          rotation: c.rotation + c.rotationSpeed,
          opacity: c.y > 100 ? Math.max(0, c.opacity - 0.05) : c.opacity,
        }))
        .filter(c => c.y < 120 && c.opacity > 0 && c.x < 120)
      );
    }, 20);

    return () => {
      clearInterval(burstInterval);
      clearInterval(spawnInterval);
      clearInterval(updateInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, reductionRate, createConfettiAtAngle]);

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
