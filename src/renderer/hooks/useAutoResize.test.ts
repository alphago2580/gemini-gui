import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoResize } from './useAutoResize';

describe('useAutoResize', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a ref object and resize function', () => {
    const { result } = renderHook(() => useAutoResize(''));
    expect(result.current.textareaRef).toBeDefined();
    expect(result.current.resize).toBeInstanceOf(Function);
  });

  it('ref is initially null', () => {
    const { result } = renderHook(() => useAutoResize(''));
    expect(result.current.textareaRef.current).toBeNull();
  });

  it('sets textarea height based on scrollHeight', () => {
    const { result } = renderHook(() => useAutoResize('hello'));
    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 80,
    } as unknown as HTMLTextAreaElement;

    // Simulate attaching the ref
    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    expect(mockTextarea.style.height).toBe('80px');
    expect(mockTextarea.style.overflowY).toBe('hidden');
  });

  it('clamps height to minimum of 44px', () => {
    const { result } = renderHook(() => useAutoResize(''));
    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 20,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    expect(mockTextarea.style.height).toBe('44px');
  });

  it('clamps height to maximum of 200px and enables scrolling', () => {
    const { result } = renderHook(() => useAutoResize(''));
    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 500,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    expect(mockTextarea.style.height).toBe('200px');
    expect(mockTextarea.style.overflowY).toBe('auto');
  });

  it('does nothing if ref is null', () => {
    const { result } = renderHook(() => useAutoResize(''));
    // ref.current is null by default, resize should not throw
    expect(() => {
      act(() => {
        result.current.resize();
      });
    }).not.toThrow();
  });

  it('reacts to value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAutoResize(value),
      { initialProps: { value: '' } }
    );

    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 44,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    // After rerender with new value, effect should re-run
    Object.defineProperty(mockTextarea, 'scrollHeight', { value: 120, writable: true });

    rerender({ value: 'multi\nline\ntext' });

    expect(mockTextarea.style.height).toBe('120px');
  });

  it('sets overflowY to hidden when height is below max', () => {
    const { result } = renderHook(() => useAutoResize('test'));
    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 100,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    expect(mockTextarea.style.overflowY).toBe('hidden');
  });

  it('sets overflowY to auto when height equals max', () => {
    const { result } = renderHook(() => useAutoResize('test'));
    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 200,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    expect(mockTextarea.style.overflowY).toBe('auto');
  });

  it('resets height to min before measuring scrollHeight', () => {
    const { result } = renderHook(() => useAutoResize('test'));
    const heights: string[] = [];
    const mockTextarea = {
      style: {
        _height: '',
        get height() { return this._height; },
        set height(v: string) { heights.push(v); this._height = v; },
        overflowY: '',
      },
      scrollHeight: 80,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    // First set should be reset to 44px, second should be actual height
    expect(heights[0]).toBe('44px');
    expect(heights[1]).toBe('80px');
  });

  it('handles exact min height (44px scrollHeight)', () => {
    const { result } = renderHook(() => useAutoResize(''));
    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 44,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    expect(mockTextarea.style.height).toBe('44px');
    expect(mockTextarea.style.overflowY).toBe('hidden');
  });

  it('resize function is stable across rerenders', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAutoResize(value),
      { initialProps: { value: '' } }
    );
    const firstResize = result.current.resize;
    rerender({ value: 'changed' });
    expect(result.current.resize).toBe(firstResize);
  });

  it('textareaRef is same object across rerenders', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAutoResize(value),
      { initialProps: { value: '' } }
    );
    const firstRef = result.current.textareaRef;
    rerender({ value: 'changed' });
    expect(result.current.textareaRef).toBe(firstRef);
  });

  it('handles scrollHeight just above max (201px)', () => {
    const { result } = renderHook(() => useAutoResize(''));
    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 201,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    expect(mockTextarea.style.height).toBe('200px');
    expect(mockTextarea.style.overflowY).toBe('auto');
  });

  it('handles scrollHeight at boundary just below max (199px)', () => {
    const { result } = renderHook(() => useAutoResize(''));
    const mockTextarea = {
      style: { height: '', overflowY: '' },
      scrollHeight: 199,
    } as unknown as HTMLTextAreaElement;

    Object.defineProperty(result.current.textareaRef, 'current', {
      value: mockTextarea,
      writable: true,
    });

    act(() => {
      result.current.resize();
    });

    expect(mockTextarea.style.height).toBe('199px');
    expect(mockTextarea.style.overflowY).toBe('hidden');
  });
});
