import React, { useMemo } from 'react';
import './StatCard.css';

export type StatCardVariant = 'default' | 'outlined' | 'elevated';
export type StatCardSize = 'small' | 'medium' | 'large';
export type StatCardTrend = 'up' | 'down' | 'neutral';

export interface StatCardProps {
  /** The label/title of the statistic */
  label: string;
  /** The value to display */
  value: string | number;
  /** Trend direction */
  trend?: StatCardTrend;
  /** Trend text (e.g. "+12%", "-3건") */
  trendText?: string;
  /** Icon character or emoji to display */
  icon?: string;
  /** Visual variant */
  variant?: StatCardVariant;
  /** Size preset */
  size?: StatCardSize;
  /** Optional description text below the value */
  description?: string;
  /** Custom accent color (CSS color value) */
  color?: string;
  /** Custom CSS class */
  className?: string;
  /** Element id */
  id?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendText,
  icon,
  variant = 'default',
  size = 'medium',
  description,
  color,
  className,
  id,
}) => {
  const classNames = useMemo(
    () =>
      [
        'stat-card',
        `stat-card--${variant}`,
        `stat-card--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [variant, size, className],
  );

  const trendClass = useMemo(() => {
    if (!trend) return '';
    return `stat-card-trend--${trend}`;
  }, [trend]);

  const trendArrow = useMemo(() => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return '\u2191';
      case 'down':
        return '\u2193';
      case 'neutral':
        return '\u2192';
    }
  }, [trend]);

  return (
    <div
      id={id}
      className={classNames}
      style={color ? { '--stat-card-accent': color } as React.CSSProperties : undefined}
      role="group"
      aria-label={`${label}: ${value}`}
    >
      {icon && (
        <span className="stat-card-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value" data-testid="stat-card-value">
          {value}
        </span>
        {(trend || trendText) && (
          <span className={`stat-card-trend ${trendClass}`.trim()}>
            {trendArrow && (
              <span className="stat-card-trend-arrow" aria-hidden="true">
                {trendArrow}
              </span>
            )}
            {trendText && <span className="stat-card-trend-text">{trendText}</span>}
          </span>
        )}
        {description && (
          <span className="stat-card-description">{description}</span>
        )}
      </div>
    </div>
  );
};

export default React.memo(StatCard);
