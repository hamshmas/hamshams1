import type { MaritalStatus } from "@/app/types";

interface MaritalStatusSelectionProps {
  onSelect: (status: MaritalStatus) => void;
  onBack: () => void;
}

export function MaritalStatusSelection({ onSelect, onBack }: MaritalStatusSelectionProps) {
  const options = [
    {
      value: 'married' as const,
      icon: '💑',
      label: '기혼',
      desc: '현재 결혼 상태입니다'
    },
    {
      value: 'single' as const,
      icon: '🙋',
      label: '미혼',
      desc: '결혼한 적이 없습니다'
    },
    {
      value: 'divorced' as const,
      icon: '👤',
      label: '이혼',
      desc: '이혼 상태입니다'
    },
  ];

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          현재 혼인 상태는?
        </h2>
        <p className="text-gray-600 text-sm">부양가족 계산을 위해 필요합니다</p>
      </div>

      <div className="space-y-2.5">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-3.5 text-left transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.icon}</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">{option.label}</p>
                <p className="text-xs text-gray-600">{option.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onBack} className="w-full secondary-button text-sm py-2.5">
        이전
      </button>
    </div>
  );
}
