import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useClickCount } from './useClickCount';

describe('useClickCount', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state with count 0 and single type', () => {
    const { result } = renderHook(() => useClickCount());
    expect(result.current.count).toBe(0);
    expect(result.current.clickType).toBe('single');
  });

  it('detects single click on element', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref));

    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(1);
    expect(result.current.clickType).toBe('single');
  });

  it('detects double click', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref, 300));

    act(() => {
      div.click();
    });

    vi.spyOn(Date, 'now').mockReturnValue(1100);

    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(2);
    expect(result.current.clickType).toBe('double');
  });

  it('detects triple click', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref, 300));

    act(() => {
      div.click();
    });

    vi.spyOn(Date, 'now').mockReturnValue(1100);
    act(() => {
      div.click();
    });

    vi.spyOn(Date, 'now').mockReturnValue(1200);
    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(3);
    expect(result.current.clickType).toBe('triple');
  });

  it('resets count after threshold expires', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref, 300));

    act(() => {
      div.click();
    });
    expect(result.current.count).toBe(1);

    // Click after threshold
    vi.spyOn(Date, 'now').mockReturnValue(1500);
    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(1);
    expect(result.current.clickType).toBe('single');
  });

  it('reset() sets count back to 0', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref));

    act(() => {
      div.click();
    });
    expect(result.current.count).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
    expect(result.current.clickType).toBe('single');
  });

  it('counts beyond triple as triple type', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref, 500));

    for (let i = 0; i < 5; i++) {
      vi.spyOn(Date, 'now').mockReturnValue(1000 + i * 50);
      act(() => {
        div.click();
      });
    }

    expect(result.current.count).toBe(5);
    expect(result.current.clickType).toBe('triple');
  });

  it('uses default threshold of 300ms', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref));

    act(() => {
      div.click();
    });

    // Within 300ms
    vi.spyOn(Date, 'now').mockReturnValue(1200);
    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(2);

    // Outside 300ms from last click
    vi.spyOn(Date, 'now').mockReturnValue(1600);
    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(1);
  });

  it('custom threshold works', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref, 100));

    act(() => {
      div.click();
    });

    vi.spyOn(Date, 'now').mockReturnValue(1050);
    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(2);

    // Over threshold of 100ms
    vi.spyOn(Date, 'now').mockReturnValue(1200);
    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(1);
  });

  it('return shape matches ClickCountResult', () => {
    const { result } = renderHook(() => useClickCount());
    expect(result.current).toHaveProperty('count');
    expect(result.current).toHaveProperty('clickType');
    expect(result.current).toHaveProperty('reset');
    expect(typeof result.current.reset).toBe('function');
  });

  it('handles null ref', () => {
    const ref = { current: null };
    const { result } = renderHook(() => useClickCount(ref));

    expect(result.current.count).toBe(0);
    expect(result.current.clickType).toBe('single');
  });

  it('click right at threshold boundary counts as continuation', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref, 300));

    act(() => {
      div.click();
    });

    // Exactly at threshold
    vi.spyOn(Date, 'now').mockReturnValue(1300);
    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(2);
  });

  it('removes event listener on unmount', () => {
    const div = document.createElement('div');
    const removeListenerSpy = vi.spyOn(div, 'removeEventListener');
    const ref = { current: div };
    const { unmount } = renderHook(() => useClickCount(ref));

    unmount();

    expect(removeListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    removeListenerSpy.mockRestore();
  });

  it('does not leak listeners when element changes', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    const removeSpy1 = vi.spyOn(div1, 'removeEventListener');
    const ref = { current: div1 as HTMLElement | null };

    const { rerender } = renderHook(() => useClickCount(ref));

    // Change the element
    ref.current = div2;
    rerender();

    // Old listener should have been removed
    expect(removeSpy1).toHaveBeenCalledWith('click', expect.any(Function));
    removeSpy1.mockRestore();
  });

  it('click just past threshold resets', () => {
    const div = document.createElement('div');
    const ref = { current: div };
    const { result } = renderHook(() => useClickCount(ref, 300));

    act(() => {
      div.click();
    });

    // Just past threshold
    vi.spyOn(Date, 'now').mockReturnValue(1301);
    act(() => {
      div.click();
    });

    expect(result.current.count).toBe(1);
  });
});
