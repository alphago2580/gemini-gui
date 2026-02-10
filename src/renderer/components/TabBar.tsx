import React from 'react';
import './TabBar.css';
import * as S from '../constants/strings';

export interface Tab {
  id: string;
  title: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  if (tabs.length === 0) return null;

  return (
    <div className="tab-bar" role="tablist" aria-label={S.ARIA_TAB_LIST}>
      <div className="tab-list">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-label={`${S.TAB_PREFIX} ${tab.title}`}
            tabIndex={activeTabId === tab.id ? 0 : -1}
            onClick={() => onSelectTab(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTab(tab.id);
              }
            }}
          >
            <span className="tab-title">{tab.title}</span>
            <button
              className="tab-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              aria-label={`${S.TAB_CLOSE_PREFIX} ${tab.title}`}
              title={S.TAB_CLOSE_TITLE}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <button
        className="new-tab-btn"
        onClick={onNewTab}
        aria-label={S.ARIA_NEW_TAB}
        title={S.TITLE_NEW_TAB}
      >
        +
      </button>
    </div>
  );
};

export default React.memo(TabBar);
