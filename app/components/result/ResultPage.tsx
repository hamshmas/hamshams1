"use client";

import { useState, useEffect, useRef } from "react";
import type { FormData, CalculationResult, HousingType, MaritalStatus } from "@/app/types";
import { getCourtName } from "@/utils/courtJurisdiction";
import { generateConsultationMessage } from "@/utils/generateConsultationMessage";
import { ConsultationModal, CopySuccessNotification } from "@/app/components/consultation";
import { KAKAO_CONSULTATION_URL, COPY_SUCCESS_NOTIFICATION_DURATION } from "@/app/config/consultation";
import { supabase } from "@/lib/supabase";
import { CelebrationEffects } from "./CelebrationEffects";

interface ResultPageProps {
  result: CalculationResult;
  formData: FormData;
  onRestart: () => void;
  onBack: () => void;
  // 자산 상세 정보
  assetInputMode?: 'direct' | 'calculate' | null;
  housingType?: HousingType | null;
  hasMortgage?: boolean | null;
  mortgageAmount?: number;
  kbPrice?: number;
  depositAmount?: number;
  isSpouseHousing?: boolean | null;
  housingAsset?: number;
  otherAsset?: number;
  // 부양가족 상세 정보
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number;
  hasNoSpouseIncome?: boolean | null;
  // 배우자 재산 정보
  isMarriedForAsset?: boolean | null;
  hasSpouseAsset?: boolean | null;
  spouseAsset?: number;
  isMainCourt?: boolean;
}

