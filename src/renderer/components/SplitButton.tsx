import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SplitButton.css';

export interface SplitButtonOption {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface SplitButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  options: SplitButtonOption[];
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  menuPosition?: 'bottom' | 'top';
  ariaLabel?: string;
}

const SplitButton: React.FC<SplitButtonProps> = ({
  label,
  icon,
  onClick,
  options,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  menuPosition = 'bottom',
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const toggleMenu = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
    setActiveIndex(-1);
  }, [disabled]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeMenu]);

  // Focus menu when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  const enabledOptions = options.filter(opt => !opt.disabled);

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex(prev => {
          const enabledIndices = options.map((opt, i) => ({ opt, i })).filter(({ opt }) => !opt.disabled);
          if (enabledIndices.length === 0) return -1;
          if (prev === -1) return enabledIndices[0].i;
          const currentPos = enabledIndices.findIndex(({ i }) => i === prev);
          const nextPos = (currentPos + 1) % enabledIndices.length;
          return enabledIndices[nextPos].i;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex(prev => {
          const enabledIndices = options.map((opt, i) => ({ opt, i })).filter(({ opt }) => !opt.disabled);
          if (enabledIndices.length === 0) return -1;
          if (prev === -1) return enabledIndices[enabledIndices.length - 1].i;
          const currentPos = enabledIndices.findIndex(({ i }) => i === prev);
          const nextPos = currentPos - 1 < 0 ? enabledIndices.length - 1 : currentPos - 1;
          return enabledIndices[nextPos].i;
        });
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (activeIndex >= 0 && !options[activeIndex].disabled) {
          closeMenu();
          options[activeIndex].onClick();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        closeMenu();
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (enabledOptions.length > 0) {
          const firstEnabled = options.findIndex(opt => !opt.disabled);
          setActiveIndex(firstEnabled);
        }
        break;
      }
      case 'End': {
        e.preventDefault();
        if (enabledOptions.length > 0) {
          for (let i = options.length - 1; i >= 0; i--) {
            if (!options[i].disabled) {
              setActiveIndex(i);
              break;
            }
          }
        }
        break;
      }
    }
  }, [activeIndex, options, enabledOptions.length, closeMenu]);

  const handleItemClick = useCallback((option: SplitButtonOption) => {
    if (option.disabled) return;
    closeMenu();
    option.onClick();
  }, [closeMenu]);

  const handleMainClick = useCallback(() => {
    if (disabled || loading) return;
    onClick();
  }, [disabled, loading, onClick]);

  const containerClass = [
    'split-button-container',
  ].filter(Boolean).join(' ');

  const groupClass = [
    'split-button-group',
    `split-button-${variant}`,
    size !== 'medium' && `split-button-${size}`,
    disabled && 'split-button-disabled',
    loading && 'split-button-loading',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} ref={containerRef}>
      <div className={groupClass} role="group" aria-label={ariaLabel || label}>
        <button
          className="split-button-main"
          onClick={handleMainClick}
          disabled={disabled || loading}
          aria-label={ariaLabel || label}
        >
          {loading && <span className="split-button-spinner" aria-hidden="true" />}
          {icon && !loading && <span aria-hidden="true">{icon}</span>}
          {label}
        </button>
        <span className="split-button-divider" aria-hidden="true" />
        <button
          className="split-button-toggle"
          onClick={toggleMenu}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`${label} 옵션`}
        >
          <span
            className={`split-button-arrow ${isOpen ? 'split-button-arrow-open' : ''}`}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>
      </div>
      {isOpen && (
        <ul
          className={`split-button-menu split-button-menu-${menuPosition}`}
          ref={menuRef}
          role="menu"
          aria-label={`${label} 옵션`}
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option.id}
              className={[
                'split-button-menu-item',
                index === activeIndex && 'split-button-menu-item-active',
                option.disabled && 'split-button-menu-item-disabled',
              ].filter(Boolean).join(' ')}
              role="menuitem"
              aria-disabled={option.disabled || undefined}
              onClick={() => handleItemClick(option)}
              onMouseEnter={() => {
                if (!option.disabled) setActiveIndex(index);
              }}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {option.icon && (
                <span className="split-button-menu-item-icon" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              <span className="split-button-menu-item-label">{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default React.memo(SplitButton);
