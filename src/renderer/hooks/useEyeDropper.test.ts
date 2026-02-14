import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEyeDropper } from './useEyeDropper';

let mockOpen: ReturnType<typeof vi.fn>;

describe('useEyeDropper', () => {
  beforeEach(() => {
    mockOpen = vi.fn().mockResolvedValue({ sRGBHex: '#ff0000' });
    const win = window as unknown as Record<string, unknown>;
    win.EyeDropper = vi.fn(function () {
      return { open: mockOpen };
    });
  });

  afterEach(() => {
    const win = window as unknown as Record<string, unknown>;
    delete win.EyeDropper;
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useEyeDropper());
    expect(result.current.color).toBeNull();
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('detects unsupported browser', () => {
    const win = window as unknown as Record<string, unknown>;
    delete win.EyeDropper;
    const { result } = renderHook(() => useEyeDropper());
    expect(result.current.isSupported).toBe(false);
  });

  it('opens and picks color', async () => {
    const { result } = renderHook(() => useEyeDropper());
    let picked: string | null = null;

    await act(async () => {
      picked = await result.current.open();
    });

    expect(picked).toBe('#ff0000');
    expect(result.current.color).toBe('#ff0000');
    expect(result.current.isOpen).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    mockOpen.mockRejectedValue(new Error('user cancelled'));
    const { result } = renderHook(() => useEyeDropper());

    await act(async () => {
      await result.current.open();
    });

    expect(result.current.color).toBeNull();
    expect(result.current.error?.message).toBe('user cancelled');
    expect(result.current.isOpen).toBe(false);
  });

  it('handles non-Error thrown value', async () => {
    mockOpen.mockRejectedValue('string error');
    const { result } = renderHook(() => useEyeDropper());

    await act(async () => {
      await result.current.open();
    });

    expect(result.current.error?.message).toBe('string error');
  });

  it('returns null when unsupported', async () => {
    const win = window as unknown as Record<string, unknown>;
    delete win.EyeDropper;
    const { result } = renderHook(() => useEyeDropper());

    let picked: string | null = 'not null';
    await act(async () => {
      picked = await result.current.open();
    });

    expect(picked).toBeNull();
    expect(result.current.error?.message).toBe('EyeDropper API is not supported');
  });

  it('resets state', async () => {
    const { result } = renderHook(() => useEyeDropper());

    await act(async () => {
      await result.current.open();
    });
    expect(result.current.color).toBe('#ff0000');

    act(() => result.current.reset());
    expect(result.current.color).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it('picks different colors', async () => {
    const { result } = renderHook(() => useEyeDropper());

    mockOpen.mockResolvedValueOnce({ sRGBHex: '#00ff00' });
    await act(async () => {
      await result.current.open();
    });
    expect(result.current.color).toBe('#00ff00');

    mockOpen.mockResolvedValueOnce({ sRGBHex: '#0000ff' });
    await act(async () => {
      await result.current.open();
    });
    expect(result.current.color).toBe('#0000ff');
  });
});
