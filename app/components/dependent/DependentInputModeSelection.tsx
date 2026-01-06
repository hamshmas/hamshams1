"use client";

interface DependentInputModeSelectionProps {
  onSelect: (mode: 'direct' | 'calculate') => void;
  onBack: () => void;
}

export function DependentInputModeSelection({
  onSelect,
  onBack,
}: DependentInputModeSelectionProps) {
  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 질문 영역 */}
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          부양가족 수를 어떻게 입력할까요?
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">입력 방식을 선택해주세요 · 마지막 단계입니다!</p>
      </div>

      {/* 선택 영역 */}
      <div className="flex-1">
        <div className="space-y-3">
          <button
            onClick={() => onSelect('direct')}
            className="w-full border-2 border-blue-300 bg-blue-50/50 hover:bg-blue-50 rounded-xl p-4 transition-all text-left"
          >
            <p className="font-bold text-gray-900 text-sm mb-1">✍️ 직접 입력하기 (권장)</p>
            <p className="text-xs text-gray-600">
              부양가족 수를 알고 있다면 직접 입력하세요
            </p>
          </button>

          <button
            onClick={() => onSelect('calculate')}
            className="w-full border-2 border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50 rounded-xl p-4 transition-all text-left"
          >
            <p className="font-bold text-gray-900 text-sm mb-1">🧮 계산하기</p>
            <p className="text-xs text-gray-600">
              혼인 여부, 자녀 수 등을 입력하여 자동으로 계산합니다
            </p>
          </button>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mt-4">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="flex-1 text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-1">부양가족 수란?</p>
              <p>개인회생에서 최저생계비 산정 시 사용되는 인원입니다. 혼인 여부와 자녀 수에 따라 다르게 계산됩니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto pt-6">
        <button onClick={onBack} className="w-full py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          ← 이전
        </button>
      </div>
    </div>
  );
}
