import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ResizablePanel.css';

export type ResizeDirection = 'horizontal' | 'vertical';

export interface ResizablePanelProps {
  direction?: ResizeDirection;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  size?: number;
  onResize?: (size: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: (size: number) => void;
  children: React.ReactNode;
  secondaryChildren: React.ReactNode;
  disabled?: boolean;
  handleSize?: number;
  className?: string;
  ariaLabel?: string;
  storageKey?: string;
}

const DEFAULT_MIN_SIZE = 100;
const DEFAULT_MAX_SIZE = 800;
const DEFAULT_SIZE = 260;
const KEYBOARD_STEP = 10;

function loadStoredSize(key: string | undefined): number | null {
  if (!key) return null;
  try {
    const stored = localStorage.getItem(`resizable-panel-${key}`);
    if (stored !== null) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed)) return parsed;
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

function saveStoredSize(key: string | undefined, size: number): void {
  if (!key) return;
  try {
    localStorage.setItem(`resizable-panel-${key}`, String(size));
  } catch {
    // localStorage unavailable
  }
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  direction = 'horizontal',
  defaultSize,
  minSize = DEFAULT_MIN_SIZE,
  maxSize = DEFAULT_MAX_SIZE,
  size: controlledSize,
  onResize,
  onResizeStart,
  onResizeEnd,
  children,
  secondaryChildren,
  disabled = false,
  handleSize = 6,
  className,
  ariaLabel,
  storageKey,
}) => {
  const isControlled = controlledSize !== undefined;
  const initialSize = controlledSize ?? loadStoredSize(storageKey) ?? defaultSize ?? DEFAULT_SIZE;
  const [internalSize, setInternalSize] = useState(initialSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const currentSize = Math.max(minSize, Math.min(maxSize, isControlled ? (controlledSize ?? DEFAULT_SIZE) : internalSize));

  const updateSize = useCallback(
    (newSize: number) => {
      const clamped = Math.max(minSize, Math.min(maxSize, newSize));
      if (!isControlled) {
        setInternalSize(clamped);
      }
      saveStoredSize(storageKey, clamped);
      onResize?.(clamped);
    },
    [minSize, maxSize, isControlled, storageKey, onResize],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      isDragging.current = true;
      onResizeStart?.();

      const startPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const startSize = currentSize;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const currentPos = direction === 'horizontal' ? ev.clientX : ev.clientY;
        const delta = currentPos - startPos;
        updateSize(startSize + delta);
      };

      let lastSize = startSize;
      const origHandleMouseMove = handleMouseMove;
      const trackingMouseMove = (ev: MouseEvent) => {
        origHandleMouseMove(ev);
        const currentPos = direction === 'horizontal' ? ev.clientX : ev.clientY;
        lastSize = Math.max(minSize, Math.min(maxSize, startSize + currentPos - startPos));
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        onResizeEnd?.(lastSize);
        document.removeEventListener('mousemove', trackingMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', trackingMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [disabled, direction, currentSize, minSize, maxSize, updateSize, onResizeStart, onResizeEnd],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      const isHorizontal = direction === 'horizontal';
      let newSize = currentSize;

      switch (e.key) {
        case isHorizontal ? 'ArrowRight' : 'ArrowDown':
          e.preventDefault();
          newSize = currentSize + KEYBOARD_STEP;
          break;
        case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
          e.preventDefault();
          newSize = currentSize - KEYBOARD_STEP;
          break;
        case 'Home':
          e.preventDefault();
          newSize = minSize;
          break;
        case 'End':
          e.preventDefault();
          newSize = maxSize;
          break;
        default:
          return;
      }
      updateSize(newSize);
    },
    [disabled, direction, currentSize, minSize, maxSize, updateSize],
  );

  const handleDoubleClick = useCallback(() => {
    if (disabled) return;
    updateSize(defaultSize ?? DEFAULT_SIZE);
  }, [disabled, defaultSize, updateSize]);

  const isHorizontal = direction === 'horizontal';
  const primaryStyle: React.CSSProperties = isHorizontal
    ? { width: `${currentSize}px`, minWidth: `${minSize}px`, maxWidth: `${maxSize}px` }
    : { height: `${currentSize}px`, minHeight: `${minSize}px`, maxHeight: `${maxSize}px` };

  const handleStyle: React.CSSProperties = isHorizontal
    ? { width: `${handleSize}px` }
    : { height: `${handleSize}px` };

  return (
    <div
      ref={containerRef}
      className={`resizable-panel resizable-panel--${direction} ${disabled ? 'resizable-panel--disabled' : ''} ${className ?? ''}`}
      data-testid="resizable-panel"
    >
      <div
        className="resizable-panel__primary"
        style={primaryStyle}
        data-testid="resizable-panel-primary"
      >
        {children}
      </div>
      <div
        className={`resizable-panel__handle resizable-panel__handle--${direction}`}
        style={handleStyle}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        role="separator"
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={currentSize}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-label={ariaLabel ?? '패널 크기 조절'}
        tabIndex={disabled ? -1 : 0}
        data-testid="resizable-panel-handle"
      >
        <div className="resizable-panel__handle-indicator" />
      </div>
      <div
        className="resizable-panel__secondary"
        data-testid="resizable-panel-secondary"
      >
        {secondaryChildren}
      </div>
    </div>
  );
};

export default React.memo(ResizablePanel);
