import type { FormData, CalculationResult, HousingType, MaritalStatus } from "@/app/types";
import { getCourtName } from "./courtJurisdiction";

interface ConsultationMessageParams {
  formData: FormData;
  result: CalculationResult;
  name: string;
  phone: string;
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

const HOUSING_TYPE_LABELS: Record<HousingType, string> = {
  owned: '본인 명의 자가',
  jeonse: '전세',
  monthly: '월세',
  free: '무상거주'
};

const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  married: '기혼',
  single: '미혼',
  divorced: '이혼'
};

/**
 * 상담 신청 메시지를 생성합니다.
 */
export function generateConsultationMessage(params: ConsultationMessageParams): string {
  const {
    formData,
    result,
    name,
    phone,
    housingType,
    kbPrice,
    mortgageAmount,
    depositAmount,
    hasMortgage,
    isSpouseHousing,
    maritalStatus,
    childrenCount,
    hasNoSpouseIncome,
  } = params;

  let message = "상담 신청합니다.\n\n";

  // 입력 정보
  message += generateInputInfo({
    formData,
    housingType,
    kbPrice,
    mortgageAmount,
    depositAmount,
    hasMortgage,
    isSpouseHousing,
    maritalStatus,
    childrenCount,
    hasNoSpouseIncome,
  });

  // 계산 결과
  message += generateCalculationResult(formData, result);

  // 신청자 정보
  message += generateApplicantInfo(name, phone);

  return message;
}

/**
 * 입력 정보 섹션을 생성합니다.
 */
function generateInputInfo(params: Omit<ConsultationMessageParams, 'result' | 'name' | 'phone'>): string {
  const {
    formData,
    housingType,
    kbPrice,
    mortgageAmount,
    depositAmount,
    hasMortgage,
    isSpouseHousing,
    maritalStatus,
    childrenCount,
    hasNoSpouseIncome,
  } = params;

  let info = "[입력 정보]\n";
  info += `• 총 부채액: ${Math.round(formData.totalDebt).toLocaleString()}원\n`;
  info += `• 월 소득: ${Math.round(formData.monthlyIncome).toLocaleString()}원\n`;

  // 자산 정보
  info += generateAssetInfo({
    assetValue: formData.assetValue,
    housingType,
    kbPrice,
    mortgageAmount,
    depositAmount,
    hasMortgage,
    isSpouseHousing,
  });

  // 부양가족 정보
  info += generateDependentInfo({
    dependents: formData.dependents,
    maritalStatus,
    childrenCount,
    hasNoSpouseIncome,
  });

  info += `• 관할법원: ${getCourtName(formData.courtJurisdiction)}\n`;

  if (formData.homeAddress) {
    info += `• 집 주소: ${formData.homeAddress}\n`;
  }

  return info;
}

/**
 * 자산 정보를 생성합니다.
 */
function generateAssetInfo(params: {
  assetValue: number;
  housingType?: HousingType | null;
  kbPrice?: number;
  mortgageAmount?: number;
  depositAmount?: number;
  hasMortgage?: boolean | null;
  isSpouseHousing?: boolean | null;
}): string {
  const { assetValue, housingType, kbPrice, mortgageAmount, depositAmount, hasMortgage, isSpouseHousing } = params;

  let info = `• 자산 가액: ${Math.round(assetValue).toLocaleString()}원\n`;

  if (!housingType) return info;

  info += `  - 주거 형태: ${HOUSING_TYPE_LABELS[housingType]}\n`;

  if (housingType === 'owned') {
    if (kbPrice !== undefined) {
      info += `  - KB시세: ${Math.round(kbPrice).toLocaleString()}원\n`;
    }
    if (hasMortgage && mortgageAmount !== undefined) {
      info += `  - 근저당권: ${Math.round(mortgageAmount).toLocaleString()}원\n`;
    }
  } else if (housingType === 'jeonse' || housingType === 'monthly') {
    if (depositAmount !== undefined) {
      info += `  - 보증금: ${Math.round(depositAmount).toLocaleString()}원\n`;
    }
  } else if (housingType === 'free') {
    if (isSpouseHousing !== undefined) {
      info += `  - 배우자 명의 주택: ${isSpouseHousing ? '예' : '아니오'}\n`;
    }
  }

  return info;
}

/**
 * 부양가족 정보를 생성합니다.
 */
function generateDependentInfo(params: {
  dependents: number;
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number;
  hasNoSpouseIncome?: boolean | null;
}): string {
  const { dependents, maritalStatus, childrenCount, hasNoSpouseIncome } = params;

  let info = `• 부양가족수: ${dependents}명\n`;

  if (maritalStatus) {
    info += `  - 결혼 상태: ${MARITAL_STATUS_LABELS[maritalStatus]}\n`;
  }

  if (childrenCount !== undefined) {
    info += `  - 자녀수: ${childrenCount}명\n`;
  }

  if (maritalStatus === 'married' && hasNoSpouseIncome !== undefined) {
    info += `  - 배우자 소득: ${hasNoSpouseIncome ? '없음' : '있음'}\n`;
  }

  return info;
}

/**
 * 계산 결과 섹션을 생성합니다.
 */
function generateCalculationResult(formData: FormData, result: CalculationResult): string {
  let info = "\n[계산 결과]\n";

  if (result.monthlyPayment <= 0) {
    info += "개인회생 신청 불가 (가용소득 부족)\n";
    info += `• 월 변제 가능액: ${Math.round(result.monthlyPayment).toLocaleString()}원`;
  } else if (result.liquidationValueViolation) {
    info += "개인회생 신청 불가 (청산가치 위반)\n";
    info += `• 청산가치: ${Math.round(formData.assetValue).toLocaleString()}원\n`;
    info += `• 월 변제 가능액: ${Math.round(result.monthlyPayment).toLocaleString()}원`;
  } else {
    info += `• 예상 변제액: ${Math.round(result.repaymentAmount).toLocaleString()}원\n`;
    info += `• 월 상환액: ${Math.round(result.monthlyPayment).toLocaleString()}원\n`;
    info += `• 변제 기간: ${result.repaymentPeriod}개월\n`;
    info += `• 예상 탕감률: ${Math.round(result.reductionRate)}%\n`;
    info += `• 예상 탕감액: ${Math.round(result.reductionAmount).toLocaleString()}원`;
  }

  return info;
}

/**
 * 신청자 정보 섹션을 생성합니다.
 */
function generateApplicantInfo(name: string, phone: string): string {
  let info = "\n\n[신청자 정보]\n";
  info += `• 이름: ${name}\n`;
  info += `• 연락처: ${phone}`;
  return info;
}
