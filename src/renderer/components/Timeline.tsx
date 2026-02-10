import React from 'react';
import './Timeline.css';

export type TimelineVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  icon?: string;
  variant?: TimelineVariant;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
}

const VARIANT_COLORS: Record<TimelineVariant, string> = {
  default: 'timeline__dot--default',
  success: 'timeline__dot--success',
  warning: 'timeline__dot--warning',
  error: 'timeline__dot--error',
  info: 'timeline__dot--info',
};

const TimelineInner: React.FC<TimelineProps> = ({
  items,
  orientation = 'vertical',
}) => {
  if (items.length === 0) return null;

  return (
    <div
      className={`timeline timeline--${orientation}`}
      role="list"
      aria-label="타임라인"
    >
      {items.map((item, index) => {
        const variant = item.variant ?? 'default';
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            className={`timeline__item ${isLast ? 'timeline__item--last' : ''}`}
            role="listitem"
          >
            <div className="timeline__marker">
              <div className={`timeline__dot ${VARIANT_COLORS[variant]}`}>
                {item.icon && (
                  <span className="timeline__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
              </div>
              {!isLast && <div className="timeline__line" />}
            </div>
            <div className="timeline__content">
              <div className="timeline__header">
                <span className="timeline__title">{item.title}</span>
                {item.timestamp && (
                  <time className="timeline__timestamp">{item.timestamp}</time>
                )}
              </div>
              {item.description && (
                <p className="timeline__description">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Timeline = React.memo(TimelineInner);
export default Timeline;
