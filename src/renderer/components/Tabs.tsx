import React, { useState, useCallback, useRef } from 'react';
import './Tabs.css';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  orientation?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledTab,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  orientation = 'horizontal',
  children,
  className,
  ariaLabel = '탭',
}) => {
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.id ?? '');
  const tabListRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledTab !== undefined;
  const activeId = isControlled ? controlledTab : internalTab;

  const handleSelect = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;
    if (!isControlled) {
      setInternalTab(tabId);
    }
    onChange?.(tabId);
  }, [tabs, isControlled, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const enabledTabs = tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === activeId);
    if (currentIndex === -1) return;

    const isHorizontal = orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    let newIndex = currentIndex;

    if (e.key === nextKey) {
      e.preventDefault();
      newIndex = (currentIndex + 1) % enabledTabs.length;
    } else if (e.key === prevKey) {
      e.preventDefault();
      newIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = enabledTabs.length - 1;
    } else {
      return;
    }

    const newTab = enabledTabs[newIndex];
    handleSelect(newTab.id);

    // Focus the new tab button
    const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const targetIndex = tabs.findIndex(t => t.id === newTab.id);
    buttons?.[targetIndex]?.focus();
  }, [tabs, activeId, orientation, handleSelect]);

  const containerClass = [
    'tabs',
    `tabs-${variant}`,
    `tabs-${size}`,
    `tabs-${orientation}`,
    fullWidth && 'tabs-full-width',
    className,
  ].filter(Boolean).join(' ');

  // Find active tab's panel content from children
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={containerClass}>
      <div
        ref={tabListRef}
        className="tabs-list"
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={[
              'tabs-tab',
              activeId === tab.id && 'tabs-tab-active',
              tab.disabled && 'tabs-tab-disabled',
            ].filter(Boolean).join(' ')}
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            aria-disabled={tab.disabled}
            id={`tab-${tab.id}`}
            tabIndex={activeId === tab.id ? 0 : -1}
            onClick={() => handleSelect(tab.id)}
            disabled={tab.disabled}
            type="button"
          >
            {tab.icon && <span className="tabs-tab-icon" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="tabs-tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {childrenArray.map((child, index) => {
        const tab = tabs[index];
        if (!tab) return null;
        return (
          <div
            key={tab.id}
            className="tabs-panel"
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeId !== tab.id}
            tabIndex={0}
          >
            {activeId === tab.id && child}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Tabs);
