import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseScreenCaptureReturn {
  isSupported: boolean;
  isCapturing: boolean;
  stream: MediaStream | null;
  start: (options?: DisplayMediaStreamOptions) => Promise<MediaStream | null>;
  stop: () => void;
  error: string | null;
}

export function useScreenCapture(): UseScreenCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackListenersRef = useRef<Map<MediaStreamTrack, () => void>>(new Map());

  const isSupported =
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    'getDisplayMedia' in navigator.mediaDevices;

  const removeTrackListeners = useCallback(() => {
    trackListenersRef.current.forEach((listener, track) => {
      track.removeEventListener('ended', listener);
    });
    trackListenersRef.current.clear();
  }, []);

  const stop = useCallback(() => {
    removeTrackListeners();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
      setIsCapturing(false);
    }
  }, [removeTrackListeners]);

  const start = useCallback(
    async (options?: DisplayMediaStreamOptions): Promise<MediaStream | null> => {
      if (!isSupported) {
        setError('Screen capture is not supported');
        return null;
      }

      // Stop any existing capture
      stop();

      try {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia(
          options ?? { video: true }
        );

        streamRef.current = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
        setError(null);

        // Listen for tracks ending (user clicks "Stop sharing")
        mediaStream.getTracks().forEach(track => {
          const listener = () => {
            stop();
          };
          track.addEventListener('ended', listener);
          trackListenersRef.current.set(track, listener);
        });

        return mediaStream;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start screen capture';
        setError(message);
        setIsCapturing(false);
        return null;
      }
    },
    [isSupported, stop]
  );

  useEffect(() => {
    return () => {
      trackListenersRef.current.forEach((listener, track) => {
        track.removeEventListener('ended', listener);
      });
      trackListenersRef.current.clear();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isCapturing,
    stream,
    start,
    stop,
    error,
  };
}
