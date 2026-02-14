import { renderHook, act, waitFor } from '@testing-library/react';
import { useClipboardMonitor } from './useClipboardMonitor';

let mockReadText: ReturnType<typeof vi.fn>;

function setupClipboardAPI(initialText = '') {
  mockReadText = vi.fn().mockResolvedValue(initialText);
  Object.defineProperty(navigator, 'clipboard', {
    value: { readText: mockReadText },
    configurable: true,
    writable: true,
  });
}

function removeClipboardAPI() {
  if ('clipboard' in navigator) {
    delete (navigator as unknown as Record<string, unknown>).clipboard;
  }
}

beforeEach(() => {
  setupClipboardAPI('');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useClipboardMonitor', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useClipboardMonitor());
    expect(result.current.content.text).toBeNull();
    expect(result.current.content.hasContent).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('reports isSupported', () => {
    const { result } = renderHook(() => useClipboardMonitor());
    expect(result.current.isSupported).toBe(true);
  });

  it('reads clipboard manually', async () => {
    mockReadText.mockResolvedValue('hello');
    const { result } = renderHook(() => useClipboardMonitor());

    await act(async () => {
      await result.current.read();
    });

    expect(result.current.content.text).toBe('hello');
    expect(result.current.content.hasContent).toBe(true);
    expect(result.current.content.lastRead).toBeGreaterThan(0);
  });

  it('calls onChange when content changes', async () => {
    mockReadText.mockResolvedValue('new text');
    const onChange = vi.fn();
    const { result } = renderHook(() => useClipboardMonitor({ onChange }));

    await act(async () => {
      await result.current.read();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].text).toBe('new text');
  });

  it('does not call onChange for same content', async () => {
    mockReadText.mockResolvedValue('same');
    const onChange = vi.fn();
    const { result } = renderHook(() => useClipboardMonitor({ onChange }));

    await act(async () => {
      await result.current.read();
    });
    await act(async () => {
      await result.current.read();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('handles read error', async () => {
    mockReadText.mockRejectedValue(new Error('Permission denied'));
    const { result } = renderHook(() => useClipboardMonitor());

    await act(async () => {
      await result.current.read();
    });

    expect(result.current.error?.message).toBe('Permission denied');
  });

  it('reports unsupported when API unavailable', () => {
    removeClipboardAPI();
    const { result } = renderHook(() => useClipboardMonitor());
    expect(result.current.isSupported).toBe(false);
    setupClipboardAPI();
  });

  it('sets error when reading on unsupported', async () => {
    removeClipboardAPI();
    const { result } = renderHook(() => useClipboardMonitor());

    await act(async () => {
      await result.current.read();
    });

    expect(result.current.error?.message).toBe('Clipboard API is not supported');
    setupClipboardAPI();
  });

  it('polls at interval', async () => {
    vi.useFakeTimers();
    mockReadText.mockResolvedValue('polled');

    renderHook(() => useClipboardMonitor({ pollInterval: 1000 }));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockReadText).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('does not poll when disabled', () => {
    vi.useFakeTimers();
    renderHook(() => useClipboardMonitor({ pollInterval: 1000, enabled: false }));

    vi.advanceTimersByTime(3000);
    expect(mockReadText).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('reads on window focus', async () => {
    mockReadText.mockResolvedValue('focused');
    renderHook(() => useClipboardMonitor());

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(mockReadText).toHaveBeenCalled();
    });
  });

  it('cleans up listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useClipboardMonitor());
    expect(addSpy).toHaveBeenCalledWith('focus', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('focus', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('clears error on successful read', async () => {
    mockReadText.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useClipboardMonitor());

    await act(async () => {
      await result.current.read();
    });
    expect(result.current.error).not.toBeNull();

    mockReadText.mockResolvedValue('success');
    await act(async () => {
      await result.current.read();
    });
    expect(result.current.error).toBeNull();
  });
});
