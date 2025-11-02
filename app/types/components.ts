/**
 * 공통 컴포넌트 Props 타입
 */

export interface BaseStepProps {
  onBack: () => void;
}

export interface ValueInputProps extends BaseStepProps {
  onNext: (value: number) => void;
  initialValue: number;
}

export interface BooleanSelectionProps extends BaseStepProps {
  onSelect: (value: boolean) => void;
}

export interface RegionSelectionProps extends BaseStepProps {
  onNext: (region: string) => void;
}
