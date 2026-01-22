"use client";

import { useState, useEffect, useRef } from "react";
import type { FormData, CalculationResult, HousingType, MaritalStatus } from "@/app/types";
import { generateConsultationMessage } from "@/utils/generateConsultationMessage";
import { ConsultationModal, CopySuccessNotification } from "@/app/components/consultation";
import { KAKAO_CONSULTATION_URL, COPY_SUCCESS_NOTIFICATION_DURATION } from "@/app/config/consultation";
import { supabase } from "@/lib/supabase";
import { CelebrationEffects } from "./CelebrationEffects";
import { useToast } from "@/app/hooks/useToast";

interface ResultPageProps {
  result: CalculationResult;
  formData: FormData;
  onRestart: () => void;
  onBack: () => void;
  assetInputMode?: 'direct' | 'calculate' | null;
  housingType?: HousingType | null;
  hasMortgage?: boolean | null;
  mortgageAmount?: number;
  kbPrice?: number;
  depositAmount?: number;
  isSpouseHousing?: boolean | null;
  housingAsset?: number;
  otherAsset?: number;
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number;
  hasNoSpouseIncome?: boolean | null;
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
  const toast = useToast();

  const hasMoreAssetThanDebt = formData.assetValue >= formData.totalDebt;
  const hasNoIncome = !hasMoreAssetThanDebt && result.monthlyPayment <= 0;
  const canShowCelebration = !hasMoreAssetThanDebt && !hasNoIncome && !result.liquidationValueViolation;

