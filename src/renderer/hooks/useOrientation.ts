import { useState, useEffect } from 'react';

export type OrientationType = 'portrait' | 'landscape';

export interface UseOrientationResult {
  /** Current orientation type */
  type: OrientationType;
  /** Screen orientation angle (0, 90, 180, 270) */
  angle: number;
  /** Whether the device is in portrait mode */
  isPortrait: boolean;
  /** Whether the device is in landscape mode */
  isLandscape: boolean;
}

function getOrientation(): { type: OrientationType; angle: number } {
  if (typeof screen !== 'undefined' && screen.orientation) {
    const angle = screen.orientation.angle;
    const type: OrientationType = angle === 0 || angle === 180 ? 'portrait' : 'landscape';
    return { type, angle };
  }
  // Fallback to window dimensions
  const isPortrait = window.innerHeight >= window.innerWidth;
  return {
    type: isPortrait ? 'portrait' : 'landscape',
    angle: isPortrait ? 0 : 90,
  };
}

export function useOrientation(): UseOrientationResult {
  const [orientation, setOrientation] = useState(getOrientation);

  useEffect(() => {
    const handleChange = () => {
      setOrientation(getOrientation());
    };

    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleChange);
    }
    window.addEventListener('resize', handleChange);

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleChange);
      }
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  return {
    type: orientation.type,
    angle: orientation.angle,
    isPortrait: orientation.type === 'portrait',
    isLandscape: orientation.type === 'landscape',
  };
}
