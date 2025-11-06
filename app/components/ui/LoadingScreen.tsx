export function LoadingScreen() {
  return (
    <div className="min-h-[350px] flex flex-col items-center justify-center space-y-6 animate-fadeIn">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 animate-pulse flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          전문 알고리즘으로 계산 중...
        </h3>
        <p className="text-gray-600 text-sm animate-pulse">변호사가 검증한 정확한 계산 방식</p>
        <div className="flex justify-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-green-600">✓</span>
            <span>법원 기준 적용</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-green-600">✓</span>
            <span>실시간 계산</span>
          </div>
        </div>
      </div>
      <div className="w-full max-w-xs space-y-2">
        {['부채 정보 분석', '청산가치 계산', '라이프니츠식 적용 (법정이율 5%)', '최종 탕감률 산출'].map((text, i) => (
          <div key={i} className="flex items-center gap-2 animate-slideIn" style={{ animationDelay: `${i * 0.6}s` }}>
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 animate-pulse"></div>
            <span className="text-gray-700 text-xs font-medium">{text}</span>
          </div>
        ))}</div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
        <p className="text-xs text-blue-800 text-center">
          <span className="font-bold">💡 잠깐!</span> 계산 결과는 참고용이며,<br/>정확한 상담은 전문 변호사를 통해 가능합니다
        </p>
      </div>
    </div>
  );
}
