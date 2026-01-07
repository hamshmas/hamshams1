/**
 * 상담 관련 설정
 */

/** 카카오톡 상담 채널 기본 URL */
export const KAKAO_BASE_URL = "https://pf.kakao.com/_Exnxnkxj/chat";

/** 기본 유입 경로 메시지 */
export const DEFAULT_REF_MESSAGE = "탕감률계산기 바로상담";

/** @deprecated getKakaoUrlWithRef 사용 권장 */
export const KAKAO_CONSULTATION_URL = `${KAKAO_BASE_URL}?ref=${encodeURIComponent(DEFAULT_REF_MESSAGE)}`;

/**
 * 유입 경로(ref) 파라미터가 포함된 카카오톡 URL 생성
 * ref 파라미터를 추가하면 채팅방 입장 시 해당 텍스트가 자동으로 전송됨
 */
export function getKakaoUrlWithRef(): string {
  return `${KAKAO_BASE_URL}?ref=${encodeURIComponent(DEFAULT_REF_MESSAGE)}`;
}

/** 클립보드 복사 성공 알림 표시 시간 (밀리초) */
export const COPY_SUCCESS_NOTIFICATION_DURATION = 5000;
