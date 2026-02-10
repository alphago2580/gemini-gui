import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyCombo, KeyCombo } from './useKeyCombo';

function fireKey(key: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    ctrlKey: modifiers.ctrl || false,
    shiftKey: modifiers.shift || false,
    altKey: modifiers.alt || false,
    metaKey: modifiers.meta || false,
    bubbles: true,
  }));
}

describe('useKeyCombo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers action on matching two-key combo', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['g', 'i'], action }];
    renderHook(() => useKeyCombo(combos));

    fireKey('g');
    fireKey('i');

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('triggers action on matching three-key combo', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['a', 'b', 'c'], action }];
    renderHook(() => useKeyCombo(combos));

    fireKey('a');
    fireKey('b');
    fireKey('c');

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('does not trigger on partial combo', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['g', 'i'], action }];
    renderHook(() => useKeyCombo(combos));

    fireKey('g');

    expect(action).not.toHaveBeenCalled();
  });

  it('does not trigger on wrong sequence', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['g', 'i'], action }];
    renderHook(() => useKeyCombo(combos));

    fireKey('g');
    fireKey('x');

    expect(action).not.toHaveBeenCalled();
  });

  it('resets sequence after timeout', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['g', 'i'], action, timeout: 300 }];
    renderHook(() => useKeyCombo(combos));

    fireKey('g');
    vi.advanceTimersByTime(400);
    fireKey('i');

    expect(action).not.toHaveBeenCalled();
  });

  it('handles modifier keys in combo', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['mod+k', 'mod+s'], action }];
    renderHook(() => useKeyCombo(combos));

    fireKey('k', { ctrl: true });
    fireKey('s', { ctrl: true });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('supports multiple combos', () => {
    const action1 = vi.fn();
    const action2 = vi.fn();
    const combos: KeyCombo[] = [
      { keys: ['g', 'i'], action: action1 },
      { keys: ['g', 'h'], action: action2 },
    ];
    renderHook(() => useKeyCombo(combos));

    fireKey('g');
    fireKey('h');

    expect(action1).not.toHaveBeenCalled();
    expect(action2).toHaveBeenCalledTimes(1);
  });

  it('does not trigger when disabled', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['g', 'i'], action }];
    renderHook(() => useKeyCombo(combos, false));

    fireKey('g');
    fireKey('i');

    expect(action).not.toHaveBeenCalled();
  });

  it('resets sequence after successful match', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['g', 'i'], action }];
    renderHook(() => useKeyCombo(combos));

    fireKey('g');
    fireKey('i');
    expect(action).toHaveBeenCalledTimes(1);

    // After match, sequence resets — single 'i' should not trigger
    fireKey('i');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listeners on unmount', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['g', 'i'], action }];
    const { unmount } = renderHook(() => useKeyCombo(combos));

    unmount();

    fireKey('g');
    fireKey('i');

    expect(action).not.toHaveBeenCalled();
  });

  it('handles case-insensitive keys', () => {
    const action = vi.fn();
    const combos: KeyCombo[] = [{ keys: ['G', 'I'], action }];
    renderHook(() => useKeyCombo(combos));

    fireKey('g');
    fireKey('i');

    expect(action).toHaveBeenCalledTimes(1);
  });
});
