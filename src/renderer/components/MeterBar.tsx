import React, { useMemo } from 'react';
import './MeterBar.css';

export type MeterBarSize = 'small' | 'medium' | 'large';

export interface MeterBarProps {
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
  size?: MeterBarSize;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  label?: string;
  id?: string;
}

const MeterBar: React.FC<MeterBarProps> = ({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  size = 'medium',
  showValue = false,
  formatValue,
  label,
  id,
}) => {
  const clampedValue = Math.max(min, Math.min(value, max));
  const percentage = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;

  const variant = useMemo(() => {
    if (low === undefined && high === undefined) return 'default';

    const effectiveLow = low ?? min;
    const effectiveHigh = high ?? max;

    if (optimum !== undefined) {
      const optimumInLow = optimum <= effectiveLow;
      const optimumInHigh = optimum >= effectiveHigh;
      const optimumInMiddle = !optimumInLow && !optimumInHigh;

      if (optimumInMiddle) {
        if (clampedValue < effectiveLow || clampedValue > effectiveHigh) return 'danger';
        return 'success';
      }
      if (optimumInLow) {
        if (clampedValue <= effectiveLow) return 'success';
        if (clampedValue <= effectiveHigh) return 'warning';
        return 'danger';
      }
      if (optimumInHigh) {
        if (clampedValue >= effectiveHigh) return 'success';
        if (clampedValue >= effectiveLow) return 'warning';
        return 'danger';
      }
    }

    if (clampedValue < effectiveLow) return 'danger';
    if (clampedValue > effectiveHigh) return 'warning';
    return 'success';
  }, [clampedValue, min, max, low, high, optimum]);

  const displayValue = formatValue ? formatValue(clampedValue) : `${Math.round(clampedValue)}`;

  const classNames = [
    'meter-bar',
    `meter-bar--${size}`,
    `meter-bar--${variant}`,
  ].join(' ');

  return (
    <div id={id} className={classNames}>
      {label && <span className="meter-bar-label">{label}</span>}
      <div className="meter-bar-container">
        <div
          className="meter-bar-track"
          role="meter"
          aria-label={label || '미터'}
          aria-valuenow={clampedValue}
          aria-valuemin={min}
          aria-valuemax={max}
        >
          <div
            className="meter-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <span className="meter-bar-value">{displayValue}</span>
        )}
      </div>
    </div>
  );
};

export default React.memo(MeterBar);
