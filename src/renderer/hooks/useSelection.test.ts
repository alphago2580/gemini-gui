import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSelection } from './useSelection';

// Helper to simulate selectionchange event
function fireSelectionChange() {
  document.dispatchEvent(new Event('selectionchange'));
}

describe('useSelection', () => {
  beforeEach(() => {
    vi.spyOn(window, 'getSelection');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with empty selection state', () => {
    const { result } = renderHook(() => useSelection());
    expect(result.current.text).toBe('');
    expect(result.current.startOffset).toBe(0);
    expect(result.current.endOffset).toBe(0);
    expect(result.current.isCollapsed).toBe(true);
  });

  it('updates selection when text is selected', () => {
    const mockRange = {
      startOffset: 0,
      endOffset: 5,
      commonAncestorContainer: document.body,
    };
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'hello',
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: () => mockRange,
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection());

    act(() => fireSelectionChange());

    expect(result.current.text).toBe('hello');
    expect(result.current.startOffset).toBe(0);
    expect(result.current.endOffset).toBe(5);
    expect(result.current.isCollapsed).toBe(false);
  });

  it('resets when selection is empty', () => {
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => '',
      rangeCount: 1,
      isCollapsed: true,
      getRangeAt: () => ({ startOffset: 0, endOffset: 0, commonAncestorContainer: document.body }),
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection());

    act(() => fireSelectionChange());

    expect(result.current.text).toBe('');
    expect(result.current.isCollapsed).toBe(true);
  });

  it('resets when getSelection returns null', () => {
    vi.spyOn(window, 'getSelection').mockReturnValue(null);

    const { result } = renderHook(() => useSelection());

    act(() => fireSelectionChange());

    expect(result.current.text).toBe('');
  });

  it('resets when rangeCount is 0', () => {
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 0,
      toString: () => '',
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection());

    act(() => fireSelectionChange());

    expect(result.current.text).toBe('');
  });

  it('filters selections outside targetRef', () => {
    const target = document.createElement('div');
    const outside = document.createElement('span');
    const ref = { current: target } as React.RefObject<HTMLElement>;

    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'outside text',
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: () => ({
        startOffset: 0,
        endOffset: 12,
        commonAncestorContainer: outside,
      }),
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection(ref));

    act(() => fireSelectionChange());

    expect(result.current.text).toBe('');
  });

  it('accepts selections inside targetRef', () => {
    const target = document.createElement('div');
    const child = document.createElement('span');
    target.appendChild(child);
    const ref = { current: target } as React.RefObject<HTMLElement>;

    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'inside text',
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: () => ({
        startOffset: 0,
        endOffset: 11,
        commonAncestorContainer: child,
      }),
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection(ref));

    act(() => fireSelectionChange());

    expect(result.current.text).toBe('inside text');
  });

  it('clear() removes selection and resets state', () => {
    const mockRemoveAllRanges = vi.fn();
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'selected',
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: () => ({ startOffset: 0, endOffset: 8, commonAncestorContainer: document.body }),
      removeAllRanges: mockRemoveAllRanges,
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection());

    act(() => fireSelectionChange());
    expect(result.current.text).toBe('selected');

    act(() => result.current.clear());
    expect(mockRemoveAllRanges).toHaveBeenCalled();
    expect(result.current.text).toBe('');
  });

  it('cleans up event listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useSelection());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('registers selectionchange listener on mount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    renderHook(() => useSelection());
    expect(addSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function));
    addSpy.mockRestore();
  });

  it('clear function is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useSelection());
    const first = result.current.clear;
    rerender();
    expect(result.current.clear).toBe(first);
  });

  it('returns correct startOffset and endOffset for mid-text selection', () => {
    const mockRange = {
      startOffset: 5,
      endOffset: 10,
      commonAncestorContainer: document.body,
    };
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'world',
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: () => mockRange,
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection());

    act(() => fireSelectionChange());

    expect(result.current.startOffset).toBe(5);
    expect(result.current.endOffset).toBe(10);
  });

  it('handles targetRef with null current', () => {
    const ref = { current: null } as React.RefObject<HTMLElement | null>;

    const mockRange = {
      startOffset: 0,
      endOffset: 3,
      commonAncestorContainer: document.body,
    };
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'abc',
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: () => mockRange,
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection(ref));

    act(() => fireSelectionChange());

    // null ref means no filtering, selection should be returned
    expect(result.current.text).toBe('abc');
  });

  it('resets to empty state after selection followed by deselection', () => {
    const mockRange = {
      startOffset: 0,
      endOffset: 5,
      commonAncestorContainer: document.body,
    };
    const mockGetSelection = vi.spyOn(window, 'getSelection');

    // First: select text
    mockGetSelection.mockReturnValue({
      toString: () => 'hello',
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: () => mockRange,
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection());

    act(() => fireSelectionChange());
    expect(result.current.text).toBe('hello');

    // Second: deselect (empty string)
    mockGetSelection.mockReturnValue({
      toString: () => '',
      rangeCount: 1,
      isCollapsed: true,
      getRangeAt: () => ({ startOffset: 0, endOffset: 0, commonAncestorContainer: document.body }),
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    act(() => fireSelectionChange());
    expect(result.current.text).toBe('');
    expect(result.current.isCollapsed).toBe(true);
  });

  it('tracks isCollapsed from Selection object', () => {
    const mockRange = {
      startOffset: 3,
      endOffset: 3,
      commonAncestorContainer: document.body,
    };
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'x',
      rangeCount: 1,
      isCollapsed: true,
      getRangeAt: () => mockRange,
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection());

    act(() => fireSelectionChange());

    expect(result.current.isCollapsed).toBe(true);
  });

  it('selection on target element itself is accepted', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;

    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'direct text',
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: () => ({
        startOffset: 0,
        endOffset: 11,
        commonAncestorContainer: target,
      }),
      removeAllRanges: vi.fn(),
    } as unknown as Selection);

    const { result } = renderHook(() => useSelection(ref));

    act(() => fireSelectionChange());

    expect(result.current.text).toBe('direct text');
  });
});
