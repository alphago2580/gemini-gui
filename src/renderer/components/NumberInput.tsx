import React, { useState, useCallback, useRef, useEffect } from 'react';
import './NumberInput.css';

export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  precision?: number;
  prefix?: string;
  suffix?: string;
  onBlur?: () => void;
  onFocus?: () => void;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  size = 'medium',
  disabled = false,
  readOnly = false,
  placeholder,
  ariaLabel = '숫자 입력',
  precision,
  prefix,
  suffix,
  onBlur,
  onFocus,
}) => {
  const [inputValue, setInputValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value
  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatValue(value, precision));
    }
  }, [value, isFocused, precision]);

  const clamp = useCallback((v: number): number => {
    let result = v;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  }, [min, max]);

  const commitValue = useCallback((v: number) => {
    const clamped = clamp(v);
    const final = precision !== undefined ? parseFloat(clamped.toFixed(precision)) : clamped;
    onChange(final);
    setInputValue(formatValue(final, precision));
  }, [clamp, onChange, precision]);

  const increment = useCallback(() => {
    if (disabled || readOnly) return;
    commitValue(value + step);
  }, [disabled, readOnly, value, step, commitValue]);

  const decrement = useCallback(() => {
    if (disabled || readOnly) return;
    commitValue(value - step);
  }, [disabled, readOnly, value, step, commitValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow typing negative, decimal, empty
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
      setInputValue(raw);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      setInputValue(raw);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(formatValue(value, precision));
    } else {
      commitValue(parsed);
    }
    onBlur?.();
  }, [inputValue, value, precision, commitValue, onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled || readOnly) return;

    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        increment();
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        decrement();
        break;
      }
      case 'Home': {
        if (min !== undefined) {
          e.preventDefault();
          commitValue(min);
        }
        break;
      }
      case 'End': {
        if (max !== undefined) {
          e.preventDefault();
          commitValue(max);
        }
        break;
      }
      case 'Enter': {
        const parsed = parseFloat(inputValue);
        if (!isNaN(parsed)) {
          commitValue(parsed);
        }
        break;
      }
    }
  }, [disabled, readOnly, increment, decrement, min, max, commitValue, inputValue]);

  const isAtMin = min !== undefined && value <= min;
  const isAtMax = max !== undefined && value >= max;

  const containerClass = [
    'number-input',
    `number-input-${size}`,
    disabled && 'number-input-disabled',
    isFocused && 'number-input-focused',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <button
        className="number-input-button number-input-decrement"
        onClick={decrement}
        disabled={disabled || readOnly || isAtMin}
        tabIndex={-1}
        aria-label="감소"
        type="button"
      >
        −
      </button>

      <div className="number-input-field">
        {prefix && <span className="number-input-prefix">{prefix}</span>}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="number-input-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          role="spinbutton"
        />
        {suffix && <span className="number-input-suffix">{suffix}</span>}
      </div>

      <button
        className="number-input-button number-input-increment"
        onClick={increment}
        disabled={disabled || readOnly || isAtMax}
        tabIndex={-1}
        aria-label="증가"
        type="button"
      >
        +
      </button>
    </div>
  );
};

function formatValue(v: number, precision?: number): string {
  if (precision !== undefined) {
    return v.toFixed(precision);
  }
  return String(v);
}

export default React.memo(NumberInput);
