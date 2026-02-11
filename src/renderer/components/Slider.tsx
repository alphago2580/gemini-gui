import React, { useState, useCallback, useRef, useMemo } from 'react';
import './Slider.css';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  showValue?: boolean;
  showTicks?: boolean;
  label?: string;
  marks?: { value: number; label?: string }[];
  formatValue?: (value: number) => string;
  className?: string;
  ariaLabel?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, step: number): number {
  return Math.round((value - min) / step) * step + min;
}

const Slider: React.FC<SliderProps> = ({
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  size = 'medium',
  disabled = false,
  showValue = false,
  showTicks = false,
  label,
  marks,
  formatValue,
  className,
  ariaLabel,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const currentValue = clamp(isControlled ? (value ?? min) : internalValue, min, max);

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const percentage = ((currentValue - min) / (max - min)) * 100;

  const displayValue = formatValue ? formatValue(currentValue) : String(currentValue);

  const tickPositions = useMemo(() => {
    if (!showTicks) return [];
    const ticks: number[] = [];
    for (let v = min; v <= max; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [showTicks, min, max, step]);

  const updateValue = useCallback(
    (newValue: number) => {
      const snapped = snapToStep(clamp(newValue, min, max), min, step);
      // Ensure we don't exceed max due to floating point
      const bounded = Math.min(snapped, max);
      if (!isControlled) {
        setInternalValue(bounded);
      }
      onChange?.(bounded);
    },
    [min, max, step, isControlled, onChange],
  );

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      return min + ratio * (max - min);
    },
    [min, max],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      isDragging.current = true;
      const newValue = getValueFromPosition(e.clientX);
      updateValue(newValue);

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        updateValue(getValueFromPosition(ev.clientX));
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [disabled, getValueFromPosition, updateValue],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      let newValue = currentValue;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = currentValue + step;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = currentValue - step;
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        case 'PageUp':
          e.preventDefault();
          newValue = currentValue + step * 10;
          break;
        case 'PageDown':
          e.preventDefault();
          newValue = currentValue - step * 10;
          break;
        default:
          return;
      }
      updateValue(newValue);
    },
    [disabled, currentValue, step, min, max, updateValue],
  );

  return (
    <div
      className={`slider slider--${size} ${disabled ? 'slider--disabled' : ''} ${className ?? ''}`}
    >
      {(label || showValue) && (
        <div className="slider__header">
          {label && <span className="slider__label">{label}</span>}
          {showValue && <span className="slider__value" aria-live="polite">{displayValue}</span>}
        </div>
      )}

      <div
        ref={trackRef}
        className="slider__track-container"
        onMouseDown={handleMouseDown}
        role="slider"
        aria-label={ariaLabel ?? label ?? '슬라이더'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        aria-valuetext={displayValue}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <div className="slider__track">
          <div
            className="slider__fill"
            style={{ width: `${percentage}%` }}
          />
          {showTicks && tickPositions.map(v => (
            <div
              key={v}
              className={`slider__tick ${v <= currentValue ? 'slider__tick--active' : ''}`}
              style={{ left: `${((v - min) / (max - min)) * 100}%` }}
            />
          ))}
        </div>
        <div
          className="slider__thumb"
          style={{ left: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>

      {marks && marks.length > 0 && (
        <div className="slider__marks">
          {marks.map(mark => (
            <span
              key={mark.value}
              className={`slider__mark ${mark.value <= currentValue ? 'slider__mark--active' : ''}`}
              style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
              onClick={() => !disabled && updateValue(mark.value)}
            >
              {mark.label ?? mark.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(Slider);
