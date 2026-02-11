import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAbortController } from './useAbortController';

describe('useAbortController', () => {
  it('initializes with non-aborted signal', () => {
    const { result } = renderHook(() => useAbortController());
    expect(result.current.isAborted()).toBe(false);
  });

  it('returns an AbortSignal', () => {
    const { result } = renderHook(() => useAbortController());
    const signal = result.current.getSignal();
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it('aborts the signal', () => {
    const { result } = renderHook(() => useAbortController());
    const signal = result.current.getSignal();
    act(() => result.current.abort());
    expect(signal.aborted).toBe(true);
    expect(result.current.isAborted()).toBe(true);
  });

  it('aborts with custom reason', () => {
    const { result } = renderHook(() => useAbortController());
    const signal = result.current.getSignal();
    act(() => result.current.abort('user cancelled'));
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBe('user cancelled');
  });

  it('reset creates a new non-aborted signal', () => {
    const { result } = renderHook(() => useAbortController());
    const oldSignal = result.current.getSignal();
    act(() => result.current.abort());
    expect(oldSignal.aborted).toBe(true);

    let newSignal: AbortSignal;
    act(() => {
      newSignal = result.current.reset();
    });
    expect(newSignal!.aborted).toBe(false);
    expect(result.current.isAborted()).toBe(false);
    expect(result.current.getSignal()).toBe(newSignal!);
  });

  it('getSignal returns same signal without reset', () => {
    const { result } = renderHook(() => useAbortController());
    const signal1 = result.current.getSignal();
    const signal2 = result.current.getSignal();
    expect(signal1).toBe(signal2);
  });

  it('getSignal returns different signal after reset', () => {
    const { result } = renderHook(() => useAbortController());
    const signal1 = result.current.getSignal();
    act(() => result.current.reset());
    const signal2 = result.current.getSignal();
    expect(signal1).not.toBe(signal2);
  });

  it('multiple aborts do not throw', () => {
    const { result } = renderHook(() => useAbortController());
    act(() => result.current.abort());
    act(() => result.current.abort());
    expect(result.current.isAborted()).toBe(true);
  });

  it('can be used for fetch cancellation pattern', () => {
    const { result } = renderHook(() => useAbortController());
    const signal = result.current.getSignal();

    let abortReceived = false;
    signal.addEventListener('abort', () => {
      abortReceived = true;
    });

    act(() => result.current.abort());
    expect(abortReceived).toBe(true);
  });
});
