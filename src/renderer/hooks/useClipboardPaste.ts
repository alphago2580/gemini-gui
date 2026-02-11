import { useEffect, useCallback, useRef } from 'react';

export interface PasteData {
  /** Plain text content, if any */
  text: string | null;
  /** HTML content, if any */
  html: string | null;
  /** Image files pasted */
  images: File[];
  /** Non-image files pasted */
  files: File[];
  /** Whether the paste contained any data */
  hasContent: boolean;
}

export interface UseClipboardPasteOptions {
  /** Target element ref - if not provided, listens on document */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Only accept specific MIME types (e.g., ['image/png', 'text/plain']) */
  acceptTypes?: string[];
  /** Called when paste is detected */
  onPaste?: (data: PasteData) => void;
  /** Whether the hook is active */
  enabled?: boolean;
}

function matchesType(type: string, acceptTypes?: string[]): boolean {
  if (!acceptTypes || acceptTypes.length === 0) return true;
  return acceptTypes.some((accepted) => {
    if (accepted.endsWith('/*')) {
      const prefix = accepted.slice(0, -1);
      return type.startsWith(prefix);
    }
    return type === accepted;
  });
}

export function useClipboardPaste(options: UseClipboardPasteOptions = {}): void {
  const { targetRef, acceptTypes, onPaste, enabled = true } = options;
  const onPasteRef = useRef(onPaste);
  onPasteRef.current = onPaste;
  const acceptTypesRef = useRef(acceptTypes);
  acceptTypesRef.current = acceptTypes;

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    let text: string | null = null;
    let html: string | null = null;
    const images: File[] = [];
    const files: File[] = [];

    const rawText = clipboardData.getData('text/plain');
    if (rawText && matchesType('text/plain', acceptTypesRef.current)) {
      text = rawText;
    }

    const rawHtml = clipboardData.getData('text/html');
    if (rawHtml && matchesType('text/html', acceptTypesRef.current)) {
      html = rawHtml;
    }

    const items = clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && matchesType(file.type, acceptTypesRef.current)) {
            if (file.type.startsWith('image/')) {
              images.push(file);
            } else {
              files.push(file);
            }
          }
        }
      }
    }

    const hasContent = text !== null || html !== null || images.length > 0 || files.length > 0;

    if (hasContent) {
      onPasteRef.current?.({ text, html, images, files, hasContent });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef?.current ?? document;
    target.addEventListener('paste', handlePaste as EventListener);
    return () => {
      target.removeEventListener('paste', handlePaste as EventListener);
    };
  }, [enabled, targetRef, handlePaste]);
}
