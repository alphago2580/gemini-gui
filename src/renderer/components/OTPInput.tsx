import React, { useState, useCallback, useRef, useEffect } from 'react';
import './OTPInput.css';

export type OTPInputSize = 'small' | 'medium' | 'large';

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  size?: OTPInputSize;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  mask?: boolean;
  label?: string;
  id?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  size = 'medium',
  disabled = false,
  error = false,
  autoFocus = false,
  mask = false,
  label,
  id,
}) => {
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = new Array(length).fill('');
    for (let i = 0; i < Math.min(value.length, length); i++) {
      arr[i] = value[i];
    }
    return arr;
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const updateDigits = useCallback((newDigits: string[]) => {
    setDigits(newDigits);
    const newValue = newDigits.join('');
    onChange?.(newValue);
    if (newDigits.every(d => d !== '') && newDigits.length === length) {
      onComplete?.(newValue);
    }
  }, [length, onChange, onComplete]);

  const handleChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length > 1) {
      // Handle paste into single field
      const chars = inputValue.replace(/[^0-9]/g, '').split('');
      const newDigits = [...digits];
      let focusIndex = index;
      for (let i = 0; i < chars.length && index + i < length; i++) {
        newDigits[index + i] = chars[i];
        focusIndex = index + i;
      }
      updateDigits(newDigits);
      const nextFocus = Math.min(focusIndex + 1, length - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const char = inputValue.replace(/[^0-9]/g, '');
    if (char === '' && inputValue !== '') return; // non-digit typed

    const newDigits = [...digits];
    newDigits[index] = char;
    updateDigits(newDigits);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits, length, updateDigits]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '') {
        if (index > 0) {
          const newDigits = [...digits];
          newDigits[index - 1] = '';
          updateDigits(newDigits);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        updateDigits(newDigits);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits, length, updateDigits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < Math.min(pasteData.length, length); i++) {
      newDigits[i] = pasteData[i];
    }
    updateDigits(newDigits);

    const focusIndex = Math.min(pasteData.length, length) - 1;
    if (focusIndex >= 0) {
      inputRefs.current[Math.min(focusIndex + 1, length - 1)]?.focus();
    }
  }, [digits, length, updateDigits]);

  const classNames = [
    'otp-input',
    `otp-input--${size}`,
    error ? 'otp-input--error' : '',
    disabled ? 'otp-input--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      id={id}
      className={classNames}
      role="group"
      aria-label={label || '인증 코드 입력'}
    >
      {label && <span className="otp-input-label">{label}</span>}
      <div className="otp-input-fields">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            className={`otp-input-field${digit ? ' otp-input-field--filled' : ''}`}
            type={mask ? 'password' : 'text'}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(index, e)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`${index + 1}번째 자리`}
            autoComplete="one-time-code"
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(OTPInput);
