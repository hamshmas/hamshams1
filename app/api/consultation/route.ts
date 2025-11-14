/**
 * 상담 신청 API
 * POST /api/consultation - 상담 신청 로그 기록
 */

import { NextRequest, NextResponse } from 'next/server';

// Consultation types
interface CreateConsultationRequest {
  applicant: {
    name: string;
    phone: string;
    email?: string;
    privacyConsent: boolean;
  };
  formData: any;
  result: any;
}

interface CreateConsultationResponse {
  success: boolean;
  consultationId?: string;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateConsultationRequest = await request.json();

    // 필수 필드 검증
    if (!body.applicant || !body.formData || !body.result) {
      return NextResponse.json<CreateConsultationResponse>(
        { success: false, error: '필수 입력값이 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이름과 전화번호 검증
    if (!body.applicant.name || !body.applicant.phone) {
      return NextResponse.json<CreateConsultationResponse>(
        { success: false, error: '이름과 전화번호는 필수입니다.' },
        { status: 400 }
      );
    }

    // 개인정보 동의 확인
    if (!body.applicant.privacyConsent) {
      return NextResponse.json<CreateConsultationResponse>(
        { success: false, error: '개인정보 수집 동의가 필요합니다.' },
        { status: 400 }
      );
    }

    // 콘솔에 로그 기록 (개발용)
    console.log('[Consultation] New consultation request:', {
      name: body.applicant.name,
      phone: body.applicant.phone,
      email: body.applicant.email,
      totalDebt: body.formData.totalDebt,
      monthlyIncome: body.formData.monthlyIncome,
      reductionRate: body.result.reductionRate,
      timestamp: new Date().toISOString(),
    });

    // 성공 응답
    return NextResponse.json<CreateConsultationResponse>(
      {
        success: true,
        consultationId: `local-${Date.now()}`,
        message: '상담 신청이 접수되었습니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Consultation] Error processing consultation:', error);

    return NextResponse.json<CreateConsultationResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      { status: 500 }
    );
  }
}
