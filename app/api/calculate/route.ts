/**
 * 개인회생 탕감률 계산 API
 * Copyright (c) 2025. All rights reserved.
 * 무단 복제 및 재배포를 금지합니다.
 */

import { NextRequest, NextResponse } from 'next/server';

// 최저생계비 데이터 (서버에서만 관리)
const minimumLivingCostData: Record<string, number> = {
  "0": 1538543,
  "1": 2519575,
  "2": 3215422,
  "3": 3874727,
  "4": 4534031
};

// 연 이자율 5%
const ANNUAL_RATE = 0.05;

// 월 이자율 계산: (1 + 연이율)^(1/12) - 1
const MONTHLY_RATE = Math.pow(1 + ANNUAL_RATE, 1 / 12) - 1;

/**
 * 라이프니츠식: 매월 변제액의 현재가치 합계 계산
 */
function calculatePresentValue(monthlyPayment: number, months: number): number {
  if (monthlyPayment <= 0 || months <= 0) return 0;

  let presentValue = 0;

  for (let t = 1; t <= months; t++) {
    const discountFactor = Math.pow(1 + MONTHLY_RATE, t);
    presentValue += monthlyPayment / discountFactor;
  }

  return presentValue;
}

/**
 * 변제기간 계산
 */
function findMinimumRepaymentPeriod(
  monthlyPayment: number,
  liquidationValue: number,
  totalDebt: number
): number | null {
  if (monthlyPayment <= 0) {
    return null;
  }

  if (liquidationValue > totalDebt) {
    return null;
  }

  if (liquidationValue <= 0) {
    for (let months = 1; months < 36; months++) {
      const pv = calculatePresentValue(monthlyPayment, months);
      if (pv >= totalDebt) {
        return months;
      }
    }
    return 36;
  }

  // 1단계: 36개월 이전에 총 부채액 전액 변제 가능한지 확인 (단축)
  for (let months = 1; months < 36; months++) {
    const pv = calculatePresentValue(monthlyPayment, months);

    if (pv >= totalDebt) {
      if (pv >= liquidationValue) {
        return months;
      }
      return null;
    }
  }

  // 2단계: 36개월 시점 확인 (원칙)
  const pv36 = calculatePresentValue(monthlyPayment, 36);

  if (pv36 >= liquidationValue) {
    return 36;
  }

  // 3단계: 36~60개월 범위에서 청산가치 충족하는 최소 기간 찾기 (연장)
  for (let months = 37; months <= 60; months++) {
    const pv = calculatePresentValue(monthlyPayment, months);

    if (pv >= liquidationValue) {
      if (pv <= totalDebt) {
        return months;
      }
      return null;
    }
  }

  return null;
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
      return NextResponse.json({
        reductionRate: 0,
        repaymentAmount: 0,
        reductionAmount: 0,
        monthlyPayment: monthlyRepayment,
        repaymentPeriod: 60,
        liquidationValueViolation: true,
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
    });
  } catch (error) {
    console.error('계산 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
