import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Popover.css';

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  size?: 'small' | 'medium' | 'large';
  offset?: number;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  showArrow?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  position = 'bottom',
  align = 'center',
  size = 'medium',
  offset = 8,
  closeOnClickOutside = true,
  closeOnEscape = true,
  showArrow = true,
  isOpen: controlledOpen,
  onOpenChange,
  ariaLabel = '팝오버',
  disabled = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback((open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  }, [isControlled, onOpenChange]);

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen(!isOpen);
  }, [disabled, isOpen, setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, close]);

  // Focus trap: Tab inside popover
  const handleContentKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && contentRef.current) {
      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, []);

  const offsetStyle = getOffsetStyle(position, offset);

  const contentClass = [
    'popover-content',
    `popover-${position}`,
    `popover-align-${align}`,
    `popover-${size}`,
    showArrow && 'popover-with-arrow',
  ].filter(Boolean).join(' ');

  return (
    <div className="popover-container" ref={containerRef}>
      <button
        ref={triggerRef}
        className="popover-trigger"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        type="button"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={contentRef}
          className={contentClass}
          role="dialog"
          aria-label={ariaLabel}
          style={offsetStyle}
          onKeyDown={handleContentKeyDown}
        >
          {showArrow && <div className="popover-arrow" />}
          <div className="popover-body">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

function getOffsetStyle(position: string, offset: number): React.CSSProperties {
  switch (position) {
    case 'top':
      return { bottom: `calc(100% + ${offset}px)` };
    case 'bottom':
      return { top: `calc(100% + ${offset}px)` };
    case 'left':
      return { right: `calc(100% + ${offset}px)` };
    case 'right':
      return { left: `calc(100% + ${offset}px)` };
    default:
      return { top: `calc(100% + ${offset}px)` };
  }
}

export default React.memo(Popover);
