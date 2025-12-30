interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
  return (
    <div className="mb-4 animate-fadeIn flex flex-col items-center w-full">
      <div className="flex justify-between items-center w-full max-w-md">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <div key={step} className="flex items-center" style={{ flex: index < totalSteps - 1 ? '1' : '0' }}>
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-all duration-500 ${
              step <= currentStep
                ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg scale-110'
                : 'bg-white/60 text-gray-400 border-2 border-gray-200'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-1 mx-2 rounded-full transition-all duration-500 flex-1 ${
                step < currentStep ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
