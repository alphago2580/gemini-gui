import { useState, useCallback, useEffect } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface UseNotificationResult {
  /** Current notification permission status */
  permission: NotificationPermission;
  /** Whether notifications are supported by the browser */
  isSupported: boolean;
  /** Request permission from the user */
  requestPermission: () => Promise<NotificationPermission>;
  /** Show a notification. Returns the Notification instance or null */
  notify: (title: string, options?: NotificationOptions) => Notification | null;
}

/**
 * Hook for browser Notification API integration.
 * Manages permission state and provides show/request helpers.
 */
export function useNotification(): UseNotificationResult {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? (Notification.permission as NotificationPermission) : 'denied'
  );

  // Sync permission state if it changes externally
  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission as NotificationPermission);
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';
    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      return result as NotificationPermission;
    } catch {
      return 'denied';
    }
  }, [isSupported]);

  const notify = useCallback((title: string, options?: NotificationOptions): Notification | null => {
    if (!isSupported || permission !== 'granted') return null;
    try {
      return new Notification(title, options);
    } catch {
      return null;
    }
  }, [isSupported, permission]);

  return { permission, isSupported, requestPermission, notify };
}
