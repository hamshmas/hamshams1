"use client";

import type { IncomeType } from "@/app/types";

interface IncomeTypeSelectionProps {
  onNext: (type: IncomeType) => void;
  onBack: () => void;
  initialValue?: IncomeType | null;
}

export function IncomeTypeSelection({
  onNext,
  onBack,
  initialValue = null,
}: IncomeTypeSelectionProps) {
  return (
    <div className="flex-1 flex flex-col animate-fadeIn">
      {/* 제목 - Apple 스타일 */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-apple-gray-800 leading-tight tracking-tight mb-3">
          소득 유형을 선택하세요
        </h2>
        <p className="text-[15px] text-apple-gray-500">소득 형태에 따라 선택해주세요</p>
      </div>

      {/* 선택 옵션 - Apple 스타일 */}
      <div className="space-y-3">
        <button
          onClick={() => onNext('salary')}
          className={`w-full rounded-apple-lg p-5 transition-all duration-200 text-left active:scale-[0.98] ${
            initialValue === 'salary'
              ? 'bg-apple-blue-50 border-2 border-apple-blue-500'
              : 'bg-apple-gray-50 border-2 border-transparent hover:bg-apple-gray-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-apple flex items-center justify-center ${
              initialValue === 'salary' ? 'bg-apple-blue-500' : 'bg-apple-gray-200'
            }`}>
              <svg className={`w-6 h-6 ${initialValue === 'salary' ? 'text-white' : 'text-apple-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-[17px] mb-1 ${
                initialValue === 'salary' ? 'text-apple-blue-500' : 'text-apple-gray-800'
              }`}>급여소득자</p>
              <p className="text-[14px] text-apple-gray-500">
                회사로부터 급여를 받는 경우
              </p>
            </div>
            {initialValue === 'salary' && (
              <svg className="w-6 h-6 text-apple-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>

        <button
          onClick={() => onNext('business')}
          className={`w-full rounded-apple-lg p-5 transition-all duration-200 text-left active:scale-[0.98] ${
            initialValue === 'business'
              ? 'bg-apple-blue-50 border-2 border-apple-blue-500'
              : 'bg-apple-gray-50 border-2 border-transparent hover:bg-apple-gray-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-apple flex items-center justify-center ${
              initialValue === 'business' ? 'bg-apple-blue-500' : 'bg-apple-gray-200'
            }`}>
              <svg className={`w-6 h-6 ${initialValue === 'business' ? 'text-white' : 'text-apple-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-[17px] mb-1 ${
                initialValue === 'business' ? 'text-apple-blue-500' : 'text-apple-gray-800'
              }`}>영업소득자</p>
              <p className="text-[14px] text-apple-gray-500">
                사업을 운영하거나 프리랜서로 활동하는 경우
              </p>
            </div>
            {initialValue === 'business' && (
              <svg className="w-6 h-6 text-apple-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* 하단 버튼 - Apple 스타일 */}
      <div className="mt-auto pt-6">
        <button
          onClick={onBack}
          className="w-full py-4 rounded-apple-lg text-[17px] font-semibold bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200 transition-all duration-200 active:scale-[0.98]"
        >
          이전
        </button>
      </div>
    </div>
  );
}
