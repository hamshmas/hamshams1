import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/app/config/supabase';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true });
  }

  try {
    // IP 주소 가져오기
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    // user_visits 테이블에 기록
    await supabaseAdmin.from('user_visits').insert({
      ip_address: ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track start error:', error);
    return NextResponse.json({ success: false });
  }
}
