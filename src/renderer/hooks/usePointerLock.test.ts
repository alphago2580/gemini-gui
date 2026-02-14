import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePointerLock } from './usePointerLock';

describe('usePointerLock', () => {
  let mockRequestPointerLock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequestPointerLock = vi.fn();
    Object.defineProperty(document, 'pointerLockElement', {
      value: null,
      writable: true,
      configurable: true,
    });
    document.exitPointerLock = vi.fn();
    document.body.requestPointerLock = mockRequestPointerLock as unknown as typeof document.body.requestPointerLock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects support', () => {
    const { result } = renderHook(() => usePointerLock());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isLocked).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('initializes with zero movement', () => {
    const { result } = renderHook(() => usePointerLock());
    expect(result.current.movement).toEqual({ movementX: 0, movementY: 0 });
  });

  it('requests pointer lock on body', () => {
    const { result } = renderHook(() => usePointerLock());

    act(() => result.current.lock());
    expect(mockRequestPointerLock).toHaveBeenCalled();
  });

  it('requests pointer lock on specific element', () => {
    const element = document.createElement('div');
    element.requestPointerLock = vi.fn();

    const { result } = renderHook(() => usePointerLock());

    act(() => result.current.lock(element));
    expect(element.requestPointerLock).toHaveBeenCalled();
  });

  it('updates isLocked on pointerlockchange', () => {
    const { result } = renderHook(() => usePointerLock());

    Object.defineProperty(document, 'pointerLockElement', {
      value: document.body,
      writable: true,
      configurable: true,
    });

    act(() => {
      document.dispatchEvent(new Event('pointerlockchange'));
    });

    expect(result.current.isLocked).toBe(true);
  });

  it('resets movement on unlock', () => {
    const { result } = renderHook(() => usePointerLock());

    // Lock
    Object.defineProperty(document, 'pointerLockElement', {
      value: document.body,
      writable: true,
      configurable: true,
    });
    act(() => document.dispatchEvent(new Event('pointerlockchange')));

    // Track movement
    act(() => {
      const event = new MouseEvent('mousemove', { movementX: 10, movementY: 20 } as MouseEventInit);
      Object.defineProperty(event, 'movementX', { value: 10 });
      Object.defineProperty(event, 'movementY', { value: 20 });
      document.dispatchEvent(event);
    });

    // Unlock
    Object.defineProperty(document, 'pointerLockElement', {
      value: null,
      writable: true,
      configurable: true,
    });
    act(() => document.dispatchEvent(new Event('pointerlockchange')));

    expect(result.current.isLocked).toBe(false);
    expect(result.current.movement).toEqual({ movementX: 0, movementY: 0 });
  });

  it('sets error on pointerlockerror', () => {
    const { result } = renderHook(() => usePointerLock());

    act(() => {
      document.dispatchEvent(new Event('pointerlockerror'));
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Pointer lock request failed');
  });

  it('calls exitPointerLock on unlock', () => {
    const { result } = renderHook(() => usePointerLock());

    Object.defineProperty(document, 'pointerLockElement', {
      value: document.body,
      writable: true,
      configurable: true,
    });

    act(() => result.current.unlock());
    expect(document.exitPointerLock).toHaveBeenCalled();
  });

  it('does not call exitPointerLock when not locked', () => {
    const { result } = renderHook(() => usePointerLock());

    act(() => result.current.unlock());
    expect(document.exitPointerLock).not.toHaveBeenCalled();
  });

  it('handles requestPointerLock throwing', () => {
    mockRequestPointerLock.mockImplementation(() => {
      throw new Error('not allowed');
    });

    const { result } = renderHook(() => usePointerLock());

    act(() => result.current.lock());
    expect(result.current.error?.message).toBe('not allowed');
  });

  it('clears error on new lock attempt', () => {
    mockRequestPointerLock.mockImplementation(() => {
      throw new Error('denied');
    });

    const { result } = renderHook(() => usePointerLock());
    act(() => result.current.lock());
    expect(result.current.error).not.toBeNull();

    mockRequestPointerLock.mockImplementation(() => {});
    act(() => result.current.lock());
    expect(result.current.error).toBeNull();
  });
});
