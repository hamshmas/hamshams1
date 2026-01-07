'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SceneRenderer } from './SceneRenderer';
import { DialogueBox } from './DialogueBox';
import { ChoicePanel } from './ChoicePanel';
import { ChapterTransition } from '../ui/ChapterTransition';
import { StressGauge } from '../hud/StressGauge';
import { ChapterIndicator } from '../hud/ChapterIndicator';
import { EndingScreen } from '../ui/EndingScreen';
import type { Chapter, Scene, Choice, DialogueEffect } from '../../types';

// 챕터 데이터 import
import chapter01 from '../../data/chapters/chapter01.json';
import chapter02 from '../../data/chapters/chapter02.json';
import chapter03 from '../../data/chapters/chapter03.json';
import chapter04 from '../../data/chapters/chapter04.json';
import chapter05 from '../../data/chapters/chapter05.json';
import chapter06 from '../../data/chapters/chapter06.json';
import chapter07 from '../../data/chapters/chapter07.json';
import chapter08 from '../../data/chapters/chapter08.json';
import chapter09 from '../../data/chapters/chapter09.json';
import chapter10 from '../../data/chapters/chapter10.json';

const CHAPTERS: Chapter[] = [
  chapter01 as Chapter,
  chapter02 as Chapter,
  chapter03 as Chapter,
  chapter04 as Chapter,
  chapter05 as Chapter,
  chapter06 as Chapter,
  chapter07 as Chapter,
  chapter08 as Chapter,
  chapter09 as Chapter,
  chapter10 as Chapter,
];

export function GameEngine() {
  const {
    currentChapter,
    currentSceneIndex,
    currentDialogueIndex,
    isTransitioning,
    screenEffect,
    setChapter,
    setSceneIndex,
    advanceDialogue,
    resetDialogue,
    updateStress,
    setFlag,
    setScreenEffect,
    setTransitioning,
  } = useGameStore();

  const [showChoices, setShowChoices] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // 현재 챕터 데이터
  const chapterData = CHAPTERS[currentChapter - 1];
  const scenes: Scene[] = chapterData?.scenes || [];
  const currentScene = scenes[currentSceneIndex] || null;
  const dialogues = currentScene?.dialogues || [];
  const currentDialogue = dialogues[currentDialogueIndex] || null;

  // 효과 적용
  const applyEffects = useCallback(
    (effects?: DialogueEffect[]) => {
      if (!effects) return;

      effects.forEach((effect) => {
        switch (effect.type) {
          case 'stress':
            if (typeof effect.value === 'number') {
              updateStress(effect.value);
            }
            break;
          case 'flag':
            if (effect.key && typeof effect.value === 'boolean') {
              setFlag(effect.key, effect.value);
            }
            break;
          case 'screen':
            if (typeof effect.value === 'string') {
              setScreenEffect(effect.value as 'shake' | 'flash');
              setTimeout(() => setScreenEffect('none'), 500);
            }
            break;
        }
      });
    },
    [updateStress, setFlag, setScreenEffect]
  );

  // 다음 씬으로 이동
  const goToNextScene = useCallback(
    (nextSceneId?: string) => {
      if (!nextSceneId) {
        // 다음 챕터로
        if (currentChapter < 10) {
          setTransitioning(true);
          setTimeout(() => {
            setChapter(currentChapter + 1);
          }, 500);
        } else {
          // 게임 종료
          setIsEnding(true);
        }
        return;
      }

      // 같은 챕터 내 씬 이동
      const nextIndex = scenes.findIndex((s) => s.id === nextSceneId);
      if (nextIndex !== -1) {
        setSceneIndex(nextIndex);
      } else {
        // 다음 챕터로
        if (currentChapter < 10) {
          setTransitioning(true);
          setTimeout(() => {
            setChapter(currentChapter + 1);
          }, 500);
        } else {
          setIsEnding(true);
        }
      }
    },
    [currentChapter, scenes, setChapter, setSceneIndex, setTransitioning]
  );

  // 대화 진행
  const handleAdvance = useCallback(() => {
    if (showChoices) return;

    // 현재 대화의 효과 적용
    if (currentDialogue?.effects) {
      applyEffects(currentDialogue.effects);
    }

    if (currentDialogueIndex < dialogues.length - 1) {
      // 다음 대화로
      advanceDialogue();
    } else {
      // 대화 끝
      if (currentScene?.choices && currentScene.choices.length > 0) {
        // 선택지 표시
        setShowChoices(true);
      } else {
        // 다음 씬으로
        goToNextScene(currentScene?.nextScene);
      }
    }
  }, [
    showChoices,
    currentDialogue,
    currentDialogueIndex,
    dialogues.length,
    currentScene,
    advanceDialogue,
    applyEffects,
    goToNextScene,
  ]);

  // 선택지 처리
  const handleChoice = useCallback(
    (choice: Choice) => {
      setShowChoices(false);
      resetDialogue();

      // 선택 효과 적용
      if (choice.effects) {
        applyEffects(choice.effects);
      }

      // 다음 씬으로
      goToNextScene(choice.nextScene);
    },
    [applyEffects, goToNextScene, resetDialogue]
  );

  // 챕터 전환 완료
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setTransitioning(false);
        setShowChoices(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, setTransitioning]);

  // 화면 효과 클래스
  const screenEffectClass =
    screenEffect !== 'none' ? `screen-${screenEffect}` : '';

  if (isEnding) {
    return <EndingScreen />;
  }

  return (
    <div
      className={`relative w-full h-screen overflow-hidden ${screenEffectClass}`}
      onClick={handleAdvance}
    >
      {/* 배경 및 캐릭터 */}
      <SceneRenderer scene={currentScene} />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <ChapterIndicator chapter={currentChapter} />
        <StressGauge />
      </div>

      {/* 대화 박스 */}
      {!showChoices && currentDialogue && (
        <DialogueBox dialogue={currentDialogue} onClick={handleAdvance} />
      )}

      {/* 선택지 */}
      {showChoices && currentScene?.choices && (
        <ChoicePanel choices={currentScene.choices} onChoice={handleChoice} />
      )}

      {/* 챕터 전환 */}
      {isTransitioning && <ChapterTransition chapter={currentChapter} />}
    </div>
  );
}
