import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import './Toolbar.css';

export interface ToolbarItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  tooltip?: string;
}

export interface ToolbarGroup {
  id: string;
  items: ToolbarItem[];
}

export interface ToolbarProps {
  groups: ToolbarGroup[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'ghost';
  overflowBehavior?: 'wrap' | 'collapse';
  disabled?: boolean;
  ariaLabel?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  groups,
  orientation = 'horizontal',
  size = 'medium',
  variant = 'default',
  overflowBehavior = 'wrap',
  disabled = false,
  ariaLabel = '도구 모음',
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [overflowItems, setOverflowItems] = useState<ToolbarItem[]>([]);
  const [visibleGroups, setVisibleGroups] = useState<ToolbarGroup[]>(groups);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [overflowActiveIndex, setOverflowActiveIndex] = useState(-1);
  const overflowMenuRef = useRef<HTMLUListElement>(null);
  const overflowBtnRef = useRef<HTMLButtonElement>(null);

  const allItems = useMemo(
    () => groups.flatMap(g => g.items),
    [groups],
  );

  // Compute overflow when collapse mode is active
  useEffect(() => {
    if (overflowBehavior !== 'collapse' || orientation === 'vertical') {
      setVisibleGroups(groups);
      setOverflowItems([]);
      return;
    }

    const toolbar = toolbarRef.current;
    if (!toolbar) {
      setVisibleGroups(groups);
      setOverflowItems([]);
      return;
    }

    const observer = new ResizeObserver(() => {
      const containerWidth = toolbar.clientWidth;
      // Reserve space for the overflow button (40px)
      const availableWidth = containerWidth - 40;

      // Measure items by inspecting children
      const buttons = toolbar.querySelectorAll<HTMLElement>('[data-toolbar-item]');
      let usedWidth = 0;
      let cutoffIndex = allItems.length;

      for (let i = 0; i < buttons.length; i++) {
        const btnWidth = buttons[i].offsetWidth + 4; // 4px gap
        if (usedWidth + btnWidth > availableWidth) {
          cutoffIndex = i;
          break;
        }
        usedWidth += btnWidth;
      }

      if (cutoffIndex >= allItems.length) {
        setVisibleGroups(groups);
        setOverflowItems([]);
      } else {
        // Build visible groups up to cutoff
        let itemCount = 0;
        const visible: ToolbarGroup[] = [];
        const overflow: ToolbarItem[] = [];

        for (const group of groups) {
          const visibleItems: ToolbarItem[] = [];
          for (const item of group.items) {
            if (itemCount < cutoffIndex) {
              visibleItems.push(item);
            } else {
              overflow.push(item);
            }
            itemCount++;
          }
          if (visibleItems.length > 0) {
            visible.push({ id: group.id, items: visibleItems });
          }
        }

        setVisibleGroups(visible);
        setOverflowItems(overflow);
      }
    });

    observer.observe(toolbar);
    return () => observer.disconnect();
  }, [groups, overflowBehavior, orientation, allItems.length]);

  // Close overflow menu on outside click
  useEffect(() => {
    if (!overflowOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        overflowMenuRef.current &&
        !overflowMenuRef.current.contains(e.target as Node) &&
        overflowBtnRef.current &&
        !overflowBtnRef.current.contains(e.target as Node)
      ) {
        setOverflowOpen(false);
        setOverflowActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [overflowOpen]);

  // Focus management within toolbar (arrow key navigation per WAI-ARIA toolbar pattern)
  const handleToolbarKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const buttons = toolbar.querySelectorAll<HTMLButtonElement>(
      'button:not([disabled]):not(.toolbar-overflow-btn)'
    );
    const btnArray = Array.from(buttons);
    const current = document.activeElement as HTMLButtonElement;
    const currentIndex = btnArray.indexOf(current);

    if (currentIndex === -1) return;

    const isHorizontal = orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    switch (e.key) {
      case nextKey: {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % btnArray.length;
        btnArray[nextIndex].focus();
        break;
      }
      case prevKey: {
        e.preventDefault();
        const prevIndex = currentIndex - 1 < 0 ? btnArray.length - 1 : currentIndex - 1;
        btnArray[prevIndex].focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        btnArray[0]?.focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        btnArray[btnArray.length - 1]?.focus();
        break;
      }
    }
  }, [disabled, orientation]);

  const handleItemClick = useCallback((item: ToolbarItem) => {
    if (disabled || item.disabled) return;
    item.onClick();
  }, [disabled]);

  const toggleOverflow = useCallback(() => {
    setOverflowOpen(prev => !prev);
    setOverflowActiveIndex(-1);
  }, []);

  const handleOverflowKeyDown = useCallback((e: React.KeyboardEvent) => {
    const enabled = overflowItems.filter(item => !item.disabled);
    if (enabled.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setOverflowActiveIndex(prev => {
          const enabledIndices = overflowItems
            .map((item, i) => ({ item, i }))
            .filter(({ item }) => !item.disabled);
          if (prev === -1) return enabledIndices[0].i;
          const currentPos = enabledIndices.findIndex(({ i }) => i === prev);
          const nextPos = (currentPos + 1) % enabledIndices.length;
          return enabledIndices[nextPos].i;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setOverflowActiveIndex(prev => {
          const enabledIndices = overflowItems
            .map((item, i) => ({ item, i }))
            .filter(({ item }) => !item.disabled);
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
        if (overflowActiveIndex >= 0 && !overflowItems[overflowActiveIndex].disabled) {
          overflowItems[overflowActiveIndex].onClick();
          setOverflowOpen(false);
          setOverflowActiveIndex(-1);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setOverflowOpen(false);
        setOverflowActiveIndex(-1);
        overflowBtnRef.current?.focus();
        break;
      }
    }
  }, [overflowItems, overflowActiveIndex]);

  const handleOverflowItemClick = useCallback((item: ToolbarItem) => {
    if (item.disabled) return;
    item.onClick();
    setOverflowOpen(false);
    setOverflowActiveIndex(-1);
  }, []);

  const containerClass = [
    'toolbar',
    `toolbar-${orientation}`,
    `toolbar-${size}`,
    `toolbar-${variant}`,
    disabled && 'toolbar-disabled',
    overflowBehavior === 'wrap' && 'toolbar-wrap',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={toolbarRef}
      className={containerClass}
      role="toolbar"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      aria-disabled={disabled || undefined}
      onKeyDown={handleToolbarKeyDown}
    >
      {visibleGroups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          {groupIndex > 0 && (
            <span className="toolbar-separator" role="separator" aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'} />
          )}
          <div className="toolbar-group" role="group" aria-label={group.id}>
            {group.items.map((item, itemIndex) => {
              // First item of first group gets tabIndex 0
              const isFirstFocusable = groupIndex === 0 && itemIndex === 0;
              const btnClass = [
                'toolbar-item',
                item.active && 'toolbar-item-active',
                item.disabled && 'toolbar-item-disabled',
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={item.id}
                  className={btnClass}
                  data-toolbar-item
                  onClick={() => handleItemClick(item)}
                  disabled={disabled || item.disabled}
                  aria-label={item.tooltip || item.label}
                  aria-pressed={item.active ?? false}
                  title={item.tooltip || item.label}
                  tabIndex={isFirstFocusable && !disabled ? 0 : -1}
                  type="button"
                >
                  {item.icon && <span className="toolbar-item-icon" aria-hidden="true">{item.icon}</span>}
                  <span className="toolbar-item-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </React.Fragment>
      ))}

      {overflowItems.length > 0 && (
        <div className="toolbar-overflow">
          <button
            ref={overflowBtnRef}
            className="toolbar-overflow-btn"
            onClick={toggleOverflow}
            aria-haspopup="menu"
            aria-expanded={overflowOpen}
            aria-label="더보기"
            title="더보기"
            tabIndex={-1}
            type="button"
          >
            <span aria-hidden="true">⋯</span>
          </button>
          {overflowOpen && (
            <ul
              ref={overflowMenuRef}
              className="toolbar-overflow-menu"
              role="menu"
              aria-label="추가 도구"
              tabIndex={-1}
              onKeyDown={handleOverflowKeyDown}
            >
              {overflowItems.map((item, index) => (
                <li
                  key={item.id}
                  className={[
                    'toolbar-overflow-item',
                    index === overflowActiveIndex && 'toolbar-overflow-item-active',
                    item.disabled && 'toolbar-overflow-item-disabled',
                  ].filter(Boolean).join(' ')}
                  role="menuitem"
                  aria-disabled={item.disabled || undefined}
                  onClick={() => handleOverflowItemClick(item)}
                  onMouseEnter={() => {
                    if (!item.disabled) setOverflowActiveIndex(index);
                  }}
                  onMouseLeave={() => setOverflowActiveIndex(-1)}
                >
                  {item.icon && (
                    <span className="toolbar-overflow-item-icon" aria-hidden="true">{item.icon}</span>
                  )}
                  <span className="toolbar-overflow-item-label">{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Toolbar);
