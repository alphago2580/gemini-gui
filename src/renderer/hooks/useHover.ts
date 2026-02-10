import { useState, useCallback, useRef } from 'react';

export interface UseHoverReturn {
  ref: React.RefObject<HTMLElement | null>;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function useHover(): UseHoverReturn {
  const ref = useRef<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return { ref, isHovered, onMouseEnter, onMouseLeave };
}
