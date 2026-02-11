import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Carousel from './Carousel';

const slides = [
  <div key="1">Slide 1</div>,
  <div key="2">Slide 2</div>,
  <div key="3">Slide 3</div>,
];

describe('Carousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -- Rendering --
  it('renders with role="region"', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders all slides', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });

  it('renders slide groups with aria-roledescription', () => {
    render(<Carousel>{slides}</Carousel>);
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups).toHaveLength(3);
    groups.forEach(group => {
      expect(group).toHaveAttribute('aria-roledescription', 'slide');
    });
  });

  it('marks first slide as visible by default', () => {
    render(<Carousel>{slides}</Carousel>);
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[0]).toHaveAttribute('aria-hidden', 'false');
    expect(groups[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders empty carousel', () => {
    render(<Carousel>{[]}</Carousel>);
    expect(screen.getByRole('region')).toHaveClass('carousel--empty');
  });

  it('has default aria-label', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', '캐러셀');
  });

  it('uses custom label', () => {
    render(<Carousel label="이미지 갤러리">{slides}</Carousel>);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', '이미지 갤러리');
  });

  it('has aria-roledescription="carousel"', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('region')).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('has tabIndex=0 for keyboard focus', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('region')).toHaveAttribute('tabindex', '0');
  });

  // -- Arrows --
  it('renders prev and next arrows by default', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByLabelText('이전 슬라이드')).toBeInTheDocument();
    expect(screen.getByLabelText('다음 슬라이드')).toBeInTheDocument();
  });

  it('hides arrows when showArrows=false', () => {
    render(<Carousel showArrows={false}>{slides}</Carousel>);
    expect(screen.queryByLabelText('이전 슬라이드')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('다음 슬라이드')).not.toBeInTheDocument();
  });

  it('disables prev arrow on first slide (no loop)', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByLabelText('이전 슬라이드')).toBeDisabled();
  });

  it('enables next arrow on first slide', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByLabelText('다음 슬라이드')).not.toBeDisabled();
  });

  it('advances to next slide on next arrow click', () => {
    render(<Carousel>{slides}</Carousel>);
    fireEvent.click(screen.getByLabelText('다음 슬라이드'));
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[1]).toHaveAttribute('aria-hidden', 'false');
  });

  it('goes back on prev arrow click', () => {
    render(<Carousel startIndex={1}>{slides}</Carousel>);
    fireEvent.click(screen.getByLabelText('이전 슬라이드'));
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('disables next arrow on last slide (no loop)', () => {
    render(<Carousel startIndex={2}>{slides}</Carousel>);
    expect(screen.getByLabelText('다음 슬라이드')).toBeDisabled();
  });

  it('does not show arrows for single slide', () => {
    render(<Carousel>{[<div key="1">Only</div>]}</Carousel>);
    expect(screen.queryByLabelText('이전 슬라이드')).not.toBeInTheDocument();
  });

  // -- Indicators --
  it('renders indicators by default', () => {
    render(<Carousel>{slides}</Carousel>);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('marks current indicator as active', () => {
    render(<Carousel>{slides}</Carousel>);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('goes to slide on indicator click', () => {
    render(<Carousel>{slides}</Carousel>);
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]);
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[2]).toHaveAttribute('aria-hidden', 'false');
  });

  it('hides indicators when showIndicators=false', () => {
    render(<Carousel showIndicators={false}>{slides}</Carousel>);
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('does not show indicators for single slide', () => {
    render(<Carousel>{[<div key="1">Only</div>]}</Carousel>);
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('indicator has accessible aria-label', () => {
    render(<Carousel>{slides}</Carousel>);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-label', '슬라이드 1');
    expect(tabs[2]).toHaveAttribute('aria-label', '슬라이드 3');
  });

  it('indicator container has role="tablist"', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  // -- Loop --
  it('wraps to first slide from last when loop=true', () => {
    render(<Carousel loop startIndex={2}>{slides}</Carousel>);
    fireEvent.click(screen.getByLabelText('다음 슬라이드'));
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('wraps to last slide from first when loop=true', () => {
    render(<Carousel loop>{slides}</Carousel>);
    fireEvent.click(screen.getByLabelText('이전 슬라이드'));
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[2]).toHaveAttribute('aria-hidden', 'false');
  });

  it('enables prev arrow at first slide when loop=true', () => {
    render(<Carousel loop>{slides}</Carousel>);
    expect(screen.getByLabelText('이전 슬라이드')).not.toBeDisabled();
  });

  it('enables next arrow at last slide when loop=true', () => {
    render(<Carousel loop startIndex={2}>{slides}</Carousel>);
    expect(screen.getByLabelText('다음 슬라이드')).not.toBeDisabled();
  });

  // -- Keyboard navigation --
  it('goes next on ArrowRight', () => {
    render(<Carousel>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[1]).toHaveAttribute('aria-hidden', 'false');
  });

  it('goes prev on ArrowLeft', () => {
    render(<Carousel startIndex={1}>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('goes to first on Home', () => {
    render(<Carousel startIndex={2}>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'Home' });
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('goes to last on End', () => {
    render(<Carousel>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'End' });
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[2]).toHaveAttribute('aria-hidden', 'false');
  });

  it('does not go past first slide on ArrowLeft (no loop)', () => {
    const onChange = vi.fn();
    render(<Carousel onChange={onChange}>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not go past last slide on ArrowRight (no loop)', () => {
    const onChange = vi.fn();
    render(<Carousel startIndex={2} onChange={onChange}>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  // -- onChange callback --
  it('calls onChange when navigating', () => {
    const onChange = vi.fn();
    render(<Carousel onChange={onChange}>{slides}</Carousel>);
    fireEvent.click(screen.getByLabelText('다음 슬라이드'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('calls onChange on indicator click', () => {
    const onChange = vi.fn();
    render(<Carousel onChange={onChange}>{slides}</Carousel>);
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  // -- autoPlay --
  it('advances automatically with autoPlay', () => {
    const onChange = vi.fn();
    render(<Carousel autoPlay autoPlayInterval={1000} onChange={onChange}>{slides}</Carousel>);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('continues auto-play across slides', () => {
    const onChange = vi.fn();
    render(<Carousel autoPlay autoPlayInterval={1000} loop onChange={onChange}>{slides}</Carousel>);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('does not auto-play with single slide', () => {
    const onChange = vi.fn();
    render(<Carousel autoPlay autoPlayInterval={1000} onChange={onChange}>{[<div key="1">Only</div>]}</Carousel>);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onChange).not.toHaveBeenCalled();
  });

  // -- startIndex --
  it('starts at specified index', () => {
    render(<Carousel startIndex={1}>{slides}</Carousel>);
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[1]).toHaveAttribute('aria-hidden', 'false');
  });

  // -- Transform --
  it('applies correct transform for slide position', () => {
    const { container } = render(<Carousel startIndex={1}>{slides}</Carousel>);
    const track = container.querySelector('.carousel-track');
    expect(track).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('applies 0% transform at first slide', () => {
    const { container } = render(<Carousel>{slides}</Carousel>);
    const track = container.querySelector('.carousel-track');
    expect(track).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('applies correct transform at last slide', () => {
    const { container } = render(<Carousel startIndex={2}>{slides}</Carousel>);
    const track = container.querySelector('.carousel-track');
    expect(track).toHaveStyle({ transform: 'translateX(-200%)' });
  });

  // -- Slide labels --
  it('has slide labels with position info', () => {
    render(<Carousel>{slides}</Carousel>);
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[0]).toHaveAttribute('aria-label', '1 / 3');
    expect(groups[2]).toHaveAttribute('aria-label', '3 / 3');
  });

  // -- CSS classes --
  it('applies carousel class', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('region')).toHaveClass('carousel');
  });

  it('applies active class on current indicator', () => {
    const { container } = render(<Carousel>{slides}</Carousel>);
    const indicators = container.querySelectorAll('.carousel-indicator');
    expect(indicators[0]).toHaveClass('carousel-indicator--active');
    expect(indicators[1]).not.toHaveClass('carousel-indicator--active');
  });

  it('updates active indicator on navigation', () => {
    const { container } = render(<Carousel>{slides}</Carousel>);
    fireEvent.click(screen.getByLabelText('다음 슬라이드'));
    const indicators = container.querySelectorAll('.carousel-indicator');
    expect(indicators[1]).toHaveClass('carousel-indicator--active');
    expect(indicators[0]).not.toHaveClass('carousel-indicator--active');
  });

  // -- Additional round 17 tests --
  it('ignores unrelated key presses', () => {
    const onChange = vi.fn();
    render(<Carousel onChange={onChange}>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'a' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Home is no-op when already at first slide', () => {
    const onChange = vi.fn();
    render(<Carousel onChange={onChange}>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'Home' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('End is no-op when already at last slide', () => {
    const onChange = vi.fn();
    render(<Carousel startIndex={2} onChange={onChange}>{slides}</Carousel>);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'End' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('indicator click on current slide is no-op', () => {
    const onChange = vi.fn();
    render(<Carousel onChange={onChange}>{slides}</Carousel>);
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not auto-play when autoPlay is false', () => {
    const onChange = vi.fn();
    render(<Carousel autoPlay={false} autoPlayInterval={100} onChange={onChange}>{slides}</Carousel>);
    act(() => { vi.advanceTimersByTime(500); });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('empty carousel uses custom label', () => {
    render(<Carousel label="빈 갤러리">{[]}</Carousel>);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', '빈 갤러리');
  });

  it('carousel-viewport exists', () => {
    const { container } = render(<Carousel>{slides}</Carousel>);
    expect(container.querySelector('.carousel-viewport')).toBeInTheDocument();
  });

  it('slide labels show "2 / 3" for second slide', () => {
    render(<Carousel>{slides}</Carousel>);
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups[1]).toHaveAttribute('aria-label', '2 / 3');
  });
});
