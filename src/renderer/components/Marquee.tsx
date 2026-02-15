import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import './Marquee.css';

export type MarqueeDirection = 'left' | 'right' | 'up' | 'down';
export type MarqueeSpeed = 'slow' | 'normal' | 'fast';

export interface MarqueeProps {
  /** Content to scroll */
  children: React.ReactNode;
  /** Scroll direction */
  direction?: MarqueeDirection;
  /** Speed preset */
  speed?: MarqueeSpeed;
  /** Custom speed in pixels per second (overrides speed preset) */
  pixelsPerSecond?: number;
  /** Pause scrolling on hover */
  pauseOnHover?: boolean;
  /** Pause scrolling on focus within */
  pauseOnFocus?: boolean;
  /** Number of times to repeat (0 = infinite) */
  repeat?: number;
  /** Gap between repeated content in px */
  gap?: number;
  /** Whether the marquee is playing */
  playing?: boolean;
  /** Accessible label */
  'aria-label'?: string;
  /** Custom CSS class */
  className?: string;
  /** Element id */
  id?: string;
}

const SPEED_PRESETS: Record<MarqueeSpeed, number> = {
  slow: 30,
  normal: 60,
  fast: 120,
};

const MarqueeInner: React.FC<MarqueeProps> = ({
  children,
  direction = 'left',
  speed = 'normal',
  pixelsPerSecond,
  pauseOnHover = true,
  pauseOnFocus = false,
  repeat = 0,
  gap = 40,
  playing = true,
  'aria-label': ariaLabel,
  className,
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const positionRef = useRef(0);
  const pausedRef = useRef(!playing);
  const iterationRef = useRef(0);
  const lastTimeRef = useRef(0);

  const pps = pixelsPerSecond ?? SPEED_PRESETS[speed];
  const isHorizontal = direction === 'left' || direction === 'right';
  const isForward = direction === 'left' || direction === 'up';

  const getContentSize = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return 0;
    const firstChild = track.children[0] as HTMLElement;
    return isHorizontal ? firstChild.offsetWidth : firstChild.offsetHeight;
  }, [isHorizontal]);

  const animate = useCallback(
    (timestamp: number) => {
      if (pausedRef.current) {
        lastTimeRef.current = timestamp;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const contentSize = getContentSize();
      if (contentSize === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const totalSize = contentSize + gap;
      const movement = pps * delta;
      positionRef.current += movement;

      if (positionRef.current >= totalSize) {
        positionRef.current -= totalSize;
        if (repeat > 0) {
          iterationRef.current += 1;
          if (iterationRef.current >= repeat) {
            pausedRef.current = true;
            positionRef.current = 0;
            if (trackRef.current) {
              trackRef.current.style.transform = 'translate3d(0, 0, 0)';
            }
            return;
          }
        }
      }

      if (trackRef.current) {
        const offset = isForward ? -positionRef.current : positionRef.current - totalSize;
        trackRef.current.style.transform = isHorizontal
          ? `translate3d(${offset}px, 0, 0)`
          : `translate3d(0, ${offset}px, 0)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [pps, gap, repeat, getContentSize, isHorizontal, isForward],
  );

  useEffect(() => {
    pausedRef.current = !playing;
  }, [playing]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      pausedRef.current = true;
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover && playing) {
      pausedRef.current = false;
    }
  }, [pauseOnHover, playing]);

  const handleFocusIn = useCallback(() => {
    if (pauseOnFocus) {
      pausedRef.current = true;
    }
  }, [pauseOnFocus]);

  const handleFocusOut = useCallback(() => {
    if (pauseOnFocus && playing) {
      pausedRef.current = false;
    }
  }, [pauseOnFocus, playing]);

  const classNames = useMemo(
    () =>
      ['marquee', `marquee--${direction}`, className].filter(Boolean).join(' '),
    [direction, className],
  );

  const gapStyle = useMemo(
    () => (isHorizontal ? { marginRight: `${gap}px` } : { marginBottom: `${gap}px` }),
    [isHorizontal, gap],
  );

  return (
    <div
      id={id}
      className={classNames}
      ref={containerRef}
      role="marquee"
      aria-label={ariaLabel || '스크롤 콘텐츠'}
      aria-live="off"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
      data-testid="marquee"
    >
      <div
        className={`marquee-track marquee-track--${isHorizontal ? 'horizontal' : 'vertical'}`}
        ref={trackRef}
        data-testid="marquee-track"
      >
        <div className="marquee-content" style={gapStyle} data-testid="marquee-content">
          {children}
        </div>
        <div className="marquee-content marquee-content--clone" style={gapStyle} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};

const Marquee = React.memo(MarqueeInner);
export default Marquee;
