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
  const [step, setStep] = useState<"home" | "workChoice" | "work" | "court">("home");
  const [hasWorkAddress, setHasWorkAddress] = useState<boolean | null>(null);

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
      setStep("workChoice");
    } else if (step === "workChoice") {
      if (hasWorkAddress) {
        setStep("work");
      } else {
        // 직장 주소 없이 바로 완료
        const homeCourt = getCourtFromAddress(homeAddressData!);
        onNext({
          homeAddress: homeAddressData!.address,
          workAddress: "",
          courtJurisdiction: homeCourt,
          homeAddressData: homeAddressData!,
        });
      }
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
      setStep("workChoice");
      setWorkAddressData(null);
    } else if (step === "workChoice") {
      setStep("home");
      setHasWorkAddress(null);
    } else if (onBack) {
      onBack();
    }
  };

  // 현재 단계에 따른 UI 렌더링
  if (step === "home") {
    const priorityRegion = homeAddressData ? getPriorityRepaymentRegion(homeAddressData) : null;
    const priorityAmount = priorityRegion ? getPriorityRepaymentAmount(priorityRegion) : 0;

    return (
      <div className="space-y-6 animate-fadeInUp">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg shadow-blue-500/30 mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            집 주소를 알려주세요
          </h2>
          <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
            관할법원과 최우선변제금 계산에<br />사용됩니다
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => openAddressSearch("home")}
            className="group w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-400 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-semibold">
                  {homeAddressData ? "주소 변경하기" : "주소 검색"}
                </span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {homeAddressData && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{homeAddressData.address}</p>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p>지번: {homeAddressData.jibunAddress || "정보 없음"}</p>
                    <p>우편번호: {homeAddressData.zonecode}</p>
                  </div>
                </div>
              </div>
              {priorityRegion && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-blue-900">
                        최우선변제금 지역: {priorityRegion}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        전세/월세 보증금에서 {(priorityAmount / 10000).toLocaleString()}만원 우선 공제
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-95"
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!homeAddressData}
            className={`flex-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
              homeAddressData
                ? "hover:shadow-xl hover:scale-105 active:scale-100"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>

        {/* 서울회생법원 바로가기 */}
        {!homeAddressData && (
          <button
            onClick={() => {
              onNext({
                homeAddress: "",
                workAddress: "",
                courtJurisdiction: "seoul" as CourtCode,
                homeAddressData: {
                  address: "",
                  jibunAddress: "",
                  zonecode: "",
                  sido: "서울특별시",
                  sigungu: "",
                },
              });
            }}
            className="w-full text-center text-sm text-gray-500 hover:text-primary-600 py-2 transition-colors"
          >
            주소 입력 없이 <span className="font-semibold text-primary-600">서울회생법원</span>에서 진행하기
          </button>
        )}
      </div>
    );
  }

  if (step === "workChoice") {
    return (
      <div className="space-y-4 animate-slideIn">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-1">
            직장 주소를 입력하시겠습니까?
          </h2>
          <p className="text-gray-600 text-sm">직장 주소는 관할법원 결정에 사용됩니다</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="flex-1 text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-1">직장 주소를 입력하면:</p>
              <p>• 집 주소와 직장 주소 중 선택하여 관할법원을 정할 수 있습니다</p>
              <p className="mt-2 font-bold">입력하지 않으면:</p>
              <p>• 집 주소 기준으로 자동으로 관할법원이 정해집니다</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setHasWorkAddress(false)}
            className={`w-full border-2 rounded-xl p-4 transition-all text-left ${
              hasWorkAddress === false
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300 bg-white"
            }`}
          >
            <p className="font-bold text-gray-900 text-sm">🏠 아니오, 집 주소만 사용하겠습니다 <span className="text-primary-600">추천</span></p>
            <p className="text-xs text-gray-600 mt-1">집 주소 기준으로 자동 결정됩니다</p>
          </button>

          <button
            onClick={() => setHasWorkAddress(true)}
            className={`w-full border-2 rounded-xl p-4 transition-all text-left ${
              hasWorkAddress === true
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300 bg-white"
            }`}
          >
            <p className="font-bold text-gray-900 text-sm">💼 네, 직장 주소를 입력하겠습니다</p>
            <p className="text-xs text-gray-600 mt-1">관할법원을 선택할 수 있습니다</p>
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleBack} className="secondary-button flex-1 text-sm py-2.5">
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={hasWorkAddress === null}
            className={`primary-button flex-1 text-sm py-2.5 ${
              hasWorkAddress === null ? "opacity-50 cursor-not-allowed" : ""
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
      <div className="space-y-6 animate-fadeInUp">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-lg shadow-purple-500/30 mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            직장 주소를 알려주세요
          </h2>
          <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
            관할법원 결정에 사용됩니다
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => openAddressSearch("work")}
            className="group w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-400 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-semibold">
                  {workAddressData ? "주소 변경하기" : "주소 검색"}
                </span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {workAddressData && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 space-y-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{workAddressData.address}</p>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p>지번: {workAddressData.jibunAddress || "정보 없음"}</p>
                    <p>우편번호: {workAddressData.zonecode}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleBack}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-95"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={!workAddressData}
            className={`flex-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
              workAddressData
                ? "hover:shadow-xl hover:scale-105 active:scale-100"
                : "opacity-40 cursor-not-allowed"
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
      <div className="space-y-6 animate-fadeInUp">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-lg shadow-amber-500/30 mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            관할법원을 선택하세요
          </h2>
          <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
            집 주소 또는 직장 주소 기준으로<br />선택 가능합니다
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setSelectedCourt(homeCourt)}
            className={`w-full rounded-2xl p-5 transition-all duration-300 text-left border-2 ${
              selectedCourt === homeCourt
                ? "border-primary-500 bg-gradient-to-br from-primary-50 to-blue-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                selectedCourt === homeCourt
                  ? "bg-gradient-to-br from-primary-500 to-primary-600"
                  : "bg-gray-100"
              }`}>
                <svg className={`w-6 h-6 ${selectedCourt === homeCourt ? "text-white" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1">
                  집 주소 기준
                </p>
                <p className="text-sm text-gray-600 font-semibold">{getCourtName(homeCourt)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{homeAddressData.sido}</p>
              </div>
              {selectedCourt === homeCourt && (
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={() => setSelectedCourt(workCourt)}
            className={`w-full rounded-2xl p-5 transition-all duration-300 text-left border-2 ${
              selectedCourt === workCourt
                ? "border-primary-500 bg-gradient-to-br from-primary-50 to-blue-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                selectedCourt === workCourt
                  ? "bg-gradient-to-br from-primary-500 to-primary-600"
                  : "bg-gray-100"
              }`}>
                <svg className={`w-6 h-6 ${selectedCourt === workCourt ? "text-white" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1">
                  직장 주소 기준
                </p>
                <p className="text-sm text-gray-600 font-semibold">{getCourtName(workCourt)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{workAddressData.sido}</p>
              </div>
              {selectedCourt === workCourt && (
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleBack}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-95"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedCourt}
            className={`flex-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
              selectedCourt
                ? "hover:shadow-xl hover:scale-105 active:scale-100"
                : "opacity-40 cursor-not-allowed"
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
