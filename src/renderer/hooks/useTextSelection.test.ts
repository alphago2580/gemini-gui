import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextSelection } from './useTextSelection';

let selectionChangeHandlers: (() => void)[] = [];
let mockSelection: Partial<Selection> | null = null;

beforeEach(() => {
  selectionChangeHandlers = [];
  mockSelection = {
    toString: () => '',
    isCollapsed: true,
    anchorNode: null,
    focusNode: null,
    rangeCount: 0,
    getRangeAt: vi.fn(),
    removeAllRanges: vi.fn(),
  };

  vi.spyOn(window, 'getSelection').mockImplementation(() => mockSelection as Selection);
  vi.spyOn(document, 'addEventListener').mockImplementation((event: string, handler: unknown) => {
    if (event === 'selectionchange') {
      selectionChangeHandlers.push(handler as () => void);
    }
  });
  vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function triggerSelectionChange() {
  selectionChangeHandlers.forEach(handler => handler());
}

describe('useTextSelection', () => {
  it('returns default selection state', () => {
    const { result } = renderHook(() => useTextSelection());

    expect(result.current.selection.text).toBe('');
    expect(result.current.selection.isCollapsed).toBe(true);
    expect(result.current.selection.anchorNode).toBeNull();
    expect(result.current.selection.focusNode).toBeNull();
    expect(result.current.selection.rangeCount).toBe(0);
    expect(result.current.selection.rect).toBeNull();
    expect(result.current.hasSelection).toBe(false);
  });

  it('updates when text is selected', () => {
    const { result } = renderHook(() => useTextSelection());

    const textNode = document.createTextNode('Hello World');
    mockSelection = {
      toString: () => 'Hello',
      isCollapsed: false,
      anchorNode: textNode,
      focusNode: textNode,
      rangeCount: 1,
      getRangeAt: vi.fn().mockReturnValue({
        getBoundingClientRect: () => ({ x: 10, y: 20, width: 50, height: 16, top: 20, right: 60, bottom: 36, left: 10 }),
      }),
      removeAllRanges: vi.fn(),
    };

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.selection.text).toBe('Hello');
    expect(result.current.selection.isCollapsed).toBe(false);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.selection.rangeCount).toBe(1);
  });

  it('provides bounding rect for non-collapsed selection', () => {
    const { result } = renderHook(() => useTextSelection());

    const rect = { x: 10, y: 20, width: 100, height: 16, top: 20, right: 110, bottom: 36, left: 10 };
    mockSelection = {
      toString: () => 'selected text',
      isCollapsed: false,
      anchorNode: null,
      focusNode: null,
      rangeCount: 1,
      getRangeAt: vi.fn().mockReturnValue({
        getBoundingClientRect: () => rect,
      }),
      removeAllRanges: vi.fn(),
    };

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.selection.rect).toEqual(rect);
  });

  it('returns null rect when selection is collapsed', () => {
    const { result } = renderHook(() => useTextSelection());

    mockSelection = {
      toString: () => '',
      isCollapsed: true,
      anchorNode: null,
      focusNode: null,
      rangeCount: 1,
      getRangeAt: vi.fn(),
      removeAllRanges: vi.fn(),
    };

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.selection.rect).toBeNull();
  });

  it('clearSelection removes all ranges and resets state', () => {
    const removeAllRanges = vi.fn();
    const { result } = renderHook(() => useTextSelection());

    mockSelection = {
      toString: () => 'some text',
      isCollapsed: false,
      anchorNode: null,
      focusNode: null,
      rangeCount: 1,
      getRangeAt: vi.fn().mockReturnValue({
        getBoundingClientRect: () => ({ x: 0, y: 0, width: 50, height: 16, top: 0, right: 50, bottom: 16, left: 0 }),
      }),
      removeAllRanges,
    };

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.hasSelection).toBe(true);

    // Now clear
    mockSelection = {
      ...mockSelection,
      removeAllRanges,
    };
    act(() => {
      result.current.clearSelection();
    });

    expect(removeAllRanges).toHaveBeenCalled();
    expect(result.current.selection.text).toBe('');
    expect(result.current.hasSelection).toBe(false);
  });

  it('hasSelection is false for empty text', () => {
    const { result } = renderHook(() => useTextSelection());

    mockSelection = {
      toString: () => '',
      isCollapsed: false,
      anchorNode: null,
      focusNode: null,
      rangeCount: 0,
      getRangeAt: vi.fn(),
      removeAllRanges: vi.fn(),
    };

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.hasSelection).toBe(false);
  });

  it('listens to selectionchange event', () => {
    renderHook(() => useTextSelection());

    expect(document.addEventListener).toHaveBeenCalledWith(
      'selectionchange',
      expect.any(Function)
    );
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useTextSelection());

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      'selectionchange',
      expect.any(Function)
    );
  });

  it('handles null getSelection gracefully', () => {
    vi.spyOn(window, 'getSelection').mockReturnValue(null);

    const { result } = renderHook(() => useTextSelection());

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.selection.text).toBe('');
    expect(result.current.hasSelection).toBe(false);
  });

  it('tracks anchorNode and focusNode', () => {
    const { result } = renderHook(() => useTextSelection());

    const anchor = document.createTextNode('anchor');
    const focus = document.createTextNode('focus');
    mockSelection = {
      toString: () => 'text',
      isCollapsed: false,
      anchorNode: anchor,
      focusNode: focus,
      rangeCount: 1,
      getRangeAt: vi.fn().mockReturnValue({
        getBoundingClientRect: () => ({ x: 0, y: 0, width: 40, height: 14, top: 0, right: 40, bottom: 14, left: 0 }),
      }),
      removeAllRanges: vi.fn(),
    };

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.selection.anchorNode).toBe(anchor);
    expect(result.current.selection.focusNode).toBe(focus);
  });

  it('updates rangeCount correctly', () => {
    const { result } = renderHook(() => useTextSelection());

    mockSelection = {
      toString: () => 'multi range',
      isCollapsed: false,
      anchorNode: null,
      focusNode: null,
      rangeCount: 3,
      getRangeAt: vi.fn().mockReturnValue({
        getBoundingClientRect: () => ({ x: 0, y: 0, width: 80, height: 14, top: 0, right: 80, bottom: 14, left: 0 }),
      }),
      removeAllRanges: vi.fn(),
    };

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.selection.rangeCount).toBe(3);
  });

  it('returns null rect when rangeCount is 0', () => {
    const { result } = renderHook(() => useTextSelection());

    mockSelection = {
      toString: () => '',
      isCollapsed: true,
      anchorNode: null,
      focusNode: null,
      rangeCount: 0,
      getRangeAt: vi.fn(),
      removeAllRanges: vi.fn(),
    };

    act(() => {
      triggerSelectionChange();
    });

    expect(result.current.selection.rect).toBeNull();
  });

  it('clearSelection is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useTextSelection());
    const firstClear = result.current.clearSelection;
    rerender();
    expect(result.current.clearSelection).toBe(firstClear);
  });
});
