import React, { useState, useCallback, useRef } from 'react';
import './RadioGroup.css';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'card';
  disabled?: boolean;
  error?: string;
  className?: string;
  ariaLabel?: string;
}

let radioGroupCounter = 0;

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  name,
  label,
  size = 'medium',
  orientation = 'vertical',
  variant = 'default',
  disabled = false,
  error,
  className,
  ariaLabel,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? value : internalValue;
  const groupRef = useRef<HTMLDivElement>(null);

  const groupName = name ?? `radio-group-${++radioGroupCounter}`;

  const handleChange = useCallback(
    (optionValue: string) => {
      if (disabled) return;
      const option = options.find(o => o.value === optionValue);
      if (option?.disabled) return;
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
    },
    [disabled, options, isControlled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      const enabledOptions = options.filter(o => !o.disabled);
      if (enabledOptions.length === 0) return;

      const currentIndex = enabledOptions.findIndex(o => o.value === currentValue);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          newIndex = currentIndex < enabledOptions.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : enabledOptions.length - 1;
          break;
        default:
          return;
      }

      handleChange(enabledOptions[newIndex].value);
      // Focus the new radio
      const radios = groupRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)');
      if (radios) {
        const enabledRadios = Array.from(radios);
        enabledRadios[newIndex]?.focus();
      }
    },
    [disabled, options, currentValue, handleChange],
  );

  return (
    <div
      className={`radio-group radio-group--${size} radio-group--${orientation} radio-group--${variant} ${disabled ? 'radio-group--disabled' : ''} ${error ? 'radio-group--error' : ''} ${className ?? ''}`}
    >
      {label && <span className="radio-group__label">{label}</span>}
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={ariaLabel ?? label ?? '라디오 그룹'}
        onKeyDown={handleKeyDown}
        className="radio-group__options"
      >
        {options.map(option => {
          const isChecked = currentValue === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={`radio-group__option ${isChecked ? 'radio-group__option--checked' : ''} ${isDisabled ? 'radio-group__option--disabled' : ''}`}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => handleChange(option.value)}
                className="radio-group__input"
                tabIndex={isChecked ? 0 : -1}
                aria-describedby={option.description ? `${groupName}-${option.value}-desc` : undefined}
              />
              <span className="radio-group__radio" aria-hidden="true">
                <span className="radio-group__radio-dot" />
              </span>
              <span className="radio-group__content">
                <span className="radio-group__option-label">{option.label}</span>
                {option.description && (
                  <span
                    className="radio-group__description"
                    id={`${groupName}-${option.value}-desc`}
                  >
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && <span className="radio-group__error">{error}</span>}
    </div>
  );
};

export default React.memo(RadioGroup);
