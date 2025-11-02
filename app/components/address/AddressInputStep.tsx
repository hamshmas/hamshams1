"use client";

import { useState } from "react";
import type { CourtCode, AddressData } from "@/app/types";
import {
  getCourtFromAddress,
  selectPriorityJurisdiction,
  getPriorityRepaymentRegion,
  getCourtName,
  getPriorityRepaymentAmount,
} from "@/utils/courtJurisdiction";

interface AddressInputStepProps {
  onNext: (data: {
    homeAddress: string;
    workAddress: string;
    courtJurisdiction: CourtCode;
    homeAddressData: AddressData;
  }) => void;
  onBack?: () => void;
  initialHomeAddress?: string;
  initialWorkAddress?: string;
}

// 카카오 주소 API 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          address: string;
          addressType: string;
          bname: string;
          buildingName: string;
          jibunAddress: string;
          roadAddress: string;
          sido: string;
          sigungu: string;
          zonecode: string;
        }) => void;
        width?: string | number;
        height?: string | number;
      }) => {
        open: () => void;
      };
    };
  }
}

export function AddressInputStep({
  onNext,
  onBack,
  initialHomeAddress = "",
  initialWorkAddress = "",
}: AddressInputStepProps) {
  const [homeAddressData, setHomeAddressData] = useState<AddressData | null>(
    initialHomeAddress
      ? {
          address: initialHomeAddress,
          jibunAddress: "",
          zonecode: "",
          sido: "",
          sigungu: "",
        }
      : null
  );
  const [workAddressData, setWorkAddressData] = useState<AddressData | null>(
    initialWorkAddress
      ? {
          address: initialWorkAddress,
          jibunAddress: "",
          zonecode: "",
          sido: "",
          sigungu: "",
        }
      : null
  );
  const [selectedCourt, setSelectedCourt] = useState<CourtCode | null>(null);
  const [step, setStep] = useState<"home" | "work" | "court">("home");

  // 카카오 주소 검색 팝업 열기
  const openAddressSearch = (type: "home" | "work") => {
    if (!window.daum) {
      alert("주소 검색 서비스를 로드하는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        const addressData: AddressData = {
          address: data.roadAddress || data.address,
          jibunAddress: data.jibunAddress,
          zonecode: data.zonecode,
          sido: data.sido,
          sigungu: data.sigungu,
        };

        if (type === "home") {
          setHomeAddressData(addressData);
        } else {
          setWorkAddressData(addressData);
        }
      },
    }).open();
  };

  // 다음 단계로 진행
  const handleNext = () => {
    if (step === "home" && homeAddressData) {
      setStep("work");
    } else if (step === "work" && workAddressData && homeAddressData) {
      // 관할법원 자동 계산
      const homeCourt = getCourtFromAddress(homeAddressData);
      const workCourt = getCourtFromAddress(workAddressData);
      const jurisdictionResult = selectPriorityJurisdiction(homeCourt, workCourt);

      if (jurisdictionResult.needsSelection) {
        setStep("court");
      } else {
        // 자동 결정된 경우 바로 완료
        onNext({
          homeAddress: homeAddressData.address,
          workAddress: workAddressData.address,
          courtJurisdiction: jurisdictionResult.court,
          homeAddressData: homeAddressData,
        });
      }
    } else if (step === "court" && selectedCourt) {
      // 사용자가 선택한 경우
      onNext({
        homeAddress: homeAddressData!.address,
        workAddress: workAddressData!.address,
        courtJurisdiction: selectedCourt,
        homeAddressData: homeAddressData!,
      });
    }
  };

  // 이전 단계
  const handleBack = () => {
    if (step === "court") {
      setStep("work");
      setSelectedCourt(null);
    } else if (step === "work") {
      setStep("home");
      setWorkAddressData(null);
    } else if (onBack) {
      onBack();
    }
  };

  // 현재 단계에 따른 UI 렌더링
  if (step === "home") {
    const priorityRegion = homeAddressData ? getPriorityRepaymentRegion(homeAddressData) : null;
    const priorityAmount = priorityRegion ? getPriorityRepaymentAmount(priorityRegion) : 0;

    return (
      <div className="space-y-4 animate-slideIn">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-1">
            집 주소를 입력하세요
          </h2>
          <p className="text-gray-600 text-sm">관할법원과 최우선변제금 계산에 사용됩니다</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => openAddressSearch("home")}
            className="w-full border-2 border-dashed border-primary-300 hover:border-primary-500 bg-primary-50/50 hover:bg-primary-50 rounded-xl p-4 transition-all text-gray-700 font-semibold text-sm"
          >
            {homeAddressData ? "📍 주소 변경하기" : "🔍 주소 검색"}
          </button>

          {homeAddressData && (
            <div className="bg-white border-2 border-primary-200 rounded-xl p-4 space-y-2 animate-fadeIn">
              <p className="text-sm font-bold text-gray-900">📍 {homeAddressData.address}</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• 지번: {homeAddressData.jibunAddress || "정보 없음"}</p>
                <p>• 우편번호: {homeAddressData.zonecode}</p>
              </div>
              {priorityRegion && (
                <div className="mt-3 pt-3 border-t border-primary-100">
                  <p className="text-xs font-semibold text-primary-700">
                    💰 최우선변제금 지역: {priorityRegion}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    전세/월세 보증금에서 {(priorityAmount / 10000).toLocaleString()}만원 우선 공제
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {onBack && (
            <button onClick={onBack} className="secondary-button flex-1 text-sm py-2.5">
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!homeAddressData}
            className={`primary-button flex-1 text-sm py-2.5 ${
              !homeAddressData ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  if (step === "work") {
    return (
      <div className="space-y-4 animate-slideIn">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-1">
            직장 주소를 입력하세요
          </h2>
          <p className="text-gray-600 text-sm">관할법원 결정에 사용됩니다</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => openAddressSearch("work")}
            className="w-full border-2 border-dashed border-primary-300 hover:border-primary-500 bg-primary-50/50 hover:bg-primary-50 rounded-xl p-4 transition-all text-gray-700 font-semibold text-sm"
          >
            {workAddressData ? "📍 주소 변경하기" : "🔍 주소 검색"}
          </button>

          {workAddressData && (
            <div className="bg-white border-2 border-primary-200 rounded-xl p-4 space-y-2 animate-fadeIn">
              <p className="text-sm font-bold text-gray-900">📍 {workAddressData.address}</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• 지번: {workAddressData.jibunAddress || "정보 없음"}</p>
                <p>• 우편번호: {workAddressData.zonecode}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleBack} className="secondary-button flex-1 text-sm py-2.5">
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={!workAddressData}
            className={`primary-button flex-1 text-sm py-2.5 ${
              !workAddressData ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  // step === "court"
  if (homeAddressData && workAddressData) {
    const homeCourt = getCourtFromAddress(homeAddressData);
    const workCourt = getCourtFromAddress(workAddressData);
    const options = [homeCourt, workCourt];

    return (
      <div className="space-y-4 animate-slideIn">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-1">
            관할법원을 선택하세요
          </h2>
          <p className="text-gray-600 text-sm">집 주소 또는 직장 주소 기준으로 선택 가능합니다</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setSelectedCourt(homeCourt)}
            className={`w-full border-2 rounded-xl p-4 transition-all text-left ${
              selectedCourt === homeCourt
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300 bg-white"
            }`}
          >
            <p className="font-bold text-gray-900 text-sm mb-1">
              🏠 집 주소 기준: {getCourtName(homeCourt)}
            </p>
            <p className="text-xs text-gray-600">{homeAddressData.sido}</p>
          </button>

          <button
            onClick={() => setSelectedCourt(workCourt)}
            className={`w-full border-2 rounded-xl p-4 transition-all text-left ${
              selectedCourt === workCourt
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300 bg-white"
            }`}
          >
            <p className="font-bold text-gray-900 text-sm mb-1">
              💼 직장 주소 기준: {getCourtName(workCourt)}
            </p>
            <p className="text-xs text-gray-600">{workAddressData.sido}</p>
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleBack} className="secondary-button flex-1 text-sm py-2.5">
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedCourt}
            className={`primary-button flex-1 text-sm py-2.5 ${
              !selectedCourt ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  return null;
}
