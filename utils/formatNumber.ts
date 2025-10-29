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
