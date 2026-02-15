import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './ScrollSpy.css';

export interface ScrollSpySection {
  id: string;
  label: string;
}

export interface ScrollSpyProps {
  /** List of sections to track */
  sections: ScrollSpySection[];
  /** The scrollable container element (defaults to window if not provided) */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Offset from the top to consider a section "active" (px) */
  offset?: number;
  /** Callback when active section changes */
  onActiveChange?: (sectionId: string) => void;
  /** Whether clicking a nav item scrolls to the section */
  smooth?: boolean;
  /** Orientation of the nav */
  orientation?: 'vertical' | 'horizontal';
  /** Additional className */
  className?: string;
}

const DEFAULT_OFFSET = 80;

const ScrollSpy: React.FC<ScrollSpyProps> = ({
  sections,
  containerRef,
  offset = DEFAULT_OFFSET,
  onActiveChange,
  smooth = true,
  orientation = 'vertical',
  className,
}) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  const navRef = useRef<HTMLElement>(null);
  const onActiveChangeRef = useRef(onActiveChange);

  // Keep callback ref fresh without adding to effect dependencies
  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const handleScroll = useCallback(() => {
    const container = containerRef?.current;
    const scrollTop = container ? container.scrollTop : window.scrollY;

    let currentId = sectionIds[0] ?? '';

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;

      const top = container
        ? el.offsetTop - container.offsetTop
        : el.getBoundingClientRect().top + window.scrollY;

      if (scrollTop + offset >= top) {
        currentId = id;
      }
    }

    setActiveId((prev) => {
      if (prev !== currentId) {
        onActiveChangeRef.current?.(currentId);
        return currentId;
      }
      return prev;
    });
  }, [sectionIds, containerRef, offset]);

  useEffect(() => {
    const container = containerRef?.current;
    const target = container ?? window;

    target.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, containerRef]);

  const handleClick = useCallback(
    (sectionId: string) => {
      const el = document.getElementById(sectionId);
      if (!el) return;

      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    },
    [smooth]
  );

  if (sections.length === 0) return null;

  const navClass = [
    'scrollspy-nav',
    `scrollspy-nav-${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={navClass} ref={navRef} aria-label="섹션 탐색">
      <ul className="scrollspy-list" role="list">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id} className="scrollspy-item" role="listitem">
              <button
                className={`scrollspy-link${isActive ? ' scrollspy-link-active' : ''}`}
                onClick={() => handleClick(section.id)}
                aria-current={isActive ? 'true' : undefined}
                type="button"
              >
                <span className="scrollspy-indicator" />
                <span className="scrollspy-label">{section.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default React.memo(ScrollSpy);
