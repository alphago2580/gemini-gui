import React, { useState, useEffect, useCallback, useRef } from 'react';
import './NotificationBanner.css';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

export interface NotificationBannerProps {
  message: string;
  variant?: BannerVariant;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoDismiss?: number;
}

const DEFAULT_ICONS: Record<BannerVariant, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

const VARIANT_LABELS: Record<BannerVariant, string> = {
  info: '정보',
  warning: '경고',
  error: '오류',
  success: '성공',
};

const NotificationBannerInner: React.FC<NotificationBannerProps> = ({
  message,
  variant = 'info',
  dismissible = true,
  onDismiss,
  icon,
  action,
  autoDismiss,
}) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (autoDismiss && autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, handleDismiss]);

  if (!visible) return null;

  const displayIcon = icon ?? DEFAULT_ICONS[variant];
  const ariaLabel = `${VARIANT_LABELS[variant]}: ${message}`;

  return (
    <div
      className={`notification-banner notification-banner--${variant} ${exiting ? 'notification-banner--exit' : ''}`}
      role="alert"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <span className="notification-banner__icon" aria-hidden="true">
        {displayIcon}
      </span>
      <span className="notification-banner__message">{message}</span>
      {action && (
        <button
          className="notification-banner__action"
          onClick={action.onClick}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button
          className="notification-banner__close"
          onClick={handleDismiss}
          aria-label="배너 닫기"
          title="닫기"
        >
          &times;
        </button>
      )}
    </div>
  );
};

const NotificationBanner = React.memo(NotificationBannerInner);
export default NotificationBanner;
