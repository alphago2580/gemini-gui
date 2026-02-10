import React, { useState, useEffect, useRef, useCallback } from 'react';
import './QuickSwitcher.css';
import type { Conversation } from '../../preload/types';
import * as S from '../constants/strings';

export interface QuickSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
}

const QuickSwitcherInner: React.FC<QuickSwitcherProps> = ({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = conversations.filter(conv =>
    conv.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, selectedIndex]);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.quick-switcher-item');
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleSelect = useCallback((conv: Conversation) => {
    onClose();
    onSelect(conv.id);
  }, [onClose, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < filtered.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : filtered.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filtered, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="quick-switcher-overlay" onClick={onClose} role="dialog" aria-label={S.QS_LABEL}>
      <div
        className="quick-switcher"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          className="quick-switcher-input"
          type="text"
          value={query}
          aria-label={S.QS_SEARCH_LABEL}
          onChange={e => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder={S.QS_PLACEHOLDER}
        />
        <div className="quick-switcher-list" ref={listRef} role="listbox" aria-label={S.QS_LIST_LABEL}>
          {filtered.length === 0 ? (
            <div className="quick-switcher-empty">{S.QS_EMPTY}</div>
          ) : (
            filtered.map((conv, index) => (
              <div
                key={conv.id}
                className={`quick-switcher-item${index === selectedIndex ? ' selected' : ''}${conv.id === currentConversationId ? ' current' : ''}`}
                onClick={() => handleSelect(conv)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="quick-switcher-item-info">
                  <span className="quick-switcher-item-title">{conv.title}</span>
                  <span className="quick-switcher-item-meta">
                    {conv.messages.length}{S.QS_MESSAGE_SUFFIX} · {conv.timestamp.toLocaleDateString()}
                  </span>
                </div>
                {conv.id === currentConversationId && (
                  <span className="quick-switcher-current-badge">{S.QS_CURRENT_BADGE}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const QuickSwitcher = React.memo(QuickSwitcherInner);
export default QuickSwitcher;
