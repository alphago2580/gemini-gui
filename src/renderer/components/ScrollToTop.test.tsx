import React, { useRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';

// Mock window.scrollTo
const mockScrollTo = vi.fn();

beforeEach(() => {
  mockScrollTo.mockClear();
  window.scrollTo = mockScrollTo;
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
});

function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
}

describe('ScrollToTop', () => {
  // --- Rendering ---

  it('renders button', () => {
    render(<ScrollToTop />);
    expect(screen.getByRole('button', { name: '맨 위로 스크롤' })).toBeInTheDocument();
  });

  it('renders default icon', () => {
    render(<ScrollToTop />);
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<ScrollToTop icon="⬆" />);
    expect(screen.getByText('⬆')).toBeInTheDocument();
  });

  it('is hidden initially when at top', () => {
    const { container } = render(<ScrollToTop />);
    expect(container.querySelector('.scroll-to-top-visible')).not.toBeInTheDocument();
  });

  // --- Visibility ---

  it('becomes visible when scrolled past threshold', () => {
    const { container } = render(<ScrollToTop threshold={100} />);
    setScrollY(150);
    act(() => {
      fireEvent.scroll(window);
    });
    expect(container.querySelector('.scroll-to-top-visible')).toBeInTheDocument();
  });

  it('hides when scrolled back above threshold', () => {
    const { container } = render(<ScrollToTop threshold={100} />);
    setScrollY(150);
    act(() => { fireEvent.scroll(window); });
    expect(container.querySelector('.scroll-to-top-visible')).toBeInTheDocument();
    setScrollY(50);
    act(() => { fireEvent.scroll(window); });
    expect(container.querySelector('.scroll-to-top-visible')).not.toBeInTheDocument();
  });

  it('uses default threshold of 200', () => {
    const { container } = render(<ScrollToTop />);
    setScrollY(100);
    act(() => { fireEvent.scroll(window); });
    expect(container.querySelector('.scroll-to-top-visible')).not.toBeInTheDocument();
    setScrollY(250);
    act(() => { fireEvent.scroll(window); });
    expect(container.querySelector('.scroll-to-top-visible')).toBeInTheDocument();
  });

  // --- Click behavior ---

  it('scrolls to top on click with smooth behavior', () => {
    render(<ScrollToTop />);
    setScrollY(300);
    act(() => { fireEvent.scroll(window); });
    fireEvent.click(screen.getByRole('button', { name: '맨 위로 스크롤' }));
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('scrolls to top with auto behavior when smooth=false', () => {
    render(<ScrollToTop smooth={false} />);
    setScrollY(300);
    act(() => { fireEvent.scroll(window); });
    fireEvent.click(screen.getByRole('button', { name: '맨 위로 스크롤' }));
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  // --- Scroll target ---

  it('uses custom scroll target', () => {
    const scrollToMock = vi.fn();
    function TestWrapper() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <div>
          <div ref={ref} data-testid="scroll-container" style={{ overflow: 'auto', height: 100 }}>
            <div style={{ height: 1000 }}>content</div>
          </div>
          <ScrollToTop scrollTarget={ref} threshold={50} />
        </div>
      );
    }
    render(<TestWrapper />);
    const container = screen.getByTestId('scroll-container');
    // Mock scrollTo on the element
    container.scrollTo = scrollToMock;
    Object.defineProperty(container, 'scrollTop', { value: 100, configurable: true });
    act(() => { fireEvent.scroll(container); });
    fireEvent.click(screen.getByRole('button', { name: '맨 위로 스크롤' }));
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  // --- TabIndex ---

  it('has tabIndex=-1 when hidden', () => {
    render(<ScrollToTop />);
    expect(screen.getByRole('button', { name: '맨 위로 스크롤' })).toHaveAttribute('tabindex', '-1');
  });

  it('has tabIndex=0 when visible', () => {
    render(<ScrollToTop threshold={100} />);
    setScrollY(150);
    act(() => { fireEvent.scroll(window); });
    expect(screen.getByRole('button', { name: '맨 위로 스크롤' })).toHaveAttribute('tabindex', '0');
  });

  // --- Sizes ---

  it('applies small size', () => {
    const { container } = render(<ScrollToTop size="small" />);
    expect(container.querySelector('.scroll-to-top-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<ScrollToTop />);
    expect(container.querySelector('.scroll-to-top-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = render(<ScrollToTop size="large" />);
    expect(container.querySelector('.scroll-to-top-large')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies primary variant by default', () => {
    const { container } = render(<ScrollToTop />);
    expect(container.querySelector('.scroll-to-top-primary')).toBeInTheDocument();
  });

  it('applies secondary variant', () => {
    const { container } = render(<ScrollToTop variant="secondary" />);
    expect(container.querySelector('.scroll-to-top-secondary')).toBeInTheDocument();
  });

  it('applies ghost variant', () => {
    const { container } = render(<ScrollToTop variant="ghost" />);
    expect(container.querySelector('.scroll-to-top-ghost')).toBeInTheDocument();
  });

  // --- Positions ---

  it('applies bottom-right position by default', () => {
    const { container } = render(<ScrollToTop />);
    expect(container.querySelector('.scroll-to-top-bottom-right')).toBeInTheDocument();
  });

  it('applies bottom-left position', () => {
    const { container } = render(<ScrollToTop position="bottom-left" />);
    expect(container.querySelector('.scroll-to-top-bottom-left')).toBeInTheDocument();
  });

  it('applies bottom-center position', () => {
    const { container } = render(<ScrollToTop position="bottom-center" />);
    expect(container.querySelector('.scroll-to-top-bottom-center')).toBeInTheDocument();
  });

  // --- Accessibility ---

  it('uses custom ariaLabel', () => {
    render(<ScrollToTop ariaLabel="위로 이동" />);
    expect(screen.getByRole('button', { name: '위로 이동' })).toBeInTheDocument();
  });

  it('icon is aria-hidden', () => {
    const { container } = render(<ScrollToTop />);
    const icon = container.querySelector('.scroll-to-top-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
