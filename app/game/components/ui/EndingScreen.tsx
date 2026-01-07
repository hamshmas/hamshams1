'use client';

import { useGameStore } from '../../stores/gameStore';

export function EndingScreen() {
  const { stressLevel, resetGame } = useGameStore();

  const handleRestart = () => {
    resetGame();
  };

  // 스트레스 레벨에 따른 엔딩 메시지
  const getEndingMessage = () => {
    if (stressLevel < 40) {
      return {
        title: '완벽한 새 출발',
        message: '당신은 침착하게 모든 과정을 잘 헤쳐나갔습니다.',
        emoji: '🌟',
      };
    } else if (stressLevel < 70) {
      return {
        title: '새로운 시작',
        message: '힘든 과정이었지만, 결국 해냈습니다.',
        emoji: '🌅',
      };
    } else {
      return {
        title: '험난한 여정 끝에',
        message: '많이 힘들었지만, 포기하지 않았기에 여기까지 왔습니다.',
        emoji: '💪',
      };
    }
  };

  const ending = getEndingMessage();

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#2d5a87] via-[#3498db] to-[#5dade2] flex flex-col items-center justify-center">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-8xl opacity-40">
          {ending.emoji}
        </div>
        <div className="absolute top-32 left-1/4 text-4xl opacity-30 animate-pulse">🕊️</div>
        <div className="absolute top-32 right-1/4 text-4xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}>🕊️</div>
        <div className="absolute bottom-40 left-1/3 text-3xl opacity-20">✨</div>
        <div className="absolute bottom-40 right-1/3 text-3xl opacity-20">✨</div>
      </div>

      {/* 엔딩 메시지 */}
      <div className="text-center space-y-8 z-10 px-8">
        <p className="pixel-text text-[var(--pixel-accent)] text-xl slide-up">
          THE END
        </p>
        <h1 className="pixel-text text-white text-4xl md:text-5xl slide-up" style={{ animationDelay: '0.2s' }}>
          {ending.title}
        </h1>
        <p className="pixel-text text-white text-lg md:text-xl max-w-md mx-auto slide-up" style={{ animationDelay: '0.4s' }}>
          {ending.message}
        </p>

        {/* 결과 요약 */}
        <div className="mt-8 space-y-4 slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="pixel-border-dark bg-[rgba(0,0,0,0.3)] p-6 max-w-md mx-auto">
            <p className="pixel-text text-[var(--pixel-accent)] text-lg mb-4">
              당신의 여정
            </p>
            <div className="space-y-2 text-left">
              <p className="pixel-text text-white">
                📋 개인회생 인가 결정 획득
              </p>
              <p className="pixel-text text-white">
                💰 3년간 성실히 변제 완료
              </p>
              <p className="pixel-text text-white">
                ⚖️ 면책 결정으로 빚에서 해방
              </p>
              <p className="pixel-text text-white">
                🌅 새로운 삶의 시작
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 다시 시작 버튼 */}
      <div className="mt-12 z-10 slide-up" style={{ animationDelay: '0.8s' }}>
        <button
          onClick={handleRestart}
          className="pixel-button text-xl px-8 py-3"
        >
          다시 시작
        </button>
      </div>

      {/* 안내 텍스트 */}
      <div className="absolute bottom-8 pixel-text text-sm text-white text-center opacity-70">
        <p>개인회생은 경제적 어려움에 처한 분들에게</p>
        <p>새로운 시작의 기회를 제공하는 제도입니다.</p>
      </div>
    </div>
  );
}
