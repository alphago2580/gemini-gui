import React, { useState, useCallback, useRef, useEffect } from 'react';
import './Collapsible.css';

export interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'bordered' | 'filled';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  icon,
  badge,
  disabled = false,
  variant = 'default',
  size = 'medium',
  animated = true,
  children,
  className,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const newOpen = !isOpen;
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onToggle?.(newOpen);
  }, [disabled, isOpen, isControlled, onToggle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  const containerClass = [
    'collapsible',
    `collapsible-${variant}`,
    `collapsible-${size}`,
    isOpen && 'collapsible-open',
    disabled && 'collapsible-disabled',
    animated && 'collapsible-animated',
    className,
  ].filter(Boolean).join(' ');

  const panelId = `collapsible-panel-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const triggerId = `collapsible-trigger-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={containerClass}>
      <button
        id={triggerId}
        className="collapsible-trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-disabled={disabled}
        disabled={disabled}
        type="button"
      >
        <span className="collapsible-chevron" aria-hidden="true">
          ›
        </span>
        {icon && <span className="collapsible-icon" aria-hidden="true">{icon}</span>}
        <span className="collapsible-title">{title}</span>
        {badge && <span className="collapsible-badge">{badge}</span>}
      </button>
      <div
        id={panelId}
        ref={contentRef}
        className="collapsible-content"
        role="region"
        aria-labelledby={triggerId}
        style={animated ? {
          maxHeight: isOpen ? contentHeight : 0,
          opacity: isOpen ? 1 : 0,
        } : undefined}
        hidden={!animated && !isOpen}
      >
        <div className="collapsible-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Collapsible);
