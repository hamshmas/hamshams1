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
          <h3 className="text-xl font-extrabold text-gray-900">
            상담 신청 정보
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            상담을 위한 정보를 입력해주세요
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="flex-1 text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-1">확인을 누르면:</p>
              <p>1️⃣ 입력한 정보가 자동으로 복사됩니다</p>
              <p>2️⃣ 카카오톡 상담 채널이 열립니다</p>
              <p>3️⃣ 채팅창에서 <strong>붙여넣기</strong>만 하시면 됩니다</p>
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

        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition-all text-sm"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg text-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
