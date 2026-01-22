import { create } from "zustand";
import type {
  FormData,
  CalculationResult,
  CourtCode,
  IncomeType,
  MaritalStatus,
} from "@/app/types";

interface FormState {
  // 폼 데이터
  formData: FormData;
  result: CalculationResult | null;

  // 소득 관련
  incomeType: IncomeType | null;
  incomeSubStep: number;

  // 자산 관련
  isMarriedForAsset: boolean | null;

  // 부양가족 관련
  dependentInputMode: "direct" | "calculate" | null;
  dependentSubStep: number;
  maritalStatus: MaritalStatus | null;
  childrenCount: number;
  hasNoSpouseIncome: boolean | null;

  // Actions
  setFormField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  setFormData: (data: Partial<FormData>) => void;
  setResult: (result: CalculationResult | null) => void;
  setIncomeType: (type: IncomeType | null) => void;
  setIncomeSubStep: (step: number) => void;
  setIsMarriedForAsset: (married: boolean | null) => void;
  setDependentInputMode: (mode: "direct" | "calculate" | null) => void;
  setDependentSubStep: (step: number) => void;
  setMaritalStatus: (status: MaritalStatus | null) => void;
  setChildrenCount: (count: number) => void;
  setHasNoSpouseIncome: (noIncome: boolean | null) => void;
  resetForm: () => void;
  resetDependentState: () => void;
}

const initialFormData: FormData = {
  totalDebt: 0,
  monthlyIncome: 0,
  assetValue: 0,
  dependents: 1,
  homeAddress: "",
  workAddress: "",
  courtJurisdiction: "other" as CourtCode,
  priorityRepaymentRegion: "그밖의지역",
};

export const useFormStore = create<FormState>((set) => ({
  formData: initialFormData,
  result: null,
  incomeType: null,
  incomeSubStep: 0,
  isMarriedForAsset: null,
  dependentInputMode: null,
  dependentSubStep: 0,
  maritalStatus: null,
  childrenCount: 0,
  hasNoSpouseIncome: null,

  setFormField: (field, value) =>
    set((state) => ({ formData: { ...state.formData, [field]: value } })),

  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  setResult: (result) => set({ result }),
  setIncomeType: (incomeType) => set({ incomeType }),
  setIncomeSubStep: (incomeSubStep) => set({ incomeSubStep }),
  setIsMarriedForAsset: (isMarriedForAsset) => set({ isMarriedForAsset }),
  setDependentInputMode: (dependentInputMode) => set({ dependentInputMode }),
  setDependentSubStep: (dependentSubStep) => set({ dependentSubStep }),
  setMaritalStatus: (maritalStatus) => set({ maritalStatus }),
  setChildrenCount: (childrenCount) => set({ childrenCount }),
  setHasNoSpouseIncome: (hasNoSpouseIncome) => set({ hasNoSpouseIncome }),

  resetForm: () =>
    set({
      formData: initialFormData,
      result: null,
      incomeType: null,
      incomeSubStep: 0,
      isMarriedForAsset: null,
      dependentInputMode: null,
      dependentSubStep: 0,
      maritalStatus: null,
      childrenCount: 0,
      hasNoSpouseIncome: null,
    }),

  resetDependentState: () =>
    set({
      dependentInputMode: null,
      dependentSubStep: 0,
      maritalStatus: null,
      childrenCount: 0,
      hasNoSpouseIncome: null,
    }),
}));
