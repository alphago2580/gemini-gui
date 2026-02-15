import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import './RangeSlider.css';

export interface RangeSliderProps {
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  showValues?: boolean;
  showTicks?: boolean;
  label?: string;
  marks?: { value: number; label?: string }[];
  formatValue?: (value: number) => string;
  minDistance?: number;
  className?: string;
  ariaLabel?: string;
}

type ThumbId = 'start' | 'end';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, step: number): number {
  return Math.round((value - min) / step) * step + min;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  size = 'medium',
  disabled = false,
  showValues = false,
  showTicks = false,
  label,
  marks,
  formatValue,
  minDistance = 0,
  className,
  ariaLabel,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<[number, number]>(
    defaultValue ?? [min, max],
  );

  const currentValue: [number, number] = [
    clamp(isControlled ? (value?.[0] ?? min) : internalValue[0], min, max),
    clamp(isControlled ? (value?.[1] ?? max) : internalValue[1], min, max),
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<ThumbId | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  const startPercent = ((currentValue[0] - min) / (max - min)) * 100;
  const endPercent = ((currentValue[1] - min) / (max - min)) * 100;

  const displayStart = formatValue ? formatValue(currentValue[0]) : String(currentValue[0]);
  const displayEnd = formatValue ? formatValue(currentValue[1]) : String(currentValue[1]);

  const tickPositions = useMemo(() => {
    if (!showTicks) return [];
    const ticks: number[] = [];
    for (let v = min; v <= max; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [showTicks, min, max, step]);

  const updateValue = useCallback(
    (thumb: ThumbId, rawValue: number) => {
      const snapped = Math.min(snapToStep(clamp(rawValue, min, max), min, step), max);
      const newRange: [number, number] = [...currentValue] as [number, number];

      if (thumb === 'start') {
        newRange[0] = Math.min(snapped, currentValue[1] - minDistance);
        newRange[0] = clamp(newRange[0], min, currentValue[1] - minDistance);
      } else {
        newRange[1] = Math.max(snapped, currentValue[0] + minDistance);
        newRange[1] = clamp(newRange[1], currentValue[0] + minDistance, max);
      }

      if (!isControlled) {
        setInternalValue(newRange);
      }
      onChange?.(newRange);
    },
    [min, max, step, isControlled, onChange, currentValue, minDistance],
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

  const getClosestThumb = useCallback(
    (rawValue: number): ThumbId => {
      const distToStart = Math.abs(rawValue - currentValue[0]);
      const distToEnd = Math.abs(rawValue - currentValue[1]);
      if (distToStart < distToEnd) return 'start';
      if (distToEnd < distToStart) return 'end';
      return rawValue <= currentValue[0] ? 'start' : 'end';
    },
    [currentValue],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      const rawValue = getValueFromPosition(e.clientX);
      const thumb = getClosestThumb(rawValue);
      activeThumbRef.current = thumb;
      updateValue(thumb, rawValue);

      const handleMouseMove = (ev: MouseEvent) => {
        if (!activeThumbRef.current) return;
        updateValue(activeThumbRef.current, getValueFromPosition(ev.clientX));
      };

      const handleMouseUp = () => {
        activeThumbRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      dragCleanupRef.current = () => {
        activeThumbRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    },
    [disabled, getValueFromPosition, getClosestThumb, updateValue],
  );

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
    };
  }, []);

  const handleKeyDown = useCallback(
    (thumb: ThumbId) => (e: React.KeyboardEvent) => {
      if (disabled) return;
      const current = thumb === 'start' ? currentValue[0] : currentValue[1];
      let newValue = current;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = current + step;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = current - step;
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
          newValue = current + step * 10;
          break;
        case 'PageDown':
          e.preventDefault();
          newValue = current - step * 10;
          break;
        default:
          return;
      }
      updateValue(thumb, newValue);
    },
    [disabled, currentValue, step, min, max, updateValue],
  );

  const handleMarkClick = useCallback(
    (markValue: number) => {
      if (disabled) return;
      const thumb = getClosestThumb(markValue);
      updateValue(thumb, markValue);
    },
    [disabled, getClosestThumb, updateValue],
  );

  return (
    <div
      className={`range-slider range-slider--${size} ${disabled ? 'range-slider--disabled' : ''} ${className ?? ''}`}
    >
      {(label || showValues) && (
        <div className="range-slider__header">
          {label && <span className="range-slider__label">{label}</span>}
          {showValues && (
            <span className="range-slider__values" aria-live="polite">
              {displayStart} – {displayEnd}
            </span>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        className="range-slider__track-container"
        onMouseDown={handleMouseDown}
      >
        <div className="range-slider__track">
          <div
            className="range-slider__fill"
            style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
          />
          {showTicks && tickPositions.map(v => (
            <div
              key={v}
              className={`range-slider__tick ${v >= currentValue[0] && v <= currentValue[1] ? 'range-slider__tick--active' : ''}`}
              style={{ left: `${((v - min) / (max - min)) * 100}%` }}
            />
          ))}
        </div>

        <div
          className="range-slider__thumb"
          style={{ left: `${startPercent}%` }}
          role="slider"
          aria-label={ariaLabel ? `${ariaLabel} 시작` : label ? `${label} 시작` : '범위 시작'}
          aria-valuemin={min}
          aria-valuemax={currentValue[1]}
          aria-valuenow={currentValue[0]}
          aria-valuetext={displayStart}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown('start')}
        />
        <div
          className="range-slider__thumb"
          style={{ left: `${endPercent}%` }}
          role="slider"
          aria-label={ariaLabel ? `${ariaLabel} 끝` : label ? `${label} 끝` : '범위 끝'}
          aria-valuemin={currentValue[0]}
          aria-valuemax={max}
          aria-valuenow={currentValue[1]}
          aria-valuetext={displayEnd}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown('end')}
        />
      </div>

      {marks && marks.length > 0 && (
        <div className="range-slider__marks">
          {marks.map(mark => (
            <span
              key={mark.value}
              className={`range-slider__mark ${mark.value >= currentValue[0] && mark.value <= currentValue[1] ? 'range-slider__mark--active' : ''}`}
              style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
              onClick={() => handleMarkClick(mark.value)}
            >
              {mark.label ?? mark.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(RangeSlider);
