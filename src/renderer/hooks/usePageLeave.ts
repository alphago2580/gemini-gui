import { useState, useEffect, useCallback } from 'react';

export interface UsePageLeaveResult {
  hasLeft: boolean;
  leaveCount: number;
  reset: () => void;
}

/**
 * Hook that detects when the mouse cursor leaves the page viewport.
 * Useful for showing exit-intent popups or saving state.
 */
export function usePageLeave(
  onLeave?: () => void
): UsePageLeaveResult {
  const [hasLeft, setHasLeft] = useState(false);
  const [leaveCount, setLeaveCount] = useState(0);

  const reset = useCallback(() => {
    setHasLeft(false);
    setLeaveCount(0);
  }, []);

  useEffect(() => {
    const handleMouseLeave = (event: MouseEvent) => {
      if (
        event.clientY <= 0 ||
        event.clientX <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight
      ) {
        setHasLeft(true);
        setLeaveCount((prev) => prev + 1);
        onLeave?.();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [onLeave]);

  return { hasLeft, leaveCount, reset };
}
