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

  // 삼각형 형태로 컨페티 생성 (0도~45도 사이로 꽉 차게)
  const createConfetti = useCallback((waveProgress: number = 0): Confetti => {
    const types: ('square' | 'circle' | 'ribbon')[] = ['square', 'circle', 'ribbon', 'square', 'ribbon'];
    const type = types[Math.floor(Math.random() * types.length)];

    // 왼쪽 위 모서리에서 시작
    const startX = Math.random() * 5; // 0-5% 범위
    const startY = -3 + Math.random() * 3; // 약간 위에서

    // 0도(오른쪽)에서 45도(대각선 아래) 사이로 꽉 차게 퍼짐
    const angle = Math.random() * (Math.PI / 4); // 0 ~ π/4 (0도 ~ 45도)
    const speed = 3 + Math.random() * 2;

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

    // 초기 컨페티 생성 (삼각형 형태로)
    const initialConfetti: Confetti[] = [];
    const initialCount = reductionRate >= 80 ? 50 : reductionRate >= 60 ? 35 : 25;
    for (let i = 0; i < initialCount; i++) {
      const progress = i / initialCount; // 0~1 진행도
      initialConfetti.push(createConfetti(progress));
    }
    setConfetti(initialConfetti);

    // 간헐적 분출을 위한 타이머 (더 짧은 텀)
    let burstPhase = 0;
    const burstInterval = setInterval(() => {
      burstPhase++;
      // 1.5초 분출, 0.6초 멈춤 패턴
      const isOn = (burstPhase % 7) < 5; // 5틱 켜짐, 2틱 꺼짐 (300ms 간격)
      setIsBursting(isOn);
    }, 300);

    // 지속적으로 새 컨페티 추가 (삼각형 웨이브 형태)
    let waveTime = 0;
    const spawnInterval = setInterval(() => {
      setIsBursting(currentBursting => {
        if (!currentBursting) return currentBursting;

        waveTime += 0.1;
        const waveProgress = (Math.sin(waveTime) + 1) / 2; // 0~1 사이 진동

        const spawnCount = reductionRate >= 80 ? 10 : reductionRate >= 60 ? 7 : 5;
        const newConfetti: Confetti[] = [];
        for (let i = 0; i < spawnCount; i++) {
          const individualProgress = waveProgress + (i / spawnCount) * 0.3;
          newConfetti.push(createConfetti(Math.min(1, individualProgress)));
        }
        setConfetti(prev => [...prev.slice(-180), ...newConfetti]);

        return currentBursting;
      });
    }, 80);

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
