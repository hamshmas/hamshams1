/**
 * 상담 데이터 타입 정의
 * Firestore 컬렉션 스키마
 */

import type { FormData, CalculationResult, HousingType, MaritalStatus } from '../types';

// 상담 상태 타입
export type ConsultationStatus =
  | 'pending'      // 대기중
  | 'contacted'    // 연락완료
  | 'scheduled'    // 상담예약
  | 'completed'    // 상담완료
  | 'cancelled'    // 취소
  | 'no-response'; // 무응답

// 선호 연락 방법
export type PreferredContactMethod = 'phone' | 'email' | 'kakao';

// 신청자 정보
export interface ApplicantInfo {
  name: string;
  phone: string;
  email?: string;
  birthdate?: string;              // 생년월일 (YYYY-MM-DD)
  residentNumberPrefix?: string;   // 주민등록번호 앞자리 (YYMMDD)
  occupation?: string;              // 직업
  workplace?: string;               // 근무처
  debtReason?: string;              // 채무 발생 주요 사유
  preferredContactMethod?: PreferredContactMethod;
  preferredContactTime?: string;    // 선호 상담 시간대 (예: "평일 오전", "평일 오후", "주말")
  additionalNotes?: string;         // 추가 메모
  privacyConsent: boolean;          // 개인정보 수집 동의
}

// 계산 입력 데이터
export interface CalculationInput {
  totalDebt: number;
  monthlyIncome: number;
  assetValue: number;
  dependents: number;
  homeAddress: string;
  workAddress: string;
  courtJurisdiction: string;
  priorityRepaymentRegion: string;
}

// 자산 상세 정보
export interface AssetDetails {
  housingType?: HousingType;
  kbPrice?: number;
  mortgageAmount?: number;
  depositAmount?: number;
  hasMortgage?: boolean;
  isSpouseHousing?: boolean;
  // 추가 자산 정보
  savings?: number;                 // 예금/적금
  vehicle?: {                       // 차량
    exists: boolean;
    value?: number;
  };
  insurance?: {                     // 보험
    exists: boolean;
    value?: number;
  };
  otherAssets?: string;             // 기타 자산 설명
}

// 부양가족 상세 정보
export interface DependentDetails {
  maritalStatus?: MaritalStatus;
  childrenCount?: number;
  hasNoSpouseIncome?: boolean;
  spouseInfo?: {                    // 배우자 정보
    name?: string;
    occupation?: string;
    monthlyIncome?: number;
  };
}

// 관리자 노트
export interface ConsultationNote {
  id: string;
  content: string;
  createdBy: string;                // 작성자 이메일 또는 ID
  createdAt: Date;
}

// 메타데이터
export interface ConsultationMetadata {
  createdAt: Date;
  updatedAt: Date;
  status: ConsultationStatus;
  assignedTo?: string;               // 담당자 이메일 또는 ID
  contactedAt?: Date;                // 최초 연락일
  scheduledAt?: Date;                // 상담 예약일
  completedAt?: Date;                // 상담 완료일
  source: 'web' | 'mobile';          // 접속 경로
  userAgent?: string;                // 브라우저 정보
  // IP 주소는 개인정보이므로 수집하지 않음
}

// Firestore 문서 타입 (전체 상담 데이터)
export interface ConsultationData {
  id: string;                        // Firestore 문서 ID
  applicant: ApplicantInfo;
  input: CalculationInput;
  assetDetails?: AssetDetails;
  dependentDetails?: DependentDetails;
  result: CalculationResult;
  metadata: ConsultationMetadata;
  notes?: ConsultationNote[];
}

// API 요청 타입 (클라이언트 -> 서버)
export interface CreateConsultationRequest {
  applicant: ApplicantInfo;
  formData: FormData;
  result: CalculationResult;
  // 자산 상세 정보
  housingType?: HousingType | null;
  kbPrice?: number;
  mortgageAmount?: number;
  depositAmount?: number;
  hasMortgage?: boolean | null;
  isSpouseHousing?: boolean | null;
  // 부양가족 상세 정보
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number;
  hasNoSpouseIncome?: boolean | null;
}

// API 응답 타입
export interface CreateConsultationResponse {
  success: boolean;
  consultationId?: string;
  message?: string;
  error?: string;
}

// 관리자 대시보드용 요약 타입
export interface ConsultationSummary {
  id: string;
  name: string;
  phone: string;
  status: ConsultationStatus;
  createdAt: Date;
  totalDebt: number;
  reductionRate: number;
  assignedTo?: string;
  courtJurisdiction: string;
}
