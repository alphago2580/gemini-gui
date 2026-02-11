import React, { useState, useCallback } from 'react';
import './CheckboxGroup.css';

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  error?: string;
  selectAll?: boolean;
  selectAllLabel?: string;
  max?: number;
  className?: string;
  ariaLabel?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  label,
  size = 'medium',
  orientation = 'vertical',
  disabled = false,
  error,
  selectAll = false,
  selectAllLabel = '전체 선택',
  max,
  className,
  ariaLabel,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const currentValues = isControlled ? value : internalValue;

  const updateValues = useCallback(
    (newValues: string[]) => {
      if (!isControlled) {
        setInternalValue(newValues);
      }
      onChange?.(newValues);
    },
    [isControlled, onChange],
  );

  const handleToggle = useCallback(
    (optionValue: string) => {
      if (disabled) return;
      const option = options.find(o => o.value === optionValue);
      if (option?.disabled) return;

      const isChecked = currentValues.includes(optionValue);
      let newValues: string[];

      if (isChecked) {
        newValues = currentValues.filter(v => v !== optionValue);
      } else {
        if (max && currentValues.length >= max) return;
        newValues = [...currentValues, optionValue];
      }

      updateValues(newValues);
    },
    [disabled, options, currentValues, max, updateValues],
  );

  const handleSelectAll = useCallback(() => {
    if (disabled) return;
    const enabledOptions = options.filter(o => !o.disabled);
    const allSelected = enabledOptions.every(o => currentValues.includes(o.value));

    if (allSelected) {
      // Deselect all enabled options
      const disabledValues = currentValues.filter(v => {
        const opt = options.find(o => o.value === v);
        return opt?.disabled;
      });
      updateValues(disabledValues);
    } else {
      // Select all enabled options
      const enabledValues = enabledOptions.map(o => o.value);
      const disabledChecked = currentValues.filter(v => {
        const opt = options.find(o => o.value === v);
        return opt?.disabled;
      });
      const combined = [...new Set([...disabledChecked, ...enabledValues])];
      if (max && combined.length > max) return;
      updateValues(combined);
    }
  }, [disabled, options, currentValues, max, updateValues]);

  const enabledOptions = options.filter(o => !o.disabled);
  const allSelected = enabledOptions.length > 0 && enabledOptions.every(o => currentValues.includes(o.value));
  const someSelected = enabledOptions.some(o => currentValues.includes(o.value)) && !allSelected;

  return (
    <div
      className={`checkbox-group checkbox-group--${size} checkbox-group--${orientation} ${disabled ? 'checkbox-group--disabled' : ''} ${error ? 'checkbox-group--error' : ''} ${className ?? ''}`}
    >
      {label && <span className="checkbox-group__label">{label}</span>}

      <div
        role="group"
        aria-label={ariaLabel ?? label ?? '체크박스 그룹'}
        className="checkbox-group__options"
      >
        {selectAll && (
          <label className={`checkbox-group__option checkbox-group__select-all ${disabled ? 'checkbox-group__option--disabled' : ''}`}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              onChange={handleSelectAll}
              disabled={disabled}
              className="checkbox-group__input"
              aria-label={selectAllLabel}
            />
            <span className="checkbox-group__checkbox" aria-hidden="true">
              <span className="checkbox-group__checkmark" />
            </span>
            <span className="checkbox-group__option-label">{selectAllLabel}</span>
          </label>
        )}

        {options.map(option => {
          const isChecked = currentValues.includes(option.value);
          const isDisabled = disabled || option.disabled;
          const isMaxReached = !isChecked && max !== undefined && currentValues.length >= max;

          return (
            <label
              key={option.value}
              className={`checkbox-group__option ${isChecked ? 'checkbox-group__option--checked' : ''} ${isDisabled || isMaxReached ? 'checkbox-group__option--disabled' : ''}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(option.value)}
                disabled={isDisabled || isMaxReached}
                className="checkbox-group__input"
              />
              <span className="checkbox-group__checkbox" aria-hidden="true">
                <span className="checkbox-group__checkmark" />
              </span>
              <span className="checkbox-group__content">
                <span className="checkbox-group__option-label">{option.label}</span>
                {option.description && (
                  <span className="checkbox-group__description">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {error && <span className="checkbox-group__error">{error}</span>}
    </div>
  );
};

export default React.memo(CheckboxGroup);
