import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CountdownTimer from './CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -- Rendering --
  it('renders with role="timer"', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('displays formatted time for seconds', () => {
    render(<CountdownTimer duration={90} />);
    expect(screen.getByText('01:30')).toBeInTheDocument();
  });

  it('displays hours when showHours=true', () => {
    render(<CountdownTimer duration={3661} showHours />);
    expect(screen.getByText('01:01:01')).toBeInTheDocument();
  });

  it('auto-shows hours when duration exceeds 1 hour', () => {
    render(<CountdownTimer duration={3600} />);
    expect(screen.getByText('01:00:00')).toBeInTheDocument();
  });

  it('displays 00:00 for zero duration', () => {
    render(<CountdownTimer duration={0} />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '카운트다운 타이머');
  });

  it('uses custom label', () => {
    render(<CountdownTimer duration={60} label="남은 시간" />);
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '남은 시간');
  });

  it('renders label text', () => {
    render(<CountdownTimer duration={60} label="남은 시간" />);
    expect(screen.getByText('남은 시간')).toBeInTheDocument();
  });

  it('applies custom id', () => {
    render(<CountdownTimer duration={60} id="my-timer" />);
    expect(screen.getByRole('timer')).toHaveAttribute('id', 'my-timer');
  });

  it('has aria-live="polite"', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'polite');
  });

  // -- Sizes --
  it('applies medium size by default', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--medium');
  });

  it('applies small size class', () => {
    render(<CountdownTimer duration={60} size="small" />);
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--small');
  });

  it('applies large size class', () => {
    render(<CountdownTimer duration={60} size="large" />);
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--large');
  });

  // -- Variants --
  it('applies default variant', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--default');
  });

  it('applies warning variant', () => {
    render(<CountdownTimer duration={60} variant="warning" />);
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--warning');
  });

  it('applies danger variant', () => {
    render(<CountdownTimer duration={60} variant="danger" />);
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--danger');
  });

  // -- Controls --
  it('shows start button when not running', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByLabelText('시작')).toBeInTheDocument();
  });

  it('shows reset button', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByLabelText('초기화')).toBeInTheDocument();
  });

  it('shows pause button when running', () => {
    render(<CountdownTimer duration={60} autoStart />);
    expect(screen.getByLabelText('일시정지')).toBeInTheDocument();
    expect(screen.queryByLabelText('시작')).not.toBeInTheDocument();
  });

  // -- Start/Pause --
  it('starts countdown on start button click', () => {
    render(<CountdownTimer duration={60} />);
    fireEvent.click(screen.getByLabelText('시작'));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  it('pauses countdown on pause button click', () => {
    render(<CountdownTimer duration={60} autoStart />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('00:58')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('일시정지'));
    act(() => { vi.advanceTimersByTime(3000); });
    // Should still be 58 after pausing
    expect(screen.getByText('00:58')).toBeInTheDocument();
  });

  it('resumes after pause', () => {
    render(<CountdownTimer duration={60} autoStart />);
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByLabelText('일시정지'));
    fireEvent.click(screen.getByLabelText('시작'));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('00:57')).toBeInTheDocument();
  });

  // -- Reset --
  it('resets to original duration', () => {
    render(<CountdownTimer duration={60} autoStart />);
    act(() => { vi.advanceTimersByTime(5000); });
    fireEvent.click(screen.getByLabelText('초기화'));
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('stops running on reset', () => {
    render(<CountdownTimer duration={60} autoStart />);
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByLabelText('초기화'));
    expect(screen.getByLabelText('시작')).toBeInTheDocument();
  });

  // -- Auto-start --
  it('auto-starts when autoStart=true', () => {
    render(<CountdownTimer duration={60} autoStart />);
    expect(screen.getByLabelText('일시정지')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  it('does not auto-start by default', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByLabelText('시작')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  // -- Completion --
  it('calls onComplete when reaching zero', () => {
    const onComplete = vi.fn();
    render(<CountdownTimer duration={3} autoStart onComplete={onComplete} />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows 00:00 when completed', () => {
    render(<CountdownTimer duration={2} autoStart />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('applies complete CSS class when finished', () => {
    render(<CountdownTimer duration={1} autoStart />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--complete');
  });

  it('does not show start button when complete', () => {
    render(<CountdownTimer duration={1} autoStart />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByLabelText('시작')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('일시정지')).not.toBeInTheDocument();
  });

  it('can restart after reset from complete', () => {
    render(<CountdownTimer duration={2} autoStart />);
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByLabelText('초기화'));
    expect(screen.getByLabelText('시작')).toBeInTheDocument();
    expect(screen.getByText('00:02')).toBeInTheDocument();
  });

  // -- onTick --
  it('calls onTick on each second', () => {
    const onTick = vi.fn();
    render(<CountdownTimer duration={5} autoStart onTick={onTick} />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onTick).toHaveBeenCalledWith(4);
    expect(onTick).toHaveBeenCalledWith(3);
    expect(onTick).toHaveBeenCalledWith(2);
  });

  // -- Threshold variants --
  it('switches to warning variant at warningThreshold', () => {
    render(<CountdownTimer duration={10} autoStart warningThreshold={5} />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--warning');
  });

  it('switches to danger variant at dangerThreshold', () => {
    render(<CountdownTimer duration={10} autoStart dangerThreshold={3} />);
    act(() => { vi.advanceTimersByTime(7000); });
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--danger');
  });

  it('danger takes priority over warning at overlap', () => {
    render(<CountdownTimer duration={10} autoStart warningThreshold={5} dangerThreshold={3} />);
    act(() => { vi.advanceTimersByTime(8000); });
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--danger');
    expect(screen.getByRole('timer')).not.toHaveClass('countdown-timer--warning');
  });

  // -- Progress bar --
  it('renders progress bar', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('progress starts at 0%', () => {
    render(<CountdownTimer duration={60} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('progress increases as time passes', () => {
    render(<CountdownTimer duration={10} autoStart />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('progress reaches 100% at completion', () => {
    render(<CountdownTimer duration={2} autoStart />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  // -- Running class --
  it('applies running class when running', () => {
    render(<CountdownTimer duration={60} autoStart />);
    expect(screen.getByRole('timer')).toHaveClass('countdown-timer--running');
  });

  it('removes running class when paused', () => {
    render(<CountdownTimer duration={60} autoStart />);
    fireEvent.click(screen.getByLabelText('일시정지'));
    expect(screen.getByRole('timer')).not.toHaveClass('countdown-timer--running');
  });

  // -- Edge cases --
  it('does not go below zero', () => {
    render(<CountdownTimer duration={1} autoStart />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('start does nothing when already complete', () => {
    render(<CountdownTimer duration={1} autoStart />);
    act(() => { vi.advanceTimersByTime(1000); });
    // No start button should be visible
    expect(screen.queryByLabelText('시작')).not.toBeInTheDocument();
  });
});
