import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './TextArea.css';

export type TextAreaSize = 'sm' | 'md' | 'lg';
export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both' | 'auto';

export interface TextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: TextAreaSize;
  resize?: TextAreaResize;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoFocus?: boolean;
}

const LINE_HEIGHT_MAP: Record<TextAreaSize, number> = {
  sm: 18,
  md: 20,
  lg: 22,
};

const TextArea: React.FC<TextAreaProps> = ({
  value = '',
  onChange,
  placeholder = '',
  label,
  size = 'md',
  resize = 'vertical',
  disabled = false,
  readOnly = false,
  error,
  helperText,
  maxLength,
  showCount = false,
  rows = 3,
  minRows,
  maxRows,
  autoFocus = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const effectiveMinRows = minRows ?? rows;
  const effectiveMaxRows = maxRows ?? (resize === 'auto' ? 20 : undefined);

  const isAutoResize = resize === 'auto';

  // Auto resize logic
  useEffect(() => {
    if (!isAutoResize || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const lineHeight = LINE_HEIGHT_MAP[size];
    const minHeight = effectiveMinRows * lineHeight;
    const maxHeight = effectiveMaxRows ? effectiveMaxRows * lineHeight : Infinity;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [value, isAutoResize, size, effectiveMinRows, effectiveMaxRows]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength !== undefined && newValue.length > maxLength) return;
    onChange?.(newValue);
  }, [onChange, maxLength]);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const charCount = value.length;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;

  const countText = useMemo(() => {
    if (!showCount) return '';
    if (maxLength !== undefined) return `${charCount}/${maxLength}`;
    return `${charCount}`;
  }, [showCount, charCount, maxLength]);

  const containerClassName = [
    'textarea-container',
    `textarea--${size}`,
    focused && 'textarea--focused',
    disabled && 'textarea--disabled',
    readOnly && 'textarea--readonly',
    error && 'textarea--error',
    isOverLimit && 'textarea--over-limit',
  ].filter(Boolean).join(' ');

  const resizeStyle = isAutoResize ? 'none' : resize;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="textarea-label">{label}</label>
      )}
      <textarea
        ref={textareaRef}
        className="textarea-field"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        rows={isAutoResize ? effectiveMinRows : rows}
        maxLength={maxLength}
        autoFocus={autoFocus}
        style={{ resize: resizeStyle }}
        aria-label={label ?? (placeholder || undefined)}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? 'textarea-error' : helperText ? 'textarea-helper' : undefined
        }
      />
      <div className="textarea-footer">
        {error ? (
          <span className="textarea-error" id="textarea-error" role="alert">{error}</span>
        ) : helperText ? (
          <span className="textarea-helper" id="textarea-helper">{helperText}</span>
        ) : (
          <span />
        )}
        {showCount && (
          <span className={`textarea-count ${isOverLimit ? 'textarea-count--over' : ''}`}>
            {countText}
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(TextArea);
