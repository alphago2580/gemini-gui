import React, { useState, useMemo, useCallback } from 'react';
import './CodeSnippets.css';
import { extractCodeBlocks, groupByLanguage } from '../utils/codeExtractor';

export interface CodeSnippetsProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  onNavigateToMessage: (messageIndex: number) => void;
}

const CodeSnippetsInner: React.FC<CodeSnippetsProps> = ({
  isOpen,
  onClose,
  messages,
  onNavigateToMessage,
}) => {
  const [filterLang, setFilterLang] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const allCodes = useMemo(() => extractCodeBlocks(messages), [messages]);

  const languages = useMemo(() => {
    const grouped = groupByLanguage(allCodes);
    return Array.from(grouped.keys()).sort();
  }, [allCodes]);

  const filteredCodes = useMemo(() => {
    if (filterLang === 'all') return allCodes;
    return allCodes.filter(c => (c.language || 'plain') === filterLang);
  }, [allCodes, filterLang]);

  const handleCopy = useCallback(async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch { /* ignore */ }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="code-snippets-overlay" onClick={onClose}>
      <div
        className="code-snippets-panel"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="코드 스니펫"
        tabIndex={-1}
      >
        <div className="code-snippets-header">
          <h3 className="code-snippets-title">코드 스니펫 ({allCodes.length})</h3>
          <div className="code-snippets-filters">
            <button
              className={`code-snippets-filter-btn ${filterLang === 'all' ? 'active' : ''}`}
              onClick={() => setFilterLang('all')}
              aria-label="전체 언어 필터"
            >
              전체
            </button>
            {languages.map(lang => (
              <button
                key={lang}
                className={`code-snippets-filter-btn ${filterLang === lang ? 'active' : ''}`}
                onClick={() => setFilterLang(lang)}
                aria-label={`${lang} 필터`}
              >
                {lang}
              </button>
            ))}
          </div>
          <button
            className="code-snippets-close-btn"
            onClick={onClose}
            aria-label="코드 스니펫 닫기"
          >
            &times;
          </button>
        </div>

        <div className="code-snippets-list">
          {filteredCodes.length === 0 && (
            <div className="code-snippets-empty">
              {allCodes.length === 0
                ? '이 대화에 코드 블록이 없습니다.'
                : '필터에 해당하는 코드가 없습니다.'}
            </div>
          )}
          {filteredCodes.map((code, index) => (
            <div key={`${code.messageIndex}-${index}`} className="code-snippet-item">
              <div className="code-snippet-header">
                <span className="code-snippet-lang">{code.language || 'plain'}</span>
                <span className="code-snippet-role">
                  {code.role === 'user' ? '사용자' : 'Gemini'}
                </span>
                <button
                  className="code-snippet-nav-btn"
                  onClick={() => {
                    onNavigateToMessage(code.messageIndex);
                    onClose();
                  }}
                  aria-label="메시지로 이동"
                  title="메시지로 이동"
                >
                  ↗
                </button>
                <button
                  className="code-snippet-copy-btn"
                  onClick={() => handleCopy(code.content, index)}
                  aria-label="코드 복사"
                  title="코드 복사"
                >
                  {copiedIndex === index ? '✓' : '📋'}
                </button>
              </div>
              <pre className="code-snippet-code"><code>{code.content}</code></pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CodeSnippets = React.memo(CodeSnippetsInner);
export default CodeSnippets;
