"use client";

import type { CourtCode } from "@/app/types";
import { getCourtName } from "@/utils/courtJurisdiction";

interface SpouseHousingJurisdictionInfoProps {
  courtJurisdiction: CourtCode;
  onBack: () => void;
  onNext: (isMainCourt: boolean) => void;
}

export function SpouseHousingJurisdictionInfo({
  courtJurisdiction,
  onBack,
  onNext,
}: SpouseHousingJurisdictionInfoProps) {
  const isMainCourt = ['seoul', 'suwon', 'daejeon', 'busan'].includes(courtJurisdiction);
  const courtName = getCourtName(courtJurisdiction);

  return (
    <div className="space-y-4 animate-slideIn">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-3">
          배우자 주택 청산가치
        </h2>
        <div className={`${isMainCourt ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'} border-2 rounded-xl p-4 mb-4`}>
          <p className="text-sm text-gray-700 mb-2">
            귀하의 관할법원: <span className={`font-bold ${isMainCourt ? 'text-primary-600' : 'text-gray-900'}`}>{courtName}</span>
          </p>
          {isMainCourt ? (
            <>
              <p className="text-sm text-gray-700">
                주요 법원 관할 지역으로, 배우자 명의 주택은 청산가치에 포함되지 않습니다.
              </p>
              <p className="text-2xl font-bold text-primary-600 mt-3">청산가치: 0원</p>
            </>
          ) : (
            <p className="text-sm text-gray-700">
              배우자 명의 주택의 절반이 청산가치에 포함됩니다. 다음 단계에서 주택 가액을 입력해주세요.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="secondary-button flex-1 text-sm py-2.5"
        >
          이전
        </button>
        <button
          onClick={() => onNext(isMainCourt)}
          className="primary-button flex-1 text-sm py-2.5"
        >
          다음
        </button>
      </div>
    </div>
  );
}
