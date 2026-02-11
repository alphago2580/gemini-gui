import { useState, useEffect, useMemo, useCallback } from 'react';

export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export const defaultBreakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

const orderedKeys: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export interface UseBreakpointResult {
  /** Current active breakpoint key */
  current: BreakpointKey;
  /** Current window width */
  width: number;
  /** True if width >= given breakpoint */
  isAbove: (key: BreakpointKey) => boolean;
  /** True if width < given breakpoint */
  isBelow: (key: BreakpointKey) => boolean;
  /** True if width is within the range of the given breakpoint */
  isAt: (key: BreakpointKey) => boolean;
  /** True if width is between min (inclusive) and max (exclusive) breakpoints */
  isBetween: (min: BreakpointKey, max: BreakpointKey) => boolean;
}

function getCurrentBreakpoint(width: number, config: BreakpointConfig): BreakpointKey {
  for (let i = orderedKeys.length - 1; i >= 0; i--) {
    if (width >= config[orderedKeys[i]]) {
      return orderedKeys[i];
    }
  }
  return 'xs';
}

export function useBreakpoint(
  customBreakpoints?: Partial<BreakpointConfig>
): UseBreakpointResult {
  const config = useMemo<BreakpointConfig>(
    () => ({ ...defaultBreakpoints, ...customBreakpoints }),
    [customBreakpoints]
  );

  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const current = useMemo(() => getCurrentBreakpoint(width, config), [width, config]);

  const isAbove = useCallback(
    (key: BreakpointKey) => width >= config[key],
    [width, config]
  );

  const isBelow = useCallback(
    (key: BreakpointKey) => width < config[key],
    [width, config]
  );

  const isAt = useCallback(
    (key: BreakpointKey) => {
      const idx = orderedKeys.indexOf(key);
      const min = config[key];
      const max = idx < orderedKeys.length - 1 ? config[orderedKeys[idx + 1]] : Infinity;
      return width >= min && width < max;
    },
    [width, config]
  );

  const isBetween = useCallback(
    (min: BreakpointKey, max: BreakpointKey) => {
      return width >= config[min] && width < config[max];
    },
    [width, config]
  );

  return { current, width, isAbove, isBelow, isAt, isBetween };
}
