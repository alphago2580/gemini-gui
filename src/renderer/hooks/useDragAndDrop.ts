import { useState, useCallback, useRef, useMemo } from 'react';

export interface DragAndDropState {
  isDragging: boolean;
  isOver: boolean;
  dragCounter: number;
}

export interface UseDragAndDropOptions {
  /** Called when files are dropped */
  onDrop?: (files: File[]) => void;
  /** Called when valid drag enters the zone */
  onDragEnter?: () => void;
  /** Called when drag leaves the zone */
  onDragLeave?: () => void;
  /** Filter accepted MIME types (e.g., ['image/*', 'text/plain']) */
  accept?: string[];
}

export interface UseDragAndDropReturn {
  isDragging: boolean;
  isOver: boolean;
  dragProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

function matchesMimeType(fileType: string, pattern: string): boolean {
  if (pattern === '*/*') return true;
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, pattern.indexOf('/'));
    return fileType.startsWith(prefix + '/');
  }
  return fileType === pattern;
}

/**
 * Manages drag-and-drop state for a drop zone.
 * Returns `isDragging`, `isOver`, and event handler props to spread on the drop zone element.
 */
export function useDragAndDrop(options: UseDragAndDropOptions = {}): UseDragAndDropReturn {
  const { onDrop, onDragEnter, onDragLeave, accept } = options;
  const [isOver, setIsOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsOver(true);
      setIsDragging(true);
      onDragEnter?.();
    }
  }, [onDragEnter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsOver(false);
      setIsDragging(false);
      onDragLeave?.();
    }
  }, [onDragLeave]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsOver(false);
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (accept && accept.length > 0) {
      const filtered = droppedFiles.filter(file =>
        accept.some(pattern => matchesMimeType(file.type, pattern))
      );
      if (filtered.length > 0) {
        onDrop?.(filtered);
      }
    } else {
      if (droppedFiles.length > 0) {
        onDrop?.(droppedFiles);
      }
    }
  }, [onDrop, accept]);

  const dragProps = useMemo(() => ({
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  }), [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  return { isDragging, isOver, dragProps };
}
