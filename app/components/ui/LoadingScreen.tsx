"use client";

import { useState, useEffect } from "react";

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

export function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

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

  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center space-y-6 animate-fadeIn px-4 relative overflow-hidden">
      {/* 배경 플로팅 도트 애니메이션 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 배경 그라데이션 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0,113,227,0.04) 0%, transparent 70%)',
          }}
        />
        {/* 플로팅 도트들 */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-apple-blue-500"
            style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 2) * 60}%`,
              opacity: 0.15 + (i % 3) * 0.05,
              animation: `floating ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* 원형 프로그레스 - Apple 스타일 */}
      <div className="relative z-10">
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
      <div className="text-center z-10">
        <p className="text-[15px] font-medium text-apple-gray-600 animate-subtlePulse">
          {LOADING_STEPS[currentStep]}
        </p>
      </div>

      {/* 프로그레스 바 - Apple 스타일 */}
      <div className="w-full max-w-xs bg-apple-gray-100 rounded-full h-1.5 z-10">
        <div
          className="bg-apple-blue-500 h-1.5 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* CTA 메시지 - Apple 스타일 */}
      <div className="bg-apple-gray-50 rounded-apple-lg p-4 w-full max-w-xs z-10">
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
      <p className="text-[12px] text-apple-gray-400 text-center z-10">
        변호사가 검증한 정확한 계산 방식
      </p>
    </div>
  );
}
