import { useState, useEffect, useCallback } from 'react';

export interface DevicePixelRatioResult {
  pixelRatio: number;
  isHighDPI: boolean;
  isRetina: boolean;
}

export function useDevicePixelRatio(): DevicePixelRatioResult {
  const getPixelRatio = useCallback(() => {
    return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  }, []);

  const [pixelRatio, setPixelRatio] = useState<number>(getPixelRatio);

  useEffect(() => {
    const updatePixelRatio = () => {
      setPixelRatio(getPixelRatio());
    };

    // Use matchMedia to listen for devicePixelRatio changes
    // This happens when user moves window between monitors with different DPI
    // or when zooming the page
    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );

    const handler = () => {
      updatePixelRatio();
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [getPixelRatio, pixelRatio]);

  return {
    pixelRatio,
    isHighDPI: pixelRatio > 1,
    isRetina: pixelRatio >= 2,
  };
}
