import { useState, useCallback } from 'react';

export interface UseEyeDropperReturn {
  color: string | null;
  isSupported: boolean;
  isOpen: boolean;
  error: Error | null;
  open: () => Promise<string | null>;
  reset: () => void;
}

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperInstance {
  open: (options?: { signal?: AbortSignal }) => Promise<EyeDropperResult>;
}

function getEyeDropperConstructor(): (new () => EyeDropperInstance) | null {
  const win = window as unknown as Record<string, unknown>;
  return (win.EyeDropper ?? null) as (new () => EyeDropperInstance) | null;
}

export function useEyeDropper(): UseEyeDropperReturn {
  const isSupported = getEyeDropperConstructor() !== null;

  const [color, setColor] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const open = useCallback(async (): Promise<string | null> => {
    const EyeDropperCtor = getEyeDropperConstructor();
    if (!EyeDropperCtor) {
      const err = new Error('EyeDropper API is not supported');
      setError(err);
      return null;
    }

    setIsOpen(true);
    setError(null);

    try {
      const dropper = new EyeDropperCtor();
      const result = await dropper.open();
      setColor(result.sRGBHex);
      setIsOpen(false);
      return result.sRGBHex;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsOpen(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setColor(null);
    setError(null);
    setIsOpen(false);
  }, []);

  return { color, isSupported, isOpen, error, open, reset };
}
