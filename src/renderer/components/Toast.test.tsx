import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Toast from './Toast';
import type { ToastMessage } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  const mockDismiss = vi.fn();

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
    const dismissFn = vi.fn();
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
});
