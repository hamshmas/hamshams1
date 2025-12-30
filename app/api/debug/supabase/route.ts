import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/app/config/supabase';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // 환경 변수 확인 (값은 마스킹)
  diagnostics.envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...`
      : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
      : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`
      : 'NOT SET',
  };

  diagnostics.isConfigured = isSupabaseConfigured();

  // Supabase 연결 테스트
  if (isSupabaseConfigured()) {
    try {
      // calculation_results 테이블 테스트
      const { count: calcCount, error: calcError } = await supabaseAdmin
        .from('calculation_results')
        .select('*', { count: 'exact', head: true });

      diagnostics.calculationResults = {
        success: !calcError,
        count: calcCount,
        error: calcError ? calcError.message : null,
      };

      // 최근 데이터 확인
      const { data: recentCalc, error: recentCalcError } = await supabaseAdmin
        .from('calculation_results')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      diagnostics.lastCalculation = {
        success: !recentCalcError,
        lastDate: recentCalc?.[0]?.created_at || null,
        error: recentCalcError ? recentCalcError.message : null,
      };

      // consultation_requests 테이블 테스트
      const { count: consultCount, error: consultError } = await supabaseAdmin
        .from('consultation_requests')
        .select('*', { count: 'exact', head: true });

      diagnostics.consultationRequests = {
        success: !consultError,
        count: consultCount,
        error: consultError ? consultError.message : null,
      };

      // 최근 상담 데이터 확인
      const { data: recentConsult, error: recentConsultError } = await supabaseAdmin
        .from('consultation_requests')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      diagnostics.lastConsultation = {
        success: !recentConsultError,
        lastDate: recentConsult?.[0]?.created_at || null,
        error: recentConsultError ? recentConsultError.message : null,
      };

      // INSERT 테스트 (테스트 데이터 삽입 후 삭제)
      const testData = {
        ip_address: '0.0.0.0',
        total_debt: 0,
        monthly_income: 0,
        asset_value: 0,
        dependents: 1,
        home_address: 'TEST',
        work_address: 'TEST',
        court_jurisdiction: 'other',
        reduction_rate: 0,
        reduction_amount: 0,
        repayment_amount: 0,
        monthly_payment: 0,
        repayment_period: 36,
        created_at: new Date().toISOString(),
      };

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('calculation_results')
        .insert([testData])
        .select('id');

      if (!insertError && insertData?.[0]?.id) {
        // 테스트 데이터 삭제
        await supabaseAdmin
          .from('calculation_results')
          .delete()
          .eq('id', insertData[0].id);

        diagnostics.insertTest = {
          success: true,
          message: 'INSERT 테스트 성공',
        };
      } else {
        diagnostics.insertTest = {
          success: false,
          error: insertError?.message || 'Unknown error',
          code: insertError?.code,
          details: insertError?.details,
        };
      }

    } catch (error) {
      diagnostics.connectionError = error instanceof Error ? error.message : 'Unknown error';
    }
  } else {
    diagnostics.connectionError = 'Supabase not configured';
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
