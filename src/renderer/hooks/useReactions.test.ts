import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReactions } from './useReactions';

describe('useReactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty reactions initially', () => {
    const { result } = renderHook(() => useReactions('conv-1'));
    expect(result.current.getReactions(0)).toEqual([]);
  });

  it('adds a reaction to a message', () => {
    const { result } = renderHook(() => useReactions('conv-1'));
    act(() => {
      result.current.addReaction(0, '👍');
    });
    expect(result.current.getReactions(0)).toEqual(['👍']);
  });

  it('supports multiple reactions on the same message', () => {
    const { result } = renderHook(() => useReactions('conv-1'));
    act(() => {
      result.current.addReaction(0, '👍');
      result.current.addReaction(0, '❤️');
    });
    expect(result.current.getReactions(0)).toEqual(['👍', '❤️']);
  });

  it('keeps reactions separate per message', () => {
    const { result } = renderHook(() => useReactions('conv-1'));
    act(() => {
      result.current.addReaction(0, '👍');
      result.current.addReaction(1, '😂');
    });
    expect(result.current.getReactions(0)).toEqual(['👍']);
    expect(result.current.getReactions(1)).toEqual(['😂']);
  });

  it('does nothing when conversationId is null', () => {
    const { result } = renderHook(() => useReactions(null));
    act(() => {
      result.current.addReaction(0, '👍');
    });
    expect(result.current.getReactions(0)).toEqual([]);
  });

  it('persists reactions to localStorage', () => {
    const { result } = renderHook(() => useReactions('conv-1'));
    act(() => {
      result.current.addReaction(0, '🎉');
    });
    const stored = JSON.parse(localStorage.getItem('gemini-reactions') || '{}');
    expect(stored['conv-1:0']).toEqual(['🎉']);
  });
});
