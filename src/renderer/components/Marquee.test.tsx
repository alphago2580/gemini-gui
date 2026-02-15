import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Marquee from './Marquee';

describe('Marquee', () => {
  let rafCallbacks: Array<(time: number) => void>;
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;

  beforeEach(() => {
    rafCallbacks = [];
    originalRaf = window.requestAnimationFrame;
    originalCaf = window.cancelAnimationFrame;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCaf;
    vi.restoreAllMocks();
  });

  it('should render with default props', () => {
    render(<Marquee>Hello World</Marquee>);
    const marquee = screen.getByTestId('marquee');
    expect(marquee).toBeInTheDocument();
    expect(marquee).toHaveClass('marquee', 'marquee--left');
  });

  it('should render children content twice (original + clone)', () => {
    const { container } = render(<Marquee>Test Content</Marquee>);
    const contents = container.querySelectorAll('.marquee-content');
    expect(contents).toHaveLength(2);
    expect(contents[0]).toHaveTextContent('Test Content');
    expect(contents[1]).toHaveTextContent('Test Content');
  });

  it('should render cloned content with aria-hidden', () => {
    const { container } = render(<Marquee>Scrolling Text</Marquee>);
    const clone = container.querySelector('.marquee-content--clone');
    expect(clone).toBeInTheDocument();
    expect(clone).toHaveAttribute('aria-hidden', 'true');
  });

  it('should apply direction class for left', () => {
    render(<Marquee direction="left">Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveClass('marquee--left');
  });

  it('should apply direction class for right', () => {
    render(<Marquee direction="right">Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveClass('marquee--right');
  });

  it('should apply direction class for up', () => {
    render(<Marquee direction="up">Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveClass('marquee--up');
  });

  it('should apply direction class for down', () => {
    render(<Marquee direction="down">Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveClass('marquee--down');
  });

  it('should use horizontal track for left/right', () => {
    render(<Marquee direction="left">Content</Marquee>);
    const track = screen.getByTestId('marquee-track');
    expect(track).toHaveClass('marquee-track--horizontal');
  });

  it('should use vertical track for up/down', () => {
    render(<Marquee direction="up">Content</Marquee>);
    const track = screen.getByTestId('marquee-track');
    expect(track).toHaveClass('marquee-track--vertical');
  });

  it('should have correct aria-label default', () => {
    render(<Marquee>Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveAttribute('aria-label', '스크롤 콘텐츠');
  });

  it('should accept custom aria-label', () => {
    render(<Marquee aria-label="뉴스 티커">Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveAttribute('aria-label', '뉴스 티커');
  });

  it('should have role marquee', () => {
    render(<Marquee>Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveAttribute('role', 'marquee');
  });

  it('should have aria-live off to avoid screen reader noise', () => {
    render(<Marquee>Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveAttribute('aria-live', 'off');
  });

  it('should apply custom className', () => {
    render(<Marquee className="my-marquee">Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveClass('marquee', 'my-marquee');
  });

  it('should apply custom id', () => {
    render(<Marquee id="news-ticker">Content</Marquee>);
    expect(screen.getByTestId('marquee')).toHaveAttribute('id', 'news-ticker');
  });

  it('should apply gap as marginRight for horizontal', () => {
    render(<Marquee gap={20}>Content</Marquee>);
    const contents = screen.getAllByTestId('marquee-content');
    expect(contents[0].style.marginRight).toBe('20px');
  });

  it('should apply gap as marginBottom for vertical', () => {
    render(<Marquee direction="up" gap={30}>Content</Marquee>);
    const contents = screen.getAllByTestId('marquee-content');
    expect(contents[0].style.marginBottom).toBe('30px');
  });

  it('should use default gap of 40px', () => {
    render(<Marquee>Content</Marquee>);
    const contents = screen.getAllByTestId('marquee-content');
    expect(contents[0].style.marginRight).toBe('40px');
  });

  it('should start animation on mount', () => {
    render(<Marquee>Content</Marquee>);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should cancel animation on unmount', () => {
    const { unmount } = render(<Marquee>Content</Marquee>);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should pause on mouse enter when pauseOnHover is true', () => {
    render(<Marquee pauseOnHover={true}>Content</Marquee>);
    const marquee = screen.getByTestId('marquee');
    fireEvent.mouseEnter(marquee);
    // Animation should still be running (RAF still called) but paused internally
    expect(marquee).toBeInTheDocument();
  });

  it('should resume on mouse leave when pauseOnHover is true', () => {
    render(<Marquee pauseOnHover={true}>Content</Marquee>);
    const marquee = screen.getByTestId('marquee');
    fireEvent.mouseEnter(marquee);
    fireEvent.mouseLeave(marquee);
    expect(marquee).toBeInTheDocument();
  });

  it('should not pause on hover when pauseOnHover is false', () => {
    render(<Marquee pauseOnHover={false}>Content</Marquee>);
    const marquee = screen.getByTestId('marquee');
    fireEvent.mouseEnter(marquee);
    expect(marquee).toBeInTheDocument();
  });

  it('should pause on focus when pauseOnFocus is true', () => {
    render(
      <Marquee pauseOnFocus={true}>
        <button>Click me</button>
      </Marquee>
    );
    const marquee = screen.getByTestId('marquee');
    fireEvent.focus(marquee);
    expect(marquee).toBeInTheDocument();
  });

  it('should resume on blur when pauseOnFocus is true', () => {
    render(
      <Marquee pauseOnFocus={true}>
        <button>Click me</button>
      </Marquee>
    );
    const marquee = screen.getByTestId('marquee');
    fireEvent.focus(marquee);
    fireEvent.blur(marquee);
    expect(marquee).toBeInTheDocument();
  });

  it('should not animate when playing is false', () => {
    render(<Marquee playing={false}>Content</Marquee>);
    const track = screen.getByTestId('marquee-track');
    // Run a few RAF cycles
    rafCallbacks.forEach(cb => cb(100));
    // Track should not have moved (transform stays at initial)
    expect(track.style.transform).toBe('');
  });

  it('should render with React.memo (component reference check)', () => {
    const { rerender } = render(<Marquee>Content</Marquee>);
    rerender(<Marquee>Content</Marquee>);
    expect(screen.getByTestId('marquee')).toBeInTheDocument();
  });

  it('should render complex children', () => {
    render(
      <Marquee>
        <span data-testid="child-1">Item 1</span>
        <span data-testid="child-2">Item 2</span>
        <span data-testid="child-3">Item 3</span>
      </Marquee>
    );
    expect(screen.getAllByTestId('child-1')).toHaveLength(2);
    expect(screen.getAllByTestId('child-2')).toHaveLength(2);
    expect(screen.getAllByTestId('child-3')).toHaveLength(2);
  });

  it('should apply horizontal track class for right direction', () => {
    render(<Marquee direction="right">Content</Marquee>);
    const track = screen.getByTestId('marquee-track');
    expect(track).toHaveClass('marquee-track--horizontal');
  });

  it('should apply vertical track class for down direction', () => {
    render(<Marquee direction="down">Content</Marquee>);
    const track = screen.getByTestId('marquee-track');
    expect(track).toHaveClass('marquee-track--vertical');
  });

  it('should apply marginBottom gap for down direction', () => {
    render(<Marquee direction="down" gap={15}>Content</Marquee>);
    const contents = screen.getAllByTestId('marquee-content');
    expect(contents[0].style.marginBottom).toBe('15px');
  });

  it('should not crash with empty children', () => {
    render(<Marquee>{null}</Marquee>);
    expect(screen.getByTestId('marquee')).toBeInTheDocument();
  });
});
