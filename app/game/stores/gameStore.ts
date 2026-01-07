import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState } from '../types';

interface GameActions {
  // 게임 시작/리셋
  startGame: () => void;
  resetGame: () => void;

  // 진행
  setChapter: (chapter: number) => void;
  setSceneIndex: (index: number) => void;
  advanceDialogue: () => void;
  resetDialogue: () => void;

  // 상태 변경
  updateStress: (delta: number) => void;
  makeChoice: (sceneId: string, choiceId: string) => void;
  setFlag: (key: string, value: boolean) => void;

  // 화면 효과
  setScreenEffect: (effect: GameState['screenEffect']) => void;
  setTransitioning: (isTransitioning: boolean) => void;
}

const initialState: GameState = {
  gameStarted: false,
  currentChapter: 1,
  currentSceneIndex: 0,
  currentDialogueIndex: 0,
  stressLevel: 50,
  choices: {},
  flags: {},
  screenEffect: 'none',
  isTransitioning: false,
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set) => ({
      ...initialState,

      startGame: () => set({ gameStarted: true, isTransitioning: true }),

      resetGame: () => set({ ...initialState }),

      setChapter: (chapter) =>
        set({
          currentChapter: chapter,
          currentSceneIndex: 0,
          currentDialogueIndex: 0,
        }),

      setSceneIndex: (index) =>
        set({
          currentSceneIndex: index,
          currentDialogueIndex: 0,
        }),

      advanceDialogue: () =>
        set((state) => ({
          currentDialogueIndex: state.currentDialogueIndex + 1,
        })),

      resetDialogue: () => set({ currentDialogueIndex: 0 }),

      updateStress: (delta) =>
        set((state) => ({
          stressLevel: Math.max(0, Math.min(100, state.stressLevel + delta)),
        })),

      makeChoice: (sceneId, choiceId) =>
        set((state) => ({
          choices: { ...state.choices, [sceneId]: choiceId },
        })),

      setFlag: (key, value) =>
        set((state) => ({
          flags: { ...state.flags, [key]: value },
        })),

      setScreenEffect: (effect) => set({ screenEffect: effect }),

      setTransitioning: (isTransitioning) => set({ isTransitioning }),
    }),
    {
      name: 'rehabilitation-game',
      partialize: (state) => ({
        currentChapter: state.currentChapter,
        currentSceneIndex: state.currentSceneIndex,
        stressLevel: state.stressLevel,
        choices: state.choices,
        flags: state.flags,
      }),
    }
  )
);
