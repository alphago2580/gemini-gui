import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  variant = 'default',
  size = 'medium',
  animated = false,
}) => {
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = max > 0 ? Math.round((clampedValue / max) * 100) : 0;

  return (
    <div
      className={`progress-bar progress-bar--${size}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `진행률 ${percentage}%`}
    >
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-track">
        <div
          className={`progress-fill progress-fill--${variant}${animated ? ' progress-fill--animated' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && <span className="progress-percentage">{percentage}%</span>}
    </div>
  );
};

export default React.memo(ProgressBar);
