import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Toast from './Toast';
import type { ToastMessage } from './Toast';

describe('Toast', () => {
  let mockDismiss: ReturnType<typeof vi.fn<(id: string) => void>>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockDismiss = vi.fn<(id: string) => void>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createToast = (overrides: Partial<ToastMessage> = {}): ToastMessage => ({
    id: '1',
    type: 'error',
    message: 'Test error message',
    ...overrides,
  });

  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<Toast toasts={[]} onDismiss={mockDismiss} />);
    expect(container.querySelector('.toast-container')).not.toBeInTheDocument();
  });

  it('renders toast message', () => {
    const toasts = [createToast()];
    render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    const toasts = [
      createToast({ id: '1', message: 'Error 1' }),
      createToast({ id: '2', message: 'Error 2', type: 'success' }),
    ];
    render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('applies correct CSS class for error type', () => {
    const toasts = [createToast({ type: 'error' })];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(container.querySelector('.toast-error')).toBeInTheDocument();
  });

  it('applies correct CSS class for success type', () => {
    const toasts = [createToast({ type: 'success' })];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(container.querySelector('.toast-success')).toBeInTheDocument();
  });

  it('applies correct CSS class for info type', () => {
    const toasts = [createToast({ type: 'info' })];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(container.querySelector('.toast-info')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    const toasts = [createToast()];
    render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has close button with aria-label', () => {
    const toasts = [createToast()];
    render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(screen.getByRole('button', { name: '알림 닫기' })).toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', () => {
    const toasts = [createToast({ id: 'toast-123' })];
    render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
    // After exit animation (300ms)
    act(() => { vi.advanceTimersByTime(300); });
    expect(mockDismiss).toHaveBeenCalledWith('toast-123');
  });

  it('auto-dismisses after duration', () => {
    const toasts = [createToast({ id: 'auto-dismiss' })];
    render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    // TOAST_DURATION (5000) + exit animation (300)
    act(() => { vi.advanceTimersByTime(5300); });
    expect(mockDismiss).toHaveBeenCalledWith('auto-dismiss');
  });

  it('container has aria-label', () => {
    const toasts = [createToast()];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(container.querySelector('.toast-container')).toHaveAttribute('aria-label', '알림');
  });

  it('adds toast-exit class during manual dismiss animation', () => {
    const toasts = [createToast({ id: 'exit-test' })];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
    // After clicking but before dismiss timeout
    expect(container.querySelector('.toast-exit')).toBeInTheDocument();
  });

  it('adds toast-exit class during auto-dismiss animation', () => {
    const toasts = [createToast({ id: 'auto-exit' })];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    // Advance past TOAST_DURATION but not past exit animation
    act(() => { vi.advanceTimersByTime(5000); });
    expect(container.querySelector('.toast-exit')).toBeInTheDocument();
  });

  it('has aria-live="assertive" on each toast', () => {
    const toasts = [
      createToast({ id: '1', message: 'A' }),
      createToast({ id: '2', message: 'B' }),
    ];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    const alerts = container.querySelectorAll('[aria-live="assertive"]');
    expect(alerts).toHaveLength(2);
  });

  it('toast-message span contains correct text', () => {
    const toasts = [createToast({ message: '특별한 오류 메시지' })];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    const msgSpan = container.querySelector('.toast-message');
    expect(msgSpan).toBeInTheDocument();
    expect(msgSpan!.textContent).toBe('특별한 오류 메시지');
  });

  it('close button has toast-close class', () => {
    const toasts = [createToast()];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    const closeBtn = container.querySelector('.toast-close');
    expect(closeBtn).toBeInTheDocument();
  });

  it('each toast has unique key (renders independently)', () => {
    const toasts = [
      createToast({ id: 'a', type: 'error', message: 'Error' }),
      createToast({ id: 'b', type: 'success', message: 'Success' }),
      createToast({ id: 'c', type: 'info', message: 'Info' }),
    ];
    const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    expect(container.querySelectorAll('.toast')).toHaveLength(3);
    expect(container.querySelector('.toast-error')).toBeInTheDocument();
    expect(container.querySelector('.toast-success')).toBeInTheDocument();
    expect(container.querySelector('.toast-info')).toBeInTheDocument();
  });

  it('close button text is ×', () => {
    const toasts = [createToast()];
    render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
    const btn = screen.getByRole('button', { name: '알림 닫기' });
    expect(btn.textContent).toBe('×');
  });

  it('auto-dismiss timer is cleaned up on unmount', () => {
    const dismissFn = vi.fn<(id: string) => void>();
    const toasts = [createToast({ id: 'cleanup-test' })];
    const { unmount } = render(<Toast toasts={toasts} onDismiss={dismissFn} />);
    // Advance only 1 second (not enough for auto-dismiss at 5000ms)
    act(() => { vi.advanceTimersByTime(1000); });
    expect(dismissFn).not.toHaveBeenCalled();
    unmount();
    // Now advance past auto-dismiss duration — timer should have been cleared
    act(() => { vi.advanceTimersByTime(6000); });
    expect(dismissFn).not.toHaveBeenCalled();
  });

  // --- Stack enhancements ---

  describe('maxVisible limit', () => {
    it('shows only maxVisible toasts when there are more', () => {
      const toasts = Array.from({ length: 8 }, (_, i) =>
        createToast({ id: `t${i}`, message: `Toast ${i}` })
      );
      const { container } = render(
        <Toast toasts={toasts} onDismiss={mockDismiss} maxVisible={3} />
      );
      expect(container.querySelectorAll('.toast')).toHaveLength(3);
    });

    it('shows all toasts when count is within maxVisible', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
      ];
      const { container } = render(
        <Toast toasts={toasts} onDismiss={mockDismiss} maxVisible={5} />
      );
      expect(container.querySelectorAll('.toast')).toHaveLength(2);
    });

    it('defaults maxVisible to 5', () => {
      const toasts = Array.from({ length: 7 }, (_, i) =>
        createToast({ id: `t${i}`, message: `Toast ${i}` })
      );
      const { container } = render(
        <Toast toasts={toasts} onDismiss={mockDismiss} />
      );
      expect(container.querySelectorAll('.toast')).toHaveLength(5);
    });

    it('shows first N toasts (not last)', () => {
      const toasts = [
        createToast({ id: 'first', message: 'First toast' }),
        createToast({ id: 'second', message: 'Second toast' }),
        createToast({ id: 'third', message: 'Third toast' }),
      ];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} maxVisible={2} />);
      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
      expect(screen.queryByText('Third toast')).not.toBeInTheDocument();
    });
  });

  describe('overflow indicator', () => {
    it('shows +N more indicator when toasts exceed maxVisible', () => {
      const toasts = Array.from({ length: 5 }, (_, i) =>
        createToast({ id: `t${i}`, message: `Toast ${i}` })
      );
      render(<Toast toasts={toasts} onDismiss={mockDismiss} maxVisible={3} />);
      expect(screen.getByText('+2개 더')).toBeInTheDocument();
    });

    it('does not show overflow indicator when all toasts are visible', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
      ];
      const { container } = render(
        <Toast toasts={toasts} onDismiss={mockDismiss} maxVisible={5} />
      );
      expect(container.querySelector('.toast-overflow')).not.toBeInTheDocument();
    });

    it('overflow indicator has role="status" and aria-live="polite"', () => {
      const toasts = Array.from({ length: 4 }, (_, i) =>
        createToast({ id: `t${i}`, message: `Toast ${i}` })
      );
      render(<Toast toasts={toasts} onDismiss={mockDismiss} maxVisible={2} />);
      const overflow = screen.getByRole('status');
      expect(overflow).toHaveAttribute('aria-live', 'polite');
    });

    it('updates overflow count correctly', () => {
      const toasts = Array.from({ length: 10 }, (_, i) =>
        createToast({ id: `t${i}`, message: `Toast ${i}` })
      );
      render(<Toast toasts={toasts} onDismiss={mockDismiss} maxVisible={3} />);
      expect(screen.getByText('+7개 더')).toBeInTheDocument();
    });
  });

  describe('dismiss all button', () => {
    it('shows dismiss all button when multiple toasts and onDismissAll provided', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
      ];
      const onDismissAll = vi.fn();
      render(
        <Toast toasts={toasts} onDismiss={mockDismiss} onDismissAll={onDismissAll} />
      );
      expect(screen.getByRole('button', { name: '모든 알림 닫기' })).toBeInTheDocument();
    });

    it('does not show dismiss all button when only one toast', () => {
      const toasts = [createToast()];
      const onDismissAll = vi.fn();
      render(
        <Toast toasts={toasts} onDismiss={mockDismiss} onDismissAll={onDismissAll} />
      );
      expect(screen.queryByRole('button', { name: '모든 알림 닫기' })).not.toBeInTheDocument();
    });

    it('does not show dismiss all button when onDismissAll is not provided', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
      ];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      expect(screen.queryByRole('button', { name: '모든 알림 닫기' })).not.toBeInTheDocument();
    });

    it('calls onDismissAll when dismiss all button is clicked', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
      ];
      const onDismissAll = vi.fn();
      render(
        <Toast toasts={toasts} onDismiss={mockDismiss} onDismissAll={onDismissAll} />
      );
      fireEvent.click(screen.getByRole('button', { name: '모든 알림 닫기' }));
      expect(onDismissAll).toHaveBeenCalledTimes(1);
    });

    it('dismiss all button has correct text content', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
      ];
      const onDismissAll = vi.fn();
      render(
        <Toast toasts={toasts} onDismiss={mockDismiss} onDismissAll={onDismissAll} />
      );
      expect(screen.getByText('모두 닫기')).toBeInTheDocument();
    });

    it('dismiss all button has toast-dismiss-all class', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
      ];
      const onDismissAll = vi.fn();
      const { container } = render(
        <Toast toasts={toasts} onDismiss={mockDismiss} onDismissAll={onDismissAll} />
      );
      expect(container.querySelector('.toast-dismiss-all')).toBeInTheDocument();
    });
  });

  // --- Action button tests ---

  describe('action button', () => {
    it('renders action button when toast has action', () => {
      const actionFn = vi.fn();
      const toasts = [createToast({
        action: { label: '실행취소', onClick: actionFn },
      })];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      expect(screen.getByRole('button', { name: '실행취소' })).toBeInTheDocument();
    });

    it('does not render action button when toast has no action', () => {
      const toasts = [createToast()];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      expect(container.querySelector('.toast-action')).not.toBeInTheDocument();
    });

    it('calls action onClick when action button is clicked', () => {
      const actionFn = vi.fn();
      const toasts = [createToast({
        id: 'action-test',
        action: { label: '다시 시도', onClick: actionFn },
      })];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
      expect(actionFn).toHaveBeenCalledTimes(1);
    });

    it('dismisses toast after action button click', () => {
      const actionFn = vi.fn();
      const toasts = [createToast({
        id: 'action-dismiss',
        action: { label: '실행취소', onClick: actionFn },
      })];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      fireEvent.click(screen.getByRole('button', { name: '실행취소' }));
      // After exit animation
      act(() => { vi.advanceTimersByTime(300); });
      expect(mockDismiss).toHaveBeenCalledWith('action-dismiss');
    });

    it('action button has toast-action class', () => {
      const toasts = [createToast({
        action: { label: '실행취소', onClick: vi.fn() },
      })];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      expect(container.querySelector('.toast-action')).toBeInTheDocument();
    });

    it('action button has aria-label matching action label', () => {
      const toasts = [createToast({
        action: { label: '다시 시도', onClick: vi.fn() },
      })];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      const btn = screen.getByRole('button', { name: '다시 시도' });
      expect(btn).toHaveAttribute('aria-label', '다시 시도');
    });

    it('action button displays label text', () => {
      const toasts = [createToast({
        action: { label: '실행취소', onClick: vi.fn() },
      })];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      expect(screen.getByText('실행취소')).toBeInTheDocument();
    });

    it('shows toast-exit class after action button click', () => {
      const toasts = [createToast({
        action: { label: '실행취소', onClick: vi.fn() },
      })];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      fireEvent.click(screen.getByRole('button', { name: '실행취소' }));
      expect(container.querySelector('.toast-exit')).toBeInTheDocument();
    });

    it('multiple toasts can have different actions', () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      const toasts = [
        createToast({ id: '1', message: 'Error', action: { label: '다시 시도', onClick: action1 } }),
        createToast({ id: '2', message: 'Deleted', type: 'info', action: { label: '실행취소', onClick: action2 } }),
      ];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '실행취소' })).toBeInTheDocument();
    });

    it('some toasts can have actions while others do not', () => {
      const toasts = [
        createToast({ id: '1', message: 'With action', action: { label: '실행취소', onClick: vi.fn() } }),
        createToast({ id: '2', message: 'No action' }),
      ];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      // Only one action button
      expect(container.querySelectorAll('.toast-action')).toHaveLength(1);
      // Two close buttons
      expect(container.querySelectorAll('.toast-close')).toHaveLength(2);
    });
  });

  // --- Custom duration tests ---

  describe('custom duration', () => {
    it('auto-dismisses after custom duration', () => {
      const toasts = [createToast({ id: 'custom-dur', duration: 2000 })];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      // Should not dismiss at 1500ms
      act(() => { vi.advanceTimersByTime(1500); });
      expect(mockDismiss).not.toHaveBeenCalled();
      // Should dismiss at 2000 + 300 (exit animation)
      act(() => { vi.advanceTimersByTime(800); });
      expect(mockDismiss).toHaveBeenCalledWith('custom-dur');
    });

    it('uses default duration when duration not specified', () => {
      const toasts = [createToast({ id: 'default-dur' })];
      render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      // Should not dismiss at 4000ms
      act(() => { vi.advanceTimersByTime(4000); });
      expect(mockDismiss).not.toHaveBeenCalled();
      // Should dismiss at 5000 + 300
      act(() => { vi.advanceTimersByTime(1300); });
      expect(mockDismiss).toHaveBeenCalledWith('default-dur');
    });
  });

  // --- Position tests ---

  describe('position prop', () => {
    it('defaults to top-right (no extra class)', () => {
      const toasts = [createToast()];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      const containerEl = container.querySelector('.toast-container');
      expect(containerEl).toBeInTheDocument();
      expect(containerEl!.className).toBe('toast-container');
    });

    it('adds bottom-right class when position is bottom-right', () => {
      const toasts = [createToast()];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} position="bottom-right" />);
      expect(container.querySelector('.toast-container-bottom-right')).toBeInTheDocument();
    });

    it('adds top-left class when position is top-left', () => {
      const toasts = [createToast()];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} position="top-left" />);
      expect(container.querySelector('.toast-container-top-left')).toBeInTheDocument();
    });

    it('adds bottom-left class when position is bottom-left', () => {
      const toasts = [createToast()];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} position="bottom-left" />);
      expect(container.querySelector('.toast-container-bottom-left')).toBeInTheDocument();
    });

    it('adds top-center class when position is top-center', () => {
      const toasts = [createToast()];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} position="top-center" />);
      expect(container.querySelector('.toast-container-top-center')).toBeInTheDocument();
    });

    it('adds bottom-center class when position is bottom-center', () => {
      const toasts = [createToast()];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} position="bottom-center" />);
      expect(container.querySelector('.toast-container-bottom-center')).toBeInTheDocument();
    });
  });

  // --- Stacking tests ---

  describe('stacked prop', () => {
    it('applies toast-stack-N classes when stacked is true', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
        createToast({ id: '3', message: 'C' }),
      ];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} stacked={true} />);
      expect(container.querySelector('.toast-stack-0')).toBeInTheDocument();
      expect(container.querySelector('.toast-stack-1')).toBeInTheDocument();
      expect(container.querySelector('.toast-stack-2')).toBeInTheDocument();
    });

    it('does not apply stack classes when stacked is false (default)', () => {
      const toasts = [
        createToast({ id: '1', message: 'A' }),
        createToast({ id: '2', message: 'B' }),
      ];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} />);
      expect(container.querySelector('.toast-stack-0')).not.toBeInTheDocument();
      expect(container.querySelector('.toast-stack-1')).not.toBeInTheDocument();
    });

    it('limits stack classes to index 4', () => {
      const toasts = Array.from({ length: 6 }, (_, i) =>
        createToast({ id: `t${i}`, message: `Toast ${i}` })
      );
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} stacked={true} maxVisible={6} />);
      expect(container.querySelector('.toast-stack-0')).toBeInTheDocument();
      expect(container.querySelector('.toast-stack-4')).toBeInTheDocument();
      // Index 5 should not get a stack class
      const allToasts = container.querySelectorAll('.toast');
      expect(allToasts[5]?.className).not.toContain('toast-stack-5');
    });

    it('stack classes coexist with type and exit classes', () => {
      const toasts = [createToast({ id: '1', type: 'success', message: 'A' })];
      const { container } = render(<Toast toasts={toasts} onDismiss={mockDismiss} stacked={true} />);
      const toastEl = container.querySelector('.toast');
      expect(toastEl!.className).toContain('toast-success');
      expect(toastEl!.className).toContain('toast-stack-0');
    });
  });

  // --- Pause on hover tests ---

  describe('pause on hover', () => {
    it('pauses auto-dismiss timer on mouse enter when pauseOnHover is true', () => {
      const dismissFn = vi.fn<(id: string) => void>();
      const toasts = [createToast({ id: 'hover-pause' })];
      const { container } = render(
        <Toast toasts={toasts} onDismiss={dismissFn} pauseOnHover={true} />
      );
      const toastEl = container.querySelector('.toast')!;

      // Advance 2 seconds then hover
      act(() => { vi.advanceTimersByTime(2000); });
      fireEvent.mouseEnter(toastEl);

      // Wait well past the full duration — should NOT dismiss
      act(() => { vi.advanceTimersByTime(10000); });
      expect(dismissFn).not.toHaveBeenCalled();
    });

    it('resumes auto-dismiss timer on mouse leave after hover', () => {
      const dismissFn = vi.fn<(id: string) => void>();
      const toasts = [createToast({ id: 'hover-resume' })];
      const { container } = render(
        <Toast toasts={toasts} onDismiss={dismissFn} pauseOnHover={true} />
      );
      const toastEl = container.querySelector('.toast')!;

      // Advance 2 seconds then hover
      act(() => { vi.advanceTimersByTime(2000); });
      fireEvent.mouseEnter(toastEl);

      // Wait 5 seconds while hovering
      act(() => { vi.advanceTimersByTime(5000); });
      expect(dismissFn).not.toHaveBeenCalled();

      // Mouse leave — remaining ~3s should start
      fireEvent.mouseLeave(toastEl);
      act(() => { vi.advanceTimersByTime(3300); });
      expect(dismissFn).toHaveBeenCalledWith('hover-resume');
    });

    it('does not pause timer when pauseOnHover is false (default)', () => {
      const dismissFn = vi.fn<(id: string) => void>();
      const toasts = [createToast({ id: 'no-hover-pause' })];
      const { container } = render(
        <Toast toasts={toasts} onDismiss={dismissFn} />
      );
      const toastEl = container.querySelector('.toast')!;

      // Hover
      fireEvent.mouseEnter(toastEl);

      // Timer still fires at 5000 + 300
      act(() => { vi.advanceTimersByTime(5300); });
      expect(dismissFn).toHaveBeenCalledWith('no-hover-pause');
    });

    it('does not pause timer when pauseOnHover is explicitly false', () => {
      const dismissFn = vi.fn<(id: string) => void>();
      const toasts = [createToast({ id: 'explicit-no-pause' })];
      const { container } = render(
        <Toast toasts={toasts} onDismiss={dismissFn} pauseOnHover={false} />
      );
      const toastEl = container.querySelector('.toast')!;

      fireEvent.mouseEnter(toastEl);
      act(() => { vi.advanceTimersByTime(5300); });
      expect(dismissFn).toHaveBeenCalledWith('explicit-no-pause');
    });
  });
});
