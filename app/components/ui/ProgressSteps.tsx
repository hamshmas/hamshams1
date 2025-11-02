interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
  return (
    <div className="mb-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-all duration-500 ${
              step <= currentStep
                ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg scale-110'
                : 'bg-white/60 text-gray-400 border-2 border-gray-200'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {index < totalSteps - 1 && (
              <div className={`flex-1 h-1 mx-1 rounded-full transition-all duration-500 ${
                step < currentStep ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-xs font-semibold text-gray-600 bg-white/60 py-1 px-3 rounded-full">
        {currentStep} / {totalSteps} 단계
      </p>
    </div>
  );
}
