/**
 * 상담 신청 API
 * POST /api/consultation - 새 상담 신청 저장
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type {
  CreateConsultationRequest,
  CreateConsultationResponse,
  ConsultationData,
  CalculationInput,
  AssetDetails,
  DependentDetails,
  ConsultationMetadata,
} from '@/app/types/consultation';

/**
 * 객체에서 undefined 값을 재귀적으로 제거하는 함수
 */
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item)).filter(item => item !== undefined);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = removeUndefined(obj[key]);
        if (value !== undefined) {
          result[key] = value;
        }
      }
    }
    return result;
  }

  return obj;
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

    // 계산 입력 데이터 구성
    const calculationInput: CalculationInput = {
      totalDebt: body.formData.totalDebt,
      monthlyIncome: body.formData.monthlyIncome,
      assetValue: body.formData.assetValue,
      dependents: body.formData.dependents,
      homeAddress: body.formData.homeAddress,
      workAddress: body.formData.workAddress,
      courtJurisdiction: body.formData.courtJurisdiction,
      priorityRepaymentRegion: body.formData.priorityRepaymentRegion,
    };

    // 자산 상세 정보 구성
    const assetDetails: AssetDetails | undefined = body.housingType
      ? {
          housingType: body.housingType,
          kbPrice: body.kbPrice,
          mortgageAmount: body.mortgageAmount,
          depositAmount: body.depositAmount,
          hasMortgage: body.hasMortgage ?? undefined,
          isSpouseHousing: body.isSpouseHousing ?? undefined,
        }
      : undefined;

    // 부양가족 상세 정보 구성
    const dependentDetails: DependentDetails | undefined = body.maritalStatus
      ? {
          maritalStatus: body.maritalStatus,
          childrenCount: body.childrenCount,
          hasNoSpouseIncome: body.hasNoSpouseIncome ?? undefined,
        }
      : undefined;

    // 메타데이터 구성
    const now = new Date();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

    const metadata: ConsultationMetadata = {
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      source: isMobile ? 'mobile' : 'web',
      userAgent,
    };

    // Firestore에 저장할 데이터 구성 (id 제외)
    const consultationDataWithoutId: Record<string, any> = {
      applicant: body.applicant,
      input: calculationInput,
      result: body.result,
      metadata,
      notes: [],
    };

    // assetDetails가 있으면 추가
    if (assetDetails) {
      consultationDataWithoutId.assetDetails = assetDetails;
    }

    // dependentDetails가 있으면 추가
    if (dependentDetails) {
      consultationDataWithoutId.dependentDetails = dependentDetails;
    }

    // undefined 값을 재귀적으로 제거
    const cleanedData = removeUndefined(consultationDataWithoutId);

    // Firestore에 문서 추가
    const docRef = await adminDb.collection('consultations').add(cleanedData);

    console.log('[Consultation] New consultation created:', {
      id: docRef.id,
      name: body.applicant.name,
      phone: body.applicant.phone,
      status: metadata.status,
    });

    return NextResponse.json<CreateConsultationResponse>(
      {
        success: true,
        consultationId: docRef.id,
        message: '상담 신청이 접수되었습니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Consultation] Error creating consultation:', error);

    // Firebase 관련 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
        return NextResponse.json<CreateConsultationResponse>(
          {
            success: false,
            error: 'Firebase 설정이 완료되지 않았습니다. 관리자에게 문의하세요.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json<CreateConsultationResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      { status: 500 }
    );
  }
}
