import { useState, useCallback, useRef } from 'react';

export type ReadMethod = 'text' | 'dataURL' | 'arrayBuffer' | 'binaryString';

export interface UseFileReaderOptions {
  method?: ReadMethod;
  onLoad?: (result: string | ArrayBuffer) => void;
  onError?: (error: DOMException | null) => void;
  onProgress?: (progress: number) => void;
}

export interface UseFileReaderReturn {
  result: string | ArrayBuffer | null;
  error: DOMException | null;
  isLoading: boolean;
  progress: number;
  readFile: (file: File) => void;
  abort: () => void;
  reset: () => void;
}

export function useFileReader(options: UseFileReaderOptions = {}): UseFileReaderReturn {
  const { method = 'text', onLoad, onError, onProgress } = options;

  const [result, setResult] = useState<string | ArrayBuffer | null>(null);
  const [error, setError] = useState<DOMException | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const readerRef = useRef<FileReader | null>(null);

  const abort = useCallback(() => {
    if (readerRef.current && readerRef.current.readyState === FileReader.LOADING) {
      readerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    abort();
    setResult(null);
    setError(null);
    setProgress(0);
  }, [abort]);

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    readerRef.current = reader;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = (event.loaded / event.total) * 100;
        setProgress(pct);
        onProgress?.(pct);
      }
    };

    reader.onload = () => {
      setResult(reader.result);
      setIsLoading(false);
      setProgress(100);
      if (reader.result !== null) {
        onLoad?.(reader.result as string | ArrayBuffer);
      }
    };

    reader.onerror = () => {
      setError(reader.error);
      setIsLoading(false);
      onError?.(reader.error);
    };

    reader.onabort = () => {
      setIsLoading(false);
    };

    switch (method) {
      case 'text':
        reader.readAsText(file);
        break;
      case 'dataURL':
        reader.readAsDataURL(file);
        break;
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file);
        break;
      case 'binaryString':
        reader.readAsBinaryString(file);
        break;
    }
  }, [method, onLoad, onError, onProgress]);

  return {
    result,
    error,
    isLoading,
    progress,
    readFile,
    abort,
    reset,
  };
}
