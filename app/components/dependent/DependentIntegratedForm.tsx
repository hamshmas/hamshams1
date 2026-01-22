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

  // 자산 단계에서 기혼 선택 시 자동 설정
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
    return children + 1; // 미혼/이혼
  };

  const isValid =
    inputMode === "direct"
      ? directValue && parseInt(directValue) >= 1
      : maritalStatus &&
        childrenCount !== "" &&
        (!showSpouseIncome || hasNoSpouseIncome !== null);

  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 제목 */}
      <div className="mb-6">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
          부양가족 수를 입력해주세요
        </h2>
        <p className="text-[15px] text-gray-500">마지막 단계예요!</p>
      </div>

      {/* 입력 모드 선택 */}
      <div className="space-y-3 mb-6">
        <label className="text-sm font-semibold text-gray-700">입력 방식</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setInputMode("direct")}
            className={`p-4 rounded-xl text-center transition-all border-2 ${
              inputMode === "direct"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <p className="font-semibold">직접 입력</p>
            <p className="text-xs text-gray-500 mt-1">숫자를 알고 있어요</p>
          </button>
          <button
            onClick={() => setInputMode("calculate")}
            className={`p-4 rounded-xl text-center transition-all border-2 ${
              inputMode === "calculate"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <p className="font-semibold">자동 계산</p>
            <p className="text-xs text-gray-500 mt-1">잘 모르겠어요</p>
          </button>
        </div>
      </div>

      {/* 직접 입력 모드 */}
      {inputMode === "direct" && (
        <div className="space-y-3 animate-fadeIn">
          <label className="text-sm font-semibold text-gray-700">
            본인 포함 함께 사는 가족 수
          </label>
          <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 pb-2">
            <input
              type="number"
              inputMode="numeric"
              value={directValue}
              onChange={(e) => setDirectValue(e.target.value)}
              className="flex-1 text-[32px] font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              placeholder="1"
              min="1"
              autoFocus
            />
            <span className="text-[20px] font-medium text-gray-400 ml-2">
              명
            </span>
          </div>
          <p className="text-sm text-gray-500">
            혼자 살면 1명, 배우자와 둘이면 2명
          </p>
        </div>
      )}

      {/* 자동 계산 모드 */}
      {inputMode === "calculate" && (
        <div className="space-y-5 animate-fadeIn">
          {/* 혼인 상태 (자산에서 기혼 선택 안한 경우만) */}
          {isMarriedForAsset !== true && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                혼인 상태
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["single", "married", "divorced"] as MaritalStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setMaritalStatus(status);
                        // 상태 변경 시 배우자 소득 초기화
                        setHasNoSpouseIncome(null);
                      }}
                      className={`p-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                        maritalStatus === status
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
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
              <label className="text-sm font-semibold text-gray-700">
                미성년 자녀 수
              </label>
              <div className="flex items-baseline border-b-2 border-gray-200 focus-within:border-blue-500 pb-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(e.target.value)}
                  className="flex-1 text-[32px] font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
                  placeholder="0"
                  min="0"
                  autoFocus
                />
                <span className="text-[20px] font-medium text-gray-400 ml-2">
                  명
                </span>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setChildrenCount(String(num))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      childrenCount === String(num)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {num}명
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 배우자 소득 (기혼 + 주요법원만) */}
          {showSpouseIncome && childrenCount !== "" && (
            <div className="space-y-3 animate-fadeIn">
              <label className="text-sm font-semibold text-gray-700">
                배우자 소득 유무
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHasNoSpouseIncome(true)}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${
                    hasNoSpouseIncome === true
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <p className="font-semibold">소득 없음</p>
                </button>
                <button
                  onClick={() => setHasNoSpouseIncome(false)}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${
                    hasNoSpouseIncome === false
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <p className="font-semibold">소득 있음</p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 결과 미리보기 */}
      {isValid && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6 animate-fadeIn">
          <p className="text-sm text-gray-600">산정 부양가족 수</p>
          <p className="text-2xl font-bold text-blue-600">
            {calculateDependents()}명
          </p>
        </div>
      )}

      {/* 버튼 */}
      <div className="mt-auto pt-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onBack}
            className="py-4 rounded-xl text-[17px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
          >
            ← 이전
          </button>
          <button
            onClick={() => onNext(calculateDependents())}
            disabled={!isValid}
            className={`py-4 rounded-xl text-[17px] font-semibold transition-all ${
              isValid
                ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            결과 확인 →
          </button>
        </div>
      </div>
    </div>
  );
}
