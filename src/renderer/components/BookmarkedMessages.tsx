import React, { useState, useMemo, useRef, useEffect } from 'react';
import './BookmarkedMessages.css';

export interface BookmarkedMessage {
  conversationId: string;
  conversationTitle: string;
  messageIndex: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BookmarkedMessagesProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkedMessage[];
  onNavigateToMessage: (conversationId: string, messageIndex: number) => void;
  onRemoveBookmark: (conversationId: string, messageIndex: number) => void;
}

const BookmarkedMessagesInner: React.FC<BookmarkedMessagesProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onNavigateToMessage,
  onRemoveBookmark,
}) => {
  const [filter, setFilter] = useState<'all' | 'user' | 'assistant'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredBookmarks = useMemo(() => {
    if (filter === 'all') return bookmarks;
    return bookmarks.filter(b => b.role === filter);
  }, [bookmarks, filter]);

  useEffect(() => {
    if (!isOpen) {
      setFilter('all');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    if (listRef.current && filteredBookmarks.length > 0) {
      const selected = listRef.current.querySelector('.bookmark-item.selected');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, filteredBookmarks.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredBookmarks.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredBookmarks.length > 0) {
      e.preventDefault();
      const bm = filteredBookmarks[selectedIndex];
      onNavigateToMessage(bm.conversationId, bm.messageIndex);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bookmarks-overlay" onClick={onClose}>
      <div
        className="bookmarks-panel"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="북마크된 메시지"
        tabIndex={-1}
      >
        <div className="bookmarks-header">
          <h3 className="bookmarks-title">북마크</h3>
          <div className="bookmarks-filters">
            <button
              className={`bookmarks-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              aria-label="전체 필터"
            >
              전체 ({bookmarks.length})
            </button>
            <button
              className={`bookmarks-filter-btn ${filter === 'user' ? 'active' : ''}`}
              onClick={() => setFilter('user')}
              aria-label="사용자 필터"
            >
              사용자
            </button>
            <button
              className={`bookmarks-filter-btn ${filter === 'assistant' ? 'active' : ''}`}
              onClick={() => setFilter('assistant')}
              aria-label="AI 필터"
            >
              AI
            </button>
          </div>
          <button
            className="bookmarks-close-btn"
            onClick={onClose}
            aria-label="북마크 닫기"
          >
            &times;
          </button>
        </div>

        <div className="bookmarks-list" ref={listRef} role="listbox">
          {filteredBookmarks.length === 0 && (
            <div className="bookmarks-empty">
              {bookmarks.length === 0
                ? '북마크된 메시지가 없습니다. 메시지의 ★ 버튼을 눌러 북마크하세요.'
                : '필터에 해당하는 북마크가 없습니다.'}
            </div>
          )}
          {filteredBookmarks.map((bm, index) => (
            <div
              key={`${bm.conversationId}-${bm.messageIndex}`}
              className={`bookmark-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                onNavigateToMessage(bm.conversationId, bm.messageIndex);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="bookmark-item-header">
                <span className="bookmark-conv-title">{bm.conversationTitle}</span>
                <span className="bookmark-role-badge">
                  {bm.role === 'user' ? '사용자' : 'Gemini'}
                </span>
                <button
                  className="bookmark-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(bm.conversationId, bm.messageIndex);
                  }}
                  title="북마크 해제"
                  aria-label="북마크 해제"
                >
                  &times;
                </button>
              </div>
              <div className="bookmark-item-content">
                {bm.content.length > 200 ? bm.content.substring(0, 200) + '...' : bm.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookmarkedMessages = React.memo(BookmarkedMessagesInner);
export default BookmarkedMessages;
