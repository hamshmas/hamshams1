"use client";

import { useState, useEffect } from "react";
import type { FormData, CalculationResult, HousingType, MaritalStatus } from "@/app/types";
import { getCourtName } from "@/utils/courtJurisdiction";
import { generateConsultationMessage } from "@/utils/generateConsultationMessage";
import { ConsultationModal, CopySuccessNotification } from "@/app/components/consultation";
import { KAKAO_CONSULTATION_URL, COPY_SUCCESS_NOTIFICATION_DURATION } from "@/app/config/consultation";
import { supabase } from "@/lib/supabase";

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
}: ResultPageProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [animatedRate, setAnimatedRate] = useState(0);
  const [animatedAmount, setAnimatedAmount] = useState(0);

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
      } else {
        setAnimatedRate(Math.round(rateIncrement * currentStep));
        setAnimatedAmount(Math.round(amountIncrement * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [result.reductionRate, result.reductionAmount]);

  // 결과 페이지 도달 시 Supabase에 데이터 저장
  useEffect(() => {
    const saveResultData = async () => {
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

        // Supabase에 저장
        const { data, error } = await supabase
          .from('calculation_results')
          .insert([resultData]);

        if (error) {
          console.error('[Supabase] 데이터 저장 실패:', error);
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

    // 상담 신청 정보 콘솔 로그
    console.log('[Consultation] 상담 신청:', {
      name,
      phone,
      totalDebt: formData.totalDebt,
      monthlyIncome: formData.monthlyIncome,
      reductionRate: result.reductionRate,
      timestamp: new Date().toISOString(),
    });

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

  // 채무액과 재산 비교
  const hasMoreAssetThanDebt = formData.assetValue >= formData.totalDebt;
  // 가용소득 체크 (채무액이 재산보다 많은 경우만)
  const hasNoIncome = !hasMoreAssetThanDebt && result.monthlyPayment <= 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      {hasMoreAssetThanDebt ? (
        // 노란불: 채무액보다 재산이 많은 경우
        <div className="text-center mb-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-2 border-yellow-300">
          <h2 className="text-2xl font-extrabold text-amber-800 mb-2 drop-shadow-sm">
            개인회생 신청 불가
          </h2>
          <p className="text-amber-800 text-sm max-w-sm mx-auto mb-3">
            채무액보다 재산이 많아 개인회생 신청이 불가능합니다
          </p>
          <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-300 rounded-xl p-3 max-w-sm mx-auto shadow-md">
            <p className="text-sm text-amber-900 font-semibold">
              💡 재산으로 채무 상환이 가능한 상태입니다
            </p>
          </div>
        </div>
      ) : hasNoIncome ? (
        // 노란불: 가용소득 부족 (개인파산 안내)
        <div className="text-center mb-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-2 border-yellow-300">
          <h2 className="text-2xl font-extrabold text-amber-800 mb-2 drop-shadow-sm">
            개인회생 신청 불가
          </h2>
          <p className="text-amber-800 text-sm max-w-sm mx-auto mb-3">
            가용소득이 없어 개인회생을 진행할 수 없습니다
          </p>
          <div className="bg-white/90 backdrop-blur-sm border-2 border-blue-300 rounded-xl p-3 max-w-sm mx-auto shadow-md">
            <p className="text-sm text-blue-900 font-semibold">
              💡 개인파산을 고려해보실 수 있습니다
            </p>
          </div>
        </div>
      ) : result.liquidationValueViolation ? (
        // 노란불: 청산가치 위반
        <div className="text-center mb-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-2 border-yellow-300">
          <h2 className="text-2xl font-extrabold text-amber-800 mb-2 drop-shadow-sm">
            개인회생 신청 불가
          </h2>
          <p className="text-amber-800 text-sm max-w-sm mx-auto">
            청산가치를 충족하면서 총 부채액을 초과하지 않는 변제계획을 수립할 수 없습니다
          </p>
        </div>
      ) : (
        // 초록불: 개인회생 가능
        <div className="text-center mb-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-8 shadow-2xl border-2 border-green-200">
          <h2 className="text-3xl font-black text-green-700 mb-4 animate-fadeIn drop-shadow-sm">
            개인회생이 가능합니다!
          </h2>
          <p className="text-green-700 font-semibold text-base mb-4">예상 탕감률</p>
          <div className="relative inline-block animate-scaleIn">
            <svg className="w-40 h-40 transform -rotate-90 drop-shadow-xl" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="54" stroke="#e5e7eb" strokeWidth="8" fill="none" />
              <circle
                cx="60" cy="60" r="54" stroke="url(#goldGradient)" strokeWidth="8" fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl font-black bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                {animatedRate}%
              </div>
            </div>
          </div>
          <div className="mt-3 bg-white/80 backdrop-blur-sm border-2 border-amber-300 rounded-xl p-3 shadow-lg">
            <p className="text-gray-700 text-sm font-semibold">
              약 <span className="font-black text-lg bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">{animatedAmount.toLocaleString()}원</span> 탕감 예상
            </p>
          </div>
          {result.consultationReason && (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-emerald-300 rounded-xl p-3 max-w-sm mx-auto mt-3 shadow-md">
              <p className="text-sm text-emerald-900 font-semibold">
                💡 {result.consultationReason}
              </p>
            </div>
          )}
        </div>
      )}

      {!hasNoIncome && !result.liquidationValueViolation && (
        <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-4 space-y-2`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-lg">💰</span>
            <h3 className="font-black text-gray-900 text-base">상세 내역</h3>
          </div>
          <div className="grid gap-2">
            {/* 총 부채액 */}
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/60">
              <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <span className="text-base">💸</span> 총 부채액
              </span>
              <span className="font-black text-base text-gray-900">
                {Math.round(formData.totalDebt).toLocaleString()}원
              </span>
            </div>

            {/* 예상 변제액 (확장형) */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                  <span className="text-base">💵</span> 예상 변제액
                </span>
                <span className="font-black text-base text-gray-900">
                  {Math.round(result.repaymentAmount).toLocaleString()}원
                </span>
              </div>
              <div className="space-y-1 pt-2 border-t border-blue-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">• 실제 납부 총액</span>
                  <span className="text-gray-700 font-semibold">
                    {Math.round(result.monthlyPayment * result.repaymentPeriod).toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">• 현재가치 (라이프니츠식)</span>
                  <span className="text-gray-700 font-semibold">
                    {Math.round(result.repaymentAmount).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 월 상환액 */}
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200">
              <span className="text-primary-700 font-bold flex items-center gap-1.5 text-sm">
                <span className="text-base">📅</span> 월 상환액
              </span>
              <span className="font-black text-base text-primary-600">
                {Math.round(result.monthlyPayment).toLocaleString()}원
              </span>
            </div>

            {/* 변제 기간 */}
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200">
              <span className="text-primary-700 font-bold flex items-center gap-1.5 text-sm">
                <span className="text-base">⏱️</span> 변제 기간
              </span>
              <span className="font-black text-base text-primary-600">
                {result.repaymentPeriod}개월
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-lg">📋</span>
          <h3 className="font-black text-gray-900 text-base">입력 정보</h3>
        </div>
        <div className="grid gap-1.5">
          {/* 월 소득 */}
          <div className="flex justify-between items-center py-1.5 px-3 bg-white/60 rounded-lg">
            <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
              <span className="text-base">💼</span> 월 소득
            </span>
            <span className="text-gray-900 font-bold text-sm">
              {Math.round(formData.monthlyIncome).toLocaleString()}원
            </span>
          </div>

          {/* 총 채무액 */}
          <div className="flex justify-between items-center py-1.5 px-3 bg-white/60 rounded-lg">
            <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
              <span className="text-base">💸</span> 총 채무액
            </span>
            <span className="text-gray-900 font-bold text-sm">
              {Math.round(formData.totalDebt).toLocaleString()}원
            </span>
          </div>

          {/* 월 변제 가능액 */}
          <div className="flex justify-between items-center py-1.5 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
              <span className="text-base">💵</span> 월 변제 가능액
            </span>
            <span className="text-blue-700 font-bold text-sm">
              {Math.round(result.monthlyPayment).toLocaleString()}원
            </span>
          </div>

          {/* 청산가치 */}
          {assetInputMode === 'calculate' && (housingAsset !== undefined || otherAsset !== undefined) ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                  <span className="text-base">🏠</span> 청산가치
                </span>
                <span className="text-gray-900 font-bold text-sm">
                  {Math.round(formData.assetValue).toLocaleString()}원
                </span>
              </div>
              <div className="space-y-1 pt-2 border-t border-green-200">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">• 주거 자산</span>
                    <span className="text-gray-700 font-semibold">
                      {Math.round(housingAsset || 0).toLocaleString()}원
                    </span>
                  </div>

                  {/* 자가 주택의 경우 */}
                  {housingType === 'owned' && kbPrice && kbPrice > 0 && (
                    <div className="ml-3 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">  - KB 시세</span>
                        <span className="text-gray-600">
                          {Math.round(kbPrice).toLocaleString()}원
                        </span>
                      </div>
                      {hasMortgage && mortgageAmount && mortgageAmount > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">  - 근저당권 공제</span>
                          <span className="text-gray-600">
                            -{Math.round(mortgageAmount).toLocaleString()}원
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 전세/월세의 경우 최우선변제액 표시 */}
                  {(housingType === 'jeonse' || housingType === 'monthly') && depositAmount && depositAmount > 0 && (
                    <div className="ml-3 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">  - 보증금</span>
                        <span className="text-gray-600">
                          {Math.round(depositAmount).toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">  - 최우선변제액 공제</span>
                        <span className="text-gray-600">
                          -{Math.round(depositAmount - (housingAsset || 0)).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 무상거주 - 배우자 명의의 경우 */}
                  {housingType === 'free' && isSpouseHousing && (
                    <div className="ml-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">  - 배우자 명의 주택</span>
                        <span className="text-gray-600">
                          {kbPrice && kbPrice > 0 ? (
                            <>
                              {Math.round(kbPrice).toLocaleString()}원
                              {hasMortgage && mortgageAmount && mortgageAmount > 0 && (
                                <span className="ml-1 text-[10px]">
                                  (근저당: {Math.round(mortgageAmount).toLocaleString()}원)
                                </span>
                              )}
                            </>
                          ) : '0원'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">• 기타 자산</span>
                  <span className="text-gray-700 font-semibold">
                    {Math.round(otherAsset || 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center py-1.5 px-3 bg-white/60 rounded-lg">
              <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <span className="text-base">🏠</span> 청산가치
              </span>
              <span className="text-gray-900 font-bold text-sm">
                {Math.round(formData.assetValue).toLocaleString()}원
              </span>
            </div>
          )}

          {/* 관할법원 정보 */}
          <div className="flex justify-between items-center py-1.5 px-3 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-lg">
            <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
              <span className="text-base">⚖️</span> 관할법원
            </span>
            <span className="text-primary-700 font-bold text-sm">
              {getCourtName(formData.courtJurisdiction)}
            </span>
          </div>

          {/* 부양가족수 */}
          <div className="flex justify-between items-center py-1.5 px-3 bg-white/60 rounded-lg">
            <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
              <span className="text-base">👨‍👩‍👧‍👦</span> 부양가족수
            </span>
            <span className="text-gray-900 font-bold text-sm">
              {formData.dependents}명
            </span>
          </div>
        </div>
      </div>


      {/* 탕감률 20% 이하 - 상담 권유 */}
      {!hasNoIncome && !result.liquidationValueViolation && !result.needsConsultation && result.reductionRate <= 20 && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-2xl p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">💡</span>
            <p className="text-sm font-bold text-purple-900">더 나은 방안이 있을 수 있습니다</p>
          </div>

          <div className="bg-white/80 rounded-lg p-3">
            <p className="text-xs text-gray-800 leading-relaxed">
              탕감률이 <span className="font-bold text-purple-700">{Math.round(result.reductionRate)}%</span>로 낮은 편입니다.
              개인회생 외에도 <span className="font-semibold">채무조정, 워크아웃</span> 등
              더 유리한 해결 방안이 있을 수 있습니다.
            </p>
          </div>

          <div className="bg-purple-600 rounded-lg p-2.5">
            <p className="text-xs text-white font-semibold text-center">
              전문가 상담을 통해 최적의 해결방안을 찾아보세요!
            </p>
          </div>
        </div>
      )}

      {/* 상담 혜택 안내 - 모든 경우에 표시 */}
      {!hasNoIncome && !result.liquidationValueViolation && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">✨</span>
            <p className="text-sm font-bold text-green-900">전문 변호사 상담의 이점</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <p className="text-xs text-gray-800 flex-1">
                <span className="font-semibold">무료 상담</span>으로 정확한 법률 검토
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <p className="text-xs text-gray-800 flex-1">
                개인 상황에 맞는 <span className="font-semibold">최적의 해결책</span> 제시
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <p className="text-xs text-gray-800 flex-1">
                서류 작성부터 법원 제출까지 <span className="font-semibold">전 과정 지원</span>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <p className="text-xs text-gray-800 flex-1">
                승인율을 높이는 <span className="font-semibold">전문적인 변제계획</span> 수립
              </p>
            </div>
          </div>

          <button
            onClick={handleConsultationClick}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg p-3 text-center transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <p className="text-white font-bold text-sm mb-1">지금 바로 상담받고</p>
            <p className="text-white text-xs">빠르게 문제를 해결하세요!</p>
          </button>
        </div>
      )}

      <div className="space-y-3">
        {result.needsConsultation ? (
          // 노란불: 전문가 상담 필요 - 강조된 버튼
          <div className="space-y-2">
            <button
              onClick={handleConsultationClick}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-extrabold py-4 px-4 rounded-xl transition-all shadow-xl hover:shadow-2xl text-center text-base animate-pulse"
            >
              🚀 무료 변호사 상담 신청하기
            </button>
            <p className="text-center text-xs text-gray-600">
              💬 카카오톡으로 간편하게 상담 가능
            </p>
          </div>
        ) : (
          // 일반 상담 버튼
          <div className="space-y-2">
            <button
              onClick={handleConsultationClick}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-center text-base hover:scale-105 transform"
            >
              💬 무료 변호사 상담 신청하기
            </button>
            <p className="text-center text-xs text-gray-600">
              📱 간단한 정보 입력 후 카카오톡으로 바로 연결
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onBack} className="secondary-button text-sm py-2.5">
            ← 이전
          </button>
          <button onClick={onRestart} className="secondary-button text-sm py-2.5">
            처음부터 →
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
      />
    </div>
  );
}
