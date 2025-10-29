/**
 * 라이프니츠식 현재가치 계산 유틸리티
 * 법정이율 연 5% 적용
 */

// 연 이자율 5%
const ANNUAL_RATE = 0.05;

// 월 이자율 계산: (1 + 연이율)^(1/12) - 1
const MONTHLY_RATE = Math.pow(1 + ANNUAL_RATE, 1 / 12) - 1; // 약 0.407%

/**
 * 라이프니츠식: 매월 변제액의 현재가치 합계 계산
 * PV = Σ(PMT / (1 + r)^t) for t=1 to n
 *
 * @param monthlyPayment - 월 변제액 (원)
 * @param months - 변제 기간 (개월)
 * @returns 현재가치 (원)
 */
export function calculatePresentValue(monthlyPayment: number, months: number): number {
  if (monthlyPayment <= 0 || months <= 0) return 0;

  let presentValue = 0;

  for (let t = 1; t <= months; t++) {
    const discountFactor = Math.pow(1 + MONTHLY_RATE, t);
    presentValue += monthlyPayment / discountFactor;
  }

  return presentValue;
}

/**
 * 청산가치를 충족하는 최소 변제기간 계산
 *
 * @param monthlyPayment - 월 변제액 (원)
 * @param liquidationValue - 청산가치 (원)
 * @param minMonths - 최소 개월 (기본 36)
 * @param maxMonths - 최대 개월 (기본 60)
 * @returns 최소 변제기간 또는 null (불가능한 경우)
 */
export function findMinimumRepaymentPeriod(
  monthlyPayment: number,
  liquidationValue: number,
  minMonths: number = 36,
  maxMonths: number = 60
): number | null {
  // 월 변제액이 0이거나 음수면 불가능
  if (monthlyPayment <= 0) {
    return maxMonths;
  }

  // 청산가치가 0이거나 음수면 최소 기간 반환
  if (liquidationValue <= 0) {
    return minMonths;
  }

  // minMonths부터 maxMonths까지 1개월씩 증가하며 확인
  for (let months = minMonths; months <= maxMonths; months++) {
    const pv = calculatePresentValue(monthlyPayment, months);

    if (pv >= liquidationValue) {
      return months;
    }
  }

  // maxMonths로도 충족 불가능
  return null;
}

/**
 * 월 이자율 getter
 */
export function getMonthlyRate(): number {
  return MONTHLY_RATE;
}

/**
 * 연 이자율 getter
 */
export function getAnnualRate(): number {
  return ANNUAL_RATE;
}
