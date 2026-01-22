"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const CTA_MESSAGES = [
  { text: "법원 인가율 98% 달성" },
  { text: "평균 72% 채무 탕감" },
  { text: "5분 내 무료 상담 가능" },
  { text: "개인정보 100% 보호" },
];

const LOADING_STEPS = [
  "채무 정보 분석 중...",
  "청산가치 계산 중...",
  "최적 변제 기간 산출 중...",
  "최종 탕감률 계산 중...",
];

// 컨페티 색상 팔레트
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#EE5A24',
  '#00D2D3', '#54A0FF', '#5F27CD', '#FF6B81', '#FFC312',
];

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

export function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const confettiRef = useRef<Confetti[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastSpawnTime = useRef(0);
  const lastRenderTime = useRef(0);

  // 컨페티 생성 함수
  const createConfetti = useCallback((): Confetti => {
    const types: ('square' | 'circle' | 'ribbon')[] = ['square', 'circle', 'ribbon'];
    const type = types[Math.floor(Math.random() * types.length)];

    const startX = 40 + Math.random() * 20;
    const startY = -2 + Math.random() * 2;
    const angleDegree = 70 + Math.random() * 40;
    const angleVariation = (Math.random() - 0.5) * 30;
    const angle = (angleDegree + angleVariation) * (Math.PI / 180);
    const speed = 2.0 + Math.random() * 1.0;

    let size: number;
    if (type === 'ribbon') {
      size = 12 + Math.random() * 8;
    } else {
      size = 4 + Math.random() * 4;
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
      rotationSpeed: (Math.random() - 0.5) * 12,
      type,
      opacity: 0.8 + Math.random() * 0.2,
    };
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 20);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % LOADING_STEPS.length);
    }, 500);

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % CTA_MESSAGES.length);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(messageInterval);
    };
  }, []);

  // 컨페티 애니메이션
  useEffect(() => {
    // 초기 컨페티 생성
    const initialConfetti: Confetti[] = [];
    for (let i = 0; i < 15; i++) {
      initialConfetti.push(createConfetti());
    }
    confettiRef.current = initialConfetti;
    setConfetti(initialConfetti);

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      const dt = deltaTime / 16.67;

      confettiRef.current = confettiRef.current
        .map(c => ({
          ...c,
          x: c.x + c.vx * 0.25 * dt,
          y: c.y + c.vy * 0.25 * dt,
          vy: c.vy + 0.02 * dt,
          vx: c.vx * Math.pow(0.997, dt),
          rotation: c.rotation + c.rotationSpeed * 0.6 * dt,
          opacity: c.y > 50 ? Math.max(0, c.opacity - 0.015 * dt) : c.opacity,
        }))
        .filter(c => c.y < 100 && c.opacity > 0);

      // 새 컨페티 생성 (120ms 간격)
      if (currentTime - lastSpawnTime.current > 120) {
        lastSpawnTime.current = currentTime;
        const newConfetti: Confetti[] = [];
        for (let i = 0; i < 3; i++) {
          newConfetti.push(createConfetti());
        }
        confettiRef.current = [...confettiRef.current.slice(-50), ...newConfetti];
      }

      // 렌더링 업데이트 (~30fps)
      if (currentTime - lastRenderTime.current > 33) {
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
  }, [createConfetti]);

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
          }}
        />
      );
    }
    return (
      <div
        style={{
          width: c.size,
          height: c.size,
          backgroundColor: c.color,
          opacity: c.opacity,
          borderRadius: '1px',
          transform: `rotate(${c.rotation}deg)`,
        }}
      />
    );
  };

  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center space-y-6 animate-fadeIn px-4 relative overflow-hidden">
      {/* 상단 컨페티 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 배경 글로우 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(0,113,227,0.08) 0%, transparent 50%)',
          }}
        />
        {/* 컨페티 */}
        {confetti.map(c => (
          <div
            key={c.id}
            className="absolute"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {renderConfetti(c)}
          </div>
        ))}
      </div>

      {/* 원형 프로그레스 - Apple 스타일 */}
      <div className="relative">
        <div className="w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
            {/* 배경 원 */}
            <circle
              cx="48" cy="48" r="42"
              stroke="#E8E8ED" strokeWidth="6" fill="none"
            />
            {/* 프로그레스 원 */}
            <circle
              cx="48" cy="48" r="42"
              stroke="#0071E3" strokeWidth="6" fill="none"
              strokeDasharray={264} strokeDashoffset={264 - (264 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-100"
            />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[24px] font-bold text-apple-gray-800 tracking-tight">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* 로딩 상태 텍스트 */}
      <div className="text-center">
        <p className="text-[15px] font-medium text-apple-gray-600 animate-subtlePulse">
          {LOADING_STEPS[currentStep]}
        </p>
      </div>

      {/* 프로그레스 바 - Apple 스타일 */}
      <div className="w-full max-w-xs bg-apple-gray-100 rounded-full h-1.5">
        <div
          className="bg-apple-blue-500 h-1.5 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* CTA 메시지 - Apple 스타일 */}
      <div className="bg-apple-gray-50 rounded-apple-lg p-4 w-full max-w-xs">
        <div className="flex items-center justify-center gap-2 transition-all duration-300">
          <svg className="w-5 h-5 text-apple-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-[14px] font-medium text-apple-gray-700">
            {CTA_MESSAGES[currentMessage].text}
          </span>
        </div>
      </div>

      {/* 하단 안내 */}
      <p className="text-[12px] text-apple-gray-400 text-center">
        변호사가 검증한 정확한 계산 방식
      </p>
    </div>
  );
}
