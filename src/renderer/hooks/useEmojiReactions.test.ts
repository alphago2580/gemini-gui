import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmojiReactions } from './useEmojiReactions';

describe('useEmojiReactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty reactions initially', () => {
    const { result } = renderHook(() => useEmojiReactions());
    expect(result.current.reactions).toEqual({});
  });

  it('adds a new reaction', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });

    const reactions = result.current.getReactions('conv-1', 0);
    expect(reactions).toHaveLength(1);
    expect(reactions[0]).toEqual({ emoji: '👍', count: 1 });
  });

  it('increments count for existing reaction', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });

    const reactions = result.current.getReactions('conv-1', 0);
    expect(reactions).toHaveLength(1);
    expect(reactions[0].count).toBe(2);
  });

  it('adds different emojis to same message', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.addReaction('conv-1', 0, '❤️');
    });

    const reactions = result.current.getReactions('conv-1', 0);
    expect(reactions).toHaveLength(2);
  });

  it('removes a reaction (decrements count)', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.removeReaction('conv-1', 0, '👍');
    });

    const reactions = result.current.getReactions('conv-1', 0);
    expect(reactions).toHaveLength(1);
    expect(reactions[0].count).toBe(1);
  });

  it('removes entry when count reaches 0', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.removeReaction('conv-1', 0, '👍');
    });

    const reactions = result.current.getReactions('conv-1', 0);
    expect(reactions).toHaveLength(0);
  });

  it('removeReaction is no-op for non-existent message', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.removeReaction('conv-1', 0, '👍');
    });

    expect(result.current.reactions).toEqual({});
  });

  it('toggleReaction adds on first call, removes on second', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.toggleReaction('conv-1', 0, '👍');
    });
    expect(result.current.getReactions('conv-1', 0)).toHaveLength(1);

    act(() => {
      result.current.toggleReaction('conv-1', 0, '👍');
    });
    expect(result.current.getReactions('conv-1', 0)).toHaveLength(0);
  });

  it('toggleReaction only removes toggled emoji', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.addReaction('conv-1', 0, '❤️');
    });
    act(() => {
      result.current.toggleReaction('conv-1', 0, '👍');
    });

    const reactions = result.current.getReactions('conv-1', 0);
    expect(reactions).toHaveLength(1);
    expect(reactions[0].emoji).toBe('❤️');
  });

  it('getReactions returns empty for unknown message', () => {
    const { result } = renderHook(() => useEmojiReactions());
    expect(result.current.getReactions('conv-1', 99)).toEqual([]);
  });

  it('clearReactions removes reactions for specific message', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.addReaction('conv-1', 1, '❤️');
    });
    act(() => {
      result.current.clearReactions('conv-1', 0);
    });

    expect(result.current.getReactions('conv-1', 0)).toHaveLength(0);
    expect(result.current.getReactions('conv-1', 1)).toHaveLength(1);
  });

  it('clearAllReactions removes everything', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.addReaction('conv-2', 0, '❤️');
    });
    act(() => {
      result.current.clearAllReactions();
    });

    expect(result.current.reactions).toEqual({});
  });

  it('persists reactions to localStorage', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });

    const stored = JSON.parse(localStorage.getItem('gemini-emoji-reactions') || '{}');
    expect(stored['conv-1:0']).toBeDefined();
    expect(stored['conv-1:0'][0].emoji).toBe('👍');
  });

  it('loads reactions from localStorage on mount', () => {
    localStorage.setItem('gemini-emoji-reactions', JSON.stringify({
      'conv-1:0': [{ emoji: '👍', count: 3 }],
    }));

    const { result } = renderHook(() => useEmojiReactions());
    const reactions = result.current.getReactions('conv-1', 0);
    expect(reactions).toHaveLength(1);
    expect(reactions[0].count).toBe(3);
  });

  it('isolates reactions between different messages', () => {
    const { result } = renderHook(() => useEmojiReactions());

    act(() => {
      result.current.addReaction('conv-1', 0, '👍');
    });
    act(() => {
      result.current.addReaction('conv-1', 1, '❤️');
    });

    expect(result.current.getReactions('conv-1', 0)[0].emoji).toBe('👍');
    expect(result.current.getReactions('conv-1', 1)[0].emoji).toBe('❤️');
  });

  it('returns stable function references', () => {
    const { result, rerender } = renderHook(() => useEmojiReactions());
    const first = result.current;
    rerender();
    const second = result.current;

    expect(first.addReaction).toBe(second.addReaction);
    expect(first.removeReaction).toBe(second.removeReaction);
    expect(first.toggleReaction).toBe(second.toggleReaction);
    expect(first.clearAllReactions).toBe(second.clearAllReactions);
  });
});
