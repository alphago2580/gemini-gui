import React, { useState, useCallback, useEffect, useRef } from 'react';
import './Carousel.css';

export interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  startIndex?: number;
  onChange?: (index: number) => void;
  label?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  autoPlay = false,
  autoPlayInterval = 3000,
  showIndicators = true,
  showArrows = true,
  loop = false,
  startIndex = 0,
  onChange,
  label,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = React.Children.count(children);

  const goTo = useCallback((index: number) => {
    if (isTransitioning || total === 0) return;
    let newIndex = index;
    if (loop) {
      newIndex = ((index % total) + total) % total;
    } else {
      newIndex = Math.max(0, Math.min(index, total - 1));
    }
    if (newIndex === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    onChange?.(newIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning, loop, total, onChange]);

  const goNext = useCallback(() => {
    if (!loop && currentIndex >= total - 1) return;
    goTo(currentIndex + 1);
  }, [currentIndex, total, loop, goTo]);

  const goPrev = useCallback(() => {
    if (!loop && currentIndex <= 0) return;
    goTo(currentIndex - 1);
  }, [currentIndex, loop, goTo]);

  const canGoNext = loop || currentIndex < total - 1;
  const canGoPrev = loop || currentIndex > 0;

  // Auto-play
  useEffect(() => {
    if (autoPlay && total > 1) {
      autoPlayRef.current = setInterval(() => {
        goNext();
      }, autoPlayInterval);
      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }
  }, [autoPlay, autoPlayInterval, total, goNext]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        goNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goPrev();
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(total - 1);
        break;
    }
  }, [goNext, goPrev, goTo, total]);

  if (total === 0) {
    return <div className="carousel carousel--empty" role="region" aria-label={label || '캐러셀'} />;
  }

  return (
    <div
      className="carousel"
      role="region"
      aria-label={label || '캐러셀'}
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {React.Children.map(children, (child, index) => (
            <div
              className="carousel-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${total}`}
              aria-hidden={index !== currentIndex}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && total > 1 && (
        <>
          <button
            className="carousel-arrow carousel-arrow--prev"
            onClick={goPrev}
            disabled={!canGoPrev}
            aria-label="이전 슬라이드"
            type="button"
          >
            ‹
          </button>
          <button
            className="carousel-arrow carousel-arrow--next"
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="다음 슬라이드"
            type="button"
          >
            ›
          </button>
        </>
      )}

      {showIndicators && total > 1 && (
        <div className="carousel-indicators" role="tablist" aria-label="슬라이드 선택">
          {React.Children.map(children, (_, index) => (
            <button
              key={index}
              className={`carousel-indicator${index === currentIndex ? ' carousel-indicator--active' : ''}`}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`슬라이드 ${index + 1}`}
              onClick={() => goTo(index)}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(Carousel);
