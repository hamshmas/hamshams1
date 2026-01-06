"use client";

import { useState, useEffect, useMemo } from "react";

interface WelcomeScreenProps {
  onStart: () => void;
}

interface Stats {
  userCount: number;
  dailyMaxRate: number | null;
}

// 채무자에게 희망과 격려를 주는 명언 리스트
const MOTIVATIONAL_QUOTES = [
  { text: "이 또한 지나가리라", author: "페르시아 속담" },
  { text: "삶이 있는 한 희망은 있다", author: "키케로" },
  { text: "세상은 고통으로 가득하지만 그것을 극복하는 사람들로도 가득하다", author: "헬렌 켈러" },
  { text: "불가능해 보이는 것도 끝나고 나면 가능했던 것이 된다", author: "넬슨 만델라" },
  { text: "최고에 도달하려면 최저에서 시작하라", author: "P.시루스" },
  { text: "가장 아름다운 전망은 가장 힘든 등반 끝에 있다", author: "" },
  { text: "오늘은 당신의 남은 인생 중 첫 번째 날이다", author: "" },
  { text: "실패란 넘어지는 것이 아니라, 넘어진 자리에 머무는 것이다", author: "" },
  { text: "두려움은 앉아있을 때 생기고, 행동할 때 극복된다", author: "헨리 링크" },
  { text: "항상 맑으면 사막이 된다. 비가 내려야 비옥해진다", author: "스페인 속담" },
  { text: "아직 늦지 않았다. 한 번 더 일어서라", author: "" },
  { text: "어둠이 깊을수록 새벽은 가깝다", author: "" },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<Stats>({ userCount: 1300, dailyMaxRate: null });

  // 랜덤 명언 선택 (컴포넌트 마운트 시 한 번만)
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, []);

  useEffect(() => {
    // Fade in animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 통계 데이터 로드
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-2xl w-full space-y-12 text-center">
        {/* Hero Section */}
        <div className="space-y-6 animate-fadeInUp">
          {/* Icon/Visual Element */}
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-accent-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="relative bg-gradient-to-br from-primary-500 to-accent-600 w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/50 transform hover:scale-105 transition-transform duration-500">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                새로운 시작을 위한
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                첫 걸음
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed max-w-xl mx-auto">
              부채로 힘든 시간을 보내고 계신가요?
              <br />
              예상 탕감률을 확인하고 새로운 출발을 준비하세요.
            </p>
          </div>

          {/* 격려 명언 */}
          <div className="mt-6 px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl max-w-lg mx-auto">
            <p className="text-gray-700 text-base md:text-lg italic leading-relaxed">
              "{randomQuote.text}"
            </p>
            {randomQuote.author && (
              <p className="text-sm text-gray-500 mt-2 text-right">
                — {randomQuote.author}
              </p>
            )}
          </div>
        </div>

        {/* 24시간 내 최대 탕감률 표시 */}
        {stats.dailyMaxRate && stats.dailyMaxRate > 0 && (
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-full shadow-lg">
              <div className="flex items-center gap-1">
                <span className="text-amber-600 text-lg">🔥</span>
                <span className="text-sm font-medium text-gray-700">24시간 내 최대 탕감률</span>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {stats.dailyMaxRate}%
              </span>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 px-4">
          <div className="space-y-3 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">5분이면 충분</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              간단한 정보 입력만으로 빠르게 결과를 확인할 수 있습니다
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">정확한 계산</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              법정 이율 기반 라이프니츠식으로 정확하게 산출합니다
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">안전한 상담</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              개인정보는 안전하게 보호되며 전문가 상담 연결이 가능합니다
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-4 pt-8">
          <button
            onClick={onStart}
            className="group relative w-full max-w-md mx-auto overflow-hidden bg-gradient-to-r from-primary-600 to-accent-600 text-white py-5 px-8 rounded-full font-semibold text-lg shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-500 transform hover:scale-105 active:scale-100"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              무료로 확인하기
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>

          <p className="text-sm text-gray-500 font-light">
            신용 정보 조회 없이 간편하게 예상 결과를 확인할 수 있습니다
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              무료 조회
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              개인정보 보호
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              전문가 검증
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
