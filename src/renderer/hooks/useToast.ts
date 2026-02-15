import { useState, useCallback, useMemo } from 'react';
import { generateUniqueId } from '../utils/format';
import type { ToastMessage, ToastAction } from '../components/Toast';

export interface AddToastOptions {
  action?: ToastAction;
  duration?: number;
}

export interface UseToastReturn {
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string, options?: AddToastOptions) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string, options?: AddToastOptions) => {
    const id = generateUniqueId('toast');
    const toast: ToastMessage = { id, type, message };
    if (options?.action) {
      toast.action = options.action;
    }
    if (options?.duration !== undefined) {
      toast.duration = options.duration;
    }
    setToasts(prev => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return useMemo(() => ({
    toasts,
    addToast,
    dismissToast,
    dismissAll,
  }), [toasts, addToast, dismissToast, dismissAll]);
}
