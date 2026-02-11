import { useState, useCallback, useRef, useEffect } from 'react';

export type MediaCaptureStatus = 'idle' | 'requesting' | 'active' | 'paused' | 'stopped' | 'error';

export interface UseMediaCaptureOptions {
  /** Enable audio capture */
  audio?: boolean | MediaTrackConstraints;
  /** Enable video capture */
  video?: boolean | MediaTrackConstraints;
  /** Auto-stop after duration in ms (0 = no limit) */
  maxDuration?: number;
  /** Called when recording data is available */
  onDataAvailable?: (blob: Blob) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** MIME type for recording (e.g., 'video/webm') */
  mimeType?: string;
}

export interface UseMediaCaptureResult {
  /** Current status */
  status: MediaCaptureStatus;
  /** The active MediaStream, if any */
  stream: MediaStream | null;
  /** Start capturing media */
  start: () => Promise<void>;
  /** Stop capturing and release all tracks */
  stop: () => void;
  /** Pause recording */
  pause: () => void;
  /** Resume recording */
  resume: () => void;
  /** Error if status is 'error' */
  error: Error | null;
  /** Whether the browser supports getUserMedia */
  isSupported: boolean;
  /** Recorded chunks as blobs */
  chunks: Blob[];
  /** Get recorded data as a single blob */
  getBlob: () => Blob | null;
}

export function useMediaCapture(options: UseMediaCaptureOptions = {}): UseMediaCaptureResult {
  const {
    audio = true,
    video = false,
    maxDuration = 0,
    onDataAvailable,
    onError,
    mimeType,
  } = options;

  const [status, setStatus] = useState<MediaCaptureStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDataAvailableRef = useRef(onDataAvailable);
  onDataAvailableRef.current = onDataAvailable;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const isSupported =
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    stopTracks();
    setStatus('stopped');
  }, [stopTracks]);

  const start = useCallback(async () => {
    if (!isSupported) {
      const err = new Error('getUserMedia is not supported');
      setError(err);
      setStatus('error');
      onErrorRef.current?.(err);
      return;
    }

    setStatus('requesting');
    setError(null);
    setChunks([]);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio,
        video,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      const recorder = new MediaRecorder(mediaStream, recorderOptions);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setChunks((prev) => [...prev, event.data]);
          onDataAvailableRef.current?.(event.data);
        }
      };

      recorder.onerror = () => {
        const recorderError = new Error('MediaRecorder error');
        setError(recorderError);
        setStatus('error');
        onErrorRef.current?.(recorderError);
      };

      recorder.start();
      setStatus('active');

      if (maxDuration > 0) {
        timerRef.current = setTimeout(() => {
          stop();
        }, maxDuration);
      }
    } catch (err) {
      const captureError = err instanceof Error ? err : new Error(String(err));
      setError(captureError);
      setStatus('error');
      onErrorRef.current?.(captureError);
      stopTracks();
    }
  }, [isSupported, audio, video, mimeType, maxDuration, stop, stopTracks]);

  const pause = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.pause();
      setStatus('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'paused') {
      recorderRef.current.resume();
      setStatus('active');
    }
  }, []);

  const getBlob = useCallback((): Blob | null => {
    if (chunks.length === 0) return null;
    const type = mimeType ?? chunks[0].type;
    return new Blob(chunks, { type });
  }, [chunks, mimeType]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    status,
    stream,
    start,
    stop,
    pause,
    resume,
    error,
    isSupported,
    chunks,
    getBlob,
  };
}
