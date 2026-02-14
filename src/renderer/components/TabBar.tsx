import React, { useState, useCallback, useRef } from 'react';
import './TabBar.css';
import * as S from '../constants/strings';

export interface Tab {
  id: string;
  title: string;
}

export interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onReorderTabs?: (tabs: Tab[]) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onReorderTabs,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (!onReorderTabs) return;
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    requestAnimationFrame(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.classList.add('tab-item--dragging');
      }
    });
  }, [onReorderTabs]);

  const handleDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.classList.remove('tab-item--dragging');
    }
    setDragIndex(null);
    setOverIndex(null);
    dragNodeRef.current = null;
  }, []);

  const handleDrop = useCallback((dropIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex || !onReorderTabs) {
      handleDragEnd();
      return;
    }
    const newTabs = [...tabs];
    const [moved] = newTabs.splice(dragIndex, 1);
    newTabs.splice(dropIndex, 0, moved);
    onReorderTabs(newTabs);
    handleDragEnd();
  }, [dragIndex, tabs, onReorderTabs, handleDragEnd]);

  if (tabs.length === 0) return null;

  const canDrag = !!onReorderTabs;

  return (
    <div className="tab-bar" role="tablist" aria-label={S.ARIA_TAB_LIST}>
      <div className="tab-list">
        {tabs.map((tab, index) => {
          const isActive = activeTabId === tab.id;
          const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;
          const classNames = [
            'tab-item',
            isActive ? 'active' : '',
            isOver ? 'tab-item--over' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={tab.id}
              className={classNames}
              role="tab"
              aria-selected={isActive}
              aria-label={`${S.TAB_PREFIX} ${tab.title}`}
              tabIndex={isActive ? 0 : -1}
              draggable={canDrag}
              onClick={() => onSelectTab(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTab(tab.id);
                }
              }}
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(index, e)}
              title={canDrag ? S.TAB_DRAG_LABEL : undefined}
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
          );
        })}
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
