/**
 * 상수 정의
 */

// 지역별 최우선변제금액 (단위: 원)
export const PRIORITY_REPAYMENT: Record<string, number> = {
  '서울특별시': 55000000,
  '수도권과밀억제권역': 48000000,
  '광역시': 28000000,
  '그밖의지역': 25000000,
};

// 법원 관할 구분
export const COURT_JURISDICTION = {
  '서울회생법원': ['서울특별시'],
  '수원회생법원': ['경기도'],
  '대전지방법원': ['대전광역시', '충청남도', '충청북도'],
  '부산회생법원': ['부산광역시', '울산광역시', '경상남도'],
};

// 지역 정보
export const REGIONS = [
  {
    value: '서울특별시' as const,
    label: '서울특별시',
    amount: 5500
  },
  {
    value: '수도권과밀억제권역' as const,
    label: '수도권 과밀억제권역',
    sublabel: '(서울 제외, 세종, 용인, 화성, 김포)',
    amount: 4800
  },
  {
    value: '광역시' as const,
    label: '광역시/특정시',
    sublabel: '(군 지역 제외, 안산, 광주, 파주, 이천, 평택)',
    amount: 2800
  },
  {
    value: '그밖의지역' as const,
    label: '그 밖의 지역',
    amount: 2500
  },
];

// 주요 법원 관할 지역
export const MAIN_COURT_REGIONS = [
  { label: '서울특별시', desc: '서울회생법원 관할' },
  { label: '경기도', desc: '수원회생법원 관할' },
  { label: '대전/충청', desc: '대전지방법원 관할' },
  { label: '부산/울산/경남', desc: '부산회생법원 관할' },
];
