import React from 'react';
import './Badge.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface BadgeProps {
  count?: number;
  text?: string;
  variant?: BadgeVariant;
  maxCount?: number;
  dot?: boolean;
  visible?: boolean;
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  count,
  text,
  variant = 'default',
  maxCount = 99,
  dot = false,
  visible = true,
  children,
}) => {
  if (!visible) {
    return <>{children}</>;
  }

  const displayText = text || (count !== undefined
    ? (count > maxCount ? `${maxCount}+` : String(count))
    : undefined);

  const shouldHide = !dot && count !== undefined && count <= 0 && !text;

  if (children) {
    return (
      <span className="badge-wrapper">
        {children}
        {!shouldHide && (
          <span
            className={`badge badge--${variant}${dot ? ' badge--dot' : ''}`}
            role="status"
            aria-label={dot ? '알림 있음' : displayText ? `${displayText}개` : '알림'}
          >
            {!dot && displayText}
          </span>
        )}
      </span>
    );
  }

  if (shouldHide) return null;

  return (
    <span
      className={`badge badge--inline badge--${variant}${dot ? ' badge--dot' : ''}`}
      role="status"
      aria-label={dot ? '알림 있음' : displayText ? `${displayText}개` : '알림'}
    >
      {!dot && displayText}
    </span>
  );
};

export default React.memo(Badge);
