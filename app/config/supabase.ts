import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// 클라이언트용 (브라우저)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버용 (API routes) - RLS 우회 가능
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 환경 변수 검증 함수
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
}

// 타입 정의
export interface SMSVerification {
  id: string;
  phone: string;
  name: string;
  otp_code: string;
  request_id: string;
  created_at: string;
  expires_at: string;
  verified_at: string | null;
  attempts: number;
}

export interface ConsultationRequest {
  id: string;
  name: string;
  phone: string;
  form_data: any;
  calculation_result: any;
  created_at: string;
  verified: boolean;
}
