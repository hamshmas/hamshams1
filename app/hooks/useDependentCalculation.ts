"use client";

import { useState } from "react";
import type { MaritalStatus, CourtJurisdiction } from "@/app/types";

export function useDependentCalculation() {
  const [dependentInputMode, setDependentInputMode] = useState<'direct' | 'calculate' | null>(null);
  const [dependentSubStep, setDependentSubStep] = useState(0);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(null);
  const [childrenCount, setChildrenCount] = useState(0);
  const [courtJurisdiction, setCourtJurisdiction] = useState<CourtJurisdiction | null>(null);
  const [hasNoSpouseIncome, setHasNoSpouseIncome] = useState<boolean | null>(null);

  /**
   * 부양가족 수 계산
   *
   * 결혼:
   *   - 기본: (자녀수 / 2) + 1
   *   - 주요 법원 관할 + 배우자 소득 없음: 자녀수 + 1
   *
   * 미혼/이혼: 자녀수 + 1
   */
  const calculateDependents = (
    status: MaritalStatus = maritalStatus!,
    children: number = childrenCount,
    jurisdiction: CourtJurisdiction | null = courtJurisdiction,
    noSpouseIncome: boolean | null = hasNoSpouseIncome
  ): number => {
    if (!status) return 1;

    switch (status) {
      case 'married':
        const isMainCourt = jurisdiction && ['seoul', 'suwon', 'daejeon', 'busan'].includes(jurisdiction);
        if (isMainCourt && noSpouseIncome) {
          // 주요 법원 + 배우자 소득 없음
          return children + 1;
        }
        // 결혼 기본값
        return (children / 2) + 1;

      case 'single':
      case 'divorced':
        return children + 1;

      default:
        return 1;
    }
  };

  const resetDependentState = () => {
    setDependentInputMode(null);
    setDependentSubStep(0);
    setMaritalStatus(null);
    setChildrenCount(0);
    setCourtJurisdiction(null);
    setHasNoSpouseIncome(null);
  };

  return {
    dependentInputMode,
    setDependentInputMode,
    dependentSubStep,
    setDependentSubStep,
    maritalStatus,
    setMaritalStatus,
    childrenCount,
    setChildrenCount,
    courtJurisdiction,
    setCourtJurisdiction,
    hasNoSpouseIncome,
    setHasNoSpouseIncome,
    calculateDependents,
    resetDependentState,
  };
}
