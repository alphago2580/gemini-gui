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
});
