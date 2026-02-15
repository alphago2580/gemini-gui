import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './Stopwatch.css';

export type StopwatchSize = 'small' | 'medium' | 'large';

export interface StopwatchLap {
  index: number;
  time: number;
  delta: number;
}

export interface StopwatchProps {
  /** Auto-start on mount */
  autoStart?: boolean;
  /** Callback on each tick with elapsed milliseconds */
  onTick?: (elapsed: number) => void;
  /** Callback when a lap is recorded */
  onLap?: (lap: StopwatchLap) => void;
  /** Show milliseconds in display */
  showMilliseconds?: boolean;
  /** Show hours in display */
  showHours?: boolean;
  /** Maximum number of laps to display */
  maxLaps?: number;
  size?: StopwatchSize;
  label?: string;
  id?: string;
}

const TICK_INTERVAL = 10;

function formatTime(ms: number, showHours: boolean, showMs: boolean): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  const pad = (n: number) => n.toString().padStart(2, '0');

  let result = '';
  if (showHours || h > 0) {
    result = `${pad(h)}:${pad(m)}:${pad(s)}`;
  } else {
    result = `${pad(m)}:${pad(s)}`;
  }

  if (showMs) {
    result += `.${pad(centiseconds)}`;
  }

  return result;
}

const Stopwatch: React.FC<StopwatchProps> = ({
  autoStart = false,
  onTick,
  onLap,
  showMilliseconds = true,
  showHours = false,
  maxLaps = 10,
  size = 'medium',
  label,
  id,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [laps, setLaps] = useState<StopwatchLap[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const onTickRef = useRef(onTick);
  const onLapRef = useRef(onLap);

  onTickRef.current = onTick;
  onLapRef.current = onLap;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const current = accumulatedRef.current + (now - startTimeRef.current);
        setElapsed(current);
        onTickRef.current?.(current);
      }, TICK_INTERVAL);
      return clearTimer;
    }
  }, [isRunning, clearTimer]);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    if (isRunning) {
      accumulatedRef.current += Date.now() - startTimeRef.current;
      setIsRunning(false);
      clearTimer();
    }
  }, [isRunning, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
    setElapsed(0);
    setIsRunning(false);
    setLaps([]);
  }, [clearTimer]);

  const lap = useCallback(() => {
    if (!isRunning) return;
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const delta = elapsed - lastLapTime;
    const newLap: StopwatchLap = {
      index: laps.length + 1,
      time: elapsed,
      delta,
    };
    setLaps(prev => [newLap, ...prev]);
    onLapRef.current?.(newLap);
  }, [isRunning, elapsed, laps]);

  const bestLap = useMemo(() => {
    if (laps.length < 2) return -1;
    let minDelta = Infinity;
    let bestIdx = -1;
    for (let i = 0; i < laps.length; i++) {
      if (laps[i].delta < minDelta) {
        minDelta = laps[i].delta;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [laps]);

  const worstLap = useMemo(() => {
    if (laps.length < 2) return -1;
    let maxDelta = -Infinity;
    let worstIdx = -1;
    for (let i = 0; i < laps.length; i++) {
      if (laps[i].delta > maxDelta) {
        maxDelta = laps[i].delta;
        worstIdx = i;
      }
    }
    return worstIdx;
  }, [laps]);

  const visibleLaps = laps.slice(0, maxLaps);

  const classNames = [
    'stopwatch',
    `stopwatch--${size}`,
    isRunning ? 'stopwatch--running' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      id={id}
      className={classNames}
      role="timer"
      aria-label={label || '스톱워치'}
      aria-live="polite"
    >
      <div className="stopwatch-display">
        <span className="stopwatch-time" data-testid="stopwatch-time">
          {formatTime(elapsed, showHours, showMilliseconds)}
        </span>
        {label && <span className="stopwatch-label">{label}</span>}
      </div>

      <div className="stopwatch-controls">
        {!isRunning ? (
          <button
            className="stopwatch-btn stopwatch-btn--start"
            onClick={start}
            aria-label="시작"
            type="button"
          >
            ▶
          </button>
        ) : (
          <button
            className="stopwatch-btn stopwatch-btn--pause"
            onClick={pause}
            aria-label="일시정지"
            type="button"
          >
            ⏸
          </button>
        )}
        {isRunning && (
          <button
            className="stopwatch-btn stopwatch-btn--lap"
            onClick={lap}
            aria-label="랩"
            type="button"
          >
            ⏱
          </button>
        )}
        {!isRunning && elapsed > 0 && (
          <button
            className="stopwatch-btn stopwatch-btn--reset"
            onClick={reset}
            aria-label="초기화"
            type="button"
          >
            ↺
          </button>
        )}
      </div>

      {visibleLaps.length > 0 && (
        <div className="stopwatch-laps" role="list" aria-label="랩 기록">
          {visibleLaps.map((lapItem, idx) => {
            let lapClass = 'stopwatch-lap';
            if (idx === bestLap) lapClass += ' stopwatch-lap--best';
            if (idx === worstLap) lapClass += ' stopwatch-lap--worst';

            return (
              <div key={lapItem.index} className={lapClass} role="listitem">
                <span className="stopwatch-lap-index">랩 {lapItem.index}</span>
                <span className="stopwatch-lap-delta">
                  {formatTime(lapItem.delta, false, showMilliseconds)}
                </span>
                <span className="stopwatch-lap-total">
                  {formatTime(lapItem.time, showHours, showMilliseconds)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(Stopwatch);
