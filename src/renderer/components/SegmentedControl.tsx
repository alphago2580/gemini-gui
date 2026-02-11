import React, { useCallback, useRef } from 'react';
import './SegmentedControl.css';

export interface SegmentedControlOption {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'ghost';
  fullWidth?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'medium',
  variant = 'default',
  fullWidth = false,
  disabled = false,
  ariaLabel = '세그먼트 컨트롤',
}) => {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (disabled) return;

    const enabledOptions = options.map((opt, i) => ({ opt, i })).filter(({ opt }) => !opt.disabled);
    if (enabledOptions.length === 0) return;

    const currentPos = enabledOptions.findIndex(({ i }) => i === index);

    let targetIndex = -1;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const nextPos = currentPos + 1 >= enabledOptions.length ? 0 : currentPos + 1;
        targetIndex = enabledOptions[nextPos].i;
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prevPos = currentPos - 1 < 0 ? enabledOptions.length - 1 : currentPos - 1;
        targetIndex = enabledOptions[prevPos].i;
        break;
      }
      case 'Home': {
        e.preventDefault();
        targetIndex = enabledOptions[0].i;
        break;
      }
      case 'End': {
        e.preventDefault();
        targetIndex = enabledOptions[enabledOptions.length - 1].i;
        break;
      }
    }

    if (targetIndex >= 0) {
      onChange(options[targetIndex].id);
      // Focus the target button
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[targetIndex]?.focus();
    }
  }, [disabled, options, onChange]);

  const handleClick = useCallback((option: SegmentedControlOption) => {
    if (disabled || option.disabled) return;
    onChange(option.id);
  }, [disabled, onChange]);

  const containerClass = [
    'segmented-control',
    `segmented-control-${size}`,
    `segmented-control-${variant}`,
    fullWidth && 'segmented-control-full-width',
    disabled && 'segmented-control-disabled',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={groupRef}
      className={containerClass}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const isSelected = option.id === value;
        const isDisabled = disabled || option.disabled;

        const buttonClass = [
          'segmented-control-option',
          isSelected && 'segmented-control-option-selected',
          isDisabled && 'segmented-control-option-disabled',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={option.id}
            className={buttonClass}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isDisabled || undefined}
            aria-label={option.label}
            tabIndex={isSelected ? 0 : -1}
            disabled={isDisabled}
            onClick={() => handleClick(option)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {option.icon && (
              <span className="segmented-control-icon" aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span className="segmented-control-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(SegmentedControl);
