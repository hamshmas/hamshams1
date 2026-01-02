import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/app/config/supabase';

// 최대 탕감률 상한 (법정 한도)
const MAX_REDUCTION_RATE = 96.9;

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        userCount: 1300,
        dailyMaxRate: 85, // 기본값
      });
    }

    // 총 사용자 수 조회 (시작하기 버튼 클릭 수)
    const { count, error: countError } = await supabaseAdmin
      .from('user_visits')
      .select('*', { count: 'exact', head: true });

    const userCount = (!countError && count !== null) ? count + 1300 : 1300;

    // 24시간 내 최고 탕감율 조회
    const now = new Date();
    const twentyFourHoursAgo = new Date(now);
    twentyFourHoursAgo.setHours(now.getHours() - 24);

    let dailyMaxRate = null;

    // 24시간 내 데이터 조회
    const { data: dailyData } = await supabaseAdmin
      .from('calculation_results')
      .select('reduction_rate')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('reduction_rate', { ascending: false })
      .limit(1);

    if (dailyData && dailyData.length > 0) {
      // 최대 탕감률 상한 적용
      dailyMaxRate = Math.min(Math.round(dailyData[0].reduction_rate), MAX_REDUCTION_RATE);
    } else {
      // 24시간 내 데이터가 없으면 최근 7일 데이터 조회
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const { data: recentData } = await supabaseAdmin
        .from('calculation_results')
        .select('reduction_rate')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('reduction_rate', { ascending: false })
        .limit(1);

      if (recentData && recentData.length > 0) {
        // 최대 탕감률 상한 적용
        dailyMaxRate = Math.min(Math.round(recentData[0].reduction_rate), MAX_REDUCTION_RATE);
      }
    }

    return NextResponse.json({
      userCount,
      dailyMaxRate,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      userCount: 1300,
      dailyMaxRate: 85, // 에러 시 기본값
    });
  }
}
