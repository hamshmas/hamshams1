import type { MaritalStatus } from "@/app/types";

interface MaritalStatusSelectionProps {
  onSelect: (status: MaritalStatus) => void;
  onBack: () => void;
  excludeMarried?: boolean; // 기혼 옵션 제외 여부
}

export function MaritalStatusSelection({ onSelect, onBack, excludeMarried = false }: MaritalStatusSelectionProps) {
  const allOptions = [
    {
      value: 'married' as const,
      label: '기혼',
      desc: '현재 결혼 상태입니다',
      gradient: 'from-pink-500 to-rose-600',
      shadow: 'shadow-pink-500/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      value: 'single' as const,
      label: '미혼',
      desc: '결혼한 적이 없습니다',
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      value: 'divorced' as const,
      label: '이혼',
      desc: '이혼 상태입니다',
      gradient: 'from-gray-500 to-slate-600',
      shadow: 'shadow-gray-500/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  const options = excludeMarried
    ? allOptions.filter(opt => opt.value !== 'married')
    : allOptions;

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 질문 영역 */}
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          현재 혼인 상태는?
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">
          부양가족 계산을 위해 필요합니다
        </p>
      </div>

      {/* 선택 영역 */}
      <div className="flex-1">
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className="group w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center shadow-lg ${option.shadow}`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-base">{option.label}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{option.desc}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto pt-6">
        <button
          onClick={onBack}
          className="w-full py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          ← 이전
        </button>
      </div>
    </div>
  );
}
