import React, { useState, useCallback, useRef, useEffect } from 'react';
import Calendar from './Calendar';
import './DatePicker.css';

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  clearable?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  format?: string;
  locale?: 'ko' | 'en';
  firstDayOfWeek?: 0 | 1;
  className?: string;
  ariaLabel?: string;
}

function formatDate(date: Date, format: string, locale: 'ko' | 'en'): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  return format
    .replace('YYYY', String(y))
    .replace('MM', String(m).padStart(2, '0'))
    .replace('DD', String(d).padStart(2, '0'));
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue,
  onChange,
  placeholder,
  label,
  size = 'medium',
  disabled = false,
  clearable = false,
  error,
  minDate,
  maxDate,
  disabledDates,
  format = 'YYYY-MM-DD',
  locale = 'ko',
  firstDayOfWeek = 0,
  className,
  ariaLabel,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null);
  const selectedDate = isControlled ? (value ?? null) : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultPlaceholder = locale === 'ko' ? '날짜를 선택하세요' : 'Select a date';

  const displayValue = selectedDate
    ? formatDate(selectedDate, format, locale)
    : '';

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  }, [disabled]);

  const handleSelect = useCallback(
    (date: Date | null) => {
      if (!isControlled) {
        setInternalValue(date);
      }
      onChange?.(date);
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [isControlled, onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue(null);
      }
      onChange?.(null);
    },
    [isControlled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.focus();
      }
    },
    [handleToggle, isOpen],
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`datepicker datepicker--${size} ${disabled ? 'datepicker--disabled' : ''} ${error ? 'datepicker--error' : ''} ${className ?? ''}`}
      aria-label={ariaLabel}
    >
      {label && (
        <label className="datepicker__label">{label}</label>
      )}
      <div
        className={`datepicker__input-wrapper ${isOpen ? 'datepicker__input-wrapper--open' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        tabIndex={disabled ? -1 : 0}
      >
        <span className="datepicker__icon" aria-hidden="true">📅</span>
        <input
          ref={inputRef}
          className="datepicker__input"
          type="text"
          value={displayValue}
          placeholder={placeholder ?? defaultPlaceholder}
          readOnly
          disabled={disabled}
          tabIndex={-1}
          aria-label={ariaLabel ?? label ?? (locale === 'ko' ? '날짜 선택' : 'Date picker')}
        />
        {clearable && selectedDate && !disabled && (
          <button
            type="button"
            className="datepicker__clear"
            onClick={handleClear}
            aria-label={locale === 'ko' ? '날짜 지우기' : 'Clear date'}
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
      {error && <span className="datepicker__error">{error}</span>}
      {isOpen && (
        <div className="datepicker__dropdown" role="dialog" aria-label={locale === 'ko' ? '달력' : 'Calendar'}>
          <Calendar
            value={selectedDate}
            onChange={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            size={size}
            locale={locale}
            firstDayOfWeek={firstDayOfWeek}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(DatePicker);
