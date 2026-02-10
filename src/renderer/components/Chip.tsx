import React, { useCallback } from 'react';
import './Chip.css';

export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  icon?: string;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  icon,
  removable = false,
  onRemove,
  onClick,
  selected = false,
  disabled = false,
}) => {
  const isClickable = !!onClick && !disabled;

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onRemove) {
      onRemove();
    }
  }, [disabled, onRemove]);

  const handleClick = useCallback(() => {
    if (isClickable) {
      onClick!();
    }
  }, [isClickable, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
      e.preventDefault();
      onClick!();
    }
  }, [isClickable, onClick]);

  const className = [
    'chip',
    `chip--${variant}`,
    selected ? 'chip--selected' : '',
    disabled ? 'chip--disabled' : '',
    isClickable ? 'chip--clickable' : '',
  ].filter(Boolean).join(' ');

  return (
    <span
      className={className}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-disabled={disabled || undefined}
      aria-pressed={isClickable ? selected : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {icon && <span className="chip-icon" aria-hidden="true">{icon}</span>}
      <span className="chip-label">{label}</span>
      {removable && (
        <button
          className="chip-remove"
          onClick={handleRemove}
          aria-label={`${label} 삭제`}
          disabled={disabled}
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default React.memo(Chip);
