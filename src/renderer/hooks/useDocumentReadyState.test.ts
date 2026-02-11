import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocumentReadyState } from './useDocumentReadyState';

describe('useDocumentReadyState', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns current ready state', () => {
    const { result } = renderHook(() => useDocumentReadyState());
    expect(result.current.readyState).toBeDefined();
    expect(typeof result.current.readyState).toBe('string');
  });

  it('provides boolean helpers for complete state', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useDocumentReadyState());
    expect(result.current.isComplete).toBe(true);
    expect(result.current.isInteractive).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('provides boolean helpers for loading state', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useDocumentReadyState());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isInteractive).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  it('provides boolean helpers for interactive state', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'interactive',
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useDocumentReadyState());
    expect(result.current.isInteractive).toBe(true);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('updates on readystatechange event', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useDocumentReadyState());
    expect(result.current.readyState).toBe('loading');

    Object.defineProperty(document, 'readyState', {
      value: 'interactive',
      writable: true,
      configurable: true,
    });

    act(() => {
      document.dispatchEvent(new Event('readystatechange'));
    });

    expect(result.current.readyState).toBe('interactive');
  });

  it('updates to complete', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useDocumentReadyState());

    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true,
    });

    act(() => {
      document.dispatchEvent(new Event('readystatechange'));
    });

    expect(result.current.readyState).toBe('complete');
    expect(result.current.isComplete).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useDocumentReadyState());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('readystatechange', expect.any(Function));
  });
});
