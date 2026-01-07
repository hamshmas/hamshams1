'use client';

import type { Scene } from '../../types';
import { CharacterSprite } from './CharacterSprite';

interface SceneRendererProps {
  scene: Scene | null;
}

// 배경별 그라데이션 스타일
const BACKGROUND_STYLES: Record<string, string> = {
  'home-dark': 'bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]',
  'home': 'bg-gradient-to-b from-[#2d3748] via-[#1a202c] to-[#171923]',
  'street': 'bg-gradient-to-b from-[#4a5568] via-[#2d3748] to-[#1a202c]',
  'lawfirm': 'bg-gradient-to-b from-[#1e3a5f] via-[#0d1b2a] to-[#0a1628]',
  'court': 'bg-gradient-to-b from-[#4a3728] via-[#2d1f14] to-[#1a120a]',
  'office': 'bg-gradient-to-b from-[#3d5a80] via-[#293241] to-[#1d242e]',
  'phone': 'bg-gradient-to-b from-[#1a1a2e] via-[#0f0f23] to-[#000]',
  'hope': 'bg-gradient-to-b from-[#1e3a5f] via-[#2d5a87] to-[#1e3a5f]',
  'ending': 'bg-gradient-to-b from-[#2d5a87] via-[#3498db] to-[#5dade2]',
};

// 배경별 장식 요소
const BACKGROUND_DECORATIONS: Record<string, React.ReactNode> = {
  'home-dark': (
    <>
      <div className="absolute top-10 right-10 text-6xl opacity-20">🌙</div>
      <div className="absolute bottom-20 left-10 text-4xl opacity-10">🛋️</div>
    </>
  ),
  'home': (
    <>
      <div className="absolute top-10 left-10 text-4xl opacity-20">🪟</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-15">🛋️</div>
    </>
  ),
  'street': (
    <>
      <div className="absolute top-5 left-1/4 text-3xl opacity-20">🏢</div>
      <div className="absolute top-5 right-1/4 text-3xl opacity-20">🏬</div>
    </>
  ),
  'lawfirm': (
    <>
      <div className="absolute top-10 right-10 text-5xl opacity-20">⚖️</div>
      <div className="absolute bottom-32 left-10 text-4xl opacity-15">📚</div>
    </>
  ),
  'court': (
    <>
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-6xl opacity-25">⚖️</div>
      <div className="absolute top-10 left-10 text-4xl opacity-15">🏛️</div>
      <div className="absolute top-10 right-10 text-4xl opacity-15">🏛️</div>
    </>
  ),
  'office': (
    <>
      <div className="absolute top-10 right-10 text-4xl opacity-20">💼</div>
      <div className="absolute bottom-32 left-10 text-3xl opacity-15">🖥️</div>
    </>
  ),
  'phone': (
    <>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-8xl opacity-30 animate-pulse">📱</div>
    </>
  ),
  'hope': (
    <>
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-6xl opacity-30">✨</div>
      <div className="absolute top-20 left-1/4 text-4xl opacity-20">⭐</div>
      <div className="absolute top-20 right-1/4 text-4xl opacity-20">⭐</div>
    </>
  ),
  'ending': (
    <>
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-8xl opacity-40">🌅</div>
      <div className="absolute top-32 left-1/4 text-4xl opacity-30">🕊️</div>
      <div className="absolute top-32 right-1/4 text-4xl opacity-30">🕊️</div>
    </>
  ),
};

export function SceneRenderer({ scene }: SceneRendererProps) {
  if (!scene) return null;

  const bgStyle = BACKGROUND_STYLES[scene.background] || BACKGROUND_STYLES['home-dark'];
  const decorations = BACKGROUND_DECORATIONS[scene.background];

  return (
    <div className={`absolute inset-0 ${bgStyle}`}>
      {/* 배경 장식 */}
      {decorations}

      {/* 캐릭터들 */}
      <div className="absolute inset-0 flex items-end justify-center pb-48">
        {scene.characters?.map((char) => (
          <CharacterSprite
            key={char.characterId}
            characterId={char.characterId}
            position={char.position}
            expression={char.expression}
            animation={char.animation}
          />
        ))}
      </div>

      {/* 비네트 효과 */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
