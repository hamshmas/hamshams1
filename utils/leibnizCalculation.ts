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
 * 변제기간 계산
 * 원칙: 36개월
 * 단축: 36개월 이전 총 부채액 전액 변제 시
 * 연장: 청산가치 충족 못하면 최대 60개월까지
 *
 * @param monthlyPayment - 월 변제액 (원)
 * @param liquidationValue - 청산가치 (원)
 * @param totalDebt - 총 부채액 (원)
 * @returns 변제기간 또는 null (불가능한 경우)
 */
export function findMinimumRepaymentPeriod(
  monthlyPayment: number,
  liquidationValue: number,
  totalDebt: number
): number | null {
  // 월 변제액이 0이거나 음수면 불가능
  if (monthlyPayment <= 0) {
    return null;
  }

  // 청산가치가 총 부채액보다 크면 불가능
  if (liquidationValue > totalDebt) {
    return null;
  }

  // 청산가치가 0이거나 음수면 36개월 기본 반환
  if (liquidationValue <= 0) {
    // 36개월 이전에 전액 변제 가능한지 확인
    for (let months = 1; months < 36; months++) {
      const pv = calculatePresentValue(monthlyPayment, months);
      if (pv >= totalDebt) {
        return months; // 단축
      }
    }
    return 36; // 기본 기간
  }

  // 1단계: 36개월 이전에 총 부채액 전액 변제 가능한지 확인 (단축)
  for (let months = 1; months < 36; months++) {
    const pv = calculatePresentValue(monthlyPayment, months);

    if (pv >= totalDebt) {
      // 전액 변제 가능 시점 발견
      // 청산가치도 충족하는지 확인
      if (pv >= liquidationValue) {
        return months; // 단축 가능
      }
      // 전액 변제는 되지만 청산가치 미충족 -> 불가능 (모순)
      return null;
    }
  }

  // 2단계: 36개월 시점 확인 (원칙)
  const pv36 = calculatePresentValue(monthlyPayment, 36);

  if (pv36 >= liquidationValue) {
    // 36개월로 청산가치 충족
    return 36;
  }

  // 3단계: 36~60개월 범위에서 청산가치 충족하는 최소 기간 찾기 (연장)
  for (let months = 37; months <= 60; months++) {
    const pv = calculatePresentValue(monthlyPayment, months);

    if (pv >= liquidationValue) {
      // 청산가치 충족
      if (pv <= totalDebt) {
        return months; // 연장
      }
      // 청산가치 충족했지만 총 부채액 초과 -> 불가능
      return null;
    }
  }

  // 60개월로도 청산가치를 충족하지 못함
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
