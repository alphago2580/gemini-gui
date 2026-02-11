import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from './useDragAndDrop';

function createDragEvent(overrides: Partial<React.DragEvent> = {}): React.DragEvent {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      files: [] as unknown as FileList,
    },
    ...overrides,
  } as unknown as React.DragEvent;
}

function createFileList(files: File[]): FileList {
  const list = {
    length: files.length,
    item: (i: number) => files[i] || null,
    [Symbol.iterator]: function* () {
      for (const f of files) yield f;
    },
  } as unknown as FileList;
  for (let i = 0; i < files.length; i++) {
    (list as any)[i] = files[i];
  }
  return list;
}

describe('useDragAndDrop', () => {
  it('initializes with isDragging and isOver as false', () => {
    const { result } = renderHook(() => useDragAndDrop());
    expect(result.current.isDragging).toBe(false);
    expect(result.current.isOver).toBe(false);
  });

  it('returns dragProps with all event handlers', () => {
    const { result } = renderHook(() => useDragAndDrop());
    expect(typeof result.current.dragProps.onDragEnter).toBe('function');
    expect(typeof result.current.dragProps.onDragOver).toBe('function');
    expect(typeof result.current.dragProps.onDragLeave).toBe('function');
    expect(typeof result.current.dragProps.onDrop).toBe('function');
  });

  it('sets isDragging and isOver to true on dragEnter', () => {
    const { result } = renderHook(() => useDragAndDrop());
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    expect(result.current.isDragging).toBe(true);
    expect(result.current.isOver).toBe(true);
  });

  it('calls preventDefault and stopPropagation on dragEnter', () => {
    const { result } = renderHook(() => useDragAndDrop());
    const e = createDragEvent();
    act(() => {
      result.current.dragProps.onDragEnter(e);
    });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it('calls preventDefault and stopPropagation on dragOver', () => {
    const { result } = renderHook(() => useDragAndDrop());
    const e = createDragEvent();
    act(() => {
      result.current.dragProps.onDragOver(e);
    });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it('resets state on dragLeave when counter reaches 0', () => {
    const { result } = renderHook(() => useDragAndDrop());
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    expect(result.current.isOver).toBe(true);

    act(() => {
      result.current.dragProps.onDragLeave(createDragEvent());
    });
    expect(result.current.isDragging).toBe(false);
    expect(result.current.isOver).toBe(false);
  });

  it('handles nested drag enter/leave with counter', () => {
    const { result } = renderHook(() => useDragAndDrop());
    // Enter parent
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    // Enter child
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    expect(result.current.isOver).toBe(true);

    // Leave child
    act(() => {
      result.current.dragProps.onDragLeave(createDragEvent());
    });
    // Still over because counter is 1
    expect(result.current.isOver).toBe(true);

    // Leave parent
    act(() => {
      result.current.dragProps.onDragLeave(createDragEvent());
    });
    expect(result.current.isOver).toBe(false);
  });

  it('calls onDragEnter callback on first enter', () => {
    const onDragEnter = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onDragEnter }));
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    expect(onDragEnter).toHaveBeenCalledTimes(1);

    // Second enter should not call again
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    expect(onDragEnter).toHaveBeenCalledTimes(1);
  });

  it('calls onDragLeave callback when counter reaches 0', () => {
    const onDragLeave = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onDragLeave }));
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    act(() => {
      result.current.dragProps.onDragLeave(createDragEvent());
    });
    expect(onDragLeave).toHaveBeenCalledTimes(1);
  });

  it('resets state and calls onDrop with files on drop', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onDrop }));
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const files = createFileList([file]);

    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    act(() => {
      result.current.dragProps.onDrop(createDragEvent({
        dataTransfer: { files } as unknown as DataTransfer,
      }));
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.isOver).toBe(false);
    expect(onDrop).toHaveBeenCalledWith([file]);
  });

  it('does not call onDrop for empty file list', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onDrop }));
    const files = createFileList([]);

    act(() => {
      result.current.dragProps.onDrop(createDragEvent({
        dataTransfer: { files } as unknown as DataTransfer,
      }));
    });

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('filters files by MIME type when accept is specified', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({
      onDrop,
      accept: ['image/*'],
    }));
    const imgFile = new File(['img'], 'photo.png', { type: 'image/png' });
    const txtFile = new File(['text'], 'doc.txt', { type: 'text/plain' });
    const files = createFileList([imgFile, txtFile]);

    act(() => {
      result.current.dragProps.onDrop(createDragEvent({
        dataTransfer: { files } as unknown as DataTransfer,
      }));
    });

    expect(onDrop).toHaveBeenCalledWith([imgFile]);
  });

  it('does not call onDrop when no files match accept filter', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({
      onDrop,
      accept: ['image/*'],
    }));
    const txtFile = new File(['text'], 'doc.txt', { type: 'text/plain' });
    const files = createFileList([txtFile]);

    act(() => {
      result.current.dragProps.onDrop(createDragEvent({
        dataTransfer: { files } as unknown as DataTransfer,
      }));
    });

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('accepts exact MIME type match', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({
      onDrop,
      accept: ['text/plain'],
    }));
    const txtFile = new File(['text'], 'doc.txt', { type: 'text/plain' });
    const htmlFile = new File(['html'], 'page.html', { type: 'text/html' });
    const files = createFileList([txtFile, htmlFile]);

    act(() => {
      result.current.dragProps.onDrop(createDragEvent({
        dataTransfer: { files } as unknown as DataTransfer,
      }));
    });

    expect(onDrop).toHaveBeenCalledWith([txtFile]);
  });

  it('accepts wildcard */* pattern', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({
      onDrop,
      accept: ['*/*'],
    }));
    const file = new File(['data'], 'file.bin', { type: 'application/octet-stream' });
    const files = createFileList([file]);

    act(() => {
      result.current.dragProps.onDrop(createDragEvent({
        dataTransfer: { files } as unknown as DataTransfer,
      }));
    });

    expect(onDrop).toHaveBeenCalledWith([file]);
  });

  it('returns stable dragProps reference', () => {
    const { result, rerender } = renderHook(() => useDragAndDrop());
    const first = result.current.dragProps;
    rerender();
    expect(result.current.dragProps).toBe(first);
  });

  it('drop resets dragCounter to 0', () => {
    const { result } = renderHook(() => useDragAndDrop());
    // Enter twice (nested)
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    expect(result.current.isOver).toBe(true);

    // Drop resets everything
    act(() => {
      result.current.dragProps.onDrop(createDragEvent());
    });
    expect(result.current.isOver).toBe(false);
    expect(result.current.isDragging).toBe(false);
  });

  it('drop calls preventDefault and stopPropagation', () => {
    const { result } = renderHook(() => useDragAndDrop());
    const e = createDragEvent();
    act(() => {
      result.current.dragProps.onDrop(e);
    });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it('dragLeave calls preventDefault and stopPropagation', () => {
    const { result } = renderHook(() => useDragAndDrop());
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    const e = createDragEvent();
    act(() => {
      result.current.dragProps.onDragLeave(e);
    });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it('multiple accept patterns work together', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({
      onDrop,
      accept: ['image/*', 'text/plain'],
    }));
    const imgFile = new File(['img'], 'photo.png', { type: 'image/png' });
    const txtFile = new File(['text'], 'doc.txt', { type: 'text/plain' });
    const pdfFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    const files = createFileList([imgFile, txtFile, pdfFile]);

    act(() => {
      result.current.dragProps.onDrop(createDragEvent({
        dataTransfer: { files } as unknown as DataTransfer,
      }));
    });

    expect(onDrop).toHaveBeenCalledWith([imgFile, txtFile]);
  });

  it('works without onDrop callback', () => {
    const { result } = renderHook(() => useDragAndDrop());
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const files = createFileList([file]);

    // Should not throw
    act(() => {
      result.current.dragProps.onDrop(createDragEvent({
        dataTransfer: { files } as unknown as DataTransfer,
      }));
    });

    expect(result.current.isDragging).toBe(false);
  });

  it('onDragEnter is not called on subsequent nested enters', () => {
    const onDragEnter = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onDragEnter }));

    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });

    expect(onDragEnter).toHaveBeenCalledTimes(1);
  });

  it('onDragLeave not called when counter is still positive', () => {
    const onDragLeave = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onDragLeave }));

    // Enter twice
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });
    act(() => {
      result.current.dragProps.onDragEnter(createDragEvent());
    });

    // Leave once - counter goes to 1, not 0
    act(() => {
      result.current.dragProps.onDragLeave(createDragEvent());
    });

    expect(onDragLeave).not.toHaveBeenCalled();
    expect(result.current.isOver).toBe(true);
  });
});
