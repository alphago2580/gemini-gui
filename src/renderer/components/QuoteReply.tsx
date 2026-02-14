import React, { useCallback, useEffect, useRef } from 'react';
import './QuoteReply.css';
import * as S from '../constants/strings';

export interface QuoteData {
  /** The text being quoted */
  text: string;
  /** The role of the original message sender */
  senderRole: 'user' | 'assistant';
  /** Optional message index for navigation */
  messageIndex?: number;
}

export interface QuoteReplyProps {
  /** The current quote to display, or null if none */
  quote: QuoteData | null;
  /** Called when the user dismisses the quote */
  onDismiss: () => void;
  /** Called when the user clicks the quote to navigate to the original message */
  onNavigate?: (messageIndex: number) => void;
  /** Maximum number of characters to show before truncating (default: 120) */
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 120;

const QuoteReply: React.FC<QuoteReplyProps> = ({
  quote,
  onDismiss,
  onNavigate,
  maxLength = DEFAULT_MAX_LENGTH,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const truncatedText = quote
    ? quote.text.length > maxLength
      ? quote.text.slice(0, maxLength) + '…'
      : quote.text
    : '';

  const senderLabel = quote
    ? quote.senderRole === 'user'
      ? S.ROLE_USER
      : S.ROLE_ASSISTANT
    : '';

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onDismiss();
    }
  }, [onDismiss]);

  const handleNavigate = useCallback(() => {
    if (quote?.messageIndex !== undefined && onNavigate) {
      onNavigate(quote.messageIndex);
    }
  }, [quote, onNavigate]);

  // Focus the container when a quote appears so Escape works immediately
  useEffect(() => {
    if (quote && containerRef.current) {
      containerRef.current.focus();
    }
  }, [quote]);

  if (!quote) return null;

  const canNavigate = quote.messageIndex !== undefined && !!onNavigate;

  return (
    <div
      ref={containerRef}
      className={`quote-reply quote-reply--${quote.senderRole}`}
      role="status"
      aria-label={S.QUOTE_REPLY_ARIA_LABEL}
      aria-live="polite"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="quote-reply-accent" />
      <div className="quote-reply-content">
        <span className="quote-reply-sender">{senderLabel}</span>
        <span
          className={`quote-reply-text${canNavigate ? ' quote-reply-text--clickable' : ''}`}
          onClick={canNavigate ? handleNavigate : undefined}
          role={canNavigate ? 'button' : undefined}
          tabIndex={canNavigate ? 0 : undefined}
          onKeyDown={canNavigate ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavigate();
            }
          } : undefined}
          aria-label={canNavigate ? S.QUOTE_REPLY_NAVIGATE_LABEL : undefined}
          title={quote.text.length > maxLength ? quote.text : undefined}
        >
          {truncatedText}
        </span>
      </div>
      <button
        className="quote-reply-dismiss"
        onClick={onDismiss}
        aria-label={S.QUOTE_REPLY_DISMISS_LABEL}
        title={S.QUOTE_REPLY_DISMISS_LABEL}
        type="button"
      >
        &times;
      </button>
    </div>
  );
};

export default React.memo(QuoteReply);
