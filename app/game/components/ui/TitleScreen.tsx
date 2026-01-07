'use client';

import { useGameStore } from '../../stores/gameStore';

export function TitleScreen() {
  const { startGame, resetGame } = useGameStore();

  const handleStart = () => {
    resetGame();
    startGame();
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex flex-col items-center justify-center">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 text-6xl opacity-10 animate-pulse">💰</div>
        <div className="absolute top-40 right-1/4 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}>📉</div>
        <div className="absolute bottom-40 left-1/3 text-4xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>⚖️</div>
        <div className="absolute bottom-20 right-1/3 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }}>🌅</div>
      </div>

      {/* 타이틀 */}
      <div className="text-center space-y-6 z-10">
        <h1 className="pixel-text text-5xl md:text-7xl text-[var(--pixel-accent)] slide-up">
          개인회생
        </h1>
        <h2 className="pixel-text text-2xl md:text-3xl text-[var(--pixel-text)] slide-up" style={{ animationDelay: '0.2s' }}>
          새로운 시작
        </h2>
        <p className="pixel-text text-lg text-[var(--pixel-text-dim)] slide-up" style={{ animationDelay: '0.4s' }}>
          빚의 늪에서 벗어나는 여정
        </p>
      </div>

      {/* 시작 버튼 */}
      <div className="mt-16 z-10 slide-up" style={{ animationDelay: '0.6s' }}>
        <button
          onClick={handleStart}
          className="pixel-button text-2xl px-12 py-4 hover:scale-105 transition-transform"
        >
          게임 시작
        </button>
      </div>

      {/* 안내 텍스트 */}
      <div className="absolute bottom-8 pixel-text text-sm text-[var(--pixel-text-dim)] text-center">
        <p>화면을 클릭하여 대화를 진행하세요</p>
        <p className="mt-2">플레이 시간: 약 10분</p>
      </div>

      {/* 비네트 효과 */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
