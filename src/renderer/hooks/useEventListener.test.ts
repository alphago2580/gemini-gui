import { renderHook } from '@testing-library/react';
import { useEventListener } from './useEventListener';

describe('useEventListener', () => {
  it('adds event listener to window by default', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useEventListener('click', handler));

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), undefined);
    addSpy.mockRestore();
  });

  it('removes event listener on unmount', () => {
    const handler = vi.fn();
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useEventListener('keydown', handler));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function), undefined);
    removeSpy.mockRestore();
  });

  it('calls handler when event fires', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler));

    window.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('uses latest handler without re-attaching listener', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(
      ({ handler }) => useEventListener('click', handler),
      { initialProps: { handler: handler1 } }
    );

    window.dispatchEvent(new Event('click'));
    expect(handler1).toHaveBeenCalledTimes(1);

    rerender({ handler: handler2 });

    window.dispatchEvent(new Event('click'));
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('adds listener to custom element', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    const addSpy = vi.spyOn(element, 'addEventListener');

    renderHook(() => useEventListener('click', handler, element));

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), undefined);
    addSpy.mockRestore();
  });

  it('handles null element gracefully', () => {
    const handler = vi.fn();
    // Should not throw
    renderHook(() => useEventListener('click', handler, null));
    window.dispatchEvent(new Event('click'));
    // handler should not be called since element is null
    expect(handler).not.toHaveBeenCalled();
  });

  it('passes options to addEventListener', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useEventListener('scroll', handler, undefined, { passive: true }));

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    addSpy.mockRestore();
  });
});