export function ResultPage({
  result,
  formData,
  onRestart,
  onBack,
  assetInputMode,
  housingType,
  hasMortgage,
  mortgageAmount,
  kbPrice,
  depositAmount,
  isSpouseHousing,
  housingAsset,
  otherAsset,
  maritalStatus,
  childrenCount,
  hasNoSpouseIncome,
  isMarriedForAsset,
  hasSpouseAsset,
  spouseAsset,
  isMainCourt,
}: ResultPageProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [animatedRate, setAnimatedRate] = useState(0);
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const hasSaved = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // 채무액과 재산 비교
  const hasMoreAssetThanDebt = formData.assetValue >= formData.totalDebt;
  // 가용소득 체크 (채무액이 재산보다 많은 경우만)
  const hasNoIncome = !hasMoreAssetThanDebt && result.monthlyPayment <= 0;
  // 개인회생 가능 여부
  const canShowCelebration = !hasMoreAssetThanDebt && !hasNoIncome && !result.liquidationValueViolation;

  // 탕감률 & 탕감액 카운트업 애니메이션
  useEffect(() => {
    const targetRate = Math.round(result.reductionRate);
    const targetAmount = Math.round(result.reductionAmount);
    const duration = 2000; // 2초
    const steps = 60;
    const rateIncrement = targetRate / steps;
    const amountIncrement = targetAmount / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedRate(targetRate);
        setAnimatedAmount(targetAmount);
        clearInterval(timer);
        // 카운트업 완료 후 축하 효과 시작 (개인회생 가능한 경우만)
        if (canShowCelebration) {
          setShowCelebration(true);
        }
      } else {
        setAnimatedRate(Math.round(rateIncrement * currentStep));
        setAnimatedAmount(Math.round(amountIncrement * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [result.reductionRate, result.reductionAmount, canShowCelebration]);

  // 결과 페이지 도달 시 Supabase에 데이터 저장 (환경 변수가 설정된 경우에만)
  useEffect(() => {
    const saveResultData = async () => {
      // 이미 저장했으면 건너뛰기 (중복 저장 방지)
      if (hasSaved.current) {
        console.log('[Supabase] 이미 저장되어 건너뜁니다.');
        return;
      }

      // Supabase가 설정되지 않은 경우 건너뛰기
      if (!supabase) {
        console.log('[Supabase] 환경 변수가 설정되지 않아 데이터 저장을 건너뜁니다.');
        return;
      }

      // 저장 시작 표시 (중복 방지 - 비동기 작업 시작 전에 설정)
      hasSaved.current = true;
      console.log('[Supabase] 데이터 저장을 시작합니다...');

      try {
        // IP 주소 가져오기
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIp = ipData.ip;

        // Supabase에 저장할 데이터 구성
        const resultData = {
          ip_address: userIp,
          // 입력 정보
          total_debt: formData.totalDebt,
          monthly_income: formData.monthlyIncome,
          asset_value: formData.assetValue,
          dependents: formData.dependents,
          home_address: formData.homeAddress,
          work_address: formData.workAddress,
          court_jurisdiction: formData.courtJurisdiction,
          priority_repayment_region: formData.priorityRepaymentRegion,
          // 결과값
          reduction_rate: result.reductionRate,
          reduction_amount: result.reductionAmount,
          repayment_amount: result.repaymentAmount,
          monthly_payment: result.monthlyPayment,
          repayment_period: result.repaymentPeriod,
          needs_consultation: result.needsConsultation || false,
          liquidation_value_violation: result.liquidationValueViolation || false,
          consultation_reason: result.consultationReason || null,
          // 자산 상세 정보
          asset_input_mode: assetInputMode || null,
          housing_type: housingType || null,
          has_mortgage: hasMortgage ?? null,
          mortgage_amount: mortgageAmount || null,
          kb_price: kbPrice || null,
          deposit_amount: depositAmount || null,
          is_spouse_housing: isSpouseHousing ?? null,
          housing_asset: housingAsset || null,
          other_asset: otherAsset || null,
          // 부양가족 상세 정보
          marital_status: maritalStatus || null,
          children_count: childrenCount || null,
          has_no_spouse_income: hasNoSpouseIncome ?? null,
          // 타임스탬프
          created_at: new Date().toISOString(),
        };

        console.log('[Supabase] 저장할 데이터:', resultData);

        // Supabase에 저장
        const { data, error } = await supabase
          .from('calculation_results')
          .insert([resultData]);

        if (error) {
          console.error('[Supabase] 데이터 저장 실패:');
          console.error('Error object:', error);
          console.error('Error keys:', Object.keys(error));
          console.error('Error JSON:', JSON.stringify(error, null, 2));
        } else {
          console.log('[Supabase] 데이터 저장 성공:', data);
        }
      } catch (error) {
        console.error('[Supabase] 저장 중 오류:', error);
      }
    };

    saveResultData();
  }, []);

  const handleConsultationClick = () => {
    setShowContactModal(true);
  };

  const handleContactSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      alert("이름과 연락처를 모두 입력해주세요.");
      return;
    }

    setShowContactModal(false);
    await sendConsultationMessage();
  };

  // 전화상담 신청 핸들러
  const handlePhoneConsultation = async () => {
    if (!name.trim() || !phone.trim()) {
      alert("이름과 연락처를 모두 입력해주세요.");
      return;
    }

    setShowContactModal(false);

    // 상담 신청 정보 저장
    try {
      const response = await fetch('/api/consultation/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          formData,
          calculationResult: result,
        }),
      });

      if (response.ok) {
        alert('전화상담 신청이 완료되었습니다.\n담당자가 곧 연락드리겠습니다.');
      } else {
        alert('전화상담 신청이 완료되었습니다.\n담당자가 곧 연락드리겠습니다.');
      }
    } catch (error) {
      console.error('상담 신청 저장 실패:', error);
      alert('전화상담 신청이 완료되었습니다.\n담당자가 곧 연락드리겠습니다.');
    }
  };

  const sendConsultationMessage = async () => {
    // 메시지 생성 (먼저 생성)
    let message = '';
    try {
      message = generateConsultationMessage({
        formData,
        result,
        name,
        phone,
        housingType,
        kbPrice,
        mortgageAmount,
        depositAmount,
        hasMortgage,
        isSpouseHousing,
        maritalStatus,
        childrenCount,
        hasNoSpouseIncome,
      });
    } catch (err) {
      console.error('메시지 생성 실패:', err);
      message = `상담 신청\n이름: ${name}\n연락처: ${phone}\n\n개인회생 탕감률 계산 결과를 상담받고 싶습니다.`;
    }

    // 클립보드 복사 (사용자 인터랙션 컨텍스트가 유지되는 동안 실행)
    let clipboardSuccess = false;
    try {
      await navigator.clipboard.writeText(message);
      clipboardSuccess = true;
    } catch (err) {
      console.error('클립보드 API 실패, fallback 사용:', err);
      // Fallback: textarea 방식
      try {
        const textarea = document.createElement('textarea');
        textarea.value = message;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        clipboardSuccess = true;
      } catch (fallbackErr) {
        console.error('Fallback 복사도 실패:', fallbackErr);
      }
    }

    // 복사 성공 표시
    if (clipboardSuccess) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), COPY_SUCCESS_NOTIFICATION_DURATION);
    }

    // 상담 신청 정보 Supabase에 저장
    try {
      const response = await fetch('/api/consultation/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          formData,
          calculationResult: result,
        }),
      });

      if (response.ok) {
        console.log('[Consultation] 상담 신청 저장 성공');
      } else {
        console.error('[Consultation] 상담 신청 저장 실패:', await response.text());
      }
    } catch (error) {
      console.error('[Consultation] 상담 신청 저장 오류:', error);
    }

    // 카카오톡 채널 열기
    window.open(KAKAO_CONSULTATION_URL, "_blank", "noopener,noreferrer");
  };
  const getColorByRate = (rate: number) => {
    if (rate >= 70) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', stroke: '#16a34a' };
    if (rate >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', stroke: '#ca8a04' };
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', stroke: '#dc2626' };
  };

  const colors = getColorByRate(result.reductionRate);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (animatedRate / 100) * circumference;

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* 축하 효과 */}
      <CelebrationEffects
        reductionRate={result.reductionRate}
        isActive={showCelebration}
      />

      {hasMoreAssetThanDebt ? (
        // 토스 스타일: 희망 제시 메시지
        <div className="text-center mb-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 shadow-2xl border-2 border-blue-200">
          <div className="mb-4">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 leading-tight">
            다른 방법을<br />찾아볼게요
          </h2>
          <p className="text-base text-gray-700 mb-4 leading-relaxed">
            재산으로 빚을 갚을 수 있는 상황이에요
          </p>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-w-sm mx-auto shadow-md">
            <p className="text-sm text-gray-800 font-medium mb-3">
              💡 이런 방법도 있어요
            </p>
            <div className="text-left space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>재산 매각 후 채무 상환</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>개인 채무조정</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>전문가와 상담하여 맞춤 해결책 찾기</span>
              </div>
            </div>
          </div>

          {/* 상단 상담 버튼 */}
          <div className="mt-6 flex gap-2 max-w-sm mx-auto">
            <button
              onClick={handleConsultationClick}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm"
            >
              💬 무료 상담받기
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm"
            >
              📞 전화상담
            </button>
          </div>
        </div>
      ) : hasNoIncome ? (
        // 토스 스타일: 개인파산 안내 (희망적)
        <div className="text-center mb-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 shadow-2xl border-2 border-blue-200">
          <div className="mb-4">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 leading-tight">
            더 나은 방법이<br />있어요
          </h2>
          <p className="text-base text-gray-700 mb-4 leading-relaxed">
            지금 수입이 적어도 괜찮아요
          </p>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-w-sm mx-auto shadow-md">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              💡 개인파산을 고려해보세요
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              수입이 없거나 적을 때는 개인파산이 더 좋은 선택일 수 있어요. 전문가와 상담하면 정확한 답을 찾을 수 있습니다.
            </p>
          </div>

          {/* 상단 상담 버튼 */}
          <div className="mt-6 flex gap-2 max-w-sm mx-auto">
            <button
              onClick={handleConsultationClick}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm"
            >
              💬 무료 상담받기
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm"
            >
              📞 전화상담
            </button>
          </div>
        </div>
      ) : result.liquidationValueViolation ? (
        // 토스 스타일: 청산가치 위반
        <div className="text-center mb-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 shadow-2xl border-2 border-blue-200">
          <div className="mb-4">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 leading-tight">
            조금 더<br />살펴볼게요
          </h2>
          <p className="text-base text-gray-700 mb-4 leading-relaxed">
            지금 상황에선 계획을 세우기 어려워요
          </p>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-w-sm mx-auto shadow-md">
            <p className="text-sm text-gray-800 font-medium mb-2">
              💡 전문가와 상담이 필요해요
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              복잡한 상황이라 정확한 판단을 위해선 변호사와 상담이 필요합니다. 무료 상담으로 해결책을 찾아보세요.
            </p>
          </div>

          {/* 상단 상담 버튼 */}
          <div className="mt-6 flex gap-2 max-w-sm mx-auto">
            <button
              onClick={handleConsultationClick}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm"
            >
              💬 무료 상담받기
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm"
            >
              📞 전화상담
            </button>
          </div>
        </div>
      ) : (
        // 단순화된 결과 화면 - 한 화면에 맞게 콤팩트하게
        <div className="text-center bg-white rounded-2xl p-4 shadow-xl border-2 border-blue-300">
          <p className="text-gray-800 text-xs font-medium mb-2">예상 탕감률</p>

          {/* 원형 프로그레스 - 크기 축소 */}
          <div className="relative inline-block">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="54" stroke="#E5E7EB" strokeWidth="10" fill="none" />
              <circle
                cx="60" cy="60" r="54" stroke="url(#goldGradient)" strokeWidth="10" fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-gray-900">
                {animatedRate}%
              </div>
            </div>
          </div>

          {/* 탕감액 & 월 상환액을 한 줄에 */}
          <div className="mt-3 flex gap-2">
            <div className="flex-1 bg-blue-50 rounded-lg p-2.5">
              <p className="text-gray-600 text-xs">탕감액</p>
              <p className="text-lg font-bold text-blue-700">
                {animatedAmount.toLocaleString()}원
              </p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-600 text-xs">월 상환액</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.round(result.monthlyPayment).toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 변제 기간 */}
          <p className="mt-2 text-xs text-gray-600">
            변제 기간: <span className="font-semibold text-gray-800">{result.repaymentPeriod}개월</span>
          </p>

          {/* Before/After 비교 섹션 */}
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              {result.repaymentPeriod}개월 기준 비교
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="text-center">
                <p className="text-xs text-gray-500">회생 전</p>
                <p className="text-sm font-bold text-gray-400 line-through">
                  월 {Math.round(formData.totalDebt / result.repaymentPeriod).toLocaleString()}원
                </p>
              </div>
              <div className="text-blue-500 font-bold text-lg">→</div>
              <div className="text-center">
                <p className="text-xs text-gray-500">회생 후</p>
                <p className="text-sm font-bold text-blue-700">
                  월 {Math.round(result.monthlyPayment).toLocaleString()}원
                </p>
              </div>
            </div>
            <p className="text-center mt-2 text-xs">
              <span className="font-bold text-green-600">
                매월 {Math.round((formData.totalDebt / result.repaymentPeriod) - result.monthlyPayment).toLocaleString()}원 절약
              </span>
              <span className="text-gray-500"> · {result.repaymentPeriod}개월간 총 </span>
              <span className="font-bold text-blue-600">{Math.round(result.reductionAmount).toLocaleString()}원 탕감</span>
            </p>
          </div>
        </div>
      )}

      {/* 간단한 입력 정보 요약 - 콤팩트 */}
      <div className="bg-gray-100 rounded-xl p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">총 채무</span>
            <span className="font-semibold text-gray-900">{Math.round(formData.totalDebt).toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">월 소득</span>
            <span className="font-semibold text-gray-900">{Math.round(formData.monthlyIncome).toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">청산가치</span>
            <span className="font-semibold text-gray-900">{Math.round(formData.assetValue).toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">관할법원</span>
            <span className="font-semibold text-gray-900">{getCourtName(formData.courtJurisdiction)}</span>
          </div>
        </div>
      </div>

      {/* 블랙스톤 법률사무소 상담 영역 - 더 콤팩트하게 */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-sm">블랙스톤 법률사무소</p>
            <p className="text-slate-400 text-xs">개인회생 전문 · 상담료 0원</p>
          </div>
          <div className="flex gap-1">
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/80">비밀 보장</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConsultationClick}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-3 rounded-lg transition-all text-sm"
          >
            카카오톡 상담
          </button>
          <button
            onClick={() => setShowContactModal(true)}
            className="flex-1 bg-white hover:bg-gray-100 text-slate-900 font-bold py-3 px-3 rounded-lg transition-all text-sm"
          >
            전화상담 신청
          </button>
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onBack} className="secondary-button text-sm py-2">
          ← 이전
        </button>
        <button onClick={onRestart} className="secondary-button text-sm py-2">
          처음부터 →
        </button>
      </div>

      <CopySuccessNotification isVisible={copySuccess} />

      <ConsultationModal
        isOpen={showContactModal}
        name={name}
        phone={phone}
        onNameChange={setName}
        onPhoneChange={setPhone}
        onCancel={() => setShowContactModal(false)}
        onSubmit={handleContactSubmit}
        onPhoneConsultation={handlePhoneConsultation}
      />
    </div>
  );
}
