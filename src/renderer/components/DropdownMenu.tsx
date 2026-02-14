import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './DropdownMenu.css';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownMenuSeparator {
  type: 'separator';
}

export type DropdownMenuEntry = DropdownMenuItem | DropdownMenuSeparator;

export function isSeparator(entry: DropdownMenuEntry): entry is DropdownMenuSeparator {
  return 'type' in entry && entry.type === 'separator';
}

export interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownMenuEntry[];
  trigger?: React.ReactNode;
  triggerClassName?: string;
  onToggle?: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  label?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  onClose,
  items,
  trigger,
  triggerClassName,
  onToggle,
  position = 'bottom-left',
  label = '메뉴',
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const actionableItems = useMemo(() => {
    return items
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => !isSeparator(entry) && !(entry as DropdownMenuItem).disabled);
  }, [items]);

  // Reset active index when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Focus menu when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const findNextActionableIndex = useCallback((currentActive: number, direction: 1 | -1): number => {
    if (actionableItems.length === 0) return -1;

    if (currentActive === -1) {
      return direction === 1 ? actionableItems[0].index : actionableItems[actionableItems.length - 1].index;
    }

    const currentPos = actionableItems.findIndex(({ index }) => index === currentActive);
    if (currentPos === -1) {
      return direction === 1 ? actionableItems[0].index : actionableItems[actionableItems.length - 1].index;
    }

    const nextPos = currentPos + direction;
    if (nextPos < 0) return actionableItems[actionableItems.length - 1].index;
    if (nextPos >= actionableItems.length) return actionableItems[0].index;
    return actionableItems[nextPos].index;
  }, [actionableItems]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = findNextActionableIndex(activeIndex, 1);
        setActiveIndex(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = findNextActionableIndex(activeIndex, -1);
        setActiveIndex(prev);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (activeIndex >= 0) {
          const entry = items[activeIndex];
          if (!isSeparator(entry) && !entry.disabled && entry.onClick) {
            onClose();
            entry.onClick();
          }
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        onClose();
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
  }, [activeIndex, items, actionableItems, findNextActionableIndex, onClose]);

  const handleItemClick = useCallback((entry: DropdownMenuEntry) => {
    if (isSeparator(entry) || (entry as DropdownMenuItem).disabled) return;
    const item = entry as DropdownMenuItem;
    onClose();
    item.onClick?.();
  }, [onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!menuRef.current || activeIndex < 0) return;
    const activeEl = menuRef.current.children[activeIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div className="dropdown-menu-container" ref={containerRef}>
      {trigger && (
        <button
          className={['dropdown-menu-trigger', triggerClassName].filter(Boolean).join(' ')}
          onClick={onToggle}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={label}
        >
          {trigger}
        </button>
      )}
      {isOpen && (
        <ul
          className={`dropdown-menu dropdown-menu-${position}`}
          ref={menuRef}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {items.map((entry, index) => {
            if (isSeparator(entry)) {
              return (
                <li
                  key={`sep-${index}`}
                  className="dropdown-menu-separator"
                  role="separator"
                />
              );
            }

            const item = entry as DropdownMenuItem;
            const isActive = index === activeIndex;

            return (
              <li
                key={item.id}
                className={[
                  'dropdown-menu-item',
                  isActive && 'dropdown-menu-item-active',
                  item.disabled && 'dropdown-menu-item-disabled',
                  item.danger && 'dropdown-menu-item-danger',
                ].filter(Boolean).join(' ')}
                role="menuitem"
                aria-disabled={item.disabled || undefined}
                onClick={() => handleItemClick(entry)}
                onMouseEnter={() => {
                  if (!item.disabled) setActiveIndex(index);
                }}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                {item.icon && (
                  <span className="dropdown-menu-item-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="dropdown-menu-item-label">{item.label}</span>
                {item.shortcut && (
                  <span className="dropdown-menu-item-shortcut">{item.shortcut}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default React.memo(DropdownMenu);
