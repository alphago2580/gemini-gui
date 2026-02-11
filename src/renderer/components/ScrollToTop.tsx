import React, { useState, useEffect, useCallback } from 'react';
import './ScrollToTop.css';

export interface ScrollToTopProps {
  threshold?: number;
  smooth?: boolean;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  ariaLabel?: string;
  scrollTarget?: React.RefObject<HTMLElement | null>;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 200,
  smooth = true,
  icon = '↑',
  size = 'medium',
  variant = 'primary',
  position = 'bottom-right',
  ariaLabel = '맨 위로 스크롤',
  scrollTarget,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = scrollTarget?.current ?? window;
    const handleScroll = () => {
      const scrollY = scrollTarget?.current
        ? scrollTarget.current.scrollTop
        : window.scrollY;
      setVisible(scrollY > threshold);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => target.removeEventListener('scroll', handleScroll);
  }, [threshold, scrollTarget]);

  const handleClick = useCallback(() => {
    const target = scrollTarget?.current;
    if (target) {
      target.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    }
  }, [smooth, scrollTarget]);

  const buttonClass = [
    'scroll-to-top',
    `scroll-to-top-${size}`,
    `scroll-to-top-${variant}`,
    `scroll-to-top-${position}`,
    visible && 'scroll-to-top-visible',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      aria-label={ariaLabel}
      type="button"
      tabIndex={visible ? 0 : -1}
    >
      <span className="scroll-to-top-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
};

export default React.memo(ScrollToTop);
