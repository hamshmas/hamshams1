"use client";

import { useEffect, useState, useCallback } from "react";

interface CelebrationEffectsProps {
  reductionRate: number;
  isActive: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'circle' | 'star' | 'ribbon';
  rotation: number;
  rotationSpeed: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  exploded: boolean;
  particles: Particle[];
}

export function CelebrationEffects({ reductionRate, isActive }: CelebrationEffectsProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [showEffects, setShowEffects] = useState(false);

  // 화려한 색상 팔레트
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
    '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#EE5A24',
    '#00D2D3', '#54A0FF', '#5F27CD', '#FF6B81', '#FFC312',
    '#C4E538', '#12CBC4', '#FDA7DF', '#ED4C67', '#B53471'
  ];

  const createParticles = useCallback((x: number, y: number, count: number): Particle[] => {
    const particles: Particle[] = [];
    const types: ('circle' | 'star' | 'ribbon')[] = ['circle', 'star', 'ribbon'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const velocity = 3 + Math.random() * 5;
      const type = types[Math.floor(Math.random() * types.length)];

      particles.push({
        id: Date.now() + i + Math.random() * 10000,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2, // 약간 위로
        color: colors[Math.floor(Math.random() * colors.length)],
        size: type === 'ribbon' ? 12 + Math.random() * 8 : 6 + Math.random() * 6,
        life: 1,
        maxLife: 1,
        type,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
      });
    }
    return particles;
  }, []);

  const launchFirework = useCallback((side: 'left' | 'right' | 'center') => {
    let x: number;
    if (side === 'left') {
      x = 15 + Math.random() * 20;
    } else if (side === 'right') {
      x = 65 + Math.random() * 20;
    } else {
      x = 40 + Math.random() * 20;
    }

    const particleCount = reductionRate >= 80 ? 40 : reductionRate >= 60 ? 30 : 20;

    const newFirework: Firework = {
      id: Date.now() + Math.random() * 10000,
      x,
      y: 30 + Math.random() * 20,
      exploded: true,
      particles: createParticles(x, 30 + Math.random() * 20, particleCount),
    };

    setFireworks(prev => [...prev.slice(-5), newFirework]);
  }, [createParticles, reductionRate]);

  // 애니메이션 루프
  useEffect(() => {
    if (!isActive || reductionRate < 40) return;

    setShowEffects(true);

    // 초기 폭죽 발사
    setTimeout(() => launchFirework('center'), 100);
    setTimeout(() => launchFirework('left'), 300);
    setTimeout(() => launchFirework('right'), 500);

    // 주기적으로 폭죽 발사
    const launchInterval = setInterval(() => {
      const sides: ('left' | 'right' | 'center')[] = ['left', 'right', 'center'];
      launchFirework(sides[Math.floor(Math.random() * sides.length)]);
    }, reductionRate >= 80 ? 1200 : 1800);

    // 파티클 업데이트
    const updateInterval = setInterval(() => {
      setFireworks(prev => prev.map(fw => ({
        ...fw,
        particles: fw.particles
          .map(p => ({
            ...p,
            x: p.x + p.vx * 0.5,
            y: p.y + p.vy * 0.5,
            vy: p.vy + 0.15, // 중력
            vx: p.vx * 0.98, // 공기 저항
            life: p.life - 0.015,
            rotation: p.rotation + p.rotationSpeed,
          }))
          .filter(p => p.life > 0)
      })).filter(fw => fw.particles.length > 0));
    }, 30);

    return () => {
      clearInterval(launchInterval);
      clearInterval(updateInterval);
    };
  }, [isActive, reductionRate, launchFirework]);

  if (!isActive || reductionRate < 40 || !showEffects) return null;

  const renderParticle = (particle: Particle) => {
    const opacity = Math.max(0, particle.life);
    const scale = 0.5 + particle.life * 0.5;

    if (particle.type === 'star') {
      return (
        <svg
          width={particle.size * scale}
          height={particle.size * scale}
          viewBox="0 0 24 24"
          fill={particle.color}
          style={{ opacity, filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})` }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }

    if (particle.type === 'ribbon') {
      return (
        <div
          style={{
            width: particle.size * scale * 0.3,
            height: particle.size * scale,
            backgroundColor: particle.color,
            opacity,
            borderRadius: '2px',
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: particle.size * scale,
          height: particle.size * scale,
          backgroundColor: particle.color,
          opacity,
          borderRadius: '50%',
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(255,215,0,0.15) 0%, transparent 50%)',
        }}
      />

      {/* 폭죽 파티클 */}
      {fireworks.map(fw => (
        fw.particles.map(particle => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
              transition: 'none',
            }}
          >
            {renderParticle(particle)}
          </div>
        ))
      ))}

      {/* 축하 이모지 (가끔씩) */}
      {reductionRate >= 70 && fireworks.length > 0 && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {['🎉', '🎊', '✨'].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-3xl animate-bounce"
              style={{
                left: `${(i - 1) * 50}px`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.8,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
