import React, { useState, useMemo, useCallback } from 'react';
import './CollapsibleCodeBlock.css';
import * as S from '../constants/strings';

export interface CollapsibleCodeBlockProps {
  /** The full code content */
  code: string;
  /** Maximum number of visible lines when collapsed (default: 15) */
  maxLines?: number;
  /** The detected or specified language */
  language?: string;
  /** Whether the code block starts collapsed (default: true) */
  defaultCollapsed?: boolean;
  /** Children to render as the code content (syntax-highlighted tokens, etc.) */
  children: React.ReactNode;
}

const CollapsibleCodeBlockInner: React.FC<CollapsibleCodeBlockProps> = ({
  code,
  maxLines = 15,
  language,
  defaultCollapsed = true,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const isCollapsible = lineCount > maxLines;
  const hiddenLines = lineCount - maxLines;

  const handleToggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  if (!isCollapsible) {
    return <div className="collapsible-code-block">{children}</div>;
  }

  const visibleHeight = `${maxLines * 1.5}em`;

  return (
    <div className="collapsible-code-block" data-language={language || undefined}>
      <div
        className={`collapsible-code-block__content${isCollapsed ? ' collapsible-code-block__content--collapsed' : ''}`}
        style={isCollapsed ? { maxHeight: visibleHeight } : undefined}
      >
        {children}
      </div>
      {isCollapsed && (
        <div className="collapsible-code-block__fade" aria-hidden="true" />
      )}
      <button
        className="collapsible-code-block__toggle"
        onClick={handleToggle}
        aria-label={isCollapsed ? S.ARIA_CODE_EXPAND : S.ARIA_CODE_COLLAPSE}
        aria-expanded={!isCollapsed}
        type="button"
      >
        {isCollapsed ? (
          <>
            {S.CODE_SHOW_MORE}
            <span className="collapsible-code-block__hint">
              {S.CODE_LINES_HIDDEN(hiddenLines)}
            </span>
          </>
        ) : (
          S.CODE_SHOW_LESS
        )}
      </button>
    </div>
  );
};

const CollapsibleCodeBlock = React.memo(CollapsibleCodeBlockInner);
export default CollapsibleCodeBlock;
