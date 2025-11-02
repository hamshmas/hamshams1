"use client";

interface CopySuccessNotificationProps {
  isVisible: boolean;
}

export function CopySuccessNotification({ isVisible }: CopySuccessNotificationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slideDown">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-green-400 max-w-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl">✅</span>
          <div className="flex-1">
            <p className="font-bold text-base mb-1">상담 정보가 복사되었습니다!</p>
            <p className="text-sm text-green-50">
              카카오톡 채팅창에서 <strong className="text-white">붙여넣기 (Ctrl+V 또는 Cmd+V)</strong>를 해주세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
