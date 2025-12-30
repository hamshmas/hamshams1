/**
 * 숫자를 천 단위 콤마가 포함된 문자열로 변환
 * @param value - 변환할 숫자 또는 문자열
 * @returns 콤마가 포함된 문자열
 */
export function formatNumberWithCommas(value: string | number): string {
  if (!value && value !== 0) return '';

  // 숫자만 추출
  const numericValue = String(value).replace(/[^\d]/g, '');

  if (numericValue === '') return '';

  // 천 단위 콤마 추가
  return Number(numericValue).toLocaleString('ko-KR');
}

/**
 * 콤마가 포함된 문자열에서 숫자를 추출
 * @param value - 콤마가 포함된 문자열
 * @returns 순수 숫자
 */
export function parseNumberFromFormatted(value: string): number {
  if (!value) return 0;

  // 모든 콤마 제거 후 숫자로 변환
  const numericValue = value.replace(/,/g, '');
  return Number(numericValue) || 0;
}

/**
 * 입력 이벤트 처리 및 포맷팅
 * @param value - 입력된 값
 * @returns 포맷된 문자열
 */
export function handleNumberInput(value: string): string {
  // 숫자가 아닌 문자 제거 (콤마 포함)
  const numericOnly = value.replace(/[^\d]/g, '');

  // 빈 문자열인 경우 그대로 반환
  if (numericOnly === '') return '';

  // 천 단위 콤마 추가하여 반환
  return formatNumberWithCommas(numericOnly);
}

/**
 * 만원 단위 숫자를 원 단위로 변환
 * @param manwon - 만원 단위 숫자
 * @returns 원 단위 숫자
 */
export function convertManwonToWon(manwon: number): number {
  return manwon * 10000;
}

/**
 * 원 단위 숫자를 만원 단위로 변환
 * @param won - 원 단위 숫자
 * @returns 만원 단위 숫자
 */
export function convertWonToManwon(won: number): number {
  return won / 10000;
}

/**
 * 숫자를 한글 금액으로 변환 (예: 100000000 → "1억원", 50000000 → "5000만원")
 * @param value - 변환할 숫자
 * @returns 한글 금액 문자열
 */
export function formatKoreanCurrency(value: number): string {
  if (!value || value === 0) return '';

  const eok = Math.floor(value / 100000000); // 억 단위
  const man = Math.floor((value % 100000000) / 10000); // 만 단위

  let result = '';

  if (eok > 0) {
    result += `${eok}억 `;
  }

  if (man > 0) {
    result += `${man}만 `;
  }

  // 만원 미만만 있는 경우
  if (eok === 0 && man === 0) {
    return `${value}원`;
  }

  return result.trim() + '원';
}
