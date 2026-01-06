"use client";

import { useState, useEffect } from "react";

const CTA_MESSAGES = [
  { icon: "⚖️", text: "법원 인가율 98% 달성" },
  { icon: "💰", text: "평균 72% 채무 탕감" },
  { icon: "📞", text: "5분 내 무료 상담 가능" },
  { icon: "🔒", text: "개인정보 100% 보호" },
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
    // 진행률 애니메이션 (2초 동안 0~100%)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 40);

    // 로딩 단계 변경 (0.5초마다)
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % LOADING_STEPS.length);
    }, 500);

    // CTA 메시지 변경 (1초마다)
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
    <div className="min-h-[300px] flex flex-col items-center justify-center space-y-4 animate-fadeIn px-4">
      {/* 원형 프로그레스 */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-blue-100">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r="36"
              stroke="#3B82F6" strokeWidth="8" fill="none"
              strokeDasharray={226} strokeDashoffset={226 - (226 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-100"
            />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-blue-600">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* 로딩 상태 텍스트 */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 animate-pulse">
          {LOADING_STEPS[currentStep]}
        </p>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* CTA 메시지 - 신뢰 구축 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 w-full max-w-xs border border-blue-200">
        <div className="flex items-center justify-center gap-2 transition-all duration-300">
          <span className="text-xl">{CTA_MESSAGES[currentMessage].icon}</span>
          <span className="text-sm font-semibold text-blue-800">
            {CTA_MESSAGES[currentMessage].text}
          </span>
        </div>
      </div>

      {/* 하단 안내 */}
      <p className="text-xs text-gray-500 text-center">
        변호사가 검증한 정확한 계산 방식
      </p>
    </div>
  );
}
