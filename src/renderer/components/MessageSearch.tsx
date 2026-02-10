import React, { useState, useMemo, useRef, useEffect } from 'react';
import './MessageSearch.css';
import { searchMessages, getMatchContext, SearchResult } from '../utils/messageSearch';

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Array<{
    id: string;
    title: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  }>;
  onNavigateToResult: (conversationId: string, messageIndex: number) => void;
}

const MessageSearchInner: React.FC<MessageSearchProps> = ({
  isOpen,
  onClose,
  conversations,
  onNavigateToResult,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchMessages(conversations, query), [conversations, query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const selected = listRef.current.querySelector('.search-result-item.selected');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, results.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const result = results[selectedIndex];
      onNavigateToResult(result.conversationId, result.messageIndex);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="message-search-overlay" onClick={onClose}>
      <div
        className="message-search-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="메시지 검색"
      >
        <div className="message-search-input-container">
          <input
            ref={inputRef}
            type="text"
            className="message-search-input"
            placeholder="전체 대화 내용 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="메시지 검색"
          />
          {query && (
            <span className="message-search-count">
              {results.length}개 결과
            </span>
          )}
        </div>

        <div className="message-search-results" ref={listRef} role="listbox">
          {query && results.length === 0 && (
            <div className="message-search-empty">검색 결과가 없습니다</div>
          )}
          {results.map((result, index) => (
            <div
              key={`${result.conversationId}-${result.messageIndex}`}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                onNavigateToResult(result.conversationId, result.messageIndex);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="search-result-header">
                <span className="search-result-conv">{result.conversationTitle}</span>
                <span className="search-result-role">
                  {result.role === 'user' ? '사용자' : 'Gemini'}
                </span>
              </div>
              <div className="search-result-content">
                <HighlightedText
                  text={getMatchContext(result.content, result.matchStart, result.matchEnd)}
                  query={query}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HighlightedText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIndex = 0;

  let searchFrom = 0;
  while (searchFrom < lowerText.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, searchFrom);
    if (matchIndex === -1) break;

    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    parts.push(
      <mark key={matchIndex}>{text.substring(matchIndex, matchIndex + query.length)}</mark>
    );
    lastIndex = matchIndex + query.length;
    searchFrom = lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

const MessageSearch = React.memo(MessageSearchInner);
export default MessageSearch;
