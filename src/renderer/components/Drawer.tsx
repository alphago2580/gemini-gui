import React, { useEffect, useCallback, useRef } from 'react';
import './Drawer.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large' | 'full';
  title?: string;
  showClose?: boolean;
  overlay?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  position = 'right',
  size = 'medium',
  title,
  showClose = true,
  overlay = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  children,
  className,
  ariaLabel,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }

    // Focus trap
    if (e.key === 'Tab' && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      // Focus the drawer panel
      requestAnimationFrame(() => {
        drawerRef.current?.focus();
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlay) {
      onClose();
    }
  }, [closeOnOverlay, onClose]);

  if (!open) return null;

  const drawerClass = [
    'drawer-panel',
    `drawer-${position}`,
    `drawer-${size}`,
    open && 'drawer-open',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="drawer-container" data-testid="drawer-container">
      {overlay && (
        <div
          className="drawer-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
          data-testid="drawer-overlay"
        />
      )}
      <div
        ref={drawerRef}
        className={drawerClass}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title ?? '서랍 패널'}
        tabIndex={-1}
      >
        {(title || showClose) && (
          <div className="drawer-header">
            {title && <h2 className="drawer-title">{title}</h2>}
            {showClose && (
              <button
                className="drawer-close"
                onClick={onClose}
                aria-label="닫기"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
};

export default React.memo(Drawer);
