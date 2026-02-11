import { useState, useCallback, useRef } from 'react';

export type RecordingState = 'inactive' | 'recording' | 'paused';

export interface UseMediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  onDataAvailable?: (data: Blob) => void;
  onStop?: (blob: Blob) => void;
  onError?: (error: Event) => void;
}

export interface UseMediaRecorderReturn {
  status: RecordingState;
  blob: Blob | null;
  error: Event | null;
  startRecording: (stream: MediaStream) => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  reset: () => void;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}): UseMediaRecorderReturn {
  const { mimeType, audioBitsPerSecond, videoBitsPerSecond, onDataAvailable, onStop, onError } = options;

  const [status, setStatus] = useState<RecordingState>('inactive');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback((stream: MediaStream) => {
    chunksRef.current = [];
    setBlob(null);
    setError(null);

    const recorderOptions: MediaRecorderOptions = {};
    if (mimeType) recorderOptions.mimeType = mimeType;
    if (audioBitsPerSecond) recorderOptions.audioBitsPerSecond = audioBitsPerSecond;
    if (videoBitsPerSecond) recorderOptions.videoBitsPerSecond = videoBitsPerSecond;

    const recorder = new MediaRecorder(stream, recorderOptions);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
        onDataAvailable?.(event.data);
      }
    };

    recorder.onstop = () => {
      const finalBlob = new Blob(chunksRef.current, {
        type: mimeType ?? recorder.mimeType,
      });
      setBlob(finalBlob);
      setStatus('inactive');
      onStop?.(finalBlob);
    };

    recorder.onerror = (event) => {
      setError(event);
      setStatus('inactive');
      onError?.(event);
    };

    recorder.onpause = () => {
      setStatus('paused');
    };

    recorder.onresume = () => {
      setStatus('recording');
    };

    recorder.start();
    setStatus('recording');
  }, [mimeType, audioBitsPerSecond, videoBitsPerSecond, onDataAvailable, onStop, onError]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.pause();
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'paused') {
      recorderRef.current.resume();
    }
  }, []);

  const reset = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    setBlob(null);
    setError(null);
    setStatus('inactive');
  }, []);

  return {
    status,
    blob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  };
}
