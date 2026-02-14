import React, { useMemo, useState, useCallback } from 'react';
import './MarkdownTOC.css';
import * as S from '../constants/strings';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface MarkdownTOCProps {
  /** Raw markdown text to extract headings from */
  markdown: string;
  /** Currently active heading ID (for scroll-spy highlighting) */
  activeId?: string;
  /** Callback when a heading link is clicked */
  onHeadingClick?: (heading: TocHeading) => void;
  /** Start collapsed (default: false) */
  defaultCollapsed?: boolean;
  /** Minimum heading level to include (default: 1) */
  minLevel?: number;
  /** Maximum heading level to include (default: 4) */
  maxLevel?: number;
}

/**
 * Extract headings from markdown text.
 * Matches lines starting with # (ATX headings).
 * Skips headings inside fenced code blocks.
 */
export function extractHeadings(markdown: string, minLevel: number, maxLevel: number): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;

  for (const line of lines) {
    // Toggle code block state on fence lines
    if (/^```/.test(line.trim())) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      if (level >= minLevel && level <= maxLevel) {
        const text = match[2].trim();
        // Generate a slug-like id from the text
        const id = text
          .toLowerCase()
          .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, '');
        headings.push({ id: id || `heading-${headings.length}`, text, level });
      }
    }
  }

  return headings;
}

const MarkdownTOC: React.FC<MarkdownTOCProps> = ({
  markdown,
  activeId,
  onHeadingClick,
  defaultCollapsed = false,
  minLevel = 1,
  maxLevel = 4,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const headings = useMemo(
    () => extractHeadings(markdown, minLevel, maxLevel),
    [markdown, minLevel, maxLevel]
  );

  const handleToggle = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const handleClick = useCallback((heading: TocHeading) => {
    if (onHeadingClick) {
      onHeadingClick(heading);
    }
  }, [onHeadingClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, heading: TocHeading) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(heading);
    }
  }, [handleClick]);

  if (headings.length === 0 && !collapsed) {
    return (
      <nav className="markdown-toc" aria-label={S.ARIA_TOC}>
        <div
          className="markdown-toc-header"
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          aria-label={S.ARIA_TOC_TOGGLE}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          <span className="markdown-toc-title">{S.TOC_TITLE}</span>
          <span className="markdown-toc-toggle" aria-hidden="true">▼</span>
        </div>
        <p className="markdown-toc-empty">{S.TOC_EMPTY}</p>
      </nav>
    );
  }

  if (headings.length === 0) {
    return null;
  }

  const containerClass = `markdown-toc${collapsed ? ' markdown-toc--collapsed' : ''}`;

  return (
    <nav className={containerClass} aria-label={S.ARIA_TOC}>
      <div
        className="markdown-toc-header"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-label={S.ARIA_TOC_TOGGLE}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <span className="markdown-toc-title">{S.TOC_TITLE}</span>
        <span className="markdown-toc-toggle" aria-hidden="true">▼</span>
      </div>
      {!collapsed && (
        <ul className="markdown-toc-list" role="list">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            const linkClass = [
              'markdown-toc-link',
              `markdown-toc-link--level-${heading.level}`,
              isActive ? 'markdown-toc-link--active' : '',
            ].filter(Boolean).join(' ');

            return (
              <li key={`${heading.id}-${index}`} className="markdown-toc-item">
                <button
                  className={linkClass}
                  onClick={() => handleClick(heading)}
                  onKeyDown={(e) => handleKeyDown(e, heading)}
                  aria-label={S.ARIA_TOC_ITEM(heading.text)}
                  aria-current={isActive ? 'location' : undefined}
                  title={heading.text}
                >
                  {heading.text}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
};

export default React.memo(MarkdownTOC);