  useEffect(() => {
    const targetRate = Math.round(result.reductionRate);
    const targetAmount = Math.round(result.reductionAmount);
    const duration = 2000;
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

  useEffect(() => {
    const saveResultData = async () => {
      if (hasSaved.current) return;
      if (!supabase) return;

      hasSaved.current = true;

      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIp = ipData.ip;

        const resultData = {
          ip_address: userIp,
          total_debt: formData.totalDebt,
          monthly_income: formData.monthlyIncome,
          asset_value: formData.assetValue,
          dependents: formData.dependents,
          home_address: formData.homeAddress,
          work_address: formData.workAddress,
          court_jurisdiction: formData.courtJurisdiction,
          priority_repayment_region: formData.priorityRepaymentRegion,
          reduction_rate: result.reductionRate,
          reduction_amount: result.reductionAmount,
          repayment_amount: result.repaymentAmount,
          monthly_payment: result.monthlyPayment,
          repayment_period: result.repaymentPeriod,
          needs_consultation: result.needsConsultation || false,
          liquidation_value_violation: result.liquidationValueViolation || false,
          consultation_reason: result.consultationReason || null,
          asset_input_mode: assetInputMode || null,
          housing_type: housingType || null,
          has_mortgage: hasMortgage ?? null,
          mortgage_amount: mortgageAmount || null,
          kb_price: kbPrice || null,
          deposit_amount: depositAmount || null,
          is_spouse_housing: isSpouseHousing ?? null,
          housing_asset: housingAsset || null,
          other_asset: otherAsset || null,
          marital_status: maritalStatus || null,
          children_count: childrenCount || null,
          has_no_spouse_income: hasNoSpouseIncome ?? null,
          created_at: new Date().toISOString(),
        };

        await supabase.from('calculation_results').insert([resultData]);
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
      toast.warning("이름과 연락처를 모두 입력해주세요.");
      return;
    }

    setShowContactModal(false);
    await sendConsultationMessage();
  };

  const handlePhoneConsultation = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.warning("이름과 연락처를 모두 입력해주세요.");
      return;
    }

    setShowContactModal(false);

    try {
      await fetch('/api/consultation/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          formData,
          calculationResult: result,
        }),
      });
    } catch (error) {
      console.error('상담 신청 저장 실패:', error);
    }

    toast.success("전화상담 신청이 완료되었습니다. 담당자가 곧 연락드리겠습니다.");
  };

  const sendConsultationMessage = async () => {
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
      message = `상담 신청\n이름: ${name}\n연락처: ${phone}\n\n개인회생 탕감률 계산 결과를 상담받고 싶습니다.`;
    }

    let clipboardSuccess = false;
    try {
      await navigator.clipboard.writeText(message);
      clipboardSuccess = true;
    } catch (err) {
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
        console.error('복사 실패:', fallbackErr);
      }
    }

    if (clipboardSuccess) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), COPY_SUCCESS_NOTIFICATION_DURATION);
    }

    try {
      await fetch('/api/consultation/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          formData,
          calculationResult: result,
        }),
      });
    } catch (error) {
      console.error('[Consultation] 상담 신청 저장 오류:', error);
    }

    window.open(KAKAO_CONSULTATION_URL, "_blank", "noopener");
  };

  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (animatedRate / 100) * circumference;

  return (
    <>
      <CelebrationEffects
        reductionRate={result.reductionRate}
        isActive={showCelebration}
      />

      <div className="flex-1 flex flex-col animate-fadeIn">
        {hasMoreAssetThanDebt ? (
          <div className="text-center mb-6 bg-apple-gray-50 rounded-apple-xl p-6">
            <div className="w-14 h-14 bg-apple-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-apple-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-[24px] font-bold text-apple-gray-800 mb-2 tracking-tight">
              다른 방법을 찾아볼게요
            </h2>
            <p className="text-[15px] text-apple-gray-500 mb-6">
              재산으로 빚을 갚을 수 있는 상황이에요
            </p>
            <div className="bg-white rounded-apple-lg p-4 text-left space-y-2 mb-6">
              <p className="text-[14px] font-semibold text-apple-gray-700 mb-3">이런 방법도 있어요</p>
              {["재산 매각 후 채무 상환", "개인 채무조정", "전문가와 상담하여 맞춤 해결책 찾기"].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-[14px] text-apple-gray-600">
                  <span className="text-apple-blue-500">•</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleConsultationClick}
              className="w-full bg-apple-blue-500 hover:bg-apple-blue-600 active:bg-apple-blue-700 active:scale-[0.98] text-white font-semibold py-4 rounded-apple-lg transition-all duration-200 text-[17px] shadow-apple-button"
            >
              무료 상담받기
            </button>
          </div>
        ) : hasNoIncome ? (
          <div className="text-center mb-6 bg-apple-gray-50 rounded-apple-xl p-6">
            <div className="w-14 h-14 bg-apple-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-apple-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-[24px] font-bold text-apple-gray-800 mb-2 tracking-tight">
              더 나은 방법이 있어요
            </h2>
            <p className="text-[15px] text-apple-gray-500 mb-4">
              지금 수입이 적어도 괜찮아요
            </p>
            <div className="bg-white rounded-apple-lg p-4 mb-6">
              <p className="text-[14px] font-semibold text-apple-gray-700 mb-2">개인파산을 고려해보세요</p>
              <p className="text-[13px] text-apple-gray-500 leading-relaxed">
                수입이 없거나 적을 때는 개인파산이 더 좋은 선택일 수 있어요.
              </p>
            </div>
            <button
              onClick={handleConsultationClick}
              className="w-full bg-apple-blue-500 hover:bg-apple-blue-600 active:bg-apple-blue-700 active:scale-[0.98] text-white font-semibold py-4 rounded-apple-lg transition-all duration-200 text-[17px] shadow-apple-button"
            >
              무료 상담받기
            </button>
          </div>
        ) : result.liquidationValueViolation ? (
          <div className="text-center mb-6 bg-apple-gray-50 rounded-apple-xl p-6">
            <div className="w-14 h-14 bg-apple-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-apple-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-[24px] font-bold text-apple-gray-800 mb-2 tracking-tight">
              조금 더 살펴볼게요
            </h2>
            <p className="text-[15px] text-apple-gray-500 mb-4">
              지금 상황에선 계획을 세우기 어려워요
            </p>
            <div className="bg-white rounded-apple-lg p-4 mb-6">
              <p className="text-[14px] font-semibold text-apple-gray-700 mb-2">전문가와 상담이 필요해요</p>
              <p className="text-[13px] text-apple-gray-500 leading-relaxed">
                복잡한 상황이라 정확한 판단을 위해선 변호사와 상담이 필요합니다.
              </p>
            </div>
            <button
              onClick={handleConsultationClick}
              className="w-full bg-apple-blue-500 hover:bg-apple-blue-600 active:bg-apple-blue-700 active:scale-[0.98] text-white font-semibold py-4 rounded-apple-lg transition-all duration-200 text-[17px] shadow-apple-button"
            >
              무료 상담받기
            </button>
          </div>
        ) : (
          <>
            {/* 결과 헤더 - Apple 스타일 */}
            <div className="text-center mb-6">
              <p className="text-[15px] font-medium text-apple-blue-500 mb-2">
                개인회생으로 새 출발이 가능해요
              </p>
            </div>

            {/* 결과 카드 - Apple 스타일 */}
            <div className="bg-apple-gray-50 rounded-apple-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-6">
                {/* 원형 프로그레스 */}
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" stroke="#E8E8ED" strokeWidth="6" fill="none" />
                    <circle
                      cx="50" cy="50" r="46"
                      stroke="#0071E3" strokeWidth="6" fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'none' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[28px] font-bold text-apple-gray-800 tracking-tight tabular-nums">{animatedRate}%</span>
                    <span className="text-[12px] text-apple-gray-400">탕감률</span>
                  </div>
                </div>

                {/* 금액 정보 */}
                <div className="text-left">
                  <div className="mb-4">
                    <p className="text-[12px] text-apple-gray-400 mb-1">예상 탕감액</p>
                    <p className="text-[22px] font-bold text-apple-blue-500 tracking-tight tabular-nums">
                      {animatedAmount.toLocaleString()}원
                    </p>
                  </div>
                  <div className="pt-3 border-t border-apple-gray-200">
                    <p className="text-[12px] text-apple-gray-400 mb-1">월 상환액</p>
                    <p className="text-[18px] font-bold text-apple-gray-800 tracking-tight tabular-nums">
                      {Math.round(result.monthlyPayment).toLocaleString()}원
                    </p>
                    <p className="text-[12px] text-apple-gray-400">({result.repaymentPeriod}개월)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 긴급성 메시지 - Apple 스타일 */}
            <div className="bg-red-50 rounded-apple-lg px-4 py-3 mb-6 border border-red-100">
              <p className="text-[14px] font-semibold text-red-600 text-center">
                하루 미룰 때마다 +{Math.round(formData.totalDebt * 0.20 / 365).toLocaleString()}원 이자 발생
              </p>
            </div>
          </>
        )}

        {/* 블랙스톤 CTA - Apple 스타일 */}
        {canShowCelebration && (
          <div className="bg-apple-gray-800 rounded-apple-xl p-5 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apple-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-apple-green-500"></span>
              </span>
              <span className="text-apple-green-500 text-[13px] font-medium">지금 상담 가능</span>
            </div>

            <p className="text-white font-bold text-[17px] text-center mb-1">블랙스톤 법률사무소</p>
            <p className="text-apple-gray-400 text-[13px] text-center mb-4">개인회생 전문</p>

            <div className="bg-apple-gray-700 rounded-apple-lg p-4 mb-4">
              <p className="text-apple-gray-300 text-[12px] font-medium mb-2">무료 상담 시 확인 가능</p>
              <ul className="text-apple-gray-400 text-[12px] space-y-1.5">
                <li>• 내 상황에 맞는 정확한 탕감률</li>
                <li>• 기각 위험 요소 사전 점검</li>
                <li>• 압류/독촉 즉시 해결 방법</li>
              </ul>
            </div>

            <button
              onClick={handleConsultationClick}
              className="w-full bg-[#FEE500] hover:bg-[#F5DC00] active:scale-[0.98] text-[#3C1E1E] font-bold py-4 rounded-apple-lg transition-all duration-200 text-[17px]"
            >
              무료 상담받기
            </button>

            <p className="text-apple-gray-400 text-[13px] text-center mt-3">
              전화상담 <button onClick={() => setShowContactModal(true)} className="text-white font-medium">02-6101-3100</button>
            </p>
          </div>
        )}

        {/* 네비게이션 - Apple 스타일 */}
        <div className="mt-auto pt-4">
          <div className="flex justify-center gap-6 text-[15px]">
            <button onClick={onBack} className="text-apple-gray-400 hover:text-apple-gray-600 transition-colors">
              이전
            </button>
            <div className="w-px bg-apple-gray-200"></div>
            <button onClick={onRestart} className="text-apple-blue-500 hover:text-apple-blue-600 transition-colors font-medium">
              처음부터
            </button>
          </div>
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
    </>
  );
}
