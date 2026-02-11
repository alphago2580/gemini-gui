import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from './useCopyToClipboard';

describe('useCopyToClipboard', () => {
  let mockWriteText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('copies text to clipboard', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.copy('hello');
    });

    expect(success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('hello');
    expect(result.current.isCopied).toBe(true);
    expect(result.current.copiedText).toBe('hello');
    expect(result.current.isLoading).toBe(false);
  });

  it('resets isCopied after resetDelay', async () => {
    const { result } = renderHook(() =>
      useCopyToClipboard({ resetDelay: 1000 })
    );

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1001);
    });

    expect(result.current.isCopied).toBe(false);
  });

  it('uses default 2000ms resetDelay', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it('handles copy failure', async () => {
    mockWriteText.mockRejectedValue(new Error('Permission denied'));
    const { result } = renderHook(() => useCopyToClipboard());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.copy('hello');
    });

    expect(success).toBe(false);
    expect(result.current.isCopied).toBe(false);
    expect(result.current.error?.message).toBe('Permission denied');
    expect(result.current.isLoading).toBe(false);
  });

  it('calls onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useCopyToClipboard({ onSuccess })
    );

    await act(async () => {
      await result.current.copy('text');
    });

    expect(onSuccess).toHaveBeenCalledWith('text');
  });

  it('calls onError callback', async () => {
    const onError = vi.fn();
    mockWriteText.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() =>
      useCopyToClipboard({ onError })
    );

    await act(async () => {
      await result.current.copy('text');
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toBe('fail');
  });

  it('reset clears all state', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.isCopied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('subsequent copy clears previous timer', async () => {
    const { result } = renderHook(() =>
      useCopyToClipboard({ resetDelay: 1000 })
    );

    await act(async () => {
      await result.current.copy('first');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await act(async () => {
      await result.current.copy('second');
    });

    expect(result.current.copiedText).toBe('second');

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it('handles non-Error rejection', async () => {
    mockWriteText.mockRejectedValue('string error');
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.error?.message).toBe('string error');
  });

  it('clears error on new copy', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('first');
    });
    expect(result.current.error).not.toBeNull();

    mockWriteText.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.copy('second');
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isCopied).toBe(true);
  });

  it('does not reset isCopied when resetDelay is 0', async () => {
    const { result } = renderHook(() =>
      useCopyToClipboard({ resetDelay: 0 })
    );

    await act(async () => {
      await result.current.copy('hello');
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.isCopied).toBe(true);
  });
});
