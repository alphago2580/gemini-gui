import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import './Toast.css';
import * as S from '../constants/strings';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
  action?: ToastAction;
  duration?: number;
}

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
  onDismissAll?: () => void;
  pauseOnHover?: boolean;
  position?: ToastPosition;
  stacked?: boolean;
}

const DEFAULT_MAX_VISIBLE = 5;
const TOAST_DURATION = 5000;
const EXIT_ANIMATION_MS = 300;

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  pauseOnHover?: boolean;
  stackIndex?: number;
}> = ({ toast, onDismiss, pauseOnHover = false, stackIndex }) => {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(toast.duration ?? TOAST_DURATION);
  const startTimeRef = useRef(Date.now());

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), EXIT_ANIMATION_MS);
    }, remainingRef.current);
  }, [toast.id, onDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      pauseTimer();
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      startTimer();
    }
  };

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), EXIT_ANIMATION_MS);
  };

  const handleAction = () => {
    toast.action?.onClick();
    handleDismiss();
  };

  const stackClass = stackIndex !== undefined && stackIndex <= 4 ? ` toast-stack-${stackIndex}` : '';

  return (
    <div
      className={`toast toast-${toast.type}${exiting ? ' toast-exit' : ''}${stackClass}`}
      role="alert"
      aria-live="assertive"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="toast-message">{toast.message}</span>
      {toast.action && (
        <button
          className="toast-action"
          onClick={handleAction}
          aria-label={toast.action.label}
        >
          {toast.action.label}
        </button>
      )}
      <button
        className="toast-close"
        onClick={handleDismiss}
        aria-label={S.ARIA_TOAST_CLOSE}
      >
        &times;
      </button>
    </div>
  );
};

const Toast: React.FC<ToastProps> = ({ toasts, onDismiss, maxVisible = DEFAULT_MAX_VISIBLE, onDismissAll, pauseOnHover = false, position = 'top-right', stacked = false }) => {
  const visibleToasts = useMemo(
    () => toasts.slice(0, maxVisible),
    [toasts, maxVisible]
  );
  const hiddenCount = toasts.length - visibleToasts.length;

  if (toasts.length === 0) return null;

  const containerClass = [
    'toast-container',
    position !== 'top-right' ? `toast-container-${position}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} aria-label={S.ARIA_TOAST_CONTAINER}>
      {toasts.length > 1 && onDismissAll && (
        <button
          className="toast-dismiss-all"
          onClick={onDismissAll}
          aria-label={S.ARIA_TOAST_DISMISS_ALL}
        >
          {S.TOAST_DISMISS_ALL}
        </button>
      )}
      {visibleToasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} pauseOnHover={pauseOnHover} stackIndex={stacked ? index : undefined} />
      ))}
      {hiddenCount > 0 && (
        <div className="toast-overflow" role="status" aria-live="polite">
          {S.TOAST_MORE_COUNT(hiddenCount)}
        </div>
      )}
    </div>
  );
};

export default React.memo(Toast);
