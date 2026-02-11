import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboardHistory } from './useClipboardHistory';

describe('useClipboardHistory', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('starts with empty history', () => {
    const { result } = renderHook(() => useClipboardHistory());
    expect(result.current.history).toEqual([]);
    expect(result.current.latest).toBeNull();
  });

  it('adds text to history', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('hello'));
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].text).toBe('hello');
    expect(result.current.latest?.text).toBe('hello');
  });

  it('adds newest items first', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('first'));
    act(() => result.current.add('second'));

    expect(result.current.history[0].text).toBe('second');
    expect(result.current.history[1].text).toBe('first');
  });

  it('deduplicates entries by moving to top', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('alpha'));
    act(() => result.current.add('beta'));
    act(() => result.current.add('alpha'));

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].text).toBe('alpha');
    expect(result.current.history[1].text).toBe('beta');
  });

  it('ignores empty or whitespace-only text', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add(''));
    act(() => result.current.add('   '));

    expect(result.current.history).toHaveLength(0);
  });

  it('respects maxItems', () => {
    const { result } = renderHook(() => useClipboardHistory({ maxItems: 3 }));

    act(() => result.current.add('one'));
    act(() => result.current.add('two'));
    act(() => result.current.add('three'));
    act(() => result.current.add('four'));

    expect(result.current.history).toHaveLength(3);
    expect(result.current.history[0].text).toBe('four');
    expect(result.current.history[2].text).toBe('two');
  });

  it('removes entry by id', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('test'));
    const id = result.current.history[0].id;

    act(() => result.current.remove(id));
    expect(result.current.history).toHaveLength(0);
  });

  it('clears all history', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('one'));
    act(() => result.current.add('two'));

    act(() => result.current.clear());
    expect(result.current.history).toEqual([]);
    expect(result.current.latest).toBeNull();
  });

  it('copies from history to clipboard', async () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('copy me'));
    const id = result.current.history[0].id;

    let success = false;
    await act(async () => {
      success = await result.current.copyFromHistory(id);
    });

    expect(success).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
  });

  it('returns false when copying non-existent entry', async () => {
    const { result } = renderHook(() => useClipboardHistory());

    let success = true;
    await act(async () => {
      success = await result.current.copyFromHistory('fake-id');
    });

    expect(success).toBe(false);
  });

  it('returns false when clipboard write fails', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>)
      .mockRejectedValue(new Error('denied'));

    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('fail'));
    const id = result.current.history[0].id;

    let success = true;
    await act(async () => {
      success = await result.current.copyFromHistory(id);
    });

    expect(success).toBe(false);
  });

  it('entries have timestamps', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('timed'));
    expect(result.current.history[0].timestamp).toBeGreaterThan(0);
  });

  it('entries have unique ids', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => result.current.add('first'));
    act(() => result.current.add('second'));

    const ids = result.current.history.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
