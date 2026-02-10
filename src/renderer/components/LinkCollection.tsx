import React, { useMemo, useState, useCallback } from 'react';
import './LinkCollection.css';
import { extractLinks } from '../utils/linkExtractor';

export interface LinkCollectionProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  onNavigateToMessage: (messageIndex: number) => void;
}

const LinkCollectionInner: React.FC<LinkCollectionProps> = ({
  isOpen,
  onClose,
  messages,
  onNavigateToMessage,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const links = useMemo(() => extractLinks(messages), [messages]);

  const handleCopy = useCallback(async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
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
    <div className="link-collection-overlay" onClick={onClose}>
      <div
        className="link-collection-panel"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="링크 모음"
        tabIndex={-1}
      >
        <div className="link-collection-header">
          <h3 className="link-collection-title">링크 모음 ({links.length})</h3>
          <button
            className="link-collection-close-btn"
            onClick={onClose}
            aria-label="링크 모음 닫기"
          >
            &times;
          </button>
        </div>

        <div className="link-collection-list">
          {links.length === 0 && (
            <div className="link-collection-empty">
              이 대화에 링크가 없습니다.
            </div>
          )}
          {links.map((link, index) => (
            <div key={`${link.messageIndex}-${index}`} className="link-collection-item">
              <div className="link-item-text" title={link.url}>
                {link.text !== link.url ? (
                  <>
                    <span className="link-item-label">{link.text}</span>
                    <span className="link-item-url">{link.url}</span>
                  </>
                ) : (
                  <span className="link-item-url">{link.url}</span>
                )}
              </div>
              <div className="link-item-actions">
                <span className="link-item-role">
                  {link.role === 'user' ? '사용자' : 'Gemini'}
                </span>
                <button
                  className="link-item-nav-btn"
                  onClick={() => {
                    onNavigateToMessage(link.messageIndex);
                    onClose();
                  }}
                  aria-label="메시지로 이동"
                  title="메시지로 이동"
                >
                  ↗
                </button>
                <button
                  className="link-item-copy-btn"
                  onClick={() => handleCopy(link.url, index)}
                  aria-label="URL 복사"
                  title="URL 복사"
                >
                  {copiedIndex === index ? '✓' : '📋'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LinkCollection = React.memo(LinkCollectionInner);
export default LinkCollection;
