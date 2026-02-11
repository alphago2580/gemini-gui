import React, { useState, useCallback, useMemo } from 'react';
import './PasswordInput.css';

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';
export type PasswordInputSize = 'sm' | 'md' | 'lg';

export interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

export interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: PasswordInputSize;
  disabled?: boolean;
  error?: string;
  showStrength?: boolean;
  showRequirements?: boolean;
  requirements?: PasswordRequirement[];
  maxLength?: number;
  autoComplete?: string;
}

const DEFAULT_REQUIREMENTS: PasswordRequirement[] = [
  { label: '8자 이상', test: (v) => v.length >= 8 },
  { label: '대문자 포함', test: (v) => /[A-Z]/.test(v) },
  { label: '소문자 포함', test: (v) => /[a-z]/.test(v) },
  { label: '숫자 포함', test: (v) => /\d/.test(v) },
  { label: '특수문자 포함', test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
];

export function calculateStrength(value: string, requirements: PasswordRequirement[]): PasswordStrength {
  if (!value) return 'weak';
  const met = requirements.filter(req => req.test(value)).length;
  const ratio = met / requirements.length;
  if (ratio <= 0.25) return 'weak';
  if (ratio <= 0.5) return 'fair';
  if (ratio <= 0.75) return 'good';
  return 'strong';
}

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: '약함',
  fair: '보통',
  good: '좋음',
  strong: '강함',
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  value = '',
  onChange,
  placeholder = '비밀번호 입력',
  label,
  size = 'md',
  disabled = false,
  error,
  showStrength = false,
  showRequirements = false,
  requirements = DEFAULT_REQUIREMENTS,
  maxLength,
  autoComplete = 'current-password',
}) => {
  const [visible, setVisible] = useState(false);

  const strength = useMemo(
    () => calculateStrength(value, requirements),
    [value, requirements]
  );

  const requirementResults = useMemo(
    () => requirements.map(req => ({ ...req, met: req.test(value) })),
    [value, requirements]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  }, [onChange]);

  const toggleVisibility = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  const containerClassName = [
    'password-input-container',
    `password-input--${size}`,
    disabled && 'password-input--disabled',
    error && 'password-input--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      {label && (
        <label className="password-input-label">{label}</label>
      )}
      <div className="password-input-wrapper">
        <input
          className="password-input-field"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-label={label ?? placeholder}
          aria-invalid={error ? true : undefined}
        />
        <button
          className="password-input-toggle"
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
          tabIndex={-1}
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="password-strength" aria-label="비밀번호 강도">
          <div className="password-strength-bar">
            <div className={`password-strength-fill password-strength--${strength}`} />
          </div>
          <span className={`password-strength-label password-strength-text--${strength}`}>
            {STRENGTH_LABELS[strength]}
          </span>
        </div>
      )}

      {showRequirements && value.length > 0 && (
        <ul className="password-requirements" aria-label="비밀번호 요구사항">
          {requirementResults.map((req, index) => (
            <li
              key={index}
              className={`password-requirement ${req.met ? 'password-requirement--met' : 'password-requirement--unmet'}`}
            >
              <span className="password-requirement-icon" aria-hidden="true">
                {req.met ? '✓' : '✗'}
              </span>
              {req.label}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <span className="password-input-error" role="alert">{error}</span>
      )}
    </div>
  );
};

export default React.memo(PasswordInput);
