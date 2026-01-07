'use client';

import type { Choice } from '../../types';

interface ChoicePanelProps {
  choices: Choice[];
  onChoice: (choice: Choice) => void;
}

export function ChoicePanel({ choices, onChoice }: ChoicePanelProps) {
  return (
    <div className="absolute bottom-40 left-0 right-0 p-4 z-30">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={(e) => {
              e.stopPropagation();
              onChoice(choice);
            }}
            className="choice-option pixel-button text-left text-lg slide-in-left"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-[var(--pixel-accent)] mr-3">
              {index + 1}.
            </span>
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
