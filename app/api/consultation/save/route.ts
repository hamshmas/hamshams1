import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/app/config/supabase';

// Google Chat으로 알림 전송
async function sendGoogleChatNotification(data: {
  name: string;
  phone: string;
  formData: {
    totalDebt: number;
    monthlyIncome: number;
    assetValue: number;
    dependents: number;
    homeAddress?: string;
    workAddress?: string;
  };
  calculationResult: {
    reductionRate: number;
    reductionAmount: number;
    repaymentAmount: number;
    monthlyPayment: number;
  };
}) {
  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;

  console.log('[GoogleChat] Attempting to send notification...');
  console.log('[GoogleChat] Webhook URL exists:', !!webhookUrl);

  if (!webhookUrl) {
    console.log('[GoogleChat] Webhook URL not configured, skipping notification');
    return;
  }

  try {
    const message = {
      cards: [{
        header: {
          title: "🔔 새 상담 신청",
          subtitle: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        },
        sections: [{
          widgets: [
            { keyValue: { topLabel: "이름", content: data.name } },
            { keyValue: { topLabel: "연락처", content: data.phone } },
            { keyValue: { topLabel: "채무액", content: `${(data.formData.totalDebt / 10000).toLocaleString()}만원` } },
            { keyValue: { topLabel: "월소득", content: `${(data.formData.monthlyIncome / 10000).toLocaleString()}만원` } },
            { keyValue: { topLabel: "예상 탕감률", content: `${data.calculationResult.reductionRate.toFixed(1)}%` } },
            { keyValue: { topLabel: "예상 탕감액", content: `${(data.calculationResult.reductionAmount / 10000).toLocaleString()}만원` } },
            { keyValue: { topLabel: "주소", content: data.formData.homeAddress || '-' } },
          ]
        }]
      }]
    };

    console.log('[GoogleChat] Sending message to webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    const responseText = await response.text();
    console.log('[GoogleChat] Response status:', response.status);
    console.log('[GoogleChat] Response body:', responseText);

    if (!response.ok) {
      console.error('[GoogleChat] Failed to send notification:', response.status, responseText);
    } else {
      console.log('[GoogleChat] Notification sent successfully');
    }
  } catch (error) {
    console.error('[GoogleChat] Error sending notification:', error);
  }
}

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

    // Google Chat으로 알림 전송
    console.log('[Consultation] DB saved, now sending Google Chat notification...');
    await sendGoogleChatNotification({ name, phone, formData, calculationResult });
    console.log('[Consultation] Google Chat notification process completed');

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
