import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/app/config/supabase';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        userCount: 1300,
        weeklyMaxRate: null,
      });
    }

    // 총 사용자 수 조회
    const { count, error: countError } = await supabaseAdmin
      .from('calculation_results')
      .select('*', { count: 'exact', head: true });

    const userCount = (!countError && count !== null) ? count + 1300 : 1300;

    // 이번주 최고 탕감율 조회
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: maxRateData, error: rateError } = await supabaseAdmin
      .from('calculation_results')
      .select('reduction_rate')
      .gte('created_at', startOfWeek.toISOString())
      .order('reduction_rate', { ascending: false })
      .limit(1);

    let weeklyMaxRate = null;
    if (!rateError && maxRateData && maxRateData.length > 0) {
      weeklyMaxRate = Math.round(maxRateData[0].reduction_rate);
    }

    return NextResponse.json({
      userCount,
      weeklyMaxRate,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      userCount: 1300,
      weeklyMaxRate: null,
    });
  }
}
