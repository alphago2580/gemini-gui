import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import HoverCard from './HoverCard';

describe('HoverCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders trigger content', () => {
    render(
      <HoverCard trigger={<button>사용자</button>}>
        <p>프로필 정보</p>
      </HoverCard>
    );
    expect(screen.getByText('사용자')).toBeInTheDocument();
  });

  it('does not show content initially', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    expect(screen.queryByText('카드 내용')).not.toBeInTheDocument();
  });

  it('shows content on mouse enter after open delay', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });

  it('does not show content before open delay completes', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('카드 내용')).not.toBeInTheDocument();
  });

  it('hides content on mouse leave after close delay', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('카드 내용')).not.toBeInTheDocument();
  });

  it('cancels open if mouse leaves before delay', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(100); });
    fireEvent.mouseLeave(trigger);
    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.queryByText('카드 내용')).not.toBeInTheDocument();
  });

  it('keeps content visible when mouse moves to content area', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });

    // Mouse leaves trigger
    fireEvent.mouseLeave(trigger);
    // Mouse enters content before close delay
    const content = container.querySelector('.hover-card-content')!;
    fireEvent.mouseEnter(content);

    act(() => { vi.advanceTimersByTime(300); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });

  it('hides content when mouse leaves content area', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });

    // Move to content
    fireEvent.mouseLeave(trigger);
    const content = container.querySelector('.hover-card-content')!;
    fireEvent.mouseEnter(content);

    // Leave content
    fireEvent.mouseLeave(content);
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('카드 내용')).not.toBeInTheDocument();
  });

  it('uses custom open delay', () => {
    render(
      <HoverCard trigger={<span>트리거</span>} openDelay={100}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(100); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });

  it('uses custom close delay', () => {
    render(
      <HoverCard trigger={<span>트리거</span>} closeDelay={500}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    // Not enough time at 200ms
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
    // Now enough at 500ms
    act(() => { vi.advanceTimersByTime(300); });
    expect(screen.queryByText('카드 내용')).not.toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(
      <HoverCard trigger={<span>트리거</span>} disabled>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.queryByText('카드 내용')).not.toBeInTheDocument();
  });

  it('applies bottom position class by default', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.querySelector('.hover-card-bottom')).toBeInTheDocument();
  });

  it('applies top position class', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>} position="top">
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.querySelector('.hover-card-top')).toBeInTheDocument();
  });

  it('applies left position class', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>} position="left">
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.querySelector('.hover-card-left')).toBeInTheDocument();
  });

  it('applies right position class', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>} position="right">
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.querySelector('.hover-card-right')).toBeInTheDocument();
  });

  it('shows arrow by default', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.querySelector('.hover-card-arrow')).toBeInTheDocument();
    expect(container.querySelector('.hover-card-with-arrow')).toBeInTheDocument();
  });

  it('hides arrow when showArrow is false', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>} showArrow={false}>
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.querySelector('.hover-card-arrow')).not.toBeInTheDocument();
    expect(container.querySelector('.hover-card-with-arrow')).not.toBeInTheDocument();
  });

  it('has role="tooltip" on content', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('applies aria-label when provided', () => {
    render(
      <HoverCard trigger={<span>트리거</span>} ariaLabel="사용자 정보">
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByRole('tooltip')).toHaveAttribute('aria-label', '사용자 정보');
  });

  it('shows content on focus', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.focus(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });

  it('hides content on blur after close delay', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.focus(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();

    fireEvent.blur(trigger);
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('카드 내용')).not.toBeInTheDocument();
  });

  it('renders rich content (not just strings)', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <div data-testid="rich-content">
          <h3>제목</h3>
          <p>설명</p>
          <button>액션</button>
        </div>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByTestId('rich-content')).toBeInTheDocument();
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('설명')).toBeInTheDocument();
    expect(screen.getByText('액션')).toBeInTheDocument();
  });

  it('has hover-card-container class on root', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>내용</p>
      </HoverCard>
    );
    expect(container.querySelector('.hover-card-container')).toBeInTheDocument();
  });

  it('has hover-card-body wrapping children', () => {
    const { container } = render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.querySelector('.hover-card-body')).toBeInTheDocument();
  });

  it('clears timers on unmount', () => {
    const clearSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    fireEvent.mouseEnter(trigger);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('re-entering trigger cancels pending close', () => {
    render(
      <HoverCard trigger={<span>트리거</span>}>
        <p>카드 내용</p>
      </HoverCard>
    );
    const trigger = screen.getByText('트리거').closest('.hover-card-trigger')!;
    // Open
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByText('카드 내용')).toBeInTheDocument();

    // Start closing
    fireEvent.mouseLeave(trigger);
    act(() => { vi.advanceTimersByTime(100); });

    // Re-enter before close completes
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(200); });

    // Should still be visible
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });
});
