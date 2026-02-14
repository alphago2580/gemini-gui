import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './LazyImage.css';

export type LazyImageFit = 'contain' | 'cover' | 'fill' | 'none';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholderSrc?: string;
  fit?: LazyImageFit;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholderSrc,
  fit = 'cover',
  rootMargin = '200px',
  threshold = 0.01,
  className = '',
  onLoad,
  onError,
}) => {
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const imgRef = useRef<HTMLImageElement | null>(null);

  const { ref: observerRef, isVisible } = useIntersectionObserver({
    rootMargin,
    threshold,
    freezeOnceVisible: true,
  });

  const shouldLoad = isVisible || loadState === 'loaded';

  useEffect(() => {
    if (!shouldLoad || loadState !== 'idle') return;
    setLoadState('loading');
  }, [shouldLoad, loadState]);

  const handleLoad = useCallback(() => {
    setLoadState('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoadState('error');
    onError?.();
  }, [onError]);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      (observerRef as React.MutableRefObject<Element | null>).current = node;
    },
    [observerRef]
  );

  const containerStyle: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? 'auto',
  };

  const showPlaceholder = loadState !== 'loaded' && placeholderSrc;
  const showSkeleton = loadState !== 'loaded' && !placeholderSrc;
  const showImage = loadState === 'loading' || loadState === 'loaded';

  return (
    <div
      ref={setRefs}
      className={`lazy-image-container ${className}`}
      style={containerStyle}
      data-state={loadState}
    >
      {showSkeleton && (
        <div
          className="lazy-image-skeleton"
          role="img"
          aria-label={`${alt} 로딩 중`}
          aria-busy="true"
        />
      )}

      {showPlaceholder && (
        <img
          className={`lazy-image-placeholder lazy-image-fit-${fit}`}
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
        />
      )}

      {showImage && (
        <img
          ref={imgRef}
          className={`lazy-image lazy-image-fit-${fit} ${loadState === 'loaded' ? 'lazy-image-visible' : ''}`}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {loadState === 'error' && (
        <div className="lazy-image-error" role="img" aria-label={`${alt} 로드 실패`}>
          <span className="lazy-image-error-icon">!</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(LazyImage);
