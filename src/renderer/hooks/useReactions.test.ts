import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReactions } from './useReactions';

describe('useReactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty reactions initially', () => {
    const { result } = renderHook(() => useReactions());
    expect(result.current.getReactions('conv1', 0)).toEqual({});
  });

  it('toggleReaction adds an emoji', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
    });
    expect(result.current.getReactions('conv1', 0)).toEqual({ '👍': 1 });
  });

  it('toggleReaction removes an existing emoji', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
    });
    expect(result.current.getReactions('conv1', 0)).toEqual({ '👍': 1 });
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
    });
    expect(result.current.getReactions('conv1', 0)).toEqual({});
  });

  it('supports multiple emojis on same message', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
      result.current.toggleReaction('conv1', 0, '❤️');
    });
    const reactions = result.current.getReactions('conv1', 0);
    expect(reactions['👍']).toBe(1);
    expect(reactions['❤️']).toBe(1);
  });

  it('supports reactions on different messages', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
      result.current.toggleReaction('conv1', 1, '😂');
    });
    expect(result.current.getReactions('conv1', 0)).toEqual({ '👍': 1 });
    expect(result.current.getReactions('conv1', 1)).toEqual({ '😂': 1 });
  });

  it('supports reactions on different conversations', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
      result.current.toggleReaction('conv2', 0, '😂');
    });
    expect(result.current.getReactions('conv1', 0)).toEqual({ '👍': 1 });
    expect(result.current.getReactions('conv2', 0)).toEqual({ '😂': 1 });
  });

  it('hasReaction returns true for added emoji', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
    });
    expect(result.current.hasReaction('conv1', 0, '👍')).toBe(true);
    expect(result.current.hasReaction('conv1', 0, '❤️')).toBe(false);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
    });
    const stored = JSON.parse(localStorage.getItem('gemini-reactions') || '{}');
    expect(stored['conv1:0']).toEqual({ '👍': 1 });
  });

  it('loads from localStorage on mount', () => {
    localStorage.setItem('gemini-reactions', JSON.stringify({ 'conv1:0': { '❤️': 1 } }));
    const { result } = renderHook(() => useReactions());
    expect(result.current.getReactions('conv1', 0)).toEqual({ '❤️': 1 });
  });

  it('cleans up key when all reactions removed', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
    });
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
    });
    expect(result.current.reactions).toEqual({});
  });

  it('removes multiple emojis in sequence and cleans key', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
      result.current.toggleReaction('conv1', 0, '❤️');
    });
    act(() => {
      result.current.toggleReaction('conv1', 0, '👍');
    });
    expect(result.current.getReactions('conv1', 0)).toEqual({ '❤️': 1 });
    act(() => {
      result.current.toggleReaction('conv1', 0, '❤️');
    });
    expect(result.current.reactions).toEqual({});
  });

  it('hasReaction returns false after toggle off', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('conv1', 0, '🔥');
    });
    expect(result.current.hasReaction('conv1', 0, '🔥')).toBe(true);
    act(() => {
      result.current.toggleReaction('conv1', 0, '🔥');
    });
    expect(result.current.hasReaction('conv1', 0, '🔥')).toBe(false);
  });

  it('getReactions returns empty for non-existent conversation', () => {
    const { result } = renderHook(() => useReactions());
    expect(result.current.getReactions('nonexistent', 99)).toEqual({});
  });

  it('hasReaction returns false for non-existent message', () => {
    const { result } = renderHook(() => useReactions());
    expect(result.current.hasReaction('conv1', 999, '👍')).toBe(false);
  });

  it('toggle on-off-on re-adds emoji', () => {
    const { result } = renderHook(() => useReactions());
    act(() => { result.current.toggleReaction('conv1', 0, '⭐'); });
    act(() => { result.current.toggleReaction('conv1', 0, '⭐'); });
    act(() => { result.current.toggleReaction('conv1', 0, '⭐'); });
    expect(result.current.hasReaction('conv1', 0, '⭐')).toBe(true);
    expect(result.current.getReactions('conv1', 0)).toEqual({ '⭐': 1 });
  });

  it('toggleReaction callback is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useReactions());
    const firstToggle = result.current.toggleReaction;
    rerender();
    expect(result.current.toggleReaction).toBe(firstToggle);
  });

  it('reactions on different messages in different conversations are independent', () => {
    const { result } = renderHook(() => useReactions());
    act(() => {
      result.current.toggleReaction('c1', 0, '👍');
      result.current.toggleReaction('c2', 0, '👍');
    });
    act(() => {
      result.current.toggleReaction('c1', 0, '👍');
    });
    expect(result.current.hasReaction('c1', 0, '👍')).toBe(false);
    expect(result.current.hasReaction('c2', 0, '👍')).toBe(true);
  });
});
