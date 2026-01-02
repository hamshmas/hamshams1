interface SpouseIncomeCheckProps {
  onSelect: (noIncome: boolean) => void;
  onBack: () => void;
}

export function SpouseIncomeCheck({ onSelect, onBack }: SpouseIncomeCheckProps) {
  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          배우자의 최근 1년 소득은?
        </h2>
        <p className="text-gray-600 text-sm">배우자 소득 유무 확인</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect(true)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-bold text-gray-900">소득 없음</p>
              <p className="text-xs text-gray-600">배우자가 최근 1년간 소득이 없는 경우</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect(false)}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💼</span>
            <div>
              <p className="font-bold text-gray-900">소득 있음</p>
              <p className="text-xs text-gray-600">배우자가 소득이 있는 경우</p>
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
