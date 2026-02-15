import React, { useEffect, useRef, useCallback, useState } from 'react';
import './InfiniteScroll.css';

export interface InfiniteScrollProps {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  direction?: 'down' | 'up';
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  errorMessage?: React.ReactNode;
  error?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  initialLoad?: boolean;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 100,
  direction = 'down',
  loader,
  endMessage,
  errorMessage,
  error = false,
  onRetry,
  children,
  className,
  ariaLabel = '무한 스크롤 목록',
  initialLoad = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingInternal, setLoadingInternal] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);
  const isRestoringScroll = useRef(false);

  const isLoading = loading || loadingInternal;

  const triggerLoad = useCallback(async () => {
    if (isLoading || !hasMore || error) return;
    setLoadingInternal(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingInternal(false);
    }
  }, [isLoading, hasMore, error, onLoadMore]);

  // Initial load
  useEffect(() => {
    if (initialLoad && hasMore && !isLoading && !error) {
      triggerLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad]);

  // Preserve scroll position when loading up
  useEffect(() => {
    if (isRestoringScroll.current && direction === 'up' && containerRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        containerRef.current.scrollTop += diff;
      }
      isRestoringScroll.current = false;
      prevScrollHeightRef.current = 0;
    }
  });

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoading || !hasMore || error) return;

    if (direction === 'down') {
      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceToBottom <= threshold) {
        prevScrollHeightRef.current = container.scrollHeight;
        isRestoringScroll.current = true;
        triggerLoad();
      }
    } else {
      const distanceToTop = container.scrollTop;
      if (distanceToTop <= threshold) {
        prevScrollHeightRef.current = container.scrollHeight;
        isRestoringScroll.current = true;
        triggerLoad();
      }
    }
  }, [direction, threshold, isLoading, hasMore, error, triggerLoad]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const defaultLoader = (
    <div className="infinite-scroll-loader" role="status" aria-label="로딩 중">
      <div className="infinite-scroll-spinner" aria-hidden="true" />
      <span>로딩 중...</span>
    </div>
  );

  const defaultEndMessage = (
    <div className="infinite-scroll-end" role="status">
      모든 항목을 불러왔습니다
    </div>
  );

  const defaultErrorMessage = (
    <div className="infinite-scroll-error" role="alert">
      <span>불러오기에 실패했습니다</span>
      {onRetry && (
        <button
          className="infinite-scroll-retry"
          onClick={onRetry}
          type="button"
        >
          다시 시도
        </button>
      )}
    </div>
  );

  const statusContent = () => {
    if (error) return errorMessage ?? defaultErrorMessage;
    if (isLoading) return loader ?? defaultLoader;
    if (!hasMore) return endMessage ?? defaultEndMessage;
    return null;
  };

  const containerClass = [
    'infinite-scroll',
    direction === 'up' && 'infinite-scroll-up',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClass}
      aria-label={ariaLabel}
      role="feed"
      aria-busy={isLoading}
    >
      {direction === 'up' && statusContent()}
      {children}
      {direction === 'down' && statusContent()}
    </div>
  );
};

export default React.memo(InfiniteScroll);
