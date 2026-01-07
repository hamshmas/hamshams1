'use client';

import { useGameStore } from '../../stores/gameStore';

export function StressGauge() {
  const stressLevel = useGameStore((state) => state.stressLevel);

  const getStressColor = () => {
    if (stressLevel < 40) return 'stress-low';
    if (stressLevel < 70) return 'stress-medium';
    return 'stress-high';
  };

  const getStressLabel = () => {
    if (stressLevel < 40) return '안정';
    if (stressLevel < 70) return '불안';
    return '위험';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="pixel-text text-sm text-[var(--pixel-text-dim)]">
        스트레스
      </span>
      <div className="w-24 h-4 bg-[var(--pixel-darker)] pixel-border-dark overflow-hidden">
        <div
          className={`h-full ${getStressColor()} transition-all duration-500`}
          style={{ width: `${stressLevel}%` }}
        />
      </div>
      <span className="pixel-text text-sm text-[var(--pixel-text)]">
        {getStressLabel()}
      </span>
    </div>
  );
}
