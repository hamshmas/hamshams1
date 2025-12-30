import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/app/config/supabase';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        userCount: 1300,
        weeklyMaxRate: 85, // 기본값
      });
    }

    // 총 사용자 수 조회 (시작하기 버튼 클릭 수)
    const { count, error: countError } = await supabaseAdmin
      .from('user_visits')
      .select('*', { count: 'exact', head: true });

    const userCount = (!countError && count !== null) ? count + 1300 : 1300;

    // 이번주 최고 탕감율 조회
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    let weeklyMaxRate = null;

    // 이번주 데이터 조회
    const { data: weeklyData } = await supabaseAdmin
      .from('calculation_results')
      .select('reduction_rate')
      .gte('created_at', startOfWeek.toISOString())
      .order('reduction_rate', { ascending: false })
      .limit(1);

    if (weeklyData && weeklyData.length > 0) {
      weeklyMaxRate = Math.round(weeklyData[0].reduction_rate);
    } else {
      // 이번주 데이터가 없으면 최근 7일 데이터 조회
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const { data: recentData } = await supabaseAdmin
        .from('calculation_results')
        .select('reduction_rate')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('reduction_rate', { ascending: false })
        .limit(1);

      if (recentData && recentData.length > 0) {
        weeklyMaxRate = Math.round(recentData[0].reduction_rate);
      }
    }

    return NextResponse.json({
      userCount,
      weeklyMaxRate,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      userCount: 1300,
      weeklyMaxRate: 85, // 에러 시 기본값
    });
  }
}
