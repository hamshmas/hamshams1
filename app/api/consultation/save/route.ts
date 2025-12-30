import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/app/config/supabase';

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 확인
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured - skipping save');
      return NextResponse.json({
        success: true,
        message: '상담 신청이 접수되었습니다. (데이터 저장 비활성화)',
      });
    }

    const { name, phone, formData, calculationResult } = await request.json();

    // 입력 검증
    if (!name || !phone) {
      return NextResponse.json(
        { error: '이름과 전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!formData || !calculationResult) {
      return NextResponse.json(
        { error: '계산 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Supabase에 저장
    const { error: dbError } = await supabaseAdmin
      .from('consultation_requests')
      .insert({
        name,
        phone,
        form_data: formData,
        calculation_result: calculationResult,
        verified: false, // SMS 인증 없이 저장
      });

    if (dbError) {
      console.error('DB 저장 오류:', dbError);
      return NextResponse.json(
        { error: '데이터 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '상담 신청이 성공적으로 접수되었습니다.',
    });

  } catch (error) {
    console.error('상담 신청 저장 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
