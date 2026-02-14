import React, { useEffect, useMemo } from 'react';
import './SearchHighlight.css';
import * as S from '../constants/strings';

export interface SearchHighlightProps {
  /** The text to search within */
  text: string;
  /** The search query to highlight */
  query: string;
  /** Whether matching is case-sensitive (default: false) */
  caseSensitive?: boolean;
  /** Index of the currently active/focused match (0-based), highlighted differently */
  activeMatchIndex?: number;
  /** Custom CSS class for highlighted matches */
  highlightClassName?: string;
  /** Custom CSS class for the active match */
  activeClassName?: string;
  /** Callback with the total match count whenever it changes */
  onMatchCount?: (count: number) => void;
}

interface MatchSegment {
  text: string;
  isMatch: boolean;
  matchIndex: number;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitByMatches(text: string, query: string, caseSensitive: boolean): MatchSegment[] {
  if (!query || !text) {
    return [{ text, isMatch: false, matchIndex: -1 }];
  }

  const escaped = escapeRegExp(query);
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(escaped, flags);
  const segments: MatchSegment[] = [];
  let lastIndex = 0;
  let matchCount = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        isMatch: false,
        matchIndex: -1,
      });
    }
    segments.push({
      text: match[0],
      isMatch: true,
      matchIndex: matchCount,
    });
    matchCount++;
    lastIndex = match.index + match[0].length;

    // Prevent infinite loop on zero-length matches
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isMatch: false,
      matchIndex: -1,
    });
  }

  return segments;
}

const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  query,
  caseSensitive = false,
  activeMatchIndex,
  highlightClassName,
  activeClassName,
  onMatchCount,
}) => {
  const segments = useMemo(
    () => splitByMatches(text, query, caseSensitive),
    [text, query, caseSensitive]
  );

  const matchCount = useMemo(
    () => segments.filter(s => s.isMatch).length,
    [segments]
  );

  // Notify parent of match count
  useEffect(() => {
    onMatchCount?.(matchCount);
  }, [matchCount, onMatchCount]);

  if (!query || matchCount === 0) {
    return <span className="search-highlight-text">{text}</span>;
  }

  const defaultHighlightClass = highlightClassName || 'search-highlight-match';
  const defaultActiveClass = activeClassName || 'search-highlight-active';

  return (
    <span className="search-highlight-text" aria-label={S.SEARCH_HIGHLIGHT_ARIA_LABEL(matchCount)}>
      {segments.map((segment, i) => {
        if (!segment.isMatch) {
          return <span key={i}>{segment.text}</span>;
        }
        const isActive = activeMatchIndex !== undefined && segment.matchIndex === activeMatchIndex;
        const className = isActive
          ? `${defaultHighlightClass} ${defaultActiveClass}`
          : defaultHighlightClass;
        return (
          <mark
            key={i}
            className={className}
            data-match-index={segment.matchIndex}
            aria-current={isActive ? 'true' : undefined}
          >
            {segment.text}
          </mark>
        );
      })}
    </span>
  );
};

export default React.memo(SearchHighlight);
