import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Message } from '../../preload/types';
import DateSeparator from './DateSeparator';
import './MessageList.css';

export interface MessageListProps {
  /** All messages in the conversation */
  messages: Message[];
  /** Number of messages to show initially (from the end) */
  initialBatch?: number;
  /** Number of messages to load per scroll-up batch */
  batchSize?: number;
  /** Pixel threshold from top to trigger loading */
  threshold?: number;
  /** Render function for each message */
  renderMessage: (message: Message, globalIndex: number) => React.ReactNode;
  /** Render function for empty state (no messages) */
  renderEmpty?: () => React.ReactNode;
  /** Render function for loading state (streaming) */
  renderLoading?: () => React.ReactNode;
  /** Render function for footer content (token usage, regenerate button, etc.) */
  renderFooter?: () => React.ReactNode;
  /** Whether messages are currently loading/streaming */
  isLoading?: boolean;
  /** Ref to expose the scroll container */
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /** Scroll event handler */
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  /** View mode class suffix */
  viewMode?: 'chat' | 'compact';
  /** ARIA label for the message log */
  ariaLabel?: string;
  /** className override */
  className?: string;
  /** Whether to show date separators between messages from different days. Defaults to true. */
  showDateSeparators?: boolean;
}

const INITIAL_BATCH_DEFAULT = 30;
const BATCH_SIZE_DEFAULT = 20;
const THRESHOLD_DEFAULT = 80;

/** Returns true if two dates fall on different calendar days. */
function isDifferentDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() !== b.getFullYear() ||
    a.getMonth() !== b.getMonth() ||
    a.getDate() !== b.getDate()
  );
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  initialBatch = INITIAL_BATCH_DEFAULT,
  batchSize = BATCH_SIZE_DEFAULT,
  threshold = THRESHOLD_DEFAULT,
  renderMessage,
  renderEmpty,
  renderLoading,
  renderFooter,
  isLoading = false,
  containerRef,
  onScroll,
  viewMode = 'chat',
  ariaLabel = '대화 메시지',
  className,
  showDateSeparators = true,
}) => {
  // How many messages are currently visible (counted from the end)
  const [visibleCount, setVisibleCount] = useState(() => Math.min(initialBatch, messages.length));
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef = containerRef ?? internalRef;
  const prevScrollHeightRef = useRef<number>(0);
  const isRestoringScroll = useRef(false);
  const prevMessagesLengthRef = useRef(messages.length);

  // When messages array changes (new conversation or new message added at end):
  // - If length changed significantly (new conversation), reset visibleCount
  // - If a new message was added, increment visibleCount to keep it visible
  useEffect(() => {
    const prevLen = prevMessagesLengthRef.current;
    const newLen = messages.length;

    if (newLen === 0) {
      setVisibleCount(0);
    } else if (newLen <= initialBatch) {
      setVisibleCount(newLen);
    } else if (Math.abs(newLen - prevLen) > batchSize) {
      // Major change (e.g., switched conversation) — reset
      setVisibleCount(Math.min(initialBatch, newLen));
    } else if (newLen > prevLen) {
      // New message(s) appended — keep them visible
      setVisibleCount(prev => Math.min(prev + (newLen - prevLen), newLen));
    }

    prevMessagesLengthRef.current = newLen;
  }, [messages.length, initialBatch, batchSize]);

  const hasMore = visibleCount < messages.length;

  // The visible slice (from the end of the messages array)
  const visibleMessages = useMemo(() => {
    if (visibleCount >= messages.length) return messages;
    const startIndex = messages.length - visibleCount;
    return messages.slice(startIndex);
  }, [messages, visibleCount]);

  // Global index offset for the first visible message
  const globalOffset = messages.length - visibleMessages.length;

  // Load more older messages
  const loadMore = useCallback(() => {
    if (!hasMore) return;
    const container = scrollRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
      isRestoringScroll.current = true;
    }
    setVisibleCount(prev => Math.min(prev + batchSize, messages.length));
  }, [hasMore, batchSize, messages.length, scrollRef]);

  // Preserve scroll position after prepending older messages
  useEffect(() => {
    if (isRestoringScroll.current && scrollRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = scrollRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        scrollRef.current.scrollTop += diff;
      }
      isRestoringScroll.current = false;
      prevScrollHeightRef.current = 0;
    }
  });

  // Handle scroll — detect when user reaches top
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(e);

    const container = e.currentTarget;
    if (!hasMore || isRestoringScroll.current) return;

    if (container.scrollTop <= threshold) {
      loadMore();
    }
  }, [onScroll, hasMore, threshold, loadMore]);

  const containerClass = [
    'message-list',
    viewMode === 'compact' && 'message-list--compact',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className={containerClass}
      role="log"
      aria-label={ariaLabel}
      aria-live="polite"
      onScroll={handleScroll}
    >
      {hasMore && (
        <div className="message-list-load-more" role="status" aria-label="이전 메시지 로딩">
          <button
            className="message-list-load-more-btn"
            onClick={loadMore}
            type="button"
          >
            이전 메시지 더 보기 ({messages.length - visibleCount}개 남음)
          </button>
        </div>
      )}
      {messages.length === 0 && renderEmpty?.()}
      {visibleMessages.map((message, index) => {
        const globalIndex = globalOffset + index;
        const showSeparator =
          showDateSeparators &&
          (index === 0 ||
            isDifferentDay(
              visibleMessages[index - 1].timestamp,
              message.timestamp,
            ));
        return (
          <React.Fragment key={message.id || globalIndex}>
            {showSeparator && (
              <DateSeparator date={message.timestamp} />
            )}
            {renderMessage(message, globalIndex)}
          </React.Fragment>
        );
      })}
      {isLoading && renderLoading?.()}
      {renderFooter?.()}
    </div>
  );
};

export default React.memo(MessageList);
