import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ImageViewer.css';

export interface ImageViewerProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
  zoomable?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  showControls?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  caption?: string;
  images?: string[];
  initialIndex?: number;
  ariaLabel?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = '',
  open,
  onClose,
  zoomable = true,
  minZoom = 0.5,
  maxZoom = 3,
  zoomStep = 0.25,
  showControls = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  caption,
  images,
  initialIndex = 0,
  ariaLabel = '이미지 뷰어',
}) => {
  const [zoom, setZoom] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const isGallery = images && images.length > 0;
  const currentSrc = isGallery ? images[currentIndex] : src;

  useEffect(() => {
    if (open) {
      setZoom(1);
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + zoomStep, maxZoom));
  }, [zoomStep, maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - zoomStep, minZoom));
  }, [zoomStep, minZoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  const handlePrev = useCallback(() => {
    if (!isGallery) return;
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  }, [isGallery, images]);

  const handleNext = useCallback(() => {
    if (!isGallery) return;
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  }, [isGallery, images]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        if (closeOnEscape) onClose();
        break;
      case '+':
      case '=':
        if (zoomable) handleZoomIn();
        break;
      case '-':
        if (zoomable) handleZoomOut();
        break;
      case '0':
        if (zoomable) handleZoomReset();
        break;
      case 'ArrowLeft':
        if (isGallery) handlePrev();
        break;
      case 'ArrowRight':
        if (isGallery) handleNext();
        break;
    }
  }, [closeOnEscape, onClose, zoomable, handleZoomIn, handleZoomOut, handleZoomReset, isGallery, handlePrev, handleNext]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      containerRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnOverlay, onClose]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!zoomable) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [zoomable, handleZoomIn, handleZoomOut]);

  if (!open) return null;

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
      className="image-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onClick={handleOverlayClick}
      data-testid="image-viewer"
    >
      <div className="image-viewer-content" onWheel={handleWheel}>
        <img
          src={currentSrc}
          alt={alt}
          className="image-viewer-img"
          style={{ transform: `scale(${zoom})` }}
          draggable={false}
        />
      </div>

      {caption && (
        <div className="image-viewer-caption">{caption}</div>
      )}

      {showControls && (
        <div className="image-viewer-controls" role="toolbar" aria-label="이미지 도구">
          {zoomable && (
            <>
              <button
                className="image-viewer-btn"
                onClick={handleZoomOut}
                disabled={zoom <= minZoom}
                aria-label="축소"
                type="button"
              >
                −
              </button>
              <span className="image-viewer-zoom" aria-live="polite">
                {zoomPercent}%
              </span>
              <button
                className="image-viewer-btn"
                onClick={handleZoomIn}
                disabled={zoom >= maxZoom}
                aria-label="확대"
                type="button"
              >
                +
              </button>
              <button
                className="image-viewer-btn"
                onClick={handleZoomReset}
                aria-label="원래 크기"
                type="button"
              >
                1:1
              </button>
            </>
          )}
        </div>
      )}

      {isGallery && (
        <div className="image-viewer-nav">
          <button
            className="image-viewer-nav-btn image-viewer-prev"
            onClick={handlePrev}
            aria-label="이전 이미지"
            type="button"
          >
            ‹
          </button>
          <span className="image-viewer-counter" aria-live="polite">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            className="image-viewer-nav-btn image-viewer-next"
            onClick={handleNext}
            aria-label="다음 이미지"
            type="button"
          >
            ›
          </button>
        </div>
      )}

      <button
        className="image-viewer-close"
        onClick={onClose}
        aria-label="닫기"
        type="button"
      >
        ✕
      </button>
    </div>
  );
};

export default React.memo(ImageViewer);
