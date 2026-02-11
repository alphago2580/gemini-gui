import React, { useState, useCallback, useRef } from 'react';
import './Rating.css';

export type RatingSize = 'small' | 'medium' | 'large';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: RatingSize;
  readOnly?: boolean;
  disabled?: boolean;
  allowHalf?: boolean;
  allowClear?: boolean;
  icon?: string;
  emptyIcon?: string;
  label?: string;
  id?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 'medium',
  readOnly = false,
  disabled = false,
  allowHalf = false,
  allowClear = false,
  icon = '★',
  emptyIcon = '☆',
  label,
  id,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractive = !readOnly && !disabled && !!onChange;

  const getDisplayValue = useCallback(() => {
    if (hoverValue !== null) return hoverValue;
    return value;
  }, [hoverValue, value]);

  const handleStarClick = useCallback((starIndex: number, isHalf: boolean) => {
    if (!isInteractive) return;
    const newValue = isHalf ? starIndex + 0.5 : starIndex + 1;
    if (allowClear && newValue === value) {
      onChange!(0);
    } else {
      onChange!(newValue);
    }
  }, [isInteractive, allowClear, value, onChange]);

  const handleMouseMove = useCallback((starIndex: number, e: React.MouseEvent<HTMLSpanElement>) => {
    if (!isInteractive) return;
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isLeftHalf = e.clientX - rect.left < rect.width / 2;
      setHoverValue(isLeftHalf ? starIndex + 0.5 : starIndex + 1);
    } else {
      setHoverValue(starIndex + 1);
    }
  }, [isInteractive, allowHalf]);

  const handleMouseLeave = useCallback(() => {
    if (!isInteractive) return;
    setHoverValue(null);
  }, [isInteractive]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isInteractive) return;
    const step = allowHalf ? 0.5 : 1;
    let newValue = value;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(value + step, max);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(value - step, 0);
        break;
      case 'Home':
        e.preventDefault();
        newValue = 0;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }

    if (newValue !== value) {
      onChange!(newValue);
    }
  }, [isInteractive, value, max, allowHalf, onChange]);

  const displayValue = getDisplayValue();
  const stars = [];

  for (let i = 0; i < max; i++) {
    const filled = displayValue >= i + 1;
    const halfFilled = !filled && allowHalf && displayValue >= i + 0.5;

    const starClass = [
      'rating-star',
      filled ? 'rating-star--filled' : '',
      halfFilled ? 'rating-star--half' : '',
      isInteractive ? 'rating-star--interactive' : '',
    ].filter(Boolean).join(' ');

    stars.push(
      <span
        key={i}
        className={starClass}
        onClick={() => handleStarClick(i, false)}
        onMouseMove={(e) => handleMouseMove(i, e)}
        data-star-index={i}
        aria-hidden="true"
      >
        {halfFilled ? (
          <span className="rating-star-half-container">
            <span className="rating-star-half-filled">{icon}</span>
            <span className="rating-star-half-empty">{emptyIcon}</span>
          </span>
        ) : (
          filled ? icon : emptyIcon
        )}
      </span>
    );
  }

  const classNames = [
    'rating',
    `rating--${size}`,
    disabled ? 'rating--disabled' : '',
    readOnly ? 'rating--readonly' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      id={id}
      className={classNames}
      role="slider"
      aria-label={label || '평점'}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      tabIndex={isInteractive ? 0 : -1}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <div className="rating-stars">
        {stars}
      </div>
      {label && <span className="rating-label">{label}</span>}
    </div>
  );
};

export default React.memo(Rating);
