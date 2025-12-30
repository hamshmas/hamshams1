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
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'star' | 'triangle';
}

interface Coin {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
}

interface MoneyBag {
  isOpen: boolean;
  coins: Coin[];
}

// 색상 팔레트 - 탕감률에 따라 다른 색상
const getConfettiColors = (rate: number) => {
  if (rate >= 80) {
    // 최고! 금/황금색 파티
    return ['#FFD700', '#FFA500', '#FF8C00', '#FFB347', '#FFCC00', '#F4C430', '#FFE135'];
  } else if (rate >= 60) {
    // 좋음! 밝은 축하 색상
    return ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  } else if (rate >= 40) {
    // 괜찮음! 부드러운 색상
    return ['#74b9ff', '#81ecec', '#a29bfe', '#fab1a0', '#ffeaa7', '#55efc4'];
  }
  // 낮음 - 폭죽 효과 없음
  return [];
};

export function CelebrationEffects({ reductionRate, isActive }: CelebrationEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [moneyBag, setMoneyBag] = useState<MoneyBag>({ isOpen: false, coins: [] });
  const [showBigText, setShowBigText] = useState(false);
  const [showMoneyRain, setShowMoneyRain] = useState(false);

  // 폭죽 파티클 생성
  const createConfetti = useCallback(() => {
    const colors = getConfettiColors(reductionRate);
    if (colors.length === 0) return;

    const newParticles: Particle[] = [];
    const particleCount = reductionRate >= 80 ? 150 : reductionRate >= 60 ? 100 : 60;
    const shapes: Particle['shape'][] = ['circle', 'square', 'star', 'triangle'];

    // 여러 발사 지점에서 폭죽 발사
    const launchPoints = reductionRate >= 80 ? [20, 50, 80] : reductionRate >= 60 ? [30, 70] : [50];

    launchPoints.forEach((launchX, pointIndex) => {
      for (let i = 0; i < particleCount / launchPoints.length; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const velocity = 8 + Math.random() * 12;

        newParticles.push({
          id: Date.now() + i + pointIndex * 1000,
          x: launchX + (Math.random() - 0.5) * 20,
          y: 60 + Math.random() * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 6 + Math.random() * 8,
          velocityX: Math.cos(angle) * velocity,
          velocityY: Math.sin(angle) * velocity - 5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 20,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }
    });

    setParticles(newParticles);
  }, [reductionRate]);

  // 돈 주머니 & 코인 효과
  const createMoneyEffect = useCallback(() => {
    if (reductionRate < 40) return;

    const coinCount = reductionRate >= 80 ? 30 : reductionRate >= 60 ? 20 : 12;
    const coins: Coin[] = [];

    for (let i = 0; i < coinCount; i++) {
      coins.push({
        id: i,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
      });
    }

    setMoneyBag({ isOpen: true, coins });
  }, [reductionRate]);

  // 효과 시작
  useEffect(() => {
    if (!isActive || reductionRate < 40) return;

    // 딜레이를 두고 순차적으로 효과 발생
    const timer1 = setTimeout(() => {
      setShowBigText(true);
    }, 300);

    const timer2 = setTimeout(() => {
      createConfetti();
    }, 600);

    const timer3 = setTimeout(() => {
      createMoneyEffect();
      setShowMoneyRain(true);
    }, 1000);

    // 두 번째 폭죽 (높은 탕감률만)
    let timer4: NodeJS.Timeout | undefined;
    if (reductionRate >= 70) {
      timer4 = setTimeout(() => {
        createConfetti();
      }, 2000);
    }

    // 파티클 정리
    const timer5 = setTimeout(() => {
      setParticles([]);
    }, 5000);

    const timer6 = setTimeout(() => {
      setShowMoneyRain(false);
      setShowBigText(false);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (timer4) clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [isActive, reductionRate, createConfetti, createMoneyEffect]);

  // 파티클 애니메이션
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * 0.1,
            y: p.y + p.velocityY * 0.1,
            velocityY: p.velocityY + 0.3, // 중력
            velocityX: p.velocityX * 0.99, // 공기 저항
            rotation: p.rotation + p.rotationSpeed,
          }))
          .filter(p => p.y < 120) // 화면 밖으로 나가면 제거
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  if (!isActive || reductionRate < 40) return null;

  const getMessage = () => {
    if (reductionRate >= 90) return "대박! 🎉";
    if (reductionRate >= 80) return "축하해요! 🎊";
    if (reductionRate >= 70) return "잘됐어요! ✨";
    if (reductionRate >= 60) return "좋아요! 💪";
    if (reductionRate >= 50) return "괜찮아요! 👍";
    return "시작이에요! 🌟";
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 빅 텍스트 애니메이션 */}
      {showBigText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-6xl font-black animate-celebration-text"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 20px rgba(255, 165, 0, 0.3)',
            }}
          >
            {getMessage()}
          </div>
        </div>
      )}

      {/* 폭죽 파티클 */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.shape !== 'star' ? particle.color : 'transparent',
            borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'triangle' ? '0' : '2px',
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
            ...(particle.shape === 'triangle' && {
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderLeft: `${particle.size / 2}px solid transparent`,
              borderRight: `${particle.size / 2}px solid transparent`,
              borderBottom: `${particle.size}px solid ${particle.color}`,
            }),
            ...(particle.shape === 'star' && {
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, ${particle.color} 30%, transparent 70%)`,
            }),
          }}
        />
      ))}

      {/* 돈 비 효과 */}
      {showMoneyRain && moneyBag.coins.map(coin => (
        <div
          key={coin.id}
          className="absolute animate-money-fall"
          style={{
            left: `${coin.x}%`,
            top: '-10%',
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
          }}
        >
          <div
            className="text-3xl"
            style={{
              transform: `rotate(${coin.rotation}deg)`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          >
            💰
          </div>
        </div>
      ))}

      {/* 돈 주머니 열림 효과 (높은 탕감률) */}
      {reductionRate >= 70 && moneyBag.isOpen && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-money-bag">
          <div className="text-7xl animate-bounce-gentle">
            💰
          </div>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="text-2xl animate-coin-pop"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                🪙
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 반짝이 효과 */}
      {reductionRate >= 60 && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
