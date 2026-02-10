import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollPosition } from './useScrollPosition';

describe('useScrollPosition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial position state', () => {
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
    expect(result.current.direction).toBe('none');
    expect(result.current.isAtTop).toBe(true);
    expect(result.current.isAtBottom).toBe(false);
  });

  it('tracks scroll position of a referenced element', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollTop', { value: 50, writable: true });
    Object.defineProperty(div, 'scrollLeft', { value: 10, writable: true });
    Object.defineProperty(div, 'scrollHeight', { value: 500 });
    Object.defineProperty(div, 'clientHeight', { value: 300 });

    const ref = { current: div };
    const { result } = renderHook(() => useScrollPosition(ref, 0));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      div.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.x).toBe(10);
    expect(result.current.y).toBe(50);
    expect(result.current.scrollHeight).toBe(500);
    expect(result.current.clientHeight).toBe(300);
  });

  it('detects scroll direction down', () => {
    const div = document.createElement('div');
    let scrollTopVal = 0;
    Object.defineProperty(div, 'scrollTop', {
      get: () => scrollTopVal,
      set: (v: number) => { scrollTopVal = v; },
    });
    Object.defineProperty(div, 'scrollLeft', { value: 0 });
    Object.defineProperty(div, 'scrollHeight', { value: 1000 });
    Object.defineProperty(div, 'clientHeight', { value: 300 });

    const ref = { current: div };
    const { result } = renderHook(() => useScrollPosition(ref, 0));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    scrollTopVal = 100;
    act(() => {
      div.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.direction).toBe('down');
    expect(result.current.y).toBe(100);
  });

  it('detects scroll direction up', () => {
    const div = document.createElement('div');
    let scrollTopVal = 100;
    Object.defineProperty(div, 'scrollTop', {
      get: () => scrollTopVal,
      set: (v: number) => { scrollTopVal = v; },
    });
    Object.defineProperty(div, 'scrollLeft', { value: 0 });
    Object.defineProperty(div, 'scrollHeight', { value: 1000 });
    Object.defineProperty(div, 'clientHeight', { value: 300 });

    const ref = { current: div };
    const { result } = renderHook(() => useScrollPosition(ref, 0));

    // Initial read sets lastY to 100
    act(() => {
      vi.advanceTimersByTime(0);
    });

    scrollTopVal = 50;
    act(() => {
      div.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.direction).toBe('up');
    expect(result.current.y).toBe(50);
  });

  it('detects isAtTop correctly', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollTop', { value: 0 });
    Object.defineProperty(div, 'scrollLeft', { value: 0 });
    Object.defineProperty(div, 'scrollHeight', { value: 500 });
    Object.defineProperty(div, 'clientHeight', { value: 300 });

    const ref = { current: div };
    const { result } = renderHook(() => useScrollPosition(ref, 0));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      div.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isAtTop).toBe(true);
  });

  it('detects isAtBottom correctly', () => {
    const div = document.createElement('div');
    // scrollTop + clientHeight >= scrollHeight - threshold
    Object.defineProperty(div, 'scrollTop', { value: 195 });
    Object.defineProperty(div, 'scrollLeft', { value: 0 });
    Object.defineProperty(div, 'scrollHeight', { value: 500 });
    Object.defineProperty(div, 'clientHeight', { value: 300 });

    const ref = { current: div };
    const { result } = renderHook(() => useScrollPosition(ref, 0));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      div.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isAtBottom).toBe(true);
  });

  it('throttles scroll events', () => {
    const div = document.createElement('div');
    let scrollTopVal = 0;
    Object.defineProperty(div, 'scrollTop', {
      get: () => scrollTopVal,
      set: (v: number) => { scrollTopVal = v; },
    });
    Object.defineProperty(div, 'scrollLeft', { value: 0 });
    Object.defineProperty(div, 'scrollHeight', { value: 1000 });
    Object.defineProperty(div, 'clientHeight', { value: 300 });

    const ref = { current: div };
    const { result } = renderHook(() => useScrollPosition(ref, 200));

    // Initial
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Fire multiple events rapidly
    scrollTopVal = 50;
    act(() => { div.dispatchEvent(new Event('scroll')); });
    scrollTopVal = 100;
    act(() => { div.dispatchEvent(new Event('scroll')); });
    scrollTopVal = 150;
    act(() => { div.dispatchEvent(new Event('scroll')); });

    // Before throttle expires, should still show value from first accepted event
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // After throttle, it should have the value from when the first event was processed
    expect(result.current.y).toBe(150);
  });

  it('cleans up event listeners on unmount', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollTop', { value: 0 });
    Object.defineProperty(div, 'scrollLeft', { value: 0 });
    Object.defineProperty(div, 'scrollHeight', { value: 500 });
    Object.defineProperty(div, 'clientHeight', { value: 300 });

    const removeEventListenerSpy = vi.spyOn(div, 'removeEventListener');
    const ref = { current: div };
    const { unmount } = renderHook(() => useScrollPosition(ref, 0));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
