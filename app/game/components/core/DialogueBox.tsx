'use client';

import { useTypingEffect } from '../../hooks/useTypingEffect';
import type { Dialogue } from '../../types';

interface DialogueBoxProps {
  dialogue: Dialogue | null;
  onComplete?: () => void;
  onClick?: () => void;
}

export function DialogueBox({ dialogue, onClick }: DialogueBoxProps) {
  const { displayedText, isComplete, skip } = useTypingEffect(
    dialogue?.text || '',
    { speed: 40 }
  );

  if (!dialogue) return null;

  const handleClick = () => {
    if (!isComplete) {
      skip();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-4 z-20"
      onClick={handleClick}
    >
      <div className="dialogue-box p-6 mx-auto max-w-3xl cursor-pointer">
        {/* 화자 이름 */}
        {dialogue.speaker && (
          <div className="pixel-text text-[var(--pixel-accent)] text-lg mb-3">
            {dialogue.speaker}
          </div>
        )}

        {/* 대화 내용 */}
        <div className="pixel-text text-white text-xl min-h-[80px] leading-relaxed">
          {displayedText}
          {!isComplete && <span className="typing-cursor">|</span>}
        </div>

        {/* 진행 표시 */}
        {isComplete && (
          <div className="absolute bottom-4 right-6 bounce-arrow">
            <span className="text-[var(--pixel-accent)] text-2xl">▼</span>
          </div>
        )}
      </div>
    </div>
  );
}
