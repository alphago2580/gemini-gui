import React, { useCallback } from 'react';
import './Switch.css';

export type SwitchSize = 'small' | 'medium' | 'large';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: SwitchSize;
  id?: string;
  'aria-label'?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  id,
  'aria-label': ariaLabel,
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, disabled, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  }, [checked, disabled, onChange]);

  const switchElement = (
    <div
      id={id}
      className={`switch switch--${size}${checked ? ' switch--checked' : ''}${disabled ? ' switch--disabled' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel || (!label ? '토글' : undefined)}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="switch-track">
        <div className="switch-thumb" />
      </div>
    </div>
  );

  if (label) {
    return (
      <label className={`switch-label${disabled ? ' switch-label--disabled' : ''}`}>
        {switchElement}
        <span className="switch-label-text">{label}</span>
      </label>
    );
  }

  return switchElement;
};

export default React.memo(Switch);
