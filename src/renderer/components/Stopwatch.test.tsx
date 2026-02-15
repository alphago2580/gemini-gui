import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Stopwatch from './Stopwatch';

describe('Stopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default state showing 00:00.00', () => {
    render(<Stopwatch />);
    expect(screen.getByTestId('stopwatch-time').textContent).toBe('00:00.00');
  });

  it('renders nothing running by default', () => {
    const { container } = render(<Stopwatch />);
    expect(container.querySelector('.stopwatch--running')).not.toBeInTheDocument();
  });

  it('has role="timer" for accessibility', () => {
    render(<Stopwatch />);
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(<Stopwatch />);
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '스톱워치');
  });

  it('uses custom label for aria-label', () => {
    render(<Stopwatch label="경과 시간" />);
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '경과 시간');
  });

  it('displays label text', () => {
    render(<Stopwatch label="경과 시간" />);
    expect(screen.getByText('경과 시간')).toBeInTheDocument();
  });

  it('applies id prop', () => {
    const { container } = render(<Stopwatch id="my-stopwatch" />);
    expect(container.querySelector('#my-stopwatch')).toBeInTheDocument();
  });

  // Size variants
  describe('size variants', () => {
    it('applies small size class', () => {
      const { container } = render(<Stopwatch size="small" />);
      expect(container.querySelector('.stopwatch--small')).toBeInTheDocument();
    });

    it('applies medium size class by default', () => {
      const { container } = render(<Stopwatch />);
      expect(container.querySelector('.stopwatch--medium')).toBeInTheDocument();
    });

    it('applies large size class', () => {
      const { container } = render(<Stopwatch size="large" />);
      expect(container.querySelector('.stopwatch--large')).toBeInTheDocument();
    });
  });

  // Start button
  describe('start button', () => {
    it('shows start button when not running', () => {
      render(<Stopwatch />);
      expect(screen.getByRole('button', { name: '시작' })).toBeInTheDocument();
    });

    it('starts the timer when start button is clicked', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      // Timer should have advanced
      expect(screen.getByTestId('stopwatch-time').textContent).not.toBe('00:00.00');
    });

    it('adds running class when started', () => {
      const { container } = render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      expect(container.querySelector('.stopwatch--running')).toBeInTheDocument();
    });
  });

  // Pause button
  describe('pause button', () => {
    it('shows pause button when running', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      expect(screen.getByRole('button', { name: '일시정지' })).toBeInTheDocument();
    });

    it('pauses the timer', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));

      const timeAfterPause = screen.getByTestId('stopwatch-time').textContent;
      act(() => { vi.advanceTimersByTime(2000); });
      expect(screen.getByTestId('stopwatch-time').textContent).toBe(timeAfterPause);
    });

    it('removes running class when paused', () => {
      const { container } = render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));
      expect(container.querySelector('.stopwatch--running')).not.toBeInTheDocument();
    });

    it('shows start button again after pause', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));
      expect(screen.getByRole('button', { name: '시작' })).toBeInTheDocument();
    });
  });

  // Reset button
  describe('reset button', () => {
    it('does not show reset button when elapsed is 0', () => {
      render(<Stopwatch />);
      expect(screen.queryByRole('button', { name: '초기화' })).not.toBeInTheDocument();
    });

    it('shows reset button when paused with elapsed > 0', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));
      expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();
    });

    it('resets elapsed time to zero', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(5000); });
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));
      fireEvent.click(screen.getByRole('button', { name: '초기화' }));
      expect(screen.getByTestId('stopwatch-time').textContent).toBe('00:00.00');
    });

    it('clears laps on reset', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));
      fireEvent.click(screen.getByRole('button', { name: '초기화' }));
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  // Lap button
  describe('lap functionality', () => {
    it('shows lap button when running', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      expect(screen.getByRole('button', { name: '랩' })).toBeInTheDocument();
    });

    it('does not show lap button when not running', () => {
      render(<Stopwatch />);
      expect(screen.queryByRole('button', { name: '랩' })).not.toBeInTheDocument();
    });

    it('records a lap when lap button is clicked', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));
      expect(screen.getByText('랩 1')).toBeInTheDocument();
    });

    it('records multiple laps', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));
      act(() => { vi.advanceTimersByTime(2000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));
      expect(screen.getByText('랩 1')).toBeInTheDocument();
      expect(screen.getByText('랩 2')).toBeInTheDocument();
    });

    it('calls onLap callback when lap is recorded', () => {
      const onLap = vi.fn();
      render(<Stopwatch onLap={onLap} />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));
      expect(onLap).toHaveBeenCalledTimes(1);
      expect(onLap).toHaveBeenCalledWith(
        expect.objectContaining({ index: 1 })
      );
    });

    it('laps list has role="list" and aria-label', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));
      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', '랩 기록');
    });

    it('each lap has role="listitem"', () => {
      render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('respects maxLaps limit', () => {
      render(<Stopwatch maxLaps={2} />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      for (let i = 0; i < 5; i++) {
        act(() => { vi.advanceTimersByTime(500); });
        fireEvent.click(screen.getByRole('button', { name: '랩' }));
      }
      // Only 2 should be visible
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(2);
    });
  });

  // Auto-start
  describe('autoStart', () => {
    it('starts automatically when autoStart is true', () => {
      const { container } = render(<Stopwatch autoStart />);
      expect(container.querySelector('.stopwatch--running')).toBeInTheDocument();
    });

    it('shows pause button immediately with autoStart', () => {
      render(<Stopwatch autoStart />);
      expect(screen.getByRole('button', { name: '일시정지' })).toBeInTheDocument();
    });

    it('timer advances with autoStart', () => {
      render(<Stopwatch autoStart />);
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByTestId('stopwatch-time').textContent).not.toBe('00:00.00');
    });
  });

  // Time format
  describe('time format', () => {
    it('shows milliseconds by default', () => {
      render(<Stopwatch />);
      // Default display includes centiseconds: 00:00.00
      expect(screen.getByTestId('stopwatch-time').textContent).toMatch(/\.\d{2}$/);
    });

    it('hides milliseconds when showMilliseconds is false', () => {
      render(<Stopwatch showMilliseconds={false} />);
      expect(screen.getByTestId('stopwatch-time').textContent).toBe('00:00');
    });

    it('shows hours when showHours is true', () => {
      render(<Stopwatch showHours showMilliseconds={false} />);
      expect(screen.getByTestId('stopwatch-time').textContent).toBe('00:00:00');
    });
  });

  // onTick callback
  describe('onTick callback', () => {
    it('calls onTick with elapsed time', () => {
      const onTick = vi.fn();
      render(<Stopwatch onTick={onTick} />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(100); });
      expect(onTick).toHaveBeenCalled();
      // The argument should be a number (elapsed ms)
      expect(typeof onTick.mock.calls[0][0]).toBe('number');
    });
  });

  // Best/worst lap highlighting
  describe('best and worst lap highlighting', () => {
    it('highlights best and worst laps when there are 2+ laps', () => {
      const { container } = render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));

      // Lap 1 — short
      act(() => { vi.advanceTimersByTime(500); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));

      // Lap 2 — long
      act(() => { vi.advanceTimersByTime(3000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));

      expect(container.querySelector('.stopwatch-lap--best')).toBeInTheDocument();
      expect(container.querySelector('.stopwatch-lap--worst')).toBeInTheDocument();
    });

    it('does not highlight when only one lap exists', () => {
      const { container } = render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '랩' }));

      expect(container.querySelector('.stopwatch-lap--best')).not.toBeInTheDocument();
      expect(container.querySelector('.stopwatch-lap--worst')).not.toBeInTheDocument();
    });
  });

  // Timer cleanup
  describe('timer cleanup', () => {
    it('cleans up interval on unmount', () => {
      const onTick = vi.fn();
      const { unmount } = render(<Stopwatch onTick={onTick} autoStart />);
      act(() => { vi.advanceTimersByTime(100); });
      const callCount = onTick.mock.calls.length;
      unmount();
      act(() => { vi.advanceTimersByTime(1000); });
      // No more ticks after unmount
      expect(onTick.mock.calls.length).toBe(callCount);
    });
  });

  // Resume after pause
  describe('resume after pause', () => {
    it('resumes from paused time', () => {
      render(<Stopwatch showMilliseconds={false} />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(3000); });
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));
      const pausedTime = screen.getByTestId('stopwatch-time').textContent;

      // Resume
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(2000); });
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));

      // Should have continued from where it paused, not reset
      expect(screen.getByTestId('stopwatch-time').textContent).not.toBe(pausedTime);
      expect(screen.getByTestId('stopwatch-time').textContent).toBe('00:05');
    });
  });

  // CSS classes on buttons
  describe('button classes', () => {
    it('start button has correct class', () => {
      const { container } = render(<Stopwatch />);
      expect(container.querySelector('.stopwatch-btn--start')).toBeInTheDocument();
    });

    it('pause button has correct class when running', () => {
      const { container } = render(<Stopwatch autoStart />);
      expect(container.querySelector('.stopwatch-btn--pause')).toBeInTheDocument();
    });

    it('lap button has correct class when running', () => {
      const { container } = render(<Stopwatch autoStart />);
      expect(container.querySelector('.stopwatch-btn--lap')).toBeInTheDocument();
    });

    it('reset button has correct class when paused with elapsed', () => {
      const { container } = render(<Stopwatch />);
      fireEvent.click(screen.getByRole('button', { name: '시작' }));
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.click(screen.getByRole('button', { name: '일시정지' }));
      expect(container.querySelector('.stopwatch-btn--reset')).toBeInTheDocument();
    });
  });
});
