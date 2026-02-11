import React from 'react';
import { renderHook } from '@testing-library/react';
import { useMutationObserver } from './useMutationObserver';

// Mock MutationObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let capturedCallback: MutationCallback | null = null;

class MockMutationObserver {
  constructor(callback: MutationCallback) {
    capturedCallback = callback;
  }
  observe = mockObserve;
  disconnect = mockDisconnect;
}

beforeEach(() => {
  vi.stubGlobal('MutationObserver', MockMutationObserver);
  mockObserve.mockClear();
  mockDisconnect.mockClear();
  capturedCallback = null;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMutationObserver', () => {
  it('observes the target element with default options', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();

    renderHook(() => useMutationObserver(ref, callback));

    expect(mockObserve).toHaveBeenCalledWith(target, { childList: true });
  });

  it('observes with custom options', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();
    const options = { attributes: true, subtree: true };

    renderHook(() => useMutationObserver(ref, callback, options));

    expect(mockObserve).toHaveBeenCalledWith(target, options);
  });

  it('does not observe when ref is null', () => {
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    const callback = vi.fn();

    renderHook(() => useMutationObserver(ref, callback));

    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('calls callback when mutations occur', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();

    renderHook(() => useMutationObserver(ref, callback));

    const fakeMutations = [{ type: 'childList' }] as unknown as MutationRecord[];
    capturedCallback!(fakeMutations, {} as MutationObserver);

    expect(callback).toHaveBeenCalledWith(fakeMutations);
  });

  it('disconnects observer on unmount', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();

    const { unmount } = renderHook(() => useMutationObserver(ref, callback));
    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('uses latest callback reference', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useMutationObserver(ref, cb),
      { initialProps: { cb: callback1 } }
    );

    rerender({ cb: callback2 });

    const fakeMutations = [{ type: 'childList' }] as unknown as MutationRecord[];
    capturedCallback!(fakeMutations, {} as MutationObserver);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith(fakeMutations);
  });

  it('reconnects observer when options change', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();

    const { rerender } = renderHook(
      ({ opts }) => useMutationObserver(ref, callback, opts),
      { initialProps: { opts: { childList: true } as MutationObserverInit } }
    );

    expect(mockObserve).toHaveBeenCalledTimes(1);

    rerender({ opts: { attributes: true } });

    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(target, { attributes: true });
  });

  it('handles multiple mutations in a single callback', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();

    renderHook(() => useMutationObserver(ref, callback));

    const fakeMutations = [
      { type: 'childList' },
      { type: 'attributes' },
      { type: 'characterData' },
    ] as unknown as MutationRecord[];
    capturedCallback!(fakeMutations, {} as MutationObserver);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(fakeMutations);
  });

  it('disconnects on unmount preventing further callbacks', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();

    const { unmount } = renderHook(() => useMutationObserver(ref, callback));
    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('observes with subtree and characterData options', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();
    const options = { childList: true, subtree: true, characterData: true };

    renderHook(() => useMutationObserver(ref, callback, options));

    expect(mockObserve).toHaveBeenCalledWith(target, options);
  });

  it('does not observe when ref transitions from element to null', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement | null>;
    const callback = vi.fn();

    const { rerender } = renderHook(
      ({ r }) => useMutationObserver(r, callback),
      { initialProps: { r: ref } }
    );

    expect(mockObserve).toHaveBeenCalledTimes(1);

    const nullRef = { current: null } as React.RefObject<HTMLElement | null>;
    rerender({ r: nullRef });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles empty mutations array', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();

    renderHook(() => useMutationObserver(ref, callback));

    capturedCallback!([] as unknown as MutationRecord[], {} as MutationObserver);

    expect(callback).toHaveBeenCalledWith([]);
  });

  it('creates new observer for each options change', () => {
    const target = document.createElement('div');
    const ref = { current: target } as React.RefObject<HTMLElement>;
    const callback = vi.fn();

    const { rerender } = renderHook(
      ({ opts }) => useMutationObserver(ref, callback, opts),
      { initialProps: { opts: { childList: true } as MutationObserverInit } }
    );

    rerender({ opts: { childList: true, attributes: true } });
    rerender({ opts: { childList: true, attributes: true, subtree: true } });

    expect(mockObserve).toHaveBeenCalledTimes(3);
  });
});
