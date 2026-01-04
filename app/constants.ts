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

// 법원 관할 구분 (레거시)
export const COURT_JURISDICTION = {
  '서울회생법원': ['서울특별시'],
  '수원회생법원': ['경기도'],
  '대전지방법원': ['대전광역시', '충청남도', '충청북도'],
  '부산회생법원': ['부산광역시', '울산광역시', '경상남도'],
};

// 경기도 북부 지역 (의정부지방법원 관할)
export const GYEONGGI_NORTH_CITIES = [
  '의정부', '양주', '포천', '연천', '고양', '파주', '남양주', '구리', '가평'
];

// 시/도 → 관할법원 코드 매핑
export const COURT_JURISDICTION_MAP: Record<string, string> = {
  // 회생법원 관할
  '서울특별시': 'seoul',
  '서울': 'seoul',

  // 경기도는 함수로 북부/남부 구분 필요
  '경기도': 'suwon', // 기본값 (남부)
  '경기': 'suwon',

  // 부산회생법원 관할
  '부산광역시': 'busan',
  '부산': 'busan',
  '울산광역시': 'busan',
  '울산': 'busan',

  // 일반 지방법원 관할
  '인천광역시': 'incheon',
  '인천': 'incheon',
  '대전광역시': 'daejeon',
  '대전': 'daejeon',
  '세종특별자치시': 'daejeon',
  '세종': 'daejeon',
  '대구광역시': 'daegu',
  '대구': 'daegu',
  '광주광역시': 'gwangju',
  '광주': 'gwangju',

  '강원특별자치도': 'chuncheon',
  '강원도': 'chuncheon',
  '강원': 'chuncheon',
  '충청북도': 'cheongju',
  '충북': 'cheongju',
  '충청남도': 'daejeon',
  '충남': 'daejeon',
  '경상북도': 'daegu',
  '경북': 'daegu',
  '경상남도': 'changwon',
  '경남': 'changwon',
  '전북특별자치도': 'jeonju',
  '전라북도': 'jeonju',
  '전북': 'jeonju',
  '전라남도': 'gwangju',
  '전남': 'gwangju',
  '제주특별자치도': 'jeju',
  '제주도': 'jeju',
  '제주': 'jeju',
};

// 회생법원 목록 (전문 도산법원)
export const REHABILITATION_COURTS = ['seoul', 'suwon', 'busan'];

// 법원 상세 정보
export const COURT_DETAILS: Record<string, { name: string; type: 'rehabilitation' | 'district'; isMain?: boolean }> = {
  'seoul': { name: '서울회생법원', type: 'rehabilitation', isMain: true },
  'suwon': { name: '수원회생법원', type: 'rehabilitation', isMain: true },
  'busan': { name: '부산회생법원', type: 'rehabilitation', isMain: true },
  'daejeon': { name: '대전지방법원', type: 'district', isMain: true },
  'incheon': { name: '인천지방법원', type: 'district' },
  'daegu': { name: '대구지방법원', type: 'district' },
  'gwangju': { name: '광주지방법원', type: 'district' },
  'uijeongbu': { name: '의정부지방법원', type: 'district' },
  'chuncheon': { name: '춘천지방법원', type: 'district' },
  'cheongju': { name: '청주지방법원', type: 'district' },
  'changwon': { name: '창원지방법원', type: 'district' },
  'jeonju': { name: '전주지방법원', type: 'district' },
  'jeju': { name: '제주지방법원', type: 'district' },
  'other': { name: '관할 지방법원', type: 'district' },
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

// 시/도 목록 (주소 입력 간소화용)
export const SIDO_LIST = [
  { label: '서울', value: 'seoul', court: 'seoul', region: '서울특별시' as const },
  { label: '경기 북부', value: 'gyeonggi-north', court: 'uijeongbu', region: '수도권과밀억제권역' as const },
  { label: '경기 남부', value: 'gyeonggi-south', court: 'suwon', region: '수도권과밀억제권역' as const },
  { label: '인천', value: 'incheon', court: 'incheon', region: '수도권과밀억제권역' as const },
  { label: '부산', value: 'busan', court: 'busan', region: '광역시' as const },
  { label: '대구', value: 'daegu', court: 'daegu', region: '광역시' as const },
  { label: '대전', value: 'daejeon', court: 'daejeon', region: '광역시' as const },
  { label: '광주', value: 'gwangju', court: 'gwangju', region: '광역시' as const },
  { label: '울산', value: 'ulsan', court: 'busan', region: '광역시' as const },
  { label: '세종', value: 'sejong', court: 'daejeon', region: '수도권과밀억제권역' as const },
  { label: '강원', value: 'gangwon', court: 'chuncheon', region: '그밖의지역' as const },
  { label: '충북', value: 'chungbuk', court: 'cheongju', region: '그밖의지역' as const },
  { label: '충남', value: 'chungnam', court: 'daejeon', region: '그밖의지역' as const },
  { label: '전북', value: 'jeonbuk', court: 'jeonju', region: '그밖의지역' as const },
  { label: '전남', value: 'jeonnam', court: 'gwangju', region: '그밖의지역' as const },
  { label: '경북', value: 'gyeongbuk', court: 'daegu', region: '그밖의지역' as const },
  { label: '경남', value: 'gyeongnam', court: 'changwon', region: '그밖의지역' as const },
  { label: '제주', value: 'jeju', court: 'jeju', region: '그밖의지역' as const },
];

// 4대 회생법원 코드
export const MAIN_COURTS = ['seoul', 'suwon', 'daejeon', 'busan'];
