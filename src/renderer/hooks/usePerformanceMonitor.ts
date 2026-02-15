import { useState, useCallback, useRef } from 'react';

export interface RenderMetric {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

export interface PerformanceData {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  slowestRender: number;
  fastestRender: number;
  recentRenders: RenderMetric[];
  messageCount: number;
  conversationCount: number;
  memoryUsageMB: number | null;
}

const MAX_RECENT_RENDERS = 50;

export interface UsePerformanceMonitorReturn {
  isEnabled: boolean;
  toggle: () => void;
  onRender: (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => void;
  getData: (messageCount: number, conversationCount: number) => PerformanceData;
  reset: () => void;
}

export function usePerformanceMonitor(): UsePerformanceMonitorReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const renderCountRef = useRef(0);
  const totalRenderTimeRef = useRef(0);
  const slowestRenderRef = useRef(0);
  const fastestRenderRef = useRef(Infinity);
  const recentRendersRef = useRef<RenderMetric[]>([]);
  const [, forceUpdate] = useState(0);

  const onRender = useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (!isEnabled) return;

    renderCountRef.current++;
    totalRenderTimeRef.current += actualDuration;

    if (actualDuration > slowestRenderRef.current) {
      slowestRenderRef.current = actualDuration;
    }
    if (actualDuration < fastestRenderRef.current) {
      fastestRenderRef.current = actualDuration;
    }

    const metric: RenderMetric = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    };

    recentRendersRef.current = [
      metric,
      ...recentRendersRef.current.slice(0, MAX_RECENT_RENDERS - 1),
    ];
  }, [isEnabled]);

  const getData = useCallback((messageCount: number, conversationCount: number): PerformanceData => {
    const count = renderCountRef.current;
    let memoryUsageMB: number | null = null;

    const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
    if (typeof performance !== 'undefined' && perf.memory) {
      memoryUsageMB = Math.round((perf.memory.usedJSHeapSize / 1024 / 1024) * 10) / 10;
    }

    return {
      renderCount: count,
      totalRenderTime: Math.round(totalRenderTimeRef.current * 100) / 100,
      averageRenderTime: count > 0 ? Math.round((totalRenderTimeRef.current / count) * 100) / 100 : 0,
      slowestRender: slowestRenderRef.current === 0 ? 0 : Math.round(slowestRenderRef.current * 100) / 100,
      fastestRender: fastestRenderRef.current === Infinity ? 0 : Math.round(fastestRenderRef.current * 100) / 100,
      recentRenders: recentRendersRef.current,
      messageCount,
      conversationCount,
      memoryUsageMB,
    };
  }, []);

  const reset = useCallback(() => {
    renderCountRef.current = 0;
    totalRenderTimeRef.current = 0;
    slowestRenderRef.current = 0;
    fastestRenderRef.current = Infinity;
    recentRendersRef.current = [];
    forceUpdate(n => n + 1);
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  return {
    isEnabled,
    toggle,
    onRender,
    getData,
    reset,
  };
}
