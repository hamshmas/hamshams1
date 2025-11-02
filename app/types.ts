/**
 * 공통 타입 정의
 */

export interface FormData {
  totalDebt: number;
  monthlyIncome: number;
  assetValue: number;
  dependents: number;
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
export type CourtJurisdiction = 'seoul' | 'suwon' | 'daejeon' | 'busan' | 'other';
