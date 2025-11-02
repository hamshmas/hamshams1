interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

export function Button({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseClass = 'text-sm py-2.5';
  const variantClass = variant === 'primary'
    ? 'primary-button disabled:opacity-50 disabled:cursor-not-allowed'
    : 'secondary-button';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

interface SelectionButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  description: string;
  variant?: 'default' | 'primary' | 'info';
}

export function SelectionButton({
  onClick,
  icon,
  label,
  description,
  variant = 'default'
}: SelectionButtonProps) {
  const variantClasses = {
    default: 'bg-white border-gray-200 hover:border-primary-400',
    primary: 'bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200 hover:border-primary-400',
    info: 'bg-blue-50 border-blue-200 hover:border-blue-400'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full ${variantClasses[variant]} border-2 rounded-xl p-4 text-left transition-all hover:shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-bold text-gray-900">{label}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
}
