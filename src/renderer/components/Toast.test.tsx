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
});
