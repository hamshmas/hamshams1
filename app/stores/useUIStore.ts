import { create } from "zustand";

interface UIState {
  currentStep: number;
  isLoading: boolean;
  showUpdateHistory: boolean;

  // Stats display (for welcome screen animation)
  userCount: number | null;
  dailyMaxRate: number;
  displayCount: number;
  displayDailyMaxRate: number;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setIsLoading: (loading: boolean) => void;
  setShowUpdateHistory: (show: boolean) => void;
  setUserCount: (count: number | null) => void;
  setDailyMaxRate: (rate: number) => void;
  setDisplayCount: (count: number) => void;
  setDisplayDailyMaxRate: (rate: number) => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentStep: 0,
  isLoading: false,
  showUpdateHistory: false,
  userCount: null,
  dailyMaxRate: 0,
  displayCount: 0,
  displayDailyMaxRate: 0,

  setCurrentStep: (currentStep) => set({ currentStep }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setShowUpdateHistory: (showUpdateHistory) => set({ showUpdateHistory }),
  setUserCount: (userCount) => set({ userCount }),
  setDailyMaxRate: (dailyMaxRate) => set({ dailyMaxRate }),
  setDisplayCount: (displayCount) => set({ displayCount }),
  setDisplayDailyMaxRate: (displayDailyMaxRate) => set({ displayDailyMaxRate }),
  resetUI: () =>
    set({
      currentStep: 0,
      isLoading: false,
      showUpdateHistory: false,
    }),
}));
