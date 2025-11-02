/**
 * 관할법원 계산 유틸리티
 */

import type { CourtCode, RegionType, AddressData } from '@/app/types';
import {
  COURT_JURISDICTION_MAP,
  REHABILITATION_COURTS,
  COURT_DETAILS,
  GYEONGGI_NORTH_CITIES,
  PRIORITY_REPAYMENT
} from '@/app/constants';

/**
 * 주소 문자열에서 관할법원 코드 추출
 */
export function getCourtFromAddress(addressData: AddressData): CourtCode {
  const { sido, sigungu, address } = addressData;

  // 경기도 특별 처리: 북부/남부 구분
  if (sido.includes('경기')) {
    const isNorthCity = GYEONGGI_NORTH_CITIES.some(city =>
      sigungu.includes(city) || address.includes(city)
    );
    return isNorthCity ? 'uijeongbu' : 'suwon';
  }

  // 강원도 특별 처리: 철원은 의정부 관할
  if (sido.includes('강원') && sigungu.includes('철원')) {
    return 'uijeongbu';
  }

  // 일반 매핑
  const courtCode = COURT_JURISDICTION_MAP[sido];
  return (courtCode as CourtCode) || 'other';
}

/**
 * 회생법원 여부 확인
 */
export function isRehabilitationCourt(court: CourtCode): boolean {
  return REHABILITATION_COURTS.includes(court);
}

/**
 * 주요 법원 여부 확인 (서울/수원/대전/부산)
 */
export function isMainCourt(court: CourtCode): boolean {
  const courtInfo = COURT_DETAILS[court];
  return courtInfo?.isMain === true;
}

/**
 * 집 주소와 직장 주소의 관할법원을 비교하여 최종 관할법원 결정
 * 우선순위: 회생법원 > 사용자 선택
 */
export function selectPriorityJurisdiction(
  homeCourt: CourtCode,
  workCourt: CourtCode
): { court: CourtCode; needsSelection: boolean; options?: CourtCode[] } {
  // 둘 다 같은 법원이면 바로 결정
  if (homeCourt === workCourt) {
    return { court: homeCourt, needsSelection: false };
  }

  // 둘 중 하나라도 회생법원이면 회생법원 우선
  const homeIsRehab = isRehabilitationCourt(homeCourt);
  const workIsRehab = isRehabilitationCourt(workCourt);

  if (homeIsRehab && !workIsRehab) {
    return { court: homeCourt, needsSelection: false };
  }

  if (workIsRehab && !homeIsRehab) {
    return { court: workCourt, needsSelection: false };
  }

  // 둘 다 회생법원이거나 둘 다 일반법원이면 사용자 선택 필요
  return {
    court: homeCourt, // 임시 기본값
    needsSelection: true,
    options: [homeCourt, workCourt]
  };
}

/**
 * 주소에서 최우선변제금 지역 구분 추출
 */
export function getPriorityRepaymentRegion(addressData: AddressData): RegionType {
  const { sido, sigungu } = addressData;

  // 서울특별시
  if (sido.includes('서울')) {
    return '서울특별시';
  }

  // 수도권 과밀억제권역 (서울 제외, 세종, 용인, 화성, 김포 등)
  const metropolitanCities = ['세종', '용인', '화성', '김포'];
  if (metropolitanCities.some(city => sigungu.includes(city))) {
    return '수도권과밀억제권역';
  }

  // 인천, 경기 일부
  if (sido.includes('인천') || sido.includes('경기')) {
    return '수도권과밀억제권역';
  }

  // 광역시/특정시 (군 지역 제외, 안산, 광주, 파주, 이천, 평택)
  const metropolitanAreas = ['부산', '대구', '대전', '광주', '울산'];
  const specialCities = ['안산', '광주', '파주', '이천', '평택'];

  if (
    metropolitanAreas.some(city => sido.includes(city)) ||
    specialCities.some(city => sigungu.includes(city))
  ) {
    // 군 지역은 제외
    if (!sigungu.includes('군')) {
      return '광역시';
    }
  }

  // 그 밖의 지역
  return '그밖의지역';
}

/**
 * 법원 코드를 법원명으로 변환
 */
export function getCourtName(court: CourtCode): string {
  return COURT_DETAILS[court]?.name || '기타 법원';
}

/**
 * 최우선변제금액 조회
 */
export function getPriorityRepaymentAmount(region: RegionType): number {
  return PRIORITY_REPAYMENT[region] || 0;
}
