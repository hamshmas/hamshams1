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
  type: 'square' | 'circle' | 'ribbon' | 'smallCircle';
  opacity: number;
}

// 색상 팔레트 (컴포넌트 외부에 상수로)
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#EE5A24',
  '#00D2D3', '#54A0FF', '#5F27CD', '#FF6B81', '#FFC312',
  '#C4E538', '#12CBC4', '#FDA7DF', '#ED4C67', '#B53471',
  '#FFD700', '#FF69B4', '#00FF7F', '#87CEEB', '#DDA0DD'
];

export function CelebrationEffects({ reductionRate, isActive }: CelebrationEffectsProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showEffects, setShowEffects] = useState(false);
  const confettiRef = useRef<Confetti[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastSpawnTime = useRef(0);
  const lastRenderTime = useRef(0);
  const burstPhase = useRef(0);

  // 특정 각도로 컨페티 생성 (왼쪽 상단에서 시작)
  const createConfettiAtAngle = useCallback((angleDegree: number): Confetti => {
    const types: ('square' | 'circle' | 'ribbon' | 'smallCircle')[] = [
      'square', 'circle', 'ribbon', 'square', 'ribbon', 'smallCircle', 'smallCircle', 'circle'
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    // 왼쪽 상단에서 시작 (0%~5% 범위)
    const startX = Math.random() * 5;
    const startY = -2 + Math.random() * 3;
    const angleVariation = (Math.random() - 0.5) * 15;
    // 오른쪽 아래 방향으로 퍼지도록 (30~75도 범위)
    const angle = (angleDegree + angleVariation) * (Math.PI / 180);
    const speed = 2.0 + Math.random() * 1.2;

    let size: number;
    if (type === 'ribbon') {
      size = 15 + Math.random() * 10;
    } else if (type === 'smallCircle') {
      size = 3 + Math.random() * 3;
    } else {
      size = 6 + Math.random() * 6;
    }

    return {
      id: Date.now() + Math.random() * 100000,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      type,
      opacity: 0.9 + Math.random() * 0.1,
    };
  }, []);

  // requestAnimationFrame 기반 애니메이션
  useEffect(() => {
    if (!isActive || reductionRate < 40) return;

    setShowEffects(true);

    // 초기 컨페티 생성 (왼쪽 상단에서 오른쪽 아래로 퍼지도록)
    const initialConfetti: Confetti[] = [];
    const initialCount = reductionRate >= 80 ? 40 : reductionRate >= 60 ? 28 : 20;
    for (let i = 0; i < initialCount; i++) {
      // 30~75도 범위 (오른쪽 아래 방향으로 퍼짐)
      const angleDegree = 30 + (i / initialCount) * 45;
      initialConfetti.push(createConfettiAtAngle(angleDegree));
    }
    confettiRef.current = initialConfetti;
    setConfetti(initialConfetti);

    let lastTime = performance.now();
    const spawnCount = reductionRate >= 80 ? 6 : reductionRate >= 60 ? 5 : 4;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // 물리 업데이트 (deltaTime 기반) - 더 부드럽게
      const dt = deltaTime / 16.67; // 60fps 기준 정규화

      confettiRef.current = confettiRef.current
        .map(c => ({
          ...c,
          x: c.x + c.vx * 0.22 * dt,
          y: c.y + c.vy * 0.22 * dt,
          vy: c.vy + 0.018 * dt,
          vx: c.vx * Math.pow(0.998, dt),
          rotation: c.rotation + c.rotationSpeed * 0.5 * dt,
          opacity: c.y > 50 ? Math.max(0, c.opacity - 0.012 * dt) : c.opacity,
        }))
        .filter(c => c.y < 110 && c.opacity > 0 && c.x > -10 && c.x < 120);

      // 새 컨페티 생성 (100ms 간격으로 더 부드럽게)
      if (currentTime - lastSpawnTime.current > 100) {
        lastSpawnTime.current = currentTime;
        burstPhase.current++;

        // 연속 분출 패턴
        const isBursting = (burstPhase.current % 10) < 8;

        if (isBursting) {
          const newConfetti: Confetti[] = [];
          for (let i = 0; i < spawnCount; i++) {
            // 30~75도 범위 (오른쪽 아래 방향으로 퍼짐)
            const angleDegree = 30 + (i / spawnCount) * 45;
            newConfetti.push(createConfettiAtAngle(angleDegree));
          }
          confettiRef.current = [...confettiRef.current.slice(-80), ...newConfetti];
        }
      }

      // 렌더링 업데이트 (60fps로 더 부드럽게)
      if (currentTime - lastRenderTime.current > 16) { // ~60fps
        lastRenderTime.current = currentTime;
        setConfetti([...confettiRef.current]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
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

    if (c.type === 'circle' || c.type === 'smallCircle') {
      return (
        <div
          style={{
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            opacity: c.opacity,
            borderRadius: '50%',
            boxShadow: c.type === 'smallCircle' ? `0 0 2px ${c.color}60` : `0 0 3px ${c.color}40`,
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
      {/* 배경 글로우 - 왼쪽 상단 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(255,215,0,0.12) 0%, transparent 45%)',
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
            transform: `translate3d(-50%, -50%, 0)`,
            willChange: 'transform, opacity',
          }}
        >
          {renderConfetti(c)}
        </div>
      ))}
    </div>
  );
}
