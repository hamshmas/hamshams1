"use client";

interface ContactInfoInputProps {
  name: string;
  phone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export function ContactInfoInput({
  name,
  phone,
  onNameChange,
  onPhoneChange
}: ContactInfoInputProps) {
  // 전화번호 포맷팅 (숫자만 입력)
  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    onPhoneChange(numbersOnly);
  };

  // 전화번호 표시 포맷 (010-1234-5678)
  const formatPhoneDisplay = (phone: string) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 7) return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7, 11)}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-2">
          연락처 정보
        </h2>
        <p className="text-gray-600 text-sm">
          계산 결과를 받으실 연락처를 입력해주세요
        </p>
      </div>

      <div className="space-y-4">
        {/* 이름 입력 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="홍길동"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:outline-none transition-colors text-base"
            maxLength={20}
          />
        </div>

        {/* 전화번호 입력 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            전화번호
          </label>
          <input
            type="tel"
            value={formatPhoneDisplay(phone)}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:outline-none transition-colors text-base"
            maxLength={13}
          />
          <p className="text-xs text-gray-500 mt-1">
            숫자만 입력해주세요
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mt-4">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">개인정보 처리방침:</span> 입력하신 정보는 상담 목적으로만 사용되며, 안전하게 보관됩니다.
        </p>
      </div>
    </div>
  );
}
