/**
 * 공통 타입 정의
 */

export interface FormData {
  totalDebt: number;
  monthlyIncome: number;
  assetValue: number;
  dependents: number;
  // 주소 및 관할 정보
  homeAddress: string;
  workAddress: string;
  courtJurisdiction: CourtCode;
  priorityRepaymentRegion: RegionType;
}

export interface CalculationResult {
  reductionRate: number;
  repaymentAmount: number;
  reductionAmount: number;
  monthlyPayment: number;
  repaymentPeriod: number;
  liquidationValueViolation: boolean;
}

export type HousingType = 'owned' | 'jeonse' | 'monthly' | 'free';
export type AssetInputMode = 'direct' | 'calculate';
export type RegionType = '서울특별시' | '수도권과밀억제권역' | '광역시' | '그밖의지역';
export type MaritalStatus = 'married' | 'single' | 'divorced';

// 관할법원 코드 (확장됨)
export type CourtCode =
  | 'seoul'       // 서울회생법원
  | 'suwon'       // 수원회생법원
  | 'busan'       // 부산회생법원
  | 'daejeon'     // 대전지방법원
  | 'incheon'     // 인천지방법원
  | 'daegu'       // 대구지방법원
  | 'gwangju'     // 광주지방법원
  | 'uijeongbu'   // 의정부지방법원
  | 'chuncheon'   // 춘천지방법원
  | 'cheongju'    // 청주지방법원
  | 'changwon'    // 창원지방법원
  | 'jeonju'      // 전주지방법원
  | 'jeju'        // 제주지방법원
  | 'other';      // 기타

// 레거시 호환용 (부양가족 계산에서 사용)
export type CourtJurisdiction = 'seoul' | 'suwon' | 'daejeon' | 'busan' | 'other';

// 주소 데이터
export interface AddressData {
  address: string;          // 도로명 주소
  jibunAddress: string;     // 지번 주소
  zonecode: string;         // 우편번호
  sido: string;             // 시/도
  sigungu: string;          // 시/군/구
}
