import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import NotificationCenter from './NotificationCenter';
import type { NotificationItem } from './NotificationCenter';

function makeNotification(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: '1',
    title: '테스트 알림',
    message: '테스트 메시지입니다.',
    type: 'info',
    timestamp: Date.now() - 60_000,
    read: false,
    ...overrides,
  };
}

describe('NotificationCenter', () => {
  const defaultProps = {
    notifications: [] as NotificationItem[],
    onDismiss: vi.fn(),
    onMarkAllRead: vi.fn(),
    onClearAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the trigger button', () => {
    render(<NotificationCenter {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: /알림/ });
    expect(trigger).toBeInTheDocument();
  });

  it('shows no badge when there are no unread notifications', () => {
    render(<NotificationCenter {...defaultProps} />);
    expect(document.querySelector('.notification-center__badge')).not.toBeInTheDocument();
  });

  it('shows badge with unread count', () => {
    const notifications = [
      makeNotification({ id: '1', read: false }),
      makeNotification({ id: '2', read: false }),
      makeNotification({ id: '3', read: true }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    const badge = document.querySelector('.notification-center__badge');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toBe('2');
  });

  it('shows 99+ when unread count exceeds 99', () => {
    const notifications = Array.from({ length: 100 }, (_, i) =>
      makeNotification({ id: String(i), read: false })
    );
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    const badge = document.querySelector('.notification-center__badge');
    expect(badge?.textContent).toBe('99+');
  });

  it('does not show panel initially', () => {
    render(<NotificationCenter {...defaultProps} />);
    expect(document.querySelector('.notification-center__panel')).not.toBeInTheDocument();
  });

  it('opens panel when trigger is clicked', () => {
    render(<NotificationCenter {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));
    expect(document.querySelector('.notification-center__panel')).toBeInTheDocument();
  });

  it('closes panel when trigger is clicked again', () => {
    render(<NotificationCenter {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: /알림/ });
    fireEvent.click(trigger);
    expect(document.querySelector('.notification-center__panel')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(document.querySelector('.notification-center__panel')).not.toBeInTheDocument();
  });

  it('closes panel on Escape key', () => {
    render(<NotificationCenter {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: /알림/ });
    fireEvent.click(trigger);
    expect(document.querySelector('.notification-center__panel')).toBeInTheDocument();

    const container = document.querySelector('.notification-center')!;
    fireEvent.keyDown(container, { key: 'Escape' });
    expect(document.querySelector('.notification-center__panel')).not.toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    render(<NotificationCenter {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));
    expect(screen.getByText('알림이 없습니다')).toBeInTheDocument();
  });

  it('renders notification items when panel is open', () => {
    const notifications = [
      makeNotification({ id: '1', title: '첫 번째 알림', message: '내용 1' }),
      makeNotification({ id: '2', title: '두 번째 알림', message: '내용 2', read: true }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
    expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
    expect(screen.getByText('내용 1')).toBeInTheDocument();
    expect(screen.getByText('내용 2')).toBeInTheDocument();
  });

  it('applies unread class to unread notifications', () => {
    const notifications = [
      makeNotification({ id: '1', read: false }),
      makeNotification({ id: '2', read: true }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    const items = document.querySelectorAll('.notification-center__item');
    expect(items[0]).toHaveClass('notification-center__item--unread');
    expect(items[1]).not.toHaveClass('notification-center__item--unread');
  });

  it('shows unread dot for unread notifications', () => {
    const notifications = [
      makeNotification({ id: '1', read: false }),
      makeNotification({ id: '2', read: true }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    const dots = document.querySelectorAll('.notification-center__unread-dot');
    expect(dots).toHaveLength(1);
  });

  it('renders correct type icons', () => {
    const notifications = [
      makeNotification({ id: '1', type: 'info' }),
      makeNotification({ id: '2', type: 'warning' }),
      makeNotification({ id: '3', type: 'error' }),
      makeNotification({ id: '4', type: 'success' }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    const icons = document.querySelectorAll('.notification-center__item-icon');
    expect(icons[0].textContent).toBe('\u2139\uFE0F');
    expect(icons[1].textContent).toBe('\u26A0\uFE0F');
    expect(icons[2].textContent).toBe('\u274C');
    expect(icons[3].textContent).toBe('\u2705');
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const notifications = [makeNotification({ id: 'abc' })];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    const dismissBtn = screen.getByLabelText('테스트 알림 알림 삭제');
    fireEvent.click(dismissBtn);
    expect(defaultProps.onDismiss).toHaveBeenCalledWith('abc');
  });

  it('calls onMarkAllRead when mark all read button is clicked', () => {
    const notifications = [makeNotification({ id: '1', read: false })];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    fireEvent.click(screen.getByText('모두 읽음'));
    expect(defaultProps.onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('does not show mark all read button when all are read', () => {
    const notifications = [makeNotification({ id: '1', read: true })];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.queryByText('모두 읽음')).not.toBeInTheDocument();
  });

  it('calls onClearAll when clear all button is clicked', () => {
    const notifications = [makeNotification({ id: '1' })];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    fireEvent.click(screen.getByText('모두 삭제'));
    expect(defaultProps.onClearAll).toHaveBeenCalledTimes(1);
  });

  it('does not show clear all button when no notifications', () => {
    render(<NotificationCenter {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.queryByText('모두 삭제')).not.toBeInTheDocument();
  });

  it('calls onNotificationClick when a notification is clicked', () => {
    const onNotificationClick = vi.fn();
    const notification = makeNotification({ id: '1' });
    render(
      <NotificationCenter
        {...defaultProps}
        notifications={[notification]}
        onNotificationClick={onNotificationClick}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    const item = document.querySelector('.notification-center__item')!;
    fireEvent.click(item);
    expect(onNotificationClick).toHaveBeenCalledWith(notification);
  });

  it('respects maxVisible prop', () => {
    const notifications = Array.from({ length: 10 }, (_, i) =>
      makeNotification({ id: String(i), title: `알림 ${i}` })
    );
    render(
      <NotificationCenter {...defaultProps} notifications={notifications} maxVisible={3} />
    );
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    const items = document.querySelectorAll('.notification-center__item');
    expect(items).toHaveLength(3);
  });

  it('shows relative time for notifications', () => {
    const notifications = [
      makeNotification({ id: '1', timestamp: Date.now() - 5000 }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.getByText('방금 전')).toBeInTheDocument();
  });

  it('shows minutes ago for older notifications', () => {
    const notifications = [
      makeNotification({ id: '1', timestamp: Date.now() - 300_000 }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.getByText('5분 전')).toBeInTheDocument();
  });

  it('shows hours ago for much older notifications', () => {
    const notifications = [
      makeNotification({ id: '1', timestamp: Date.now() - 7_200_000 }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.getByText('2시간 전')).toBeInTheDocument();
  });

  it('shows days ago for very old notifications', () => {
    const notifications = [
      makeNotification({ id: '1', timestamp: Date.now() - 172_800_000 }),
    ];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.getByText('2일 전')).toBeInTheDocument();
  });

  it('has correct ARIA attributes on trigger', () => {
    render(<NotificationCenter {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: /알림/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('has region role on panel', () => {
    render(<NotificationCenter {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('has list role on notification list', () => {
    const notifications = [makeNotification({ id: '1' })];
    render(<NotificationCenter {...defaultProps} notifications={notifications} />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('closes panel when clicking outside', () => {
    render(
      <div>
        <span data-testid="outside">outside</span>
        <NotificationCenter {...defaultProps} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));
    expect(document.querySelector('.notification-center__panel')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(document.querySelector('.notification-center__panel')).not.toBeInTheDocument();
  });

  it('dismiss click does not trigger notification click', () => {
    const onNotificationClick = vi.fn();
    const notifications = [makeNotification({ id: '1' })];
    render(
      <NotificationCenter
        {...defaultProps}
        notifications={notifications}
        onNotificationClick={onNotificationClick}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));

    const dismissBtn = screen.getByLabelText('테스트 알림 알림 삭제');
    fireEvent.click(dismissBtn);

    expect(defaultProps.onDismiss).toHaveBeenCalledWith('1');
    expect(onNotificationClick).not.toHaveBeenCalled();
  });
});
