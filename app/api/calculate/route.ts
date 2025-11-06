/**
 * 개인회생 탕감률 계산 API
 * Copyright (c) 2025. All rights reserved.
 * 무단 복제 및 재배포를 금지합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePresentValue, findMinimumRepaymentPeriod } from '@/utils/leibnizCalculation';

// 최저생계비 데이터 (서버에서만 관리)
const minimumLivingCostData: Record<string, number> = {
  "0": 1538543,
  "1": 2519575,
  "2": 3215422,
  "3": 3874727,
  "4": 4534031
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { totalDebt, monthlyIncome, assetValue, dependents } = body;

    // 입력값 검증
    if (typeof totalDebt !== 'number' || typeof monthlyIncome !== 'number' ||
        typeof assetValue !== 'number' || typeof dependents !== 'number') {
      return NextResponse.json(
        { error: '잘못된 입력값입니다.' },
        { status: 400 }
      );
    }

    // 입력값(1~5)을 데이터베이스 인덱스(0~4)로 변환
    const householdIndex = dependents - 1;
    const clampedDependents = Math.max(0, Math.min(householdIndex, 4));
    const floorDependents = Math.floor(clampedDependents);
    const ceilDependents = Math.ceil(clampedDependents);
    const fraction = clampedDependents - floorDependents;

    const floorCost = minimumLivingCostData[String(floorDependents)] || 0;
    const ceilCost = minimumLivingCostData[String(ceilDependents)] || floorCost;
    const minimumLivingCost = floorCost * (1 - fraction) + ceilCost * fraction;

    const monthlyRepayment = Math.max(monthlyIncome - minimumLivingCost, 0);
    const liquidationValue = assetValue;
    const repaymentPeriod = findMinimumRepaymentPeriod(monthlyRepayment, liquidationValue, totalDebt);

    if (repaymentPeriod === null) {
      // 청산가치 위반 - 조정 가능성 체크
      const pv60 = calculatePresentValue(monthlyRepayment, 60);
      const pvGap = liquidationValue - pv60;
      const pvRatio = pv60 / liquidationValue;

      let needsConsultation = false;
      let consultationReason = '';

      // 1. 60개월 PV가 청산가치의 85% 이상인 경우 (생계비 조정으로 가능)
      if (pvRatio >= 0.85 && pvRatio < 1.0) {
        needsConsultation = true;
        const requiredIncrease = Math.ceil(pvGap / 60); // 월 필요 증가액
        consultationReason = `월 생계비를 약 ${requiredIncrease.toLocaleString()}원 줄이면 개인회생이 가능할 수 있습니다.`;
      }
      // 2. 청산가치가 60개월 PV의 115% 이하인 경우 (자산 조정으로 가능)
      else if (liquidationValue <= pv60 * 1.15 && pv60 > 0) {
        needsConsultation = true;
        const requiredDecrease = Math.ceil(pvGap);
        consultationReason = `자산 가액을 약 ${requiredDecrease.toLocaleString()}원 줄이면 개인회생이 가능할 수 있습니다.`;
      }
      // 3. 가용소득이 없는 경우
      else if (monthlyRepayment <= 0) {
        needsConsultation = false;
        consultationReason = '';
      }

      return NextResponse.json({
        reductionRate: 0,
        repaymentAmount: 0,
        reductionAmount: 0,
        monthlyPayment: monthlyRepayment,
        repaymentPeriod: 60,
        liquidationValueViolation: true,
        needsConsultation,
        consultationReason: consultationReason || undefined,
      });
    }

    const totalRepaymentPV = calculatePresentValue(monthlyRepayment, repaymentPeriod);
    const repaymentAmount = Math.min(Math.max(totalRepaymentPV, liquidationValue), totalDebt);
    const reductionAmount = totalDebt - repaymentAmount;
    const reductionRate = totalDebt > 0 ? (reductionAmount / totalDebt) * 100 : 0;

    return NextResponse.json({
      reductionRate: Math.max(0, Math.min(100, reductionRate)),
      repaymentAmount: Math.max(0, repaymentAmount),
      reductionAmount: Math.max(0, reductionAmount),
      monthlyPayment: monthlyRepayment,
      repaymentPeriod,
      liquidationValueViolation: false,
      needsConsultation: false,
    });
  } catch (error) {
    console.error('계산 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
