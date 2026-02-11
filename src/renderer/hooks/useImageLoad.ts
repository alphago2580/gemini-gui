import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseImageLoadOptions {
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: string;
  onLoad?: (event: Event) => void;
  onError?: (event: Event | string) => void;
}

export interface UseImageLoadReturn {
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
  error: string | null;
  naturalWidth: number;
  naturalHeight: number;
  reload: () => void;
}

export function useImageLoad(
  src: string | undefined,
  options: UseImageLoadOptions = {}
): UseImageLoadReturn {
  const { crossOrigin, referrerPolicy, onLoad, onError } = options;
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const reload = useCallback(() => {
    setReloadCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setIsLoaded(false);
      setIsError(false);
      setError(null);
      setNaturalWidth(0);
      setNaturalHeight(0);
      return;
    }

    const img = new Image();
    imgRef.current = img;

    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    if (referrerPolicy) {
      img.referrerPolicy = referrerPolicy as ReferrerPolicy;
    }

    setIsLoading(true);
    setIsLoaded(false);
    setIsError(false);
    setError(null);
    setNaturalWidth(0);
    setNaturalHeight(0);

    const handleLoad = (event: Event) => {
      setIsLoading(false);
      setIsLoaded(true);
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      onLoadRef.current?.(event);
    };

    const handleError = (event: Event | string) => {
      setIsLoading(false);
      setIsError(true);
      setError(`Failed to load image: ${src}`);
      onErrorRef.current?.(event);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      imgRef.current = null;
    };
  }, [src, crossOrigin, referrerPolicy, reloadCount]);

  return {
    isLoading,
    isLoaded,
    isError,
    error,
    naturalWidth,
    naturalHeight,
    reload,
  };
}
