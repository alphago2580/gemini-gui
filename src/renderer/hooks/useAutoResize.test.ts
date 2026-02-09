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
});
