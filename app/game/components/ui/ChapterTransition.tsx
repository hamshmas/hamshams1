'use client';

import { CHAPTER_TITLES } from '../../types';

interface ChapterTransitionProps {
  chapter: number;
}

export function ChapterTransition({ chapter }: ChapterTransitionProps) {
  const chapterInfo = CHAPTER_TITLES[chapter - 1];

  if (!chapterInfo) return null;

  return (
    <div className="absolute inset-0 chapter-overlay flex items-center justify-center z-50 fade-in">
      <div className="text-center space-y-6">
        <p className="pixel-text text-[var(--pixel-accent)] text-2xl slide-up">
          Chapter {chapter}
        </p>
        <h1 className="pixel-text text-white text-5xl md:text-6xl slide-up" style={{ animationDelay: '0.2s' }}>
          {chapterInfo.title}
        </h1>
        <p className="pixel-text text-[var(--pixel-text-dim)] text-xl slide-up" style={{ animationDelay: '0.4s' }}>
          {chapterInfo.subtitle}
        </p>
      </div>
    </div>
  );
}
