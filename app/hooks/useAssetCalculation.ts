"use client";

import { useState } from "react";
import type { HousingType, RegionType } from "@/app/types";

export function useAssetCalculation() {
  const [assetInputMode, setAssetInputMode] = useState<'direct' | 'calculate' | null>(null);
  const [assetSubStep, setAssetSubStep] = useState(0);
  const [housingType, setHousingType] = useState<HousingType | null>(null);
  const [hasMortgage, setHasMortgage] = useState<boolean | null>(null);
  const [mortgageAmount, setMortgageAmount] = useState(0);
  const [kbPrice, setKbPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<RegionType | null>(null);
  const [isSpouseHousing, setIsSpouseHousing] = useState<boolean | null>(null);
  const [isMainCourtJurisdiction, setIsMainCourtJurisdiction] = useState<boolean | null>(null);
  const [housingAsset, setHousingAsset] = useState(0); // 주거 자산
  const [otherAsset, setOtherAsset] = useState(0); // 기타 자산 (예금, 주식, 자동차 등)

  const resetAssetState = () => {
    setAssetInputMode(null);
    setAssetSubStep(0);
    setHousingType(null);
    setHasMortgage(null);
    setMortgageAmount(0);
    setKbPrice(0);
    setDepositAmount(0);
    setSelectedRegion(null);
    setIsSpouseHousing(null);
    setIsMainCourtJurisdiction(null);
    setHousingAsset(0);
    setOtherAsset(0);
  };

  return {
    assetInputMode,
    setAssetInputMode,
    assetSubStep,
    setAssetSubStep,
    housingType,
    setHousingType,
    hasMortgage,
    setHasMortgage,
    mortgageAmount,
    setMortgageAmount,
    kbPrice,
    setKbPrice,
    depositAmount,
    setDepositAmount,
    selectedRegion,
    setSelectedRegion,
    isSpouseHousing,
    setIsSpouseHousing,
    isMainCourtJurisdiction,
    setIsMainCourtJurisdiction,
    housingAsset,
    setHousingAsset,
    otherAsset,
    setOtherAsset,
    resetAssetState,
  };
}
