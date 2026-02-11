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

  it('fires handler on custom element event dispatch', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler, element));

    element.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('removes listener from custom element on unmount', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    const removeSpy = vi.spyOn(element, 'removeEventListener');

    const { unmount } = renderHook(() => useEventListener('click', handler, element));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), undefined);
    removeSpy.mockRestore();
  });

  it('passes boolean options to addEventListener', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useEventListener('click', handler, undefined, true));

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
    addSpy.mockRestore();
  });

  it('re-attaches listener when eventName changes', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { rerender } = renderHook(
      ({ eventName }) => useEventListener(eventName, handler),
      { initialProps: { eventName: 'click' as keyof (WindowEventMap & DocumentEventMap & HTMLElementEventMap) } }
    );

    addSpy.mockClear();
    removeSpy.mockClear();

    rerender({ eventName: 'keydown' as keyof (WindowEventMap & DocumentEventMap & HTMLElementEventMap) });

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), undefined);
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function), undefined);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('re-attaches listener when element changes', () => {
    const handler = vi.fn();
    const el1 = document.createElement('div');
    const el2 = document.createElement('span');
    const removeSpy1 = vi.spyOn(el1, 'removeEventListener');
    const addSpy2 = vi.spyOn(el2, 'addEventListener');

    const { rerender } = renderHook(
      ({ element }) => useEventListener('click', handler, element),
      { initialProps: { element: el1 as HTMLElement } }
    );

    rerender({ element: el2 });

    expect(removeSpy1).toHaveBeenCalledWith('click', expect.any(Function), undefined);
    expect(addSpy2).toHaveBeenCalledWith('click', expect.any(Function), undefined);

    removeSpy1.mockRestore();
    addSpy2.mockRestore();
  });

  it('handles multiple events of same type', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler));

    window.dispatchEvent(new Event('click'));
    window.dispatchEvent(new Event('click'));
    window.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('adds listener to document element', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(document, 'addEventListener');

    renderHook(() => useEventListener('click', handler, document));

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), undefined);
    addSpy.mockRestore();
  });

  it('passes capture option correctly', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useEventListener('click', handler, undefined, { capture: true }));

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), { capture: true });
    addSpy.mockRestore();
  });
});
