import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ColorSwatch.css';

export type ColorSwatchSize = 'small' | 'medium' | 'large';

export interface ColorSwatchProps {
  colors: string[];
  value?: string;
  onChange?: (color: string) => void;
  size?: ColorSwatchSize;
  columns?: number;
  allowCustom?: boolean;
  disabled?: boolean;
  label?: string;
  id?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  colors,
  value,
  onChange,
  size = 'medium',
  columns = 8,
  allowCustom = false,
  disabled = false,
  label,
  id,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up focus timer on unmount
  useEffect(() => {
    return () => {
      if (focusTimerRef.current !== null) {
        clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  const handleSelect = useCallback((color: string) => {
    if (disabled) return;
    onChange?.(color);
  }, [disabled, onChange]);

  const handleCustomSubmit = useCallback(() => {
    const trimmed = customInput.trim();
    if (!trimmed || disabled) return;
    const color = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
      onChange?.(color);
      setCustomInput('');
      setShowCustom(false);
    }
  }, [customInput, disabled, onChange]);

  const handleCustomKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomSubmit();
    } else if (e.key === 'Escape') {
      setShowCustom(false);
    }
  }, [handleCustomSubmit]);

  const handleSwatchKeyDown = useCallback((color: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(color);
    }
  }, [handleSelect]);

  const classNames = [
    'color-swatch',
    `color-swatch--${size}`,
    disabled ? 'color-swatch--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      id={id}
      className={classNames}
      role="radiogroup"
      aria-label={label || '색상 선택'}
      aria-disabled={disabled || undefined}
    >
      {label && <span className="color-swatch-label">{label}</span>}
      <div
        className="color-swatch-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {colors.map((color) => {
          const isSelected = value === color;
          return (
            <button
              key={color}
              className={`color-swatch-item${isSelected ? ' color-swatch-item--selected' : ''}`}
              style={{ backgroundColor: color }}
              role="radio"
              aria-checked={isSelected}
              aria-label={color}
              onClick={() => handleSelect(color)}
              onKeyDown={(e) => handleSwatchKeyDown(color, e)}
              disabled={disabled}
              type="button"
              title={color}
            />
          );
        })}
      </div>
      {allowCustom && (
        <div className="color-swatch-custom">
          {!showCustom ? (
            <button
              className="color-swatch-custom-trigger"
              onClick={() => {
                setShowCustom(true);
                focusTimerRef.current = setTimeout(() => customInputRef.current?.focus(), 0);
              }}
              disabled={disabled}
              type="button"
              aria-label="커스텀 색상 입력"
            >
              + 커스텀
            </button>
          ) : (
            <div className="color-swatch-custom-input-row">
              <input
                ref={customInputRef}
                className="color-swatch-custom-input"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                placeholder="#000000"
                maxLength={7}
                aria-label="색상 코드 입력"
                disabled={disabled}
              />
              <button
                className="color-swatch-custom-apply"
                onClick={handleCustomSubmit}
                disabled={disabled}
                type="button"
                aria-label="색상 적용"
              >
                ✓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ColorSwatch);
