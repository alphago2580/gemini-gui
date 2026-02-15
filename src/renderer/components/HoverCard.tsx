import React, { useState, useRef, useCallback, useEffect } from 'react';
import './HoverCard.css';

export type HoverCardPosition = 'top' | 'bottom' | 'left' | 'right';

export interface HoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: HoverCardPosition;
  openDelay?: number;
  closeDelay?: number;
  showArrow?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

const HoverCard: React.FC<HoverCardProps> = ({
  trigger,
  children,
  position = 'bottom',
  openDelay = 400,
  closeDelay = 200,
  showArrow = true,
  disabled = false,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    openTimerRef.current = setTimeout(() => {
      setOpen(true);
    }, openDelay);
  }, [disabled, openDelay]);

  const handleClose = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, closeDelay);
  }, [closeDelay]);

  const handleContentEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleContentLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, closeDelay);
  }, [closeDelay]);

  const contentClass = [
    'hover-card-content',
    `hover-card-${position}`,
    showArrow && 'hover-card-with-arrow',
  ].filter(Boolean).join(' ');

  return (
    <div className="hover-card-container" ref={containerRef}>
      <div
        className="hover-card-trigger"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
      >
        {trigger}
      </div>

      {open && (
        <div
          className={contentClass}
          role="tooltip"
          aria-label={ariaLabel}
          onMouseEnter={handleContentEnter}
          onMouseLeave={handleContentLeave}
        >
          {showArrow && <div className="hover-card-arrow" />}
          <div className="hover-card-body">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HoverCard);
