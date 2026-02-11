import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from './usePerformanceMonitor';

describe('usePerformanceMonitor', () => {
  it('starts disabled', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    expect(result.current.isEnabled).toBe(false);
  });

  it('toggles enabled state', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isEnabled).toBe(true);
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isEnabled).toBe(false);
  });

  it('returns initial performance data with zero values', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    const data = result.current.getData(5, 3);
    expect(data.renderCount).toBe(0);
    expect(data.totalRenderTime).toBe(0);
    expect(data.averageRenderTime).toBe(0);
    expect(data.slowestRender).toBe(0);
    expect(data.fastestRender).toBe(0);
    expect(data.recentRenders).toEqual([]);
    expect(data.messageCount).toBe(5);
    expect(data.conversationCount).toBe(3);
  });

  it('does not record renders when disabled', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => {
      result.current.onRender('App', 'mount', 10, 20, 100, 200);
    });
    const data = result.current.getData(0, 0);
    expect(data.renderCount).toBe(0);
    expect(data.recentRenders).toEqual([]);
  });

  it('records render metrics when enabled', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.onRender('App', 'mount', 10.5, 20, 100, 200);
    });
    const data = result.current.getData(0, 0);
    expect(data.renderCount).toBe(1);
    expect(data.totalRenderTime).toBe(10.5);
    expect(data.averageRenderTime).toBe(10.5);
    expect(data.slowestRender).toBe(10.5);
    expect(data.fastestRender).toBe(10.5);
    expect(data.recentRenders).toHaveLength(1);
    expect(data.recentRenders[0]).toEqual({
      id: 'App',
      phase: 'mount',
      actualDuration: 10.5,
      baseDuration: 20,
      startTime: 100,
      commitTime: 200,
    });
  });

  it('tracks slowest and fastest renders', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.onRender('App', 'mount', 5, 20, 100, 200);
      result.current.onRender('App', 'update', 15, 20, 300, 400);
      result.current.onRender('App', 'update', 2, 20, 500, 600);
    });
    const data = result.current.getData(0, 0);
    expect(data.renderCount).toBe(3);
    expect(data.slowestRender).toBe(15);
    expect(data.fastestRender).toBe(2);
  });

  it('calculates average render time', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.onRender('App', 'mount', 10, 20, 100, 200);
      result.current.onRender('App', 'update', 20, 20, 300, 400);
    });
    const data = result.current.getData(0, 0);
    expect(data.averageRenderTime).toBe(15);
  });

  it('keeps recent renders capped at 50', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => {
      result.current.toggle();
    });
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.onRender(`Comp-${i}`, 'update', i, 20, i * 100, i * 100 + 50);
      }
    });
    const data = result.current.getData(0, 0);
    expect(data.recentRenders).toHaveLength(50);
    // Most recent render should be first
    expect(data.recentRenders[0].id).toBe('Comp-59');
  });

  it('resets all metrics', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.onRender('App', 'mount', 10, 20, 100, 200);
      result.current.onRender('App', 'update', 20, 20, 300, 400);
    });
    act(() => {
      result.current.reset();
    });
    const data = result.current.getData(5, 3);
    expect(data.renderCount).toBe(0);
    expect(data.totalRenderTime).toBe(0);
    expect(data.averageRenderTime).toBe(0);
    expect(data.slowestRender).toBe(0);
    expect(data.fastestRender).toBe(0);
    expect(data.recentRenders).toEqual([]);
    // message/conversation counts still reflect current args
    expect(data.messageCount).toBe(5);
    expect(data.conversationCount).toBe(3);
  });

  it('passes message and conversation counts through getData', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    const data = result.current.getData(42, 7);
    expect(data.messageCount).toBe(42);
    expect(data.conversationCount).toBe(7);
  });

  it('rounds render times to 2 decimal places', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.onRender('App', 'mount', 3.456789, 20, 100, 200);
    });
    const data = result.current.getData(0, 0);
    expect(data.totalRenderTime).toBe(3.46);
    expect(data.averageRenderTime).toBe(3.46);
    expect(data.slowestRender).toBe(3.46);
    expect(data.fastestRender).toBe(3.46);
  });

  it('reports memory usage when performance.memory is available', () => {
    const originalPerformance = globalThis.performance;
    Object.defineProperty(globalThis, 'performance', {
      value: {
        ...originalPerformance,
        memory: { usedJSHeapSize: 50 * 1024 * 1024 },
      },
      configurable: true,
    });

    const { result } = renderHook(() => usePerformanceMonitor());
    const data = result.current.getData(0, 0);
    expect(data.memoryUsageMB).toBe(50);

    Object.defineProperty(globalThis, 'performance', {
      value: originalPerformance,
      configurable: true,
    });
  });

  it('reports null memory when performance.memory is unavailable', () => {
    const originalPerformance = globalThis.performance;
    Object.defineProperty(globalThis, 'performance', {
      value: { ...originalPerformance },
      configurable: true,
    });
    // Ensure no memory property
    delete (globalThis.performance as unknown as Record<string, unknown>).memory;

    const { result } = renderHook(() => usePerformanceMonitor());
    const data = result.current.getData(0, 0);
    expect(data.memoryUsageMB).toBeNull();

    Object.defineProperty(globalThis, 'performance', {
      value: originalPerformance,
      configurable: true,
    });
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => usePerformanceMonitor());
    const firstRender = {
      toggle: result.current.toggle,
      reset: result.current.reset,
      getData: result.current.getData,
    };
    rerender();
    expect(result.current.toggle).toBe(firstRender.toggle);
    expect(result.current.reset).toBe(firstRender.reset);
    expect(result.current.getData).toBe(firstRender.getData);
  });

  it('stops recording after disable', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => { result.current.toggle(); }); // enable
    act(() => {
      result.current.onRender('A', 'mount', 5, 10, 0, 50);
    });
    act(() => { result.current.toggle(); }); // disable
    act(() => {
      result.current.onRender('B', 'mount', 10, 20, 100, 150);
    });
    const data = result.current.getData(0, 0);
    expect(data.renderCount).toBe(1);
    expect(data.recentRenders).toHaveLength(1);
    expect(data.recentRenders[0].id).toBe('A');
  });

  it('enable-disable-enable preserves prior data', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => { result.current.toggle(); }); // enable
    act(() => {
      result.current.onRender('A', 'mount', 5, 10, 0, 50);
    });
    act(() => { result.current.toggle(); }); // disable
    act(() => { result.current.toggle(); }); // enable again
    act(() => {
      result.current.onRender('B', 'update', 3, 10, 100, 150);
    });
    const data = result.current.getData(0, 0);
    expect(data.renderCount).toBe(2);
    expect(data.recentRenders).toHaveLength(2);
  });

  it('multiple resets keep returning zero data', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => { result.current.toggle(); });
    act(() => {
      result.current.onRender('App', 'mount', 10, 20, 0, 50);
    });
    act(() => { result.current.reset(); });
    act(() => { result.current.reset(); });
    const data = result.current.getData(0, 0);
    expect(data.renderCount).toBe(0);
    expect(data.totalRenderTime).toBe(0);
  });

  it('reset then record starts fresh', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => { result.current.toggle(); });
    act(() => {
      result.current.onRender('Old', 'mount', 50, 60, 0, 50);
    });
    act(() => { result.current.reset(); });
    act(() => {
      result.current.onRender('New', 'mount', 5, 10, 100, 150);
    });
    const data = result.current.getData(0, 0);
    expect(data.renderCount).toBe(1);
    expect(data.slowestRender).toBe(5);
    expect(data.fastestRender).toBe(5);
    expect(data.recentRenders[0].id).toBe('New');
  });

  it('update phase is recorded correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => { result.current.toggle(); });
    act(() => {
      result.current.onRender('Sidebar', 'update', 2, 5, 200, 300);
    });
    const data = result.current.getData(0, 0);
    expect(data.recentRenders[0].phase).toBe('update');
    expect(data.recentRenders[0].id).toBe('Sidebar');
  });

  it('fastest render updates on lower duration', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    act(() => { result.current.toggle(); });
    act(() => {
      result.current.onRender('A', 'mount', 10, 20, 0, 50);
      result.current.onRender('B', 'update', 3, 20, 100, 150);
      result.current.onRender('C', 'update', 1, 20, 200, 250);
    });
    const data = result.current.getData(0, 0);
    expect(data.fastestRender).toBe(1);
  });

  it('memory usage rounds to 1 decimal place', () => {
    const originalPerformance = globalThis.performance;
    Object.defineProperty(globalThis, 'performance', {
      value: {
        ...originalPerformance,
        memory: { usedJSHeapSize: 33.33 * 1024 * 1024 },
      },
      configurable: true,
    });

    const { result } = renderHook(() => usePerformanceMonitor());
    const data = result.current.getData(0, 0);
    expect(data.memoryUsageMB).toBe(33.3);

    Object.defineProperty(globalThis, 'performance', {
      value: originalPerformance,
      configurable: true,
    });
  });
});
