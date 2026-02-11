import { useState, useCallback } from 'react';

export interface UseClampedValueOptions {
  min: number;
  max: number;
  initialValue?: number;
  step?: number;
  loop?: boolean;
}

export interface UseClampedValueReturn {
  value: number;
  setValue: (val: number) => void;
  increment: () => void;
  decrement: () => void;
  min: number;
  max: number;
  isMin: boolean;
  isMax: boolean;
  reset: () => void;
  percentage: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useClampedValue(options: UseClampedValueOptions): UseClampedValueReturn {
  const { min, max, step = 1, loop = false } = options;

  if (min > max) {
    throw new Error('min must not be greater than max');
  }

  const initialValue = options.initialValue !== undefined
    ? clamp(options.initialValue, min, max)
    : min;

  const [value, setValueRaw] = useState(initialValue);

  const setValue = useCallback((val: number) => {
    setValueRaw(clamp(val, min, max));
  }, [min, max]);

  const increment = useCallback(() => {
    setValueRaw(prev => {
      const next = prev + step;
      if (next > max) {
        return loop ? min : max;
      }
      return next;
    });
  }, [step, max, min, loop]);

  const decrement = useCallback(() => {
    setValueRaw(prev => {
      const next = prev - step;
      if (next < min) {
        return loop ? max : min;
      }
      return next;
    });
  }, [step, min, max, loop]);

  const reset = useCallback(() => {
    setValueRaw(initialValue);
  }, [initialValue]);

  const isMin = value === min;
  const isMax = value === max;
  const range = max - min;
  const percentage = range === 0 ? 100 : ((value - min) / range) * 100;

  return {
    value,
    setValue,
    increment,
    decrement,
    min,
    max,
    isMin,
    isMax,
    reset,
    percentage,
  };
}
