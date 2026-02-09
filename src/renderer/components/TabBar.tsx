import React from 'react';
import './TabBar.css';

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
    <div className="tab-bar" role="tablist" aria-label="대화 탭">
      <div className="tab-list">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-label={`탭: ${tab.title}`}
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
              aria-label={`탭 닫기: ${tab.title}`}
              title="탭 닫기"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <button
        className="new-tab-btn"
        onClick={onNewTab}
        aria-label="새 탭"
        title="새 탭 (Ctrl+N)"
      >
        +
      </button>
    </div>
  );
};

export default TabBar;
