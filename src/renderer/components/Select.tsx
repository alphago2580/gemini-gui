import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  group?: string;
}

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'outlined' | 'filled';

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  maxHeight?: number;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  label,
  size = 'md',
  variant = 'default',
  multiple = false,
  searchable = false,
  clearable = false,
  disabled = false,
  error,
  maxHeight = 240,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = useMemo((): string[] => {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(opt => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  const groups = useMemo(() => {
    const grouped = new Map<string, SelectOption[]>();
    const ungrouped: SelectOption[] = [];

    for (const opt of filteredOptions) {
      if (opt.group) {
        const list = grouped.get(opt.group) ?? [];
        list.push(opt);
        grouped.set(opt.group, list);
      } else {
        ungrouped.push(opt);
      }
    }

    return { grouped, ungrouped };
  }, [filteredOptions]);

  const flatItems = useMemo((): SelectOption[] => {
    const result: SelectOption[] = [];
    if (groups.ungrouped.length > 0) {
      result.push(...groups.ungrouped);
    }
    for (const [, opts] of groups.grouped) {
      result.push(...opts);
    }
    return result;
  }, [groups]);

  const actionableItems = useMemo(() => {
    return flatItems
      .map((opt, index) => ({ opt, index }))
      .filter(({ opt }) => !opt.disabled);
  }, [flatItems]);

  const selectedLabels = useMemo(() => {
    return selectedValues
      .map(v => options.find(opt => opt.value === v))
      .filter((opt): opt is SelectOption => !!opt)
      .map(opt => opt.label);
  }, [selectedValues, options]);

  const displayText = useMemo(() => {
    if (selectedLabels.length === 0) return '';
    if (!multiple) return selectedLabels[0];
    return `${selectedLabels.length}개 선택됨`;
  }, [selectedLabels, multiple]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset active index on filter change
  useEffect(() => {
    setActiveIndex(-1);
  }, [search]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current || activeIndex < 0) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    const activeEl = items[activeIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const toggleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => {
      if (prev) setSearch('');
      return !prev;
    });
    setActiveIndex(-1);
  }, [disabled]);

  const handleSelect = useCallback((optValue: string) => {
    if (!onChange) return;

    if (multiple) {
      const current = selectedValues;
      const next = current.includes(optValue)
        ? current.filter(v => v !== optValue)
        : [...current, optValue];
      onChange(next);
    } else {
      onChange(optValue);
      setIsOpen(false);
      setSearch('');
    }
  }, [multiple, onChange, selectedValues]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    onChange(multiple ? [] : '');
  }, [multiple, onChange]);

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
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
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
      case 'Enter':
      case ' ': {
        if (searchable && e.key === ' ') break;
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < flatItems.length) {
          const opt = flatItems[activeIndex];
          if (!opt.disabled) {
            handleSelect(opt.value);
          }
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        setSearch('');
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
  }, [isOpen, activeIndex, flatItems, actionableItems, findNextActionableIndex, handleSelect, searchable]);

  const isSelected = useCallback((optValue: string) => {
    return selectedValues.includes(optValue);
  }, [selectedValues]);

  const renderOption = (opt: SelectOption, index: number) => {
    const selected = isSelected(opt.value);
    const active = index === activeIndex;

    return (
      <li
        key={opt.value}
        className={[
          'select-option',
          selected && 'select-option--selected',
          active && 'select-option--active',
          opt.disabled && 'select-option--disabled',
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
        {multiple && (
          <span className="select-option-check" aria-hidden="true">
            {selected ? '✓' : ''}
          </span>
        )}
        {opt.icon && (
          <span className="select-option-icon" aria-hidden="true">{opt.icon}</span>
        )}
        <span className="select-option-label">{opt.label}</span>
        {!multiple && selected && (
          <span className="select-option-check-single" aria-hidden="true">✓</span>
        )}
      </li>
    );
  };

  const renderOptions = () => {
    if (flatItems.length === 0) {
      return (
        <li className="select-no-results" role="option" aria-disabled="true">
          결과가 없습니다
        </li>
      );
    }

    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    if (groups.ungrouped.length > 0) {
      for (const opt of groups.ungrouped) {
        elements.push(renderOption(opt, currentIndex));
        currentIndex++;
      }
    }

    for (const [groupName, opts] of groups.grouped) {
      elements.push(
        <li key={`group-${groupName}`} className="select-group-label" role="presentation">
          {groupName}
        </li>
      );
      for (const opt of opts) {
        elements.push(renderOption(opt, currentIndex));
        currentIndex++;
      }
    }

    return elements;
  };

  const showClear = clearable && selectedValues.length > 0 && !disabled;

  const containerClassName = [
    'select-container',
    `select--${size}`,
    `select--${variant}`,
    isOpen && 'select--open',
    disabled && 'select--disabled',
    error && 'select--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label className="select-label">{label}</label>
      )}
      <div
        className="select-trigger"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label ?? placeholder}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={toggleOpen}
      >
        <span className={`select-value ${!displayText ? 'select-placeholder' : ''}`}>
          {displayText || placeholder}
        </span>
        <span className="select-controls">
          {showClear && (
            <button
              className="select-clear"
              onClick={handleClear}
              aria-label="선택 초기화"
              type="button"
              tabIndex={-1}
            >
              ×
            </button>
          )}
          <span className="select-arrow" aria-hidden="true">
            ▾
          </span>
        </span>
      </div>

      {isOpen && (
        <div className="select-dropdown">
          {searchable && (
            <div className="select-search-container">
              <input
                ref={searchInputRef}
                className="select-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="검색..."
                aria-label="옵션 검색"
                role="searchbox"
              />
            </div>
          )}
          <ul
            ref={listRef}
            className="select-options"
            role="listbox"
            aria-multiselectable={multiple || undefined}
            aria-label={label ?? placeholder}
            style={{ maxHeight }}
          >
            {renderOptions()}
          </ul>
        </div>
      )}

      {error && (
        <span className="select-error" role="alert">{error}</span>
      )}
    </div>
  );
};

export default React.memo(Select);
