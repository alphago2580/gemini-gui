import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with copied=false and no error', () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets copied=true after successful copy', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const success = await result.current.copy('hello');
      expect(success).toBe(true);
    });
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('calls navigator.clipboard.writeText with the text', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy('test text');
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
  });

  it('resets copied after the default delay (2000ms)', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy('hello');
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.copied).toBe(false);
  });

  it('resets copied after a custom delay', async () => {
    const { result } = renderHook(() => useClipboard(500));
    await act(async () => {
      await result.current.copy('hello');
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it('sets error on clipboard failure', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Permission denied')
    );
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const success = await result.current.copy('hello');
      expect(success).toBe(false);
    });
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe('Permission denied');
  });

  it('sets fallback error message for non-Error rejects', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce('unknown');
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const success = await result.current.copy('hello');
      expect(success).toBe(false);
    });
    expect(result.current.error).toBe('Copy failed');
  });

  it('clears previous error on successful copy', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('fail');
    });
    expect(result.current.error).toBe('fail');

    await act(async () => {
      await result.current.copy('success');
    });
    expect(result.current.error).toBeNull();
    expect(result.current.copied).toBe(true);
  });

  it('resets timer when copying again before reset', async () => {
    const { result } = renderHook(() => useClipboard(1000));
    await act(async () => {
      await result.current.copy('first');
    });

    // Advance 800ms then copy again
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.copied).toBe(true);

    await act(async () => {
      await result.current.copy('second');
    });

    // 800ms more — total 1600ms from first, but 800ms from second
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.copied).toBe(true);

    // 200ms more — 1000ms from second copy
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.copied).toBe(false);
  });

  it('returns stable copy function reference', () => {
    const { result, rerender } = renderHook(() => useClipboard());
    const firstCopy = result.current.copy;
    rerender();
    expect(result.current.copy).toBe(firstCopy);
  });

  it('copies empty string successfully', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const success = await result.current.copy('');
      expect(success).toBe(true);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
    expect(result.current.copied).toBe(true);
  });

  it('copies string with special characters', async () => {
    const { result } = renderHook(() => useClipboard());
    const specialText = '<script>alert("xss")</script>';
    await act(async () => {
      await result.current.copy(specialText);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(specialText);
  });

  it('copies multiline text', async () => {
    const { result } = renderHook(() => useClipboard());
    const multiline = 'line 1\nline 2\nline 3';
    await act(async () => {
      const success = await result.current.copy(multiline);
      expect(success).toBe(true);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(multiline);
  });

  it('copied stays false before delay even after success', async () => {
    const { result } = renderHook(() => useClipboard(5000));
    await act(async () => {
      await result.current.copy('test');
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it('error is cleared on next successful copy', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('first fail'));

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('fail');
    });
    expect(result.current.error).toBe('first fail');

    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(undefined);

    await act(async () => {
      await result.current.copy('success');
    });
    expect(result.current.error).toBeNull();
    expect(result.current.copied).toBe(true);
  });

  it('multiple rapid copies only keeps last timer', async () => {
    const { result } = renderHook(() => useClipboard(300));

    await act(async () => {
      await result.current.copy('a');
    });
    await act(async () => {
      await result.current.copy('b');
    });
    await act(async () => {
      await result.current.copy('c');
    });

    expect(result.current.copied).toBe(true);

    // After 300ms from last copy, it resets
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.copied).toBe(false);
  });

  it('zero delay resets copied immediately', async () => {
    const { result } = renderHook(() => useClipboard(0));
    await act(async () => {
      await result.current.copy('test');
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current.copied).toBe(false);
  });
});
