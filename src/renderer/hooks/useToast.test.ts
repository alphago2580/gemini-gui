import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast', () => {
  it('starts with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'Something went wrong');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('error');
    expect(result.current.toasts[0].message).toBe('Something went wrong');
  });

  it('adds multiple toasts', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'Error 1');
      result.current.addToast('success', 'Success 1');
      result.current.addToast('info', 'Info 1');
    });
    expect(result.current.toasts).toHaveLength(3);
  });

  it('dismisses a toast by id', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'Error to dismiss');
    });
    const toastId = result.current.toasts[0].id;
    act(() => {
      result.current.dismissToast(toastId);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('only dismisses the targeted toast', () => {
    const { result } = renderHook(() => useToast());
    vi.spyOn(Date, 'now').mockReturnValueOnce(1).mockReturnValueOnce(2);
    act(() => {
      result.current.addToast('error', 'Keep this');
      result.current.addToast('success', 'Dismiss this');
    });
    const secondId = result.current.toasts[1].id;
    act(() => {
      result.current.dismissToast(secondId);
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Keep this');
    vi.restoreAllMocks();
  });

  it('generates unique ids for each toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'Toast 1');
      result.current.addToast('error', 'Toast 2');
    });
    expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
  });
});
