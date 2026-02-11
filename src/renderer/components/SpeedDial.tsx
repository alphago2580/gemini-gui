import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SpeedDial.css';

export interface SpeedDialAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface SpeedDialProps {
  actions: SpeedDialAction[];
  icon?: string;
  openIcon?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  ariaLabel?: string;
  tooltipPosition?: 'left' | 'right' | 'top' | 'bottom';
  onOpen?: () => void;
  onClose?: () => void;
}

const SpeedDial: React.FC<SpeedDialProps> = ({
  actions,
  icon = '+',
  openIcon,
  direction = 'up',
  size = 'medium',
  variant = 'primary',
  disabled = false,
  ariaLabel = '빠른 액션',
  tooltipPosition,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const resolvedTooltipPosition = tooltipPosition ?? getDefaultTooltipPosition(direction);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setActiveIndex(-1);
    onOpen?.();
  }, [disabled, onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  const enabledActions = actions.filter(a => !a.disabled);

  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowUp': {
        if (direction === 'up' || direction === 'down') {
          e.preventDefault();
          if (!isOpen) {
            open();
          }
          if (enabledActions.length > 0) {
            const firstIdx = actions.findIndex(a => !a.disabled);
            setActiveIndex(firstIdx);
          }
        }
        break;
      }
      case 'ArrowDown': {
        if (direction === 'up' || direction === 'down') {
          e.preventDefault();
          if (!isOpen) {
            open();
          }
          if (enabledActions.length > 0) {
            const firstIdx = actions.findIndex(a => !a.disabled);
            setActiveIndex(firstIdx);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        if (direction === 'left' || direction === 'right') {
          e.preventDefault();
          if (!isOpen) {
            open();
          }
          if (enabledActions.length > 0) {
            const firstIdx = actions.findIndex(a => !a.disabled);
            setActiveIndex(firstIdx);
          }
        }
        break;
      }
      case 'ArrowRight': {
        if (direction === 'left' || direction === 'right') {
          e.preventDefault();
          if (!isOpen) {
            open();
          }
          if (enabledActions.length > 0) {
            const firstIdx = actions.findIndex(a => !a.disabled);
            setActiveIndex(firstIdx);
          }
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        toggle();
        break;
      }
    }
  }, [disabled, direction, isOpen, open, toggle, actions, enabledActions.length]);

  const handleActionKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isVertical = direction === 'up' || direction === 'down';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

    switch (e.key) {
      case nextKey: {
        e.preventDefault();
        setActiveIndex(prev => {
          const enabledIndices = actions.map((a, i) => ({ a, i })).filter(({ a }) => !a.disabled);
          if (enabledIndices.length === 0) return -1;
          const currentPos = enabledIndices.findIndex(({ i }) => i === prev);
          if (currentPos === -1) return enabledIndices[0].i;
          const nextPos = (currentPos + 1) % enabledIndices.length;
          return enabledIndices[nextPos].i;
        });
        break;
      }
      case prevKey: {
        e.preventDefault();
        setActiveIndex(prev => {
          const enabledIndices = actions.map((a, i) => ({ a, i })).filter(({ a }) => !a.disabled);
          if (enabledIndices.length === 0) return -1;
          const currentPos = enabledIndices.findIndex(({ i }) => i === prev);
          if (currentPos === -1) return enabledIndices[enabledIndices.length - 1].i;
          const nextPos = currentPos - 1 < 0 ? enabledIndices.length - 1 : currentPos - 1;
          return enabledIndices[nextPos].i;
        });
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (activeIndex >= 0 && !actions[activeIndex].disabled) {
          actions[activeIndex].onClick();
          close();
          triggerRef.current?.focus();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        const firstIdx = actions.findIndex(a => !a.disabled);
        if (firstIdx >= 0) setActiveIndex(firstIdx);
        break;
      }
      case 'End': {
        e.preventDefault();
        for (let i = actions.length - 1; i >= 0; i--) {
          if (!actions[i].disabled) {
            setActiveIndex(i);
            break;
          }
        }
        break;
      }
    }
  }, [direction, activeIndex, actions, close]);

  // Focus active action button
  useEffect(() => {
    if (activeIndex < 0 || !containerRef.current) return;
    const actionButtons = containerRef.current.querySelectorAll<HTMLButtonElement>('.speed-dial-action-button');
    const visibleIndex = actions.slice(0, activeIndex + 1).filter((_, i) => i <= activeIndex).length - 1;
    actionButtons[visibleIndex]?.focus();
  }, [activeIndex, actions]);

  const handleActionClick = useCallback((action: SpeedDialAction) => {
    if (action.disabled) return;
    action.onClick();
    close();
    triggerRef.current?.focus();
  }, [close]);

  const containerClass = [
    'speed-dial',
    `speed-dial-${direction}`,
    `speed-dial-${size}`,
    `speed-dial-${variant}`,
    isOpen && 'speed-dial-open',
    disabled && 'speed-dial-disabled',
  ].filter(Boolean).join(' ');

  const displayIcon = isOpen && openIcon ? openIcon : icon;

  return (
    <div className={containerClass} ref={containerRef}>
      <button
        ref={triggerRef}
        className={`speed-dial-trigger ${isOpen ? 'speed-dial-trigger-open' : ''}`}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="speed-dial-trigger-icon" aria-hidden="true">
          {displayIcon}
        </span>
      </button>

      {isOpen && (
        <div
          className="speed-dial-actions"
          role="menu"
          aria-label={ariaLabel}
          onKeyDown={handleActionKeyDown}
        >
          {actions.map((action, index) => (
            <div
              key={action.id}
              className={[
                'speed-dial-action',
                `speed-dial-tooltip-${resolvedTooltipPosition}`,
                action.disabled && 'speed-dial-action-disabled',
                index === activeIndex && 'speed-dial-action-active',
              ].filter(Boolean).join(' ')}
              style={{ '--action-index': index } as React.CSSProperties}
            >
              <button
                className="speed-dial-action-button"
                role="menuitem"
                aria-label={action.label}
                aria-disabled={action.disabled || undefined}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
              >
                <span aria-hidden="true">{action.icon}</span>
              </button>
              <span className="speed-dial-action-tooltip">{action.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function getDefaultTooltipPosition(direction: string): 'left' | 'right' | 'top' | 'bottom' {
  switch (direction) {
    case 'up':
    case 'down':
      return 'left';
    case 'left':
      return 'top';
    case 'right':
      return 'top';
    default:
      return 'left';
  }
}

export default React.memo(SpeedDial);
