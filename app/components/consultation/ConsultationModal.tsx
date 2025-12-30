"use client";

interface ConsultationModalProps {
  isOpen: boolean;
  name: string;
  phone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ConsultationModal({
  isOpen,
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onCancel,
  onSubmit,
}: ConsultationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-3">
            <span className="text-3xl">💬</span>
          </div>
          <h3 className="text-xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            무료 변호사 상담 신청
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            간단한 정보만 입력하면 바로 상담 가능합니다
          </p>

          {/* 신뢰 배지 */}
          <div className="flex justify-center gap-3 mt-3">
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
              <span className="text-green-600 text-xs">✓</span>
              <span className="text-xs text-green-700 font-semibold">100% 무료</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
              <span className="text-blue-600 text-xs">🔒</span>
              <span className="text-xs text-blue-700 font-semibold">개인정보 보호</span>
            </div>
            <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-full">
              <span className="text-purple-600 text-xs">⚡</span>
              <span className="text-xs text-purple-700 font-semibold">즉시 응답</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">📱</span>
            <div className="flex-1 text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-1.5 text-blue-800">카카오톡으로 간편하게 상담</p>
              <p className="mb-0.5">1️⃣ 확인 버튼을 누르면 정보가 자동 복사됩니다</p>
              <p className="mb-0.5">2️⃣ 카카오톡 상담 채널이 자동으로 열립니다</p>
              <p>3️⃣ 채팅창에 <strong>붙여넣기</strong>만 하면 바로 상담 시작!</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
              placeholder="홍길동"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              연락처
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
              placeholder="010-1234-5678"
              onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
            />
          </div>
        </div>

        {/* 안심 메시지 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2.5 text-center">
          <p className="text-xs text-green-800">
            <span className="font-bold">💬 무료 법률 상담</span>으로 정확한 솔루션을 받아보세요
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            평균 응답 시간: <strong>5분 이내</strong>
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all text-sm"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm hover:scale-105 transform"
          >
            카카오톡 상담 시작
          </button>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-xs text-gray-500 pt-1">
          상담은 <span className="font-semibold text-gray-700">완전 무료</span>이며, 개인정보는 안전하게 보호됩니다
        </p>
      </div>
    </div>
  );
}
