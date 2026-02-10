import React, { useRef, useEffect } from 'react';
import './InlineSearch.css';
import * as S from '../constants/strings';

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
    <div className="inline-search-bar" role="search" aria-label={S.INLINE_SEARCH_LABEL}>
      <input
        ref={inputRef}
        type="text"
        className="inline-search-input"
        placeholder={S.INLINE_SEARCH_PLACEHOLDER}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={S.INLINE_SEARCH_LABEL}
      />
      <span className="inline-search-count" aria-live="polite">
        {query ? `${matchCount > 0 ? currentMatchIndex + 1 : 0}/${matchCount}` : ''}
      </span>
      <button
        className="inline-search-btn"
        onClick={onPrev}
        disabled={matchCount === 0}
        title={S.INLINE_SEARCH_PREV_TITLE}
        aria-label={S.INLINE_SEARCH_PREV}
      >
        ↑
      </button>
      <button
        className="inline-search-btn"
        onClick={onNext}
        disabled={matchCount === 0}
        title={S.INLINE_SEARCH_NEXT_TITLE}
        aria-label={S.INLINE_SEARCH_NEXT}
      >
        ↓
      </button>
      <button
        className="inline-search-close-btn"
        onClick={onClose}
        title={S.INLINE_SEARCH_CLOSE_TITLE}
        aria-label={S.INLINE_SEARCH_CLOSE_LABEL}
      >
        ×
      </button>
    </div>
  );
};

const InlineSearch = React.memo(InlineSearchInner);
export default InlineSearch;
