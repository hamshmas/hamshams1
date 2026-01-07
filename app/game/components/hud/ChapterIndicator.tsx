'use client';

import { CHAPTER_TITLES } from '../../types';

interface ChapterIndicatorProps {
  chapter: number;
}

export function ChapterIndicator({ chapter }: ChapterIndicatorProps) {
  const chapterInfo = CHAPTER_TITLES[chapter - 1];

  return (
    <div className="flex items-center gap-3">
      <span className="pixel-text text-[var(--pixel-accent)] text-lg">
        Ch.{chapter}
      </span>
      <span className="pixel-text text-[var(--pixel-text)] text-sm">
        {chapterInfo?.title || ''}
      </span>
    </div>
  );
}
