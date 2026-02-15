import React, { useState, useCallback, useRef, useEffect } from 'react';
import './NotificationCenter.css';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
}

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  maxVisible?: number;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  info: '\u2139\uFE0F',
  warning: '\u26A0\uFE0F',
  error: '\u274C',
  success: '\u2705',
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return '방금 전';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

const NotificationCenterInner: React.FC<NotificationCenterProps> = ({
  notifications,
  onDismiss,
  onMarkAllRead,
  onClearAll,
  onNotificationClick,
  maxVisible = 50,
}) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = notifications.slice(0, maxVisible);

  const togglePanel = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  }, [open]);

  const handleItemClick = useCallback(
    (notification: NotificationItem) => {
      onNotificationClick?.(notification);
    },
    [onNotificationClick],
  );

  const handleDismiss = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDismiss(id);
    },
    [onDismiss],
  );

  // Close panel when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="notification-center" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        className="notification-center__trigger"
        onClick={togglePanel}
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        type="button"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-center__badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="notification-center__panel"
          role="region"
          aria-label="알림 센터"
        >
          <div className="notification-center__header">
            <h3 className="notification-center__title">알림</h3>
            <div className="notification-center__actions">
              {unreadCount > 0 && (
                <button
                  className="notification-center__action-btn"
                  onClick={onMarkAllRead}
                  type="button"
                >
                  모두 읽음
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notification-center__action-btn notification-center__action-btn--danger"
                  onClick={onClearAll}
                  type="button"
                >
                  모두 삭제
                </button>
              )}
            </div>
          </div>

          {visibleNotifications.length === 0 ? (
            <div className="notification-center__empty">
              <span className="notification-center__empty-icon" aria-hidden="true">
                🔔
              </span>
              <span className="notification-center__empty-text">알림이 없습니다</span>
            </div>
          ) : (
            <ul className="notification-center__list" role="list">
              {visibleNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`notification-center__item ${
                    !notification.read ? 'notification-center__item--unread' : ''
                  }`}
                  onClick={() => handleItemClick(notification)}
                  role="listitem"
                >
                  {!notification.read && (
                    <span
                      className="notification-center__unread-dot"
                      aria-label="읽지 않음"
                    />
                  )}
                  <span
                    className="notification-center__item-icon"
                    aria-hidden="true"
                  >
                    {TYPE_ICONS[notification.type]}
                  </span>
                  <div className="notification-center__item-body">
                    <p className="notification-center__item-title">
                      {notification.title}
                    </p>
                    <p className="notification-center__item-message">
                      {notification.message}
                    </p>
                    <span className="notification-center__item-time">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  <button
                    className="notification-center__item-dismiss"
                    onClick={(e) => handleDismiss(e, notification.id)}
                    aria-label={`${notification.title} 알림 삭제`}
                    type="button"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const NotificationCenter = React.memo(NotificationCenterInner);
export default NotificationCenter;
