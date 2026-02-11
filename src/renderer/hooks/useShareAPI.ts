import { useState, useCallback, useRef } from 'react';

export interface ShareData {
  /** Title of the shared content */
  title?: string;
  /** Description or text */
  text?: string;
  /** URL to share */
  url?: string;
  /** Files to share */
  files?: File[];
}

export interface UseShareAPIOptions {
  /** Called after successful share */
  onSuccess?: () => void;
  /** Called on share error or cancel */
  onError?: (error: Error) => void;
}

export interface UseShareAPIResult {
  /** Trigger the native share dialog */
  share: (data: ShareData) => Promise<boolean>;
  /** Whether the Web Share API is supported */
  isSupported: boolean;
  /** Whether file sharing is supported */
  isFileShareSupported: boolean;
  /** Whether sharing is currently in progress */
  isSharing: boolean;
  /** Check if specific data can be shared */
  canShare: (data: ShareData) => boolean;
  /** Error from last share attempt */
  error: Error | null;
}

export function useShareAPI(options: UseShareAPIOptions = {}): UseShareAPIResult {
  const { onSuccess, onError } = options;
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const isSupported =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const isFileShareSupported =
    isSupported &&
    typeof navigator.canShare === 'function';

  const canShare = useCallback(
    (data: ShareData): boolean => {
      if (!isSupported) return false;
      if (typeof navigator.canShare === 'function') {
        try {
          return navigator.canShare(data as globalThis.ShareData);
        } catch {
          return false;
        }
      }
      // Fallback: check at least one field is present
      return !!(data.title || data.text || data.url);
    },
    [isSupported]
  );

  const share = useCallback(
    async (data: ShareData): Promise<boolean> => {
      if (!isSupported) {
        const err = new Error('Web Share API is not supported');
        setError(err);
        onErrorRef.current?.(err);
        return false;
      }

      setIsSharing(true);
      setError(null);

      try {
        await navigator.share(data as globalThis.ShareData);
        setIsSharing(false);
        onSuccessRef.current?.();
        return true;
      } catch (err) {
        const shareError = err instanceof Error ? err : new Error(String(err));
        setError(shareError);
        setIsSharing(false);
        onErrorRef.current?.(shareError);
        return false;
      }
    },
    [isSupported]
  );

  return { share, isSupported, isFileShareSupported, isSharing, canShare, error };
}
