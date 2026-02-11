import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAnimationFrameResult {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
  elapsed: number;
  fps: number;
}

export function useAnimationFrame(
  callback: (deltaTime: number, elapsed: number) => void
): UseAnimationFrameResult {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fps, setFps] = useState(0);

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const animate = useCallback((time: number) => {
    if (!isRunningRef.current) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = time;
      prevTimeRef.current = time;
    }

    const deltaTime = time - prevTimeRef.current;
    const totalElapsed = time - startTimeRef.current;

    if (deltaTime > 0) {
      setFps(Math.round(1000 / deltaTime));
    }
    setElapsed(totalElapsed);

    callbackRef.current(deltaTime, totalElapsed);
    prevTimeRef.current = time;

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    startTimeRef.current = 0;
    prevTimeRef.current = 0;
    setIsRunning(true);
    setElapsed(0);
    setFps(0);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { start, stop, isRunning, elapsed, fps };
}
