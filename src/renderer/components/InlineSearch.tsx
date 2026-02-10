import React, { useRef, useEffect } from 'react';
import './InlineSearch.css';

interface InlineSearchProps {
  isOpen: boolean;
  query: string;
  matchCount: number;
  currentMatchIndex: number;
  onQueryChange: (query: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const InlineSearchInner: React.FC<InlineSearchProps> = ({
  isOpen,
  query,
  matchCount,
  currentMatchIndex,
  onQueryChange,
  onNext,
  onPrev,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="inline-search-bar" role="search" aria-label="대화 내 검색">
      <input
        ref={inputRef}
        type="text"
        className="inline-search-input"
        placeholder="대화 내 검색..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="대화 내 검색"
      />
      <span className="inline-search-count" aria-live="polite">
        {query ? `${matchCount > 0 ? currentMatchIndex + 1 : 0}/${matchCount}` : ''}
      </span>
      <button
        className="inline-search-btn"
        onClick={onPrev}
        disabled={matchCount === 0}
        title="이전 결과 (Shift+Enter)"
        aria-label="이전 결과"
      >
        ↑
      </button>
      <button
        className="inline-search-btn"
        onClick={onNext}
        disabled={matchCount === 0}
        title="다음 결과 (Enter)"
        aria-label="다음 결과"
      >
        ↓
      </button>
      <button
        className="inline-search-close-btn"
        onClick={onClose}
        title="닫기 (Esc)"
        aria-label="검색 닫기"
      >
        ×
      </button>
    </div>
  );
};

const InlineSearch = React.memo(InlineSearchInner);
export default InlineSearch;
