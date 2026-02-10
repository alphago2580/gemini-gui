import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ColorPicker.css';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  label?: string;
  disabled?: boolean;
  showInput?: boolean;
}

const DEFAULT_PRESETS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  '#795548', '#9e9e9e', '#607d8b', '#000000',
];

const ColorPickerInner: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  presetColors = DEFAULT_PRESETS,
  label,
  disabled = false,
  showInput = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);

  const handlePresetClick = useCallback((color: string) => {
    onChange(color);
    setInputValue(color);
    setIsOpen(false);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (/^#[0-9a-fA-F]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  }, [onChange]);

  const handleInputBlur = useCallback(() => {
    if (!/^#[0-9a-fA-F]{6}$/.test(inputValue)) {
      setInputValue(value);
    }
  }, [inputValue, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  return (
    <div
      className={`color-picker ${disabled ? 'color-picker--disabled' : ''}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <span className="color-picker__label">{label}</span>
      )}
      <div className="color-picker__trigger-row">
        <button
          className="color-picker__trigger"
          onClick={handleToggle}
          disabled={disabled}
          aria-label="색상 선택"
          aria-expanded={isOpen}
          aria-haspopup="true"
          title={value}
        >
          <span
            className="color-picker__swatch"
            style={{ backgroundColor: value }}
            aria-hidden="true"
          />
        </button>
        {showInput && (
          <input
            className="color-picker__input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            maxLength={7}
            aria-label="색상 코드"
            placeholder="#000000"
          />
        )}
      </div>
      {isOpen && (
        <div
          className="color-picker__dropdown"
          role="listbox"
          aria-label="프리셋 색상"
        >
          {presetColors.map((color) => (
            <button
              key={color}
              className={`color-picker__preset ${color === value ? 'color-picker__preset--selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetClick(color)}
              role="option"
              aria-selected={color === value}
              aria-label={color}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ColorPicker = React.memo(ColorPickerInner);
export default ColorPicker;
