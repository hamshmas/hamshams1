import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 환경 변수 검증 (유효한 URL과 키가 있는지 확인)
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

const isValidKey = (key: string) => {
  // Supabase anon key는 최소 20자 이상의 문자열
  return key.length > 20 && !key.startsWith('http');
};

const hasValidConfig = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

// Supabase 클라이언트 생성 (환경 변수가 유효한 경우에만)
export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // 환경 변수가 없거나 유효하지 않으면 null 반환
