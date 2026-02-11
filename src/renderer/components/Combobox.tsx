import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Combobox.css';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export type ComboboxSize = 'sm' | 'md' | 'lg';

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  onInputChange?: (input: string) => void;
  placeholder?: string;
  label?: string;
  size?: ComboboxSize;
  allowFreeInput?: boolean;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  emptyMessage?: string;
  maxHeight?: number;
  autoHighlight?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  onInputChange,
  placeholder = '입력하세요',
  label,
  size = 'md',
  allowFreeInput = false,
  disabled = false,
  error,
  loading = false,
  emptyMessage = '결과가 없습니다',
  maxHeight = 240,
  autoHighlight = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync input display with selected value
  useEffect(() => {
    if (value !== undefined) {
      const found = options.find(opt => opt.value === value);
      setInputValue(found ? found.label : value);
    } else {
      setInputValue('');
    }
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    const lower = inputValue.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(lower) ||
      (opt.description && opt.description.toLowerCase().includes(lower))
    );
  }, [options, inputValue]);

  const actionableItems = useMemo(() => {
    return filteredOptions
      .map((opt, index) => ({ opt, index }))
      .filter(({ opt }) => !opt.disabled);
  }, [filteredOptions]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Revert input if not allowFreeInput and no match
        if (!allowFreeInput && value !== undefined) {
          const found = options.find(opt => opt.value === value);
          setInputValue(found ? found.label : '');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, allowFreeInput, value, options]);

  // Reset active index on filter change
  useEffect(() => {
    if (autoHighlight && actionableItems.length > 0) {
      setActiveIndex(actionableItems[0].index);
    } else {
      setActiveIndex(-1);
    }
  }, [inputValue, actionableItems.length, autoHighlight]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current || activeIndex < 0) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    const activeEl = items[activeIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleSelect = useCallback((optValue: string) => {
    const found = options.find(opt => opt.value === optValue);
    if (found) {
      setInputValue(found.label);
    }
    onChange?.(optValue);
    setIsOpen(false);
    inputRef.current?.blur();
  }, [options, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onInputChange?.(val);

    if (!isOpen) {
      setIsOpen(true);
    }

    if (allowFreeInput) {
      onChange?.(val);
    }
  }, [isOpen, allowFreeInput, onChange, onInputChange]);

  const handleInputFocus = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
  }, [disabled]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange?.('');
    onInputChange?.('');
    inputRef.current?.focus();
  }, [onChange, onInputChange]);

  const findNextActionableIndex = useCallback((current: number, direction: 1 | -1): number => {
    if (actionableItems.length === 0) return -1;

    if (current === -1) {
      return direction === 1 ? actionableItems[0].index : actionableItems[actionableItems.length - 1].index;
    }

    const currentPos = actionableItems.findIndex(({ index }) => index === current);
    if (currentPos === -1) {
      return direction === 1 ? actionableItems[0].index : actionableItems[actionableItems.length - 1].index;
    }

    const nextPos = currentPos + direction;
    if (nextPos < 0) return actionableItems[actionableItems.length - 1].index;
    if (nextPos >= actionableItems.length) return actionableItems[0].index;
    return actionableItems[nextPos].index;
  }, [actionableItems]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex(prev => findNextActionableIndex(prev, 1));
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex(prev => findNextActionableIndex(prev, -1));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          const opt = filteredOptions[activeIndex];
          if (!opt.disabled) {
            handleSelect(opt.value);
          }
        } else if (allowFreeInput && inputValue) {
          onChange?.(inputValue);
          setIsOpen(false);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        if (!allowFreeInput && value !== undefined) {
          const found = options.find(opt => opt.value === value);
          setInputValue(found ? found.label : '');
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (actionableItems.length > 0) {
          setActiveIndex(actionableItems[0].index);
        }
        break;
      }
      case 'End': {
        e.preventDefault();
        if (actionableItems.length > 0) {
          setActiveIndex(actionableItems[actionableItems.length - 1].index);
        }
        break;
      }
    }
  }, [isOpen, activeIndex, filteredOptions, actionableItems, findNextActionableIndex, handleSelect, allowFreeInput, inputValue, onChange, value, options]);

  const showClear = inputValue.length > 0 && !disabled;

  const containerClassName = [
    'combobox-container',
    `combobox--${size}`,
    isOpen && 'combobox--open',
    disabled && 'combobox--disabled',
    error && 'combobox--error',
  ].filter(Boolean).join(' ');

  const listId = useMemo(() => `combobox-list-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <div className={containerClassName} ref={containerRef}>
      {label && (
        <label className="combobox-label">{label}</label>
      )}
      <div className="combobox-input-wrapper">
        <input
          ref={inputRef}
          className="combobox-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          aria-label={label ?? placeholder}
          aria-invalid={error ? true : undefined}
        />
        <span className="combobox-controls">
          {showClear && (
            <button
              className="combobox-clear"
              onClick={handleClear}
              aria-label="입력 초기화"
              type="button"
              tabIndex={-1}
            >
              ×
            </button>
          )}
          <span
            className="combobox-arrow"
            aria-hidden="true"
            onClick={() => {
              if (!disabled) {
                setIsOpen(prev => !prev);
                inputRef.current?.focus();
              }
            }}
          >
            ▾
          </span>
        </span>
      </div>

      {isOpen && (
        <div className="combobox-dropdown">
          {loading ? (
            <div className="combobox-loading" role="status">
              <span className="combobox-loading-spinner" />
              로딩 중...
            </div>
          ) : (
            <ul
              ref={listRef}
              id={listId}
              className="combobox-options"
              role="listbox"
              aria-label={label ?? placeholder}
              style={{ maxHeight }}
            >
              {filteredOptions.length === 0 ? (
                <li className="combobox-no-results" role="option" aria-disabled="true">
                  {emptyMessage}
                </li>
              ) : (
                filteredOptions.map((opt, index) => {
                  const active = index === activeIndex;
                  const selected = value === opt.value;

                  return (
                    <li
                      key={opt.value}
                      id={`${listId}-option-${index}`}
                      className={[
                        'combobox-option',
                        active && 'combobox-option--active',
                        selected && 'combobox-option--selected',
                        opt.disabled && 'combobox-option--disabled',
                      ].filter(Boolean).join(' ')}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={opt.disabled || undefined}
                      onClick={() => {
                        if (!opt.disabled) handleSelect(opt.value);
                      }}
                      onMouseEnter={() => {
                        if (!opt.disabled) setActiveIndex(index);
                      }}
                    >
                      {opt.icon && (
                        <span className="combobox-option-icon" aria-hidden="true">{opt.icon}</span>
                      )}
                      <div className="combobox-option-content">
                        <span className="combobox-option-label">{opt.label}</span>
                        {opt.description && (
                          <span className="combobox-option-description">{opt.description}</span>
                        )}
                      </div>
                      {selected && (
                        <span className="combobox-option-check" aria-hidden="true">✓</span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      )}

      {error && (
        <span className="combobox-error" role="alert">{error}</span>
      )}
    </div>
  );
};

export default React.memo(Combobox);
