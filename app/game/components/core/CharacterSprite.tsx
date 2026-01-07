'use client';

import type { CharacterPosition } from '../../types';

// 캐릭터별 이모지 표현
const CHARACTER_EXPRESSIONS: Record<string, Record<string, string>> = {
  protagonist: {
    normal: '😐',
    worried: '😟',
    scared: '😨',
    desperate: '😰',
    hopeful: '🙂',
    happy: '😊',
    relieved: '😌',
    determined: '😤',
    crying: '😢',
  },
  collector: {
    normal: '😠',
    angry: '😡',
    threatening: '👿',
    aggressive: '🤬',
  },
  lawyer: {
    normal: '🙂',
    explaining: '🤓',
    reassuring: '😊',
    serious: '😐',
    encouraging: '💪',
  },
  judge: {
    normal: '😐',
    stern: '🧐',
    approving: '👍',
    reading: '📋',
  },
  friend: {
    normal: '🙂',
    concerned: '😟',
    helpful: '🤝',
  },
  creditor: {
    normal: '😐',
    angry: '😠',
    accepting: '🙂',
  },
};

// 캐릭터 이름 색상
const CHARACTER_COLORS: Record<string, string> = {
  protagonist: '#4A90D9',
  collector: '#E74C3C',
  lawyer: '#27AE60',
  judge: '#8E44AD',
  friend: '#F39C12',
  creditor: '#95A5A6',
};

interface CharacterSpriteProps extends CharacterPosition {}

export function CharacterSprite({
  characterId,
  position,
  expression,
  animation,
}: CharacterSpriteProps) {
  const expressions = CHARACTER_EXPRESSIONS[characterId];
  if (!expressions) return null;

  const emoji = expressions[expression] || expressions.normal || '😐';

  const positionClass = {
    left: 'absolute left-16 md:left-24',
    center: 'absolute left-1/2 -translate-x-1/2',
    right: 'absolute right-16 md:right-24',
  }[position];

  const animationClass = animation
    ? {
        shake: 'character-shake',
        bounce: 'animate-bounce',
        fadeIn: 'fade-in',
      }[animation]
    : '';

  return (
    <div className={`${positionClass} ${animationClass} bottom-0`}>
      <div className="character-emoji select-none">{emoji}</div>
    </div>
  );
}

export { CHARACTER_EXPRESSIONS, CHARACTER_COLORS };
