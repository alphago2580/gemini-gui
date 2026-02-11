import React, { useState, useCallback } from 'react';
import './AlertBanner.css';

export interface AlertBannerAction {
  id: string;
  label: string;
  onClick: () => void;
}

export interface AlertBannerProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  icon?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: AlertBannerAction[];
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
}

const DEFAULT_ICONS: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const VARIANT_ROLES: Record<string, string> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
};

const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  actions,
  size = 'medium',
  bordered = false,
}) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (dismissed) return null;

  const displayIcon = icon ?? DEFAULT_ICONS[variant];
  const role = VARIANT_ROLES[variant] || 'status';

  const containerClass = [
    'alert-banner',
    `alert-banner-${variant}`,
    `alert-banner-${size}`,
    bordered && 'alert-banner-bordered',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} role={role}>
      {displayIcon && (
        <span className="alert-banner-icon" aria-hidden="true">
          {displayIcon}
        </span>
      )}

      <div className="alert-banner-content">
        {title && <div className="alert-banner-title">{title}</div>}
        <div className="alert-banner-message">{children}</div>

        {actions && actions.length > 0 && (
          <div className="alert-banner-actions">
            {actions.map((action) => (
              <button
                key={action.id}
                className="alert-banner-action"
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {dismissible && (
        <button
          className="alert-banner-dismiss"
          onClick={handleDismiss}
          aria-label="닫기"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default React.memo(AlertBanner);
