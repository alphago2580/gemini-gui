import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScrollSpy from './ScrollSpy';
import type { ScrollSpySection } from './ScrollSpy';

const createSections = (count: number): ScrollSpySection[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `section-${i}`,
    label: `Section ${i}`,
  }));

// Helper: create DOM sections for scroll testing with mocked positions
const setupSectionElements = (sections: ScrollSpySection[]) => {
  sections.forEach((s, i) => {
    const el = document.createElement('div');
    el.id = s.id;
    document.body.appendChild(el);
    // Mock getBoundingClientRect so sections are spaced at 500px intervals
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: i * 500,
      bottom: i * 500 + 400,
      left: 0,
      right: 100,
      width: 100,
      height: 400,
      x: 0,
      y: i * 500,
      toJSON: () => ({}),
    });
  });
  // scrollY = 0 by default; with offset=80, only first section (top=0) is active
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
};

const cleanupSectionElements = (sections: ScrollSpySection[]) => {
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) document.body.removeChild(el);
  });
};

describe('ScrollSpy', () => {
  const sections = createSections(4);

  beforeEach(() => {
    setupSectionElements(sections);
  });

  afterEach(() => {
    cleanupSectionElements(sections);
  });

  it('renders nothing when sections array is empty', () => {
    const { container } = render(
      <ScrollSpy sections={[]} onActiveChange={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nav element with correct aria-label', () => {
    render(<ScrollSpy sections={sections} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', '섹션 탐색');
  });

  it('renders all section labels as buttons', () => {
    render(<ScrollSpy sections={sections} />);
    sections.forEach((s) => {
      expect(screen.getByText(s.label)).toBeInTheDocument();
    });
  });

  it('renders buttons for each section', () => {
    render(<ScrollSpy sections={sections} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(sections.length);
  });

  it('marks first section as active by default', () => {
    render(<ScrollSpy sections={sections} />);
    const firstButton = screen.getByText('Section 0').closest('button');
    expect(firstButton).toHaveClass('scrollspy-link-active');
    expect(firstButton).toHaveAttribute('aria-current', 'true');
  });

  it('does not mark non-first sections as active initially', () => {
    render(<ScrollSpy sections={sections} />);
    const secondButton = screen.getByText('Section 1').closest('button');
    expect(secondButton).not.toHaveClass('scrollspy-link-active');
    expect(secondButton).not.toHaveAttribute('aria-current');
  });

  it('defaults to vertical orientation class', () => {
    const { container } = render(<ScrollSpy sections={sections} />);
    expect(container.querySelector('.scrollspy-nav-vertical')).toBeInTheDocument();
    expect(container.querySelector('.scrollspy-nav-horizontal')).not.toBeInTheDocument();
  });

  it('applies horizontal orientation class', () => {
    const { container } = render(
      <ScrollSpy sections={sections} orientation="horizontal" />
    );
    expect(container.querySelector('.scrollspy-nav-horizontal')).toBeInTheDocument();
    expect(container.querySelector('.scrollspy-nav-vertical')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ScrollSpy sections={sections} className="my-custom-class" />
    );
    const nav = container.querySelector('.scrollspy-nav');
    expect(nav).toHaveClass('my-custom-class');
  });

  it('renders list items with role="listitem"', () => {
    render(<ScrollSpy sections={sections} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(sections.length);
  });

  it('renders a list with role="list"', () => {
    render(<ScrollSpy sections={sections} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('each button has scrollspy-indicator and scrollspy-label spans', () => {
    const { container } = render(<ScrollSpy sections={sections} />);
    const indicators = container.querySelectorAll('.scrollspy-indicator');
    const labels = container.querySelectorAll('.scrollspy-label');
    expect(indicators).toHaveLength(sections.length);
    expect(labels).toHaveLength(sections.length);
  });

  it('calls scrollIntoView with smooth behavior on click', () => {
    const sectionEl = document.getElementById('section-2');
    const scrollIntoViewMock = vi.fn();
    sectionEl!.scrollIntoView = scrollIntoViewMock;

    render(<ScrollSpy sections={sections} smooth={true} />);
    fireEvent.click(screen.getByText('Section 2'));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('calls scrollIntoView with auto behavior when smooth is false', () => {
    const sectionEl = document.getElementById('section-1');
    const scrollIntoViewMock = vi.fn();
    sectionEl!.scrollIntoView = scrollIntoViewMock;

    render(<ScrollSpy sections={sections} smooth={false} />);
    fireEvent.click(screen.getByText('Section 1'));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });
  });

  it('does not crash when clicking section with missing DOM element', () => {
    const missingSections: ScrollSpySection[] = [
      { id: 'nonexistent', label: 'Missing' },
    ];
    render(<ScrollSpy sections={missingSections} />);
    // Should not throw
    expect(() => fireEvent.click(screen.getByText('Missing'))).not.toThrow();
  });

  it('listens to window scroll events', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    render(<ScrollSpy sections={sections} />);
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    addSpy.mockRestore();
  });

  it('removes scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<ScrollSpy sections={sections} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('listens to container scroll events when containerRef is provided', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const addSpy = vi.spyOn(container, 'addEventListener');

    const ref = { current: container };
    render(<ScrollSpy sections={sections} containerRef={ref} />);
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

    addSpy.mockRestore();
    document.body.removeChild(container);
  });

  it('removes container scroll listener on unmount', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const removeSpy = vi.spyOn(container, 'removeEventListener');

    const ref = { current: container };
    const { unmount } = render(<ScrollSpy sections={sections} containerRef={ref} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    removeSpy.mockRestore();
    document.body.removeChild(container);
  });

  it('calls onActiveChange when active section changes via scroll', () => {
    const onActiveChange = vi.fn();

    render(<ScrollSpy sections={sections} onActiveChange={onActiveChange} offset={80} />);

    // Initial mount: activeId = section-0 (no change, so no callback)
    expect(onActiveChange).not.toHaveBeenCalled();

    // Simulate scroll to section-1: update getBoundingClientRect to reflect scroll
    sections.forEach((s, i) => {
      const el = document.getElementById(s.id)!;
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: i * 500 - 500, // scrolled 500px down
        bottom: i * 500 - 100,
        left: 0,
        right: 100,
        width: 100,
        height: 400,
        x: 0,
        y: i * 500 - 500,
        toJSON: () => ({}),
      });
    });
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });

    fireEvent.scroll(window);

    // Now section-1 should be active (top=0, scrollY+offset=580 >= 500)
    expect(onActiveChange).toHaveBeenCalledWith('section-1');
  });

  it('applies active class only to the active section button', () => {
    render(<ScrollSpy sections={sections} />);
    const buttons = screen.getAllByRole('button');
    const activeButtons = buttons.filter((b) => b.classList.contains('scrollspy-link-active'));
    expect(activeButtons).toHaveLength(1);
  });

  it('buttons have type="button"', () => {
    render(<ScrollSpy sections={sections} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('type', 'button');
    });
  });

  it('renders with single section', () => {
    const single: ScrollSpySection[] = [{ id: 'only', label: 'Only Section' }];
    const onlyEl = document.createElement('div');
    onlyEl.id = 'only';
    document.body.appendChild(onlyEl);

    render(<ScrollSpy sections={single} />);
    expect(screen.getByText('Only Section')).toBeInTheDocument();
    const btn = screen.getByText('Only Section').closest('button');
    expect(btn).toHaveClass('scrollspy-link-active');

    document.body.removeChild(onlyEl);
  });

  it('handles sections with long labels via scrollspy-label class', () => {
    const longSections: ScrollSpySection[] = [
      { id: 'long', label: 'A very long section label that should be truncated with ellipsis' },
    ];
    const el = document.createElement('div');
    el.id = 'long';
    document.body.appendChild(el);

    const { container } = render(<ScrollSpy sections={longSections} />);
    const label = container.querySelector('.scrollspy-label');
    expect(label?.textContent).toBe('A very long section label that should be truncated with ellipsis');

    document.body.removeChild(el);
  });

  it('does not render aria-current on inactive buttons', () => {
    render(<ScrollSpy sections={sections} />);
    const buttons = screen.getAllByRole('button');
    // Only first should have aria-current
    expect(buttons[0]).toHaveAttribute('aria-current', 'true');
    for (let i = 1; i < buttons.length; i++) {
      expect(buttons[i]).not.toHaveAttribute('aria-current');
    }
  });
});
