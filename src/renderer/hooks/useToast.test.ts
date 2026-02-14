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

  it('dismissing non-existent id does not change toasts', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('info', 'Keep me');
    });
    act(() => {
      result.current.dismissToast('non-existent-id');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Keep me');
  });

  it('preserves toast ordering (FIFO)', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'First');
      result.current.addToast('success', 'Second');
      result.current.addToast('info', 'Third');
    });
    expect(result.current.toasts[0].message).toBe('First');
    expect(result.current.toasts[1].message).toBe('Second');
    expect(result.current.toasts[2].message).toBe('Third');
  });

  it('addToast callback is stable across renders', () => {
    const { result, rerender } = renderHook(() => useToast());
    const firstAddFn = result.current.addToast;
    rerender();
    expect(result.current.addToast).toBe(firstAddFn);
  });

  it('dismissToast callback is stable across renders', () => {
    const { result, rerender } = renderHook(() => useToast());
    const firstDismissFn = result.current.dismissToast;
    rerender();
    expect(result.current.dismissToast).toBe(firstDismissFn);
  });

  it('toast ids have toast prefix', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'test');
    });
    expect(result.current.toasts[0].id).toMatch(/^toast-/);
  });

  it('can dismiss first toast and keep rest', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'A');
      result.current.addToast('success', 'B');
      result.current.addToast('info', 'C');
    });
    const firstId = result.current.toasts[0].id;
    act(() => {
      result.current.dismissToast(firstId);
    });
    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].message).toBe('B');
    expect(result.current.toasts[1].message).toBe('C');
  });

  it('can dismiss all toasts sequentially', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'X');
      result.current.addToast('success', 'Y');
    });
    const ids = result.current.toasts.map(t => t.id);
    act(() => {
      ids.forEach(id => result.current.dismissToast(id));
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('each toast type is stored correctly', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'err');
      result.current.addToast('success', 'suc');
      result.current.addToast('info', 'inf');
    });
    expect(result.current.toasts[0].type).toBe('error');
    expect(result.current.toasts[1].type).toBe('success');
    expect(result.current.toasts[2].type).toBe('info');
  });

  describe('addToast with options', () => {
    it('adds a toast with action', () => {
      const { result } = renderHook(() => useToast());
      const onClick = vi.fn();
      act(() => {
        result.current.addToast('info', 'Deleted item', {
          action: { label: '실행취소', onClick },
        });
      });
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].action).toBeDefined();
      expect(result.current.toasts[0].action!.label).toBe('실행취소');
    });

    it('adds a toast with custom duration', () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.addToast('success', 'Saved', { duration: 3000 });
      });
      expect(result.current.toasts[0].duration).toBe(3000);
    });

    it('adds a toast with both action and duration', () => {
      const { result } = renderHook(() => useToast());
      const onClick = vi.fn();
      act(() => {
        result.current.addToast('error', 'Failed', {
          action: { label: '다시 시도', onClick },
          duration: 10000,
        });
      });
      const toast = result.current.toasts[0];
      expect(toast.action!.label).toBe('다시 시도');
      expect(toast.duration).toBe(10000);
    });

    it('adds a toast without options (backwards compatible)', () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.addToast('info', 'Simple toast');
      });
      const toast = result.current.toasts[0];
      expect(toast.action).toBeUndefined();
      expect(toast.duration).toBeUndefined();
    });

    it('does not set duration when options has no duration', () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.addToast('info', 'No duration', {});
      });
      expect(result.current.toasts[0].duration).toBeUndefined();
    });

    it('does not set action when options has no action', () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.addToast('info', 'No action', {});
      });
      expect(result.current.toasts[0].action).toBeUndefined();
    });
  });

  describe('dismissAll', () => {
    it('clears all toasts at once', () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.addToast('error', 'A');
        result.current.addToast('success', 'B');
        result.current.addToast('info', 'C');
      });
      expect(result.current.toasts).toHaveLength(3);
      act(() => {
        result.current.dismissAll();
      });
      expect(result.current.toasts).toHaveLength(0);
    });

    it('is a no-op when toasts are already empty', () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.dismissAll();
      });
      expect(result.current.toasts).toHaveLength(0);
    });

    it('dismissAll callback is stable across renders', () => {
      const { result, rerender } = renderHook(() => useToast());
      const firstDismissAllFn = result.current.dismissAll;
      rerender();
      expect(result.current.dismissAll).toBe(firstDismissAllFn);
    });

    it('can add toasts after dismissAll', () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.addToast('error', 'Before');
      });
      act(() => {
        result.current.dismissAll();
      });
      act(() => {
        result.current.addToast('success', 'After');
      });
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('After');
    });
  });
});
