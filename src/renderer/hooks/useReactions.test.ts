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
});
