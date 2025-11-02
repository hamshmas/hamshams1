import type { CourtJurisdiction } from "@/app/types";

interface CourtJurisdictionCheckProps {
  onSelect: (jurisdiction: CourtJurisdiction) => void;
  onBack: () => void;
}

export function CourtJurisdictionCheck({ onSelect, onBack }: CourtJurisdictionCheckProps) {
  const mainCourts = [
    { value: 'seoul' as const, label: '서울회생법원', desc: '서울특별시' },
    { value: 'suwon' as const, label: '수원회생법원', desc: '경기도' },
    { value: 'daejeon' as const, label: '대전지방법원', desc: '대전/충청' },
    { value: 'busan' as const, label: '부산회생법원', desc: '부산/울산/경남' },
  ];

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          관할 법원을 선택해주세요
        </h2>
        <p className="text-gray-600 text-sm">거주지 기준 관할 법원</p>
      </div>

      <div className="space-y-2.5">
        {mainCourts.map((court) => (
          <button
            key={court.value}
            onClick={() => onSelect(court.value)}
            className="w-full bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-3.5 text-left transition-all hover:shadow-lg"
          >
            <div>
              <p className="font-bold text-gray-900 text-sm">{court.label}</p>
              <p className="text-xs text-blue-600 mt-0.5">{court.desc}</p>
            </div>
          </button>
        ))}

        <button
          onClick={() => onSelect('other')}
          className="w-full bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl p-3.5 text-left transition-all hover:shadow-lg"
        >
          <div>
            <p className="font-bold text-gray-900 text-sm">그 외 지역</p>
            <p className="text-xs text-gray-600 mt-0.5">기타 법원 관할</p>
          </div>
        </button>
      </div>

      <button onClick={onBack} className="w-full secondary-button text-sm py-2.5">
        이전
      </button>
    </div>
  );
}
