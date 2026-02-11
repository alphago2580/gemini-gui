import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CountdownTimer.css';

export type CountdownTimerSize = 'small' | 'medium' | 'large';
export type CountdownTimerVariant = 'default' | 'warning' | 'danger';

export interface CountdownTimerProps {
  /** Total duration in seconds */
  duration: number;
  /** Auto-start on mount */
  autoStart?: boolean;
  /** Callback when countdown reaches zero */
  onComplete?: () => void;
  /** Callback on each tick with remaining seconds */
  onTick?: (remaining: number) => void;
  /** Show hours in display */
  showHours?: boolean;
  size?: CountdownTimerSize;
  variant?: CountdownTimerVariant;
  /** Threshold in seconds below which variant switches to 'warning' */
  warningThreshold?: number;
  /** Threshold in seconds below which variant switches to 'danger' */
  dangerThreshold?: number;
  label?: string;
  id?: string;
}

function formatTime(totalSeconds: number, showHours: boolean): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (showHours || h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  autoStart = false,
  onComplete,
  onTick,
  showHours = false,
  size = 'medium',
  variant = 'default',
  warningThreshold,
  dangerThreshold,
  label,
  id,
}) => {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  onCompleteRef.current = onComplete;
  onTickRef.current = onTick;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setIsRunning(false);
            setIsComplete(true);
            onCompleteRef.current?.();
            return 0;
          }
          onTickRef.current?.(next);
          return next;
        });
      }, 1000);
      return clearTimer;
    }
  }, [isRunning, remaining, clearTimer]);

  const start = useCallback(() => {
    if (remaining > 0 && !isComplete) {
      setIsRunning(true);
    }
  }, [remaining, isComplete]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(duration);
    setIsRunning(false);
    setIsComplete(false);
  }, [duration, clearTimer]);

  const getEffectiveVariant = useCallback(() => {
    if (dangerThreshold !== undefined && remaining <= dangerThreshold && remaining > 0) {
      return 'danger';
    }
    if (warningThreshold !== undefined && remaining <= warningThreshold && remaining > 0) {
      return 'warning';
    }
    return variant;
  }, [remaining, variant, warningThreshold, dangerThreshold]);

  const effectiveVariant = getEffectiveVariant();

  const classNames = [
    'countdown-timer',
    `countdown-timer--${size}`,
    `countdown-timer--${effectiveVariant}`,
    isComplete ? 'countdown-timer--complete' : '',
    isRunning ? 'countdown-timer--running' : '',
  ].filter(Boolean).join(' ');

  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return (
    <div
      id={id}
      className={classNames}
      role="timer"
      aria-label={label || '카운트다운 타이머'}
      aria-live="polite"
    >
      <div className="countdown-timer-display">
        <span className="countdown-timer-time">
          {formatTime(remaining, showHours)}
        </span>
        {label && <span className="countdown-timer-label">{label}</span>}
      </div>

      <div
        className="countdown-timer-progress"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="countdown-timer-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="countdown-timer-controls">
        {!isRunning && !isComplete && (
          <button
            className="countdown-timer-btn countdown-timer-btn--start"
            onClick={start}
            aria-label="시작"
            type="button"
          >
            ▶
          </button>
        )}
        {isRunning && (
          <button
            className="countdown-timer-btn countdown-timer-btn--pause"
            onClick={pause}
            aria-label="일시정지"
            type="button"
          >
            ⏸
          </button>
        )}
        <button
          className="countdown-timer-btn countdown-timer-btn--reset"
          onClick={reset}
          aria-label="초기화"
          type="button"
        >
          ↺
        </button>
      </div>
    </div>
  );
};

export default React.memo(CountdownTimer);
