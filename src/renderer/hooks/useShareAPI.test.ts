import { renderHook, act } from '@testing-library/react';
import { useShareAPI } from './useShareAPI';

let mockShare: ReturnType<typeof vi.fn>;
let mockCanShare: ReturnType<typeof vi.fn>;

function setupShareAPI() {
  mockShare = vi.fn().mockResolvedValue(undefined);
  mockCanShare = vi.fn().mockReturnValue(true);
  Object.defineProperty(navigator, 'share', {
    value: mockShare,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(navigator, 'canShare', {
    value: mockCanShare,
    configurable: true,
    writable: true,
  });
}

function removeShareAPI() {
  delete (navigator as Record<string, unknown>).share;
  delete (navigator as Record<string, unknown>).canShare;
}

beforeEach(() => {
  setupShareAPI();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useShareAPI', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useShareAPI());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isSharing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('reports isFileShareSupported', () => {
    const { result } = renderHook(() => useShareAPI());
    expect(result.current.isFileShareSupported).toBe(true);
  });

  it('shares data successfully', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useShareAPI({ onSuccess }));

    let success = false;
    await act(async () => {
      success = await result.current.share({ title: 'Test', text: 'Hello' });
    });

    expect(success).toBe(true);
    expect(mockShare).toHaveBeenCalledWith({ title: 'Test', text: 'Hello' });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('handles share rejection (user cancel)', async () => {
    mockShare.mockRejectedValue(new Error('AbortError'));
    const onError = vi.fn();
    const { result } = renderHook(() => useShareAPI({ onError }));

    let success = false;
    await act(async () => {
      success = await result.current.share({ title: 'Test' });
    });

    expect(success).toBe(false);
    expect(result.current.error?.message).toBe('AbortError');
    expect(onError).toHaveBeenCalled();
  });

  it('reports unsupported', () => {
    removeShareAPI();
    const { result } = renderHook(() => useShareAPI());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isFileShareSupported).toBe(false);
    setupShareAPI();
  });

  it('returns false when unsupported', async () => {
    removeShareAPI();
    const onError = vi.fn();
    const { result } = renderHook(() => useShareAPI({ onError }));

    let success = false;
    await act(async () => {
      success = await result.current.share({ title: 'Test' });
    });

    expect(success).toBe(false);
    expect(result.current.error?.message).toBe('Web Share API is not supported');
    expect(onError).toHaveBeenCalled();
    setupShareAPI();
  });

  it('canShare checks via navigator.canShare', () => {
    mockCanShare.mockReturnValue(true);
    const { result } = renderHook(() => useShareAPI());
    expect(result.current.canShare({ title: 'Test' })).toBe(true);

    mockCanShare.mockReturnValue(false);
    expect(result.current.canShare({ url: 'http://test.com' })).toBe(false);
  });

  it('canShare returns false when unsupported', () => {
    removeShareAPI();
    const { result } = renderHook(() => useShareAPI());
    expect(result.current.canShare({ title: 'Test' })).toBe(false);
    setupShareAPI();
  });

  it('shares with URL', async () => {
    const { result } = renderHook(() => useShareAPI());

    await act(async () => {
      await result.current.share({ url: 'https://example.com' });
    });

    expect(mockShare).toHaveBeenCalledWith({ url: 'https://example.com' });
  });

  it('isSharing is false after completion', async () => {
    const { result } = renderHook(() => useShareAPI());

    await act(async () => {
      await result.current.share({ title: 'Test' });
    });

    expect(result.current.isSharing).toBe(false);
  });

  it('isSharing is false after error', async () => {
    mockShare.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useShareAPI());

    await act(async () => {
      await result.current.share({ title: 'Test' });
    });

    expect(result.current.isSharing).toBe(false);
  });

  it('clears error on subsequent successful share', async () => {
    mockShare.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useShareAPI());

    await act(async () => {
      await result.current.share({ title: 'Test' });
    });
    expect(result.current.error).not.toBeNull();

    mockShare.mockResolvedValue(undefined);
    await act(async () => {
      await result.current.share({ title: 'Test' });
    });
    expect(result.current.error).toBeNull();
  });

  it('canShare handles exception from navigator.canShare', () => {
    mockCanShare.mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const { result } = renderHook(() => useShareAPI());
    expect(result.current.canShare({ title: 'Test' })).toBe(false);
  });
});
