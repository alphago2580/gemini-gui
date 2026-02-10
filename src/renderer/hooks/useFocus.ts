import { useState, useCallback, useRef } from 'react';

export interface UseFocusReturn {
  ref: React.RefObject<HTMLElement | null>;
  isFocused: boolean;
  focus: () => void;
  blur: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function useFocus(): UseFocusReturn {
  const ref = useRef<HTMLElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const onFocus = useCallback(() => setIsFocused(true), []);
  const onBlur = useCallback(() => setIsFocused(false), []);

  const focus = useCallback(() => {
    ref.current?.focus();
  }, []);

  const blur = useCallback(() => {
    ref.current?.blur();
  }, []);

  return { ref, isFocused, focus, blur, onFocus, onBlur };
}
