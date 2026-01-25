"use client";
import { useState, useEffect } from "react";
import type { MaritalStatus, CourtCode } from "@/app/types";

interface DependentIntegratedFormProps {
  onNext: (dependents: number) => void;
  onBack: () => void;
  courtJurisdiction: CourtCode;
  isMarriedForAsset: boolean | null;
}

export function DependentIntegratedForm({
  onNext,
  onBack,
  courtJurisdiction,
  isMarriedForAsset,
}: DependentIntegratedFormProps) {
  const [inputMode, setInputMode] = useState<"direct" | "calculate" | null>(
    null
  );
  const [directValue, setDirectValue] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(
    isMarriedForAsset === true ? "married" : null
  );
  const [childrenCount, setChildrenCount] = useState("");
  const [hasNoSpouseIncome, setHasNoSpouseIncome] = useState<boolean | null>(
    null
  );

  const isMainCourt = ["seoul", "suwon", "daejeon", "busan"].includes(
    courtJurisdiction
  );
  const showSpouseIncome = maritalStatus === "married" && isMainCourt;

  useEffect(() => {
    if (isMarriedForAsset === true) {
      setMaritalStatus("married");
    }
  }, [isMarriedForAsset]);

  const calculateDependents = (): number => {
    if (inputMode === "direct") return parseInt(directValue) || 1;

    const children = parseInt(childrenCount) || 0;
    if (maritalStatus === "married") {
      if (isMainCourt && hasNoSpouseIncome) return children + 1;
      return children / 2 + 1;
    }
    return children + 1;
  };

  const isValid =
    inputMode === "direct"
      ? directValue && parseInt(directValue) >= 1
      : maritalStatus &&
      childrenCount !== "" &&
      (!showSpouseIncome || hasNoSpouseIncome !== null);

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 제목 - Apple 스타일 */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-apple-gray-800 leading-tight tracking-tight mb-3">
          부양가족 수를 입력해주세요
        </h2>
        <p className="text-[15px] text-apple-gray-500">마지막 단계예요!</p>
      </div>

      <div className="flex-1 space-y-6">
        {/* 입력 모드 선택 - Apple 스타일 */}
        <div className="space-y-3">
          <label className="text-[14px] font-semibold text-apple-gray-600">입력 방식</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setInputMode("direct")}
              className={`p-4 rounded-apple-lg text-center transition-all duration-200 ${inputMode === "direct"
                  ? "bg-apple-blue-50 border-2 border-apple-blue-500"
                  : "bg-apple-gray-50 border-2 border-transparent hover:bg-apple-gray-100"
                }`}
            >
              <p className={`font-semibold text-[15px] ${inputMode === "direct" ? "text-apple-blue-500" : "text-apple-gray-800"
                }`}>직접 입력</p>
              <p className="text-[13px] text-apple-gray-400 mt-1">숫자를 알고 있어요</p>
            </button>
            <button
              onClick={() => setInputMode("calculate")}
              className={`p-4 rounded-apple-lg text-center transition-all duration-200 ${inputMode === "calculate"
                  ? "bg-apple-blue-50 border-2 border-apple-blue-500"
                  : "bg-apple-gray-50 border-2 border-transparent hover:bg-apple-gray-100"
                }`}
            >
              <p className={`font-semibold text-[15px] ${inputMode === "calculate" ? "text-apple-blue-500" : "text-apple-gray-800"
                }`}>자동 계산</p>
              <p className="text-[13px] text-apple-gray-400 mt-1">잘 모르겠어요</p>
            </button>
          </div>
        </div>

        {/* 직접 입력 모드 - Apple 스타일 */}
        {inputMode === "direct" && (
          <div className="space-y-3 animate-fadeIn">
            <label className="text-[14px] font-semibold text-apple-gray-600">
              본인 포함 함께 사는 가족 수
            </label>
            <div className="flex items-baseline border-b-2 border-apple-gray-200 focus-within:border-apple-blue-500 transition-all duration-200 pb-3">
              <input
                type="number"
                inputMode="numeric"
                value={directValue}
                onChange={(e) => setDirectValue(e.target.value)}
                className="flex-1 text-[36px] font-bold text-apple-gray-800 outline-none bg-transparent placeholder:text-apple-gray-300 tracking-tight"
                placeholder="1"
                min="1"
                autoFocus
              />
              <span className="text-[18px] font-medium text-apple-gray-400 ml-2">
                명
              </span>
            </div>
            <p className="text-[13px] text-apple-gray-400">
              혼자 살면 1명, 배우자와 둘이면 2명
            </p>
          </div>
        )}

        {/* 자동 계산 모드 - Apple 스타일 */}
        {inputMode === "calculate" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 혼인 상태 */}
            {isMarriedForAsset !== true && (
              <div className="space-y-3">
                <label className="text-[14px] font-semibold text-apple-gray-600">
                  혼인 상태
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["single", "married", "divorced"] as MaritalStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setMaritalStatus(status);
                          setHasNoSpouseIncome(null);
                        }}
                        className={`p-3 rounded-apple text-[14px] font-semibold transition-all duration-200 ${maritalStatus === status
                            ? "bg-apple-blue-500 text-white shadow-apple-sm"
                            : "bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200"
                          }`}
                      >
                        {status === "single"
                          ? "미혼"
                          : status === "married"
                            ? "기혼"
                            : "이혼"}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* 자녀 수 */}
            {(maritalStatus || isMarriedForAsset === true) && (
              <div className="space-y-3 animate-fadeIn">
                <label className="text-[14px] font-semibold text-apple-gray-600">
                  미성년 자녀 수
                </label>
                <div className="flex items-baseline border-b-2 border-apple-gray-200 focus-within:border-apple-blue-500 transition-all duration-200 pb-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(e.target.value)}
                    className="flex-1 text-[36px] font-bold text-apple-gray-800 outline-none bg-transparent placeholder:text-apple-gray-300 tracking-tight"
                    placeholder="0"
                    min="0"
                    autoFocus
                  />
                  <span className="text-[18px] font-medium text-apple-gray-400 ml-2">
                    명
                  </span>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setChildrenCount(String(num))}
                      className={`px-4 py-2 rounded-apple text-[14px] font-medium transition-all duration-200 ${childrenCount === String(num)
                          ? "bg-apple-blue-500 text-white"
                          : "bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200"
                        }`}
                    >
                      {num}명
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 배우자 소득 */}
            {showSpouseIncome && childrenCount !== "" && (
              <div className="space-y-3 animate-fadeIn">
                <label className="text-[14px] font-semibold text-apple-gray-600">
                  배우자 소득 유무
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setHasNoSpouseIncome(true)}
                    className={`p-4 rounded-apple-lg text-center transition-all duration-200 ${hasNoSpouseIncome === true
                        ? "bg-apple-blue-50 border-2 border-apple-blue-500"
                        : "bg-apple-gray-50 border-2 border-transparent hover:bg-apple-gray-100"
                      }`}
                  >
                    <p className={`font-semibold text-[15px] ${hasNoSpouseIncome === true ? "text-apple-blue-500" : "text-apple-gray-800"
                      }`}>소득 없음</p>
                  </button>
                  <button
                    onClick={() => setHasNoSpouseIncome(false)}
                    className={`p-4 rounded-apple-lg text-center transition-all duration-200 ${hasNoSpouseIncome === false
                        ? "bg-apple-blue-50 border-2 border-apple-blue-500"
                        : "bg-apple-gray-50 border-2 border-transparent hover:bg-apple-gray-100"
                      }`}
                  >
                    <p className={`font-semibold text-[15px] ${hasNoSpouseIncome === false ? "text-apple-blue-500" : "text-apple-gray-800"
                      }`}>소득 있음</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 결과 미리보기 - Apple 스타일 Refined */}
        {isValid && (
          <div className="space-y-3 animate-fadeIn">
            <div className="bg-apple-blue-50 border border-apple-blue-100 rounded-apple-lg p-5">
              <p className="text-[13px] text-apple-gray-500 mb-4 text-center">산정 부양가족 수 계산</p>

              {/* Visual Calculation Logic */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 mb-2">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white border border-apple-blue-200 flex items-center justify-center text-[18px] font-bold text-apple-gray-700 shadow-sm">
                    1
                  </div>
                  <span className="text-[12px] text-apple-gray-500 mt-2">본인</span>
                </div>

                <span className="text-apple-gray-300 font-bold text-xl">+</span>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white border border-apple-blue-200 flex items-center justify-center text-[18px] font-bold text-apple-gray-700 shadow-sm">
                    {calculateDependents() - 1}
                  </div>
                  <span className="text-[12px] text-apple-gray-500 mt-2">피부양자</span>
                </div>

                <span className="text-apple-gray-300 font-bold text-xl">=</span>

                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-apple-blue-500 flex items-center justify-center text-[24px] font-bold text-white shadow-apple-md">
                    {calculateDependents()}
                  </div>
                  <span className="text-[13px] font-bold text-apple-blue-600 mt-2">총 {calculateDependents()}명</span>
                </div>
              </div>
            </div>

            {/* Contextual Legal Explanation */}
            {maritalStatus === "married" && (
              <div className="bg-apple-gray-50 rounded-lg p-3 text-[12px] text-apple-gray-500 leading-relaxed">
                {isMainCourt ? (
                  <>
                    💡 <span className="font-bold text-apple-gray-700">회생법원 실무준칙</span>에 따라 배우자는 원칙적으로 부양가족에서 제외됩니다. (단, 배우자가 경제활동이 불가능한 경우 소명 후 포함 가능)
                  </>
                ) : (
                  <>
                    💡 일반 법원 관할로, 미성년 자녀는 <span className="font-bold text-apple-gray-700">부부 공동 부양</span>을 원칙으로 하여 자녀 수의 50%만 인정될 수 있습니다. (1.5명 → 1명 인정)
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 버튼 - Apple 스타일 */}
      <div className="mt-auto pt-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onBack}
            className="py-4 rounded-apple-lg text-[17px] font-semibold bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-700 transition-all duration-200 active:scale-[0.98]"
          >
            이전
          </button>
          <button
            onClick={() => onNext(calculateDependents())}
            disabled={!isValid}
            className={`py-4 rounded-apple-lg text-[17px] font-semibold transition-all duration-200 ${isValid
                ? "bg-apple-blue-500 hover:bg-apple-blue-600 active:bg-apple-blue-700 active:scale-[0.98] text-white shadow-apple-button"
                : "bg-apple-gray-100 text-apple-gray-400 cursor-not-allowed"
              }`}
          >
            결과 확인
          </button>
        </div>
      </div>
    </div>
  );
}
