import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import NotificationBanner from './NotificationBanner';

describe('NotificationBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Rendering ---

  it('renders the message', () => {
    render(<NotificationBanner message="업데이트가 있습니다" />);
    expect(screen.getByText('업데이트가 있습니다')).toBeInTheDocument();
  });

  it('renders with info variant by default', () => {
    const { container } = render(<NotificationBanner message="정보 메시지" />);
    const banner = container.querySelector('.notification-banner');
    expect(banner).toHaveClass('notification-banner--info');
  });

  it('renders warning variant', () => {
    const { container } = render(
      <NotificationBanner message="경고" variant="warning" />
    );
    const banner = container.querySelector('.notification-banner');
    expect(banner).toHaveClass('notification-banner--warning');
  });

  it('renders error variant', () => {
    const { container } = render(
      <NotificationBanner message="오류 발생" variant="error" />
    );
    const banner = container.querySelector('.notification-banner');
    expect(banner).toHaveClass('notification-banner--error');
  });

  it('renders success variant', () => {
    const { container } = render(
      <NotificationBanner message="완료" variant="success" />
    );
    const banner = container.querySelector('.notification-banner');
    expect(banner).toHaveClass('notification-banner--success');
  });

  // --- Icons ---

  it('renders default icon for each variant', () => {
    const { container: c1 } = render(
      <NotificationBanner message="info" variant="info" />
    );
    expect(c1.querySelector('.notification-banner__icon')).toBeTruthy();

    const { container: c2 } = render(
      <NotificationBanner message="warn" variant="warning" />
    );
    expect(c2.querySelector('.notification-banner__icon')).toBeTruthy();

    const { container: c3 } = render(
      <NotificationBanner message="err" variant="error" />
    );
    expect(c3.querySelector('.notification-banner__icon')).toBeTruthy();

    const { container: c4 } = render(
      <NotificationBanner message="ok" variant="success" />
    );
    expect(c4.querySelector('.notification-banner__icon')).toBeTruthy();
  });

  it('renders custom icon when provided', () => {
    const { container } = render(
      <NotificationBanner message="custom" icon="★" />
    );
    const icon = container.querySelector('.notification-banner__icon');
    expect(icon?.textContent).toBe('★');
  });

  it('hides icon from screen readers', () => {
    const { container } = render(<NotificationBanner message="test" />);
    const icon = container.querySelector('.notification-banner__icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Dismiss ---

  it('renders close button when dismissible (default)', () => {
    render(<NotificationBanner message="dismiss" />);
    expect(screen.getByTitle('닫기')).toBeInTheDocument();
  });

  it('does not render close button when dismissible is false', () => {
    render(<NotificationBanner message="no dismiss" dismissible={false} />);
    expect(screen.queryByTitle('닫기')).not.toBeInTheDocument();
  });

  it('hides banner after close button click with exit animation', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <NotificationBanner message="bye" onDismiss={onDismiss} />
    );

    fireEvent.click(screen.getByTitle('닫기'));

    // Should have exit class immediately
    const banner = container.querySelector('.notification-banner');
    expect(banner).toHaveClass('notification-banner--exit');

    // After animation timeout, banner disappears and onDismiss is called
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.notification-banner')).toBeNull();
  });

  it('hides banner without onDismiss callback', () => {
    const { container } = render(<NotificationBanner message="bye" />);

    fireEvent.click(screen.getByTitle('닫기'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(container.querySelector('.notification-banner')).toBeNull();
  });

  // --- Auto dismiss ---

  it('auto-dismisses after specified duration', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <NotificationBanner message="auto" autoDismiss={3000} onDismiss={onDismiss} />
    );

    expect(container.querySelector('.notification-banner')).toBeInTheDocument();

    // Advance to auto-dismiss time
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Exit animation
    expect(container.querySelector('.notification-banner')).toHaveClass('notification-banner--exit');

    // After animation completes
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.notification-banner')).toBeNull();
  });

  it('does not auto-dismiss when autoDismiss is not set', () => {
    const { container } = render(<NotificationBanner message="stay" />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(container.querySelector('.notification-banner')).toBeInTheDocument();
  });

  // --- Action button ---

  it('renders action button when action prop is provided', () => {
    const action = { label: '업데이트', onClick: vi.fn() };
    render(<NotificationBanner message="new version" action={action} />);

    const actionBtn = screen.getByText('업데이트');
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn).toHaveAttribute('aria-label', '업데이트');
  });

  it('calls action onClick when action button is clicked', () => {
    const onClick = vi.fn();
    const action = { label: '재시도', onClick };
    render(<NotificationBanner message="failed" action={action} />);

    fireEvent.click(screen.getByText('재시도'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when action is not provided', () => {
    const { container } = render(<NotificationBanner message="no action" />);
    expect(container.querySelector('.notification-banner__action')).toBeNull();
  });

  // --- Accessibility ---

  it('has role="alert"', () => {
    render(<NotificationBanner message="alert test" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="polite"', () => {
    render(<NotificationBanner message="polite" />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });

  it('has descriptive aria-label with variant and message', () => {
    render(<NotificationBanner message="중요한 알림" variant="warning" />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-label', '경고: 중요한 알림');
  });

  it('has aria-label for info variant', () => {
    render(<NotificationBanner message="참고 사항" variant="info" />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-label', '정보: 참고 사항');
  });

  it('has aria-label for error variant', () => {
    render(<NotificationBanner message="연결 실패" variant="error" />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-label', '오류: 연결 실패');
  });

  it('has aria-label for success variant', () => {
    render(<NotificationBanner message="저장 완료" variant="success" />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-label', '성공: 저장 완료');
  });

  it('close button has aria-label and title', () => {
    render(<NotificationBanner message="test" />);
    const closeBtn = screen.getByTitle('닫기');
    expect(closeBtn).toHaveAttribute('aria-label', '배너 닫기');
  });
});
