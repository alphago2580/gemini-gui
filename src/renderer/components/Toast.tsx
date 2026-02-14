import React, { useEffect, useState, useMemo } from 'react';
import './Toast.css';
import * as S from '../constants/strings';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
  onDismissAll?: () => void;
}

const DEFAULT_MAX_VISIBLE = 5;
const TOAST_DURATION = 5000;

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`toast toast-${toast.type} ${exiting ? 'toast-exit' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="toast-message">{toast.message}</span>
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

const Toast: React.FC<ToastProps> = ({ toasts, onDismiss, maxVisible = DEFAULT_MAX_VISIBLE, onDismissAll }) => {
  const visibleToasts = useMemo(
    () => toasts.slice(0, maxVisible),
    [toasts, maxVisible]
  );
  const hiddenCount = toasts.length - visibleToasts.length;

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label={S.ARIA_TOAST_CONTAINER}>
      {toasts.length > 1 && onDismissAll && (
        <button
          className="toast-dismiss-all"
          onClick={onDismissAll}
          aria-label={S.ARIA_TOAST_DISMISS_ALL}
        >
          {S.TOAST_DISMISS_ALL}
        </button>
      )}
      {visibleToasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
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
