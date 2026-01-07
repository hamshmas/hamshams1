'use client';

import { useGameStore } from './stores/gameStore';
import { GameEngine } from './components/core/GameEngine';
import { TitleScreen } from './components/ui/TitleScreen';

export default function GamePage() {
  const { gameStarted } = useGameStore();

  return (
    <main className="w-full h-screen overflow-hidden">
      {gameStarted ? <GameEngine /> : <TitleScreen />}
    </main>
  );
}
