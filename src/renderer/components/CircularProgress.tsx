import React, { useMemo } from 'react';
import './CircularProgress.css';

export type CircularProgressSize = 'small' | 'medium' | 'large';
export type CircularProgressVariant = 'default' | 'success' | 'warning' | 'error';

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: CircularProgressSize;
  variant?: CircularProgressVariant;
  showPercentage?: boolean;
  label?: string;
  strokeWidth?: number;
  animated?: boolean;
  children?: React.ReactNode;
}

const SIZE_MAP: Record<CircularProgressSize, number> = {
  small: 40,
  medium: 64,
  large: 96,
};

const DEFAULT_STROKE_MAP: Record<CircularProgressSize, number> = {
  small: 3,
  medium: 5,
  large: 6,
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 'medium',
  variant = 'default',
  showPercentage = false,
  label,
  strokeWidth,
  animated = false,
  children,
}) => {
  const diameter = SIZE_MAP[size];
  const stroke = strokeWidth ?? DEFAULT_STROKE_MAP[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = max > 0 ? Math.round((clampedValue / max) * 100) : 0;
  const strokeDashoffset = circumference - (circumference * clampedValue) / (max > 0 ? max : 1);

  const ariaLabel = label ?? `${percentage}%`;

  const containerClass = useMemo(() => {
    const classes = [
      'circular-progress',
      `circular-progress--${size}`,
      `circular-progress--${variant}`,
    ];
    if (animated) {
      classes.push('circular-progress--animated');
    }
    return classes.join(' ');
  }, [size, variant, animated]);

  const center = diameter / 2;

  return (
    <div
      className={containerClass}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      <svg
        className="circular-progress-svg"
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
      >
        <circle
          className="circular-progress-track"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="circular-progress-fill"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="circular-progress-content">
        {children ?? (showPercentage && (
          <span className="circular-progress-percentage">{percentage}%</span>
        ))}
      </div>
    </div>
  );
};

export default React.memo(CircularProgress);
