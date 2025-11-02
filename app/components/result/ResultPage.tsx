"use client";

import { useState } from "react";
import type { FormData, CalculationResult, HousingType, MaritalStatus } from "@/app/types";
import { getCourtName } from "@/utils/courtJurisdiction";
import { generateConsultationMessage } from "@/utils/generateConsultationMessage";
import { ConsultationModal, CopySuccessNotification } from "@/app/components/consultation";
import { KAKAO_CONSULTATION_URL, COPY_SUCCESS_NOTIFICATION_DURATION } from "@/app/config/consultation";

interface ResultPageProps {
  result: CalculationResult;
  formData: FormData;
  onRestart: () => void;
  // 자산 상세 정보
  assetInputMode?: 'direct' | 'calculate' | null;
  housingType?: HousingType | null;
  hasMortgage?: boolean | null;
  mortgageAmount?: number;
  kbPrice?: number;
  depositAmount?: number;
  isSpouseHousing?: boolean | null;
  // 부양가족 상세 정보
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number;
  hasNoSpouseIncome?: boolean | null;
}

export function ResultPage({
  result,
  formData,
  onRestart,
  assetInputMode,
  housingType,
  hasMortgage,
  mortgageAmount,
  kbPrice,
  depositAmount,
  isSpouseHousing,
  maritalStatus,
  childrenCount,
  hasNoSpouseIncome,
}: ResultPageProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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
    // 메시지 생성
    const message = generateConsultationMessage({
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

    // 클립보드에 복사하고 카카오톡 채널 열기
    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), COPY_SUCCESS_NOTIFICATION_DURATION);

      window.open(KAKAO_CONSULTATION_URL, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert("클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.");
    }
  };
  const getColorByRate = (rate: number) => {
    if (rate >= 70) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', stroke: '#16a34a' };
    if (rate >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', stroke: '#ca8a04' };
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', stroke: '#dc2626' };
  };

  const colors = getColorByRate(result.reductionRate);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (result.reductionRate / 100) * circumference;

  // 가용소득 체크
  const hasNoIncome = result.monthlyPayment <= 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      {hasNoIncome ? (
        <div className="text-center mb-4">
          <div className="relative inline-block animate-scaleIn mb-3">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-xl">
              <span className="text-6xl">💸</span>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            개인회생 신청 불가
          </h2>
          <p className="text-gray-700 text-sm max-w-sm mx-auto">
            가용소득이 없어 개인회생을 진행할 수 없습니다
          </p>
        </div>
      ) : result.liquidationValueViolation ? (
        <div className="text-center mb-4">
          <div className="relative inline-block animate-scaleIn mb-3">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-xl">
              <span className="text-6xl">🚨</span>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">
            개인회생 신청 불가
          </h2>
          <p className="text-gray-700 text-sm max-w-sm mx-auto">
            청산가치를 충족하면서 총 부채액을 초과하지 않는 변제계획을 수립할 수 없습니다
          </p>
        </div>
      ) : (
        <div className="text-center mb-4">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-3">
            예상 탕감률
          </h2>
          <div className="relative inline-block animate-scaleIn">
            <svg className="w-40 h-40 transform -rotate-90 drop-shadow-xl" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" stroke="#e5e7eb" strokeWidth="8" fill="none" />
              <circle
                cx="60" cy="60" r="54" stroke={colors.stroke} strokeWidth="8" fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-4xl font-black ${colors.text}`}>
                {Math.round(result.reductionRate)}%
              </div>
            </div>
          </div>
          <div className="mt-3 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl p-3">
            <p className="text-gray-700 text-sm">
              약 <span className="font-black text-lg text-transparent bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text">{Math.round(result.reductionAmount).toLocaleString()}원</span> 탕감 예상
            </p>
          </div>
        </div>
      )}

      {!hasNoIncome && !result.liquidationValueViolation && (
        <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-4 space-y-2`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-lg">💰</span>
            <h3 className="font-black text-gray-900 text-base">상세 내역</h3>
          </div>
          <div className="grid gap-2">
            {[
              { icon: '💸', label: '총 부채액', value: formData.totalDebt },
              { icon: '💵', label: '예상 변제액', value: result.repaymentAmount },
              { icon: '📅', label: '월 상환액', value: result.monthlyPayment, highlight: true },
              { icon: '⏱️', label: '변제 기간', value: result.repaymentPeriod, unit: '개월', highlight: true },
            ].map((item, i) => (
              <div key={i} className={`flex justify-between items-center py-2 px-3 rounded-lg ${item.highlight ? 'bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200' : 'bg-white/60'}`}>
                <span className={`${item.highlight ? 'text-primary-700 font-bold' : 'text-gray-700 font-semibold'} flex items-center gap-1.5 text-sm`}>
                  <span className="text-base">{item.icon}</span> {item.label}
                </span>
                <span className={`font-black text-base ${item.highlight ? 'text-primary-600' : 'text-gray-900'}`}>
                  {typeof item.value === 'number' ? Math.round(item.value).toLocaleString() : item.value}{item.unit || '원'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-lg">📋</span>
          <h3 className="font-black text-gray-900 text-base">입력 정보</h3>
        </div>
        <div className="grid gap-1.5">
          {[
            { icon: '💼', label: '월 소득', value: formData.monthlyIncome },
            { icon: '🏠', label: '자산 가액', value: formData.assetValue },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 px-3 bg-white/60 rounded-lg">
              <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <span className="text-base">{item.icon}</span> {item.label}
              </span>
              <span className="text-gray-900 font-bold text-sm">
                {typeof item.value === 'number' ? Math.round(item.value).toLocaleString() : item.value}원
              </span>
            </div>
          ))}

          {/* 관할법원 정보 */}
          <div className="flex justify-between items-center py-1.5 px-3 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-lg">
            <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
              <span className="text-base">⚖️</span> 관할법원
            </span>
            <span className="text-primary-700 font-bold text-sm">
              {getCourtName(formData.courtJurisdiction)}
            </span>
          </div>

          {/* 집 주소 */}
          {formData.homeAddress && (
            <div className="py-1.5 px-3 bg-white/60 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">📍</span>
                <span className="text-gray-700 font-semibold text-sm">집 주소</span>
              </div>
              <p className="text-xs text-gray-600 pl-6">{formData.homeAddress}</p>
            </div>
          )}

          {/* 부양가족수 - 별도 스타일링 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mt-1">
            <div className="flex justify-between items-start">
              <span className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <span className="text-base">👨‍👩‍👧‍👦</span> 부양가족수
              </span>
              <span className="text-gray-900 font-bold text-sm">
                {formData.dependents.toLocaleString()}명
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-[11px] text-gray-600 leading-relaxed">
                <span className="font-semibold text-blue-700">💡 계산 방식:</span><br/>
                • 기혼 기본: (자녀수 ÷ 2) + 1<br/>
                • 기혼 + 주요법원 + 배우자 소득無: 자녀수 + 1<br/>
                • 미혼/이혼: 자녀수 + 1
              </p>
            </div>
          </div>
        </div>
      </div>

      {hasNoIncome ? (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4">
          <p className="text-sm font-bold text-orange-900 mb-2">상세 정보</p>
          <div className="space-y-1.5 text-xs text-orange-800">
            <p>• 월 소득: {Math.round(formData.monthlyIncome).toLocaleString()}원</p>
            <p>• 최저생계비: 소득에서 최저생계비를 차감한 금액</p>
            <p>• 월 변제 가능액: {Math.round(result.monthlyPayment).toLocaleString()}원</p>
            <p className="pt-1.5 border-t border-orange-200 font-semibold">
              💡 개인회생을 진행하려면 월 소득에서 최저생계비를 제외한 가용소득이 있어야 합니다. 현재 조건으로는 변제 가능한 소득이 없습니다.
            </p>
            <p className="font-semibold text-orange-900">
              ⚠️ 변호사와 상담하여 다른 해결방안을 모색하시기 바랍니다.
            </p>
          </div>
        </div>
      ) : result.liquidationValueViolation ? (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
          <p className="text-sm font-bold text-red-900 mb-2">상세 정보</p>
          <div className="space-y-1.5 text-xs text-red-800">
            <p>• 총 부채액: {Math.round(formData.totalDebt).toLocaleString()}원</p>
            <p>• 청산가치: {Math.round(formData.assetValue).toLocaleString()}원</p>
            <p>• 월 변제 가능액: {Math.round(result.monthlyPayment).toLocaleString()}원</p>
            <p className="pt-1.5 border-t border-red-200 font-semibold">
              💡 개인회생을 진행하려면 청산가치 이상을 변제하되 총 부채액을 초과할 수 없습니다. 현재 조건으로는 이를 충족하는 변제계획 수립이 어렵습니다.
            </p>
            <p className="font-semibold text-red-900">
              ⚠️ 변호사와 상담하여 다른 해결방안을 모색하시기 바랍니다.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3">
            <p className="font-bold text-blue-900 text-xs mb-1">📊 계산 방식</p>
            <p className="text-[11px] text-blue-800">
              라이프니츠식(법정이율 연 5%)으로 계산. 기본 변제기간은 36개월이며, 전액 변제 시 단축되거나 청산가치 충족을 위해 최대 60개월까지 연장될 수 있습니다.
            </p>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3">
            <p className="font-bold text-amber-900 text-xs mb-1">⚠️ 안내사항</p>
            <p className="text-[11px] text-amber-800">
              이 결과는 참고용이며, 실제 탕감률은 법원 판단과 개인 상황에 따라 달라질 수 있습니다.
            </p>
          </div>
        </>
      )}

      <div className="space-y-2">
        <button
          onClick={handleConsultationClick}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-center text-sm"
        >
          💬 지금 상담신청하기
        </button>
        <button onClick={onRestart} className="w-full secondary-button text-sm py-2.5">
          다시 계산하기
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
      />
    </div>
  );
}
