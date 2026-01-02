interface MortgageCheckProps {
  onSelect: (has: boolean) => void;
  onBack: () => void;
}

export function MortgageCheck({ onSelect, onBack }: MortgageCheckProps) {
  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          근저당권이 설정되어 있나요?
        </h2>
        <p className="text-gray-600 text-sm">주택담보대출 등이 있는 경우</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect(true)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-gray-900">예, 있어요</p>
              <p className="text-xs text-gray-600">주택담보대출이 있어요</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect(false)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-bold text-gray-900">아니오, 없어요</p>
              <p className="text-xs text-gray-600">대출이 없거나 전액 상환했어요</p>
            </div>
          </div>
        </button>
      </div>

      <button onClick={onBack} className="w-full py-4 rounded-xl text-[17px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
        ← 이전
      </button>
    </div>
  );
}
