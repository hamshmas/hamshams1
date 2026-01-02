/**
 * 개인회생 탕감률 계산 API
 * Copyright (c) 2025. All rights reserved.
 * 무단 복제 및 재배포를 금지합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePresentValue, findMinimumRepaymentPeriod } from '@/utils/leibnizCalculation';
import { supabaseAdmin, isSupabaseConfigured } from '@/app/config/supabase';

// 개인회생 최대 탕감률 (법정 한도)
const MAX_REDUCTION_RATE = 96.9;

// 최소 변제액 계산 함수 (법정 최소 변제 기준)
// 채무 5000만원 이하: 채무액의 5%
// 채무 5000만원 초과: 채무액의 3% + 100만원
function calculateMinimumRepayment(totalDebt: number): number {
  const threshold = 50000000; // 5000만원
  if (totalDebt <= threshold) {
    return totalDebt * 0.05; // 5%
  } else {
    return totalDebt * 0.03 + 1000000; // 3% + 100만원
  }
}

// 최저생계비 데이터 (서버에서만 관리)
const minimumLivingCostData: Record<string, number> = {
  "0": 1538543,
  "1": 2519575,
  "2": 3215422,
  "3": 3874727,
  "4": 4534031
};

// 최저생계비 계산 함수
function calculateMinimumLivingCost(dependents: number): number {
  const householdIndex = dependents - 1;
  const clampedDependents = Math.max(0, Math.min(householdIndex, 4));
  const floorDependents = Math.floor(clampedDependents);
  const ceilDependents = Math.ceil(clampedDependents);
  const fraction = clampedDependents - floorDependents;

  const floorCost = minimumLivingCostData[String(floorDependents)] || 0;
  const ceilCost = minimumLivingCostData[String(ceilDependents)] || floorCost;
  return floorCost * (1 - fraction) + ceilCost * fraction;
}

// 부양가족 수 조정으로 개인회생 가능 여부 체크
function checkDependentAdjustment(
  currentDependents: number,
  monthlyIncome: number,
  liquidationValue: number,
  totalDebt: number,
  minimumLivingCostFloor: number = 600000
): { canAdjust: boolean; suggestedDependents: number | null; reason: string | null } {
  // 부양가족이 1명 이하면 조정 불가
  if (currentDependents <= 1) {
    return { canAdjust: false, suggestedDependents: null, reason: null };
  }

  // 부양가족 수를 0.1명씩 줄여가며 체크
  for (let testDependents = currentDependents - 0.1; testDependents >= 1; testDependents -= 0.1) {
    // 소수점 오차 보정
    testDependents = Math.round(testDependents * 10) / 10;

    const testLivingCost = calculateMinimumLivingCost(testDependents);

    // 생계비가 60만원 미만이면 더 이상 불가
    if (testLivingCost < minimumLivingCostFloor) {
      break;
    }

    const testMonthlyRepayment = Math.max(monthlyIncome - testLivingCost, 0);

    // 월 변제액이 0이면 불가
    if (testMonthlyRepayment <= 0) {
      continue;
    }

    const testPeriod = findMinimumRepaymentPeriod(testMonthlyRepayment, liquidationValue, totalDebt);

    // 변제 기간을 찾으면 가능
    if (testPeriod !== null) {
      const currentLivingCost = calculateMinimumLivingCost(currentDependents);
      return {
        canAdjust: true,
        suggestedDependents: testDependents,
        reason: `부양가족 수를 ${currentDependents}명에서 ${testDependents}명으로 조정하면 (생계비: ${Math.round(currentLivingCost).toLocaleString()}원 → ${Math.round(testLivingCost).toLocaleString()}원, 월 변제액: ${Math.round(testMonthlyRepayment).toLocaleString()}원) 개인회생이 가능합니다.`
      };
    }
  }

  return { canAdjust: false, suggestedDependents: null, reason: null };
}

// Supabase에 계산 결과 저장
async function saveCalculationResult(
  request: NextRequest,
  formData: {
    totalDebt: number;
    monthlyIncome: number;
    assetValue: number;
    dependents: number;
    homeAddress?: string;
    workAddress?: string;
    courtJurisdiction?: string;
    priorityRepaymentRegion?: string;
  },
  result: {
    reductionRate: number;
    reductionAmount: number;
    repaymentAmount: number;
    monthlyPayment: number;
    repaymentPeriod: number;
    needsConsultation?: boolean;
    liquidationValueViolation?: boolean;
    consultationReason?: string;
  }
) {
  console.log('[SaveResult] Starting save, isSupabaseConfigured:', isSupabaseConfigured());

  if (!isSupabaseConfigured()) {
    console.log('[SaveResult] Supabase not configured, skipping save');
    return;
  }

  try {
    // IP 주소 가져오기
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    console.log('[SaveResult] Inserting data for IP:', ipAddress);

    const insertData = {
      ip_address: ipAddress,
      total_debt: Math.round(formData.totalDebt || 0),
      monthly_income: Math.round(formData.monthlyIncome || 0),
      asset_value: Math.round(formData.assetValue || 0),
      dependents: Math.round(formData.dependents || 1),
      home_address: formData.homeAddress || null,
      work_address: formData.workAddress || null,
      court_jurisdiction: formData.courtJurisdiction || null,
      priority_repayment_region: formData.priorityRepaymentRegion || null,
      reduction_rate: Math.round(result.reductionRate * 100) / 100, // 소수점 2자리
      reduction_amount: Math.round(result.reductionAmount || 0),
      repayment_amount: Math.round(result.repaymentAmount || 0),
      monthly_payment: Math.round(result.monthlyPayment || 0),
      repayment_period: Math.round(result.repaymentPeriod || 36),
      needs_consultation: result.needsConsultation || false,
      liquidation_value_violation: result.liquidationValueViolation || false,
      consultation_reason: result.consultationReason || null,
    };

    console.log('[SaveResult] Insert data:', JSON.stringify(insertData));

    const { data, error } = await supabaseAdmin.from('calculation_results').insert(insertData).select();

    if (error) {
      console.error('[SaveResult] Supabase insert error:', error);
    } else {
      console.log('[SaveResult] Successfully saved:', data);
    }
  } catch (error) {
    console.error('[SaveResult] Exception:', error);
  }
}

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

    // 최저생계비 계산
    const minimumLivingCost = calculateMinimumLivingCost(dependents);
    const monthlyRepayment = Math.max(monthlyIncome - minimumLivingCost, 0);
    const liquidationValue = assetValue;
    const repaymentPeriod = findMinimumRepaymentPeriod(monthlyRepayment, liquidationValue, totalDebt);
    const MINIMUM_LIVING_COST = 600000; // 최저 생계비 하한선

    if (repaymentPeriod === null) {
      // 청산가치 위반 - 조정 가능성 체크
      const pv60 = calculatePresentValue(monthlyRepayment, 60);
      const pvGap = liquidationValue - pv60;
      const pvRatio = pv60 / liquidationValue;

      let needsConsultation = false;
      let consultationReason = '';
      let canBeAdjusted = false; // 조정 가능 여부 (초록불)
      let adjustedMonthlyPayment = monthlyRepayment; // 조정된 월 변제액
      let adjustedLiquidationValue = liquidationValue; // 조정된 청산가치

      // 1. 부양가족 수 조정으로 가능 여부 체크 (최우선)
      const dependentAdjustment = checkDependentAdjustment(
        dependents,
        monthlyIncome,
        liquidationValue,
        totalDebt,
        MINIMUM_LIVING_COST
      );

      if (dependentAdjustment.canAdjust && dependentAdjustment.suggestedDependents) {
        needsConsultation = true;
        canBeAdjusted = true;
        // 조정된 부양가족 수로 다시 계산
        const adjustedLivingCost = calculateMinimumLivingCost(dependentAdjustment.suggestedDependents);
        adjustedMonthlyPayment = Math.max(monthlyIncome - adjustedLivingCost, 0);
        consultationReason = dependentAdjustment.reason!;
      }
      // 2. 60개월 PV가 청산가치의 85% 이상인 경우 (생계비 조정으로 가능)
      else if (pvRatio >= 0.85 && pvRatio < 1.0) {
        const requiredIncrease = Math.ceil(pvGap / 60); // 월 필요 증가액
        const adjustedLivingCost = minimumLivingCost - requiredIncrease;

        // 생계비가 60만원 이상 유지되는지 확인
        if (adjustedLivingCost >= MINIMUM_LIVING_COST) {
          needsConsultation = true;
          canBeAdjusted = true;
          adjustedMonthlyPayment = monthlyIncome - adjustedLivingCost;
          consultationReason = `현재 보장된 생계비는 ${Math.round(minimumLivingCost).toLocaleString()}원인데, 약 ${Math.round(adjustedLivingCost).toLocaleString()}원으로 줄이면 (월 변제액: ${Math.round(adjustedMonthlyPayment).toLocaleString()}원) 개인회생이 가능합니다.`;
        }
      }
      // 3. 청산가치가 60개월 PV의 115% 이하인 경우 (자산 조정으로 가능)
      else if (liquidationValue <= pv60 * 1.15 && pv60 > 0) {
        needsConsultation = true;
        canBeAdjusted = true;
        const requiredDecrease = Math.ceil(pvGap);
        adjustedLiquidationValue = liquidationValue - requiredDecrease;
        consultationReason = `자산 가액을 약 ${requiredDecrease.toLocaleString()}원 줄이면 개인회생이 가능합니다.`;
      }
      // 4. 가용소득이 없는 경우 - 생계비 조정 가능성 안내
      else if (monthlyRepayment <= 0) {
        const requiredIncome = Math.ceil(liquidationValue / 60 / 0.84); // 60개월 기준 필요 월 납입액
        const adjustedLivingCost = monthlyIncome - requiredIncome;

        // 생계비가 60만원 이상 유지되는지 확인
        if (adjustedLivingCost >= MINIMUM_LIVING_COST) {
          needsConsultation = true;
          canBeAdjusted = true;
          adjustedMonthlyPayment = requiredIncome;
          consultationReason = `현재 보장된 생계비는 ${Math.round(minimumLivingCost).toLocaleString()}원인데, 약 ${Math.round(adjustedLivingCost).toLocaleString()}원으로 줄이면 (월 변제액: ${Math.round(requiredIncome).toLocaleString()}원) 개인회생이 가능합니다.`;
        }
      }

      // 조정 가능하면 초록불로 탕감률 계산
      if (canBeAdjusted) {
        const adjustedRepaymentPeriod = findMinimumRepaymentPeriod(adjustedMonthlyPayment, adjustedLiquidationValue, totalDebt);

        if (adjustedRepaymentPeriod !== null) {
          // 조정 후 실제 탕감률 계산
          const totalRepaymentPV = calculatePresentValue(adjustedMonthlyPayment, adjustedRepaymentPeriod);
          let repaymentAmount = Math.min(Math.max(totalRepaymentPV, adjustedLiquidationValue), totalDebt);

          // 최소 변제액 조건 적용
          const minimumRepayment = calculateMinimumRepayment(totalDebt);
          if (repaymentAmount < minimumRepayment) {
            repaymentAmount = minimumRepayment;
          }

          const reductionAmount = totalDebt - repaymentAmount;
          const reductionRate = totalDebt > 0 ? (reductionAmount / totalDebt) * 100 : 0;

          // 최대 탕감률 제한 적용
          const cappedReductionRate = Math.min(reductionRate, MAX_REDUCTION_RATE);
          const cappedReductionAmount = totalDebt * (cappedReductionRate / 100);
          const cappedRepaymentAmount = totalDebt - cappedReductionAmount;

          const resultData = {
            reductionRate: Math.max(0, cappedReductionRate),
            repaymentAmount: Math.max(0, cappedRepaymentAmount),
            reductionAmount: Math.max(0, cappedReductionAmount),
            monthlyPayment: adjustedMonthlyPayment,
            repaymentPeriod: adjustedRepaymentPeriod,
            liquidationValueViolation: false,
            needsConsultation: true,
            consultationReason,
          };

          // Supabase에 저장
          await saveCalculationResult(request, body, resultData);

          return NextResponse.json(resultData);
        }
      }

      // 조정 불가능하면 빨간불
      const redResultData = {
        reductionRate: 0,
        repaymentAmount: 0,
        reductionAmount: 0,
        monthlyPayment: monthlyRepayment,
        repaymentPeriod: 60,
        liquidationValueViolation: true,
        needsConsultation,
        consultationReason: consultationReason || undefined,
      };

      // Supabase에 저장
      await saveCalculationResult(request, body, redResultData);

      return NextResponse.json(redResultData);
    }

    const totalRepaymentPV = calculatePresentValue(monthlyRepayment, repaymentPeriod);
    let repaymentAmount = Math.min(Math.max(totalRepaymentPV, liquidationValue), totalDebt);

    // 최소 변제액 조건 적용
    const minimumRepayment = calculateMinimumRepayment(totalDebt);
    if (repaymentAmount < minimumRepayment) {
      repaymentAmount = minimumRepayment;
    }

    const reductionAmount = totalDebt - repaymentAmount;
    const reductionRate = totalDebt > 0 ? (reductionAmount / totalDebt) * 100 : 0;

    // 최대 탕감률 제한 적용
    const cappedReductionRate = Math.min(reductionRate, MAX_REDUCTION_RATE);
    const cappedReductionAmount = totalDebt * (cappedReductionRate / 100);
    const cappedRepaymentAmount = totalDebt - cappedReductionAmount;

    const successResultData = {
      reductionRate: Math.max(0, cappedReductionRate),
      repaymentAmount: Math.max(0, cappedRepaymentAmount),
      reductionAmount: Math.max(0, cappedReductionAmount),
      monthlyPayment: monthlyRepayment,
      repaymentPeriod,
      liquidationValueViolation: false,
      needsConsultation: false,
    };

    // Supabase에 저장
    await saveCalculationResult(request, body, successResultData);

    return NextResponse.json(successResultData);
  } catch (error) {
    console.error('계산 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
