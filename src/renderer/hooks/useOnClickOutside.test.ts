import { renderHook, act } from '@testing-library/react';
import { useOnClickOutside } from './useOnClickOutside';

describe('useOnClickOutside', () => {
  it('calls handler when clicking outside the element', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useOnClickOutside<HTMLDivElement>(handler));

    const div = document.createElement('div');
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);
    document.body.removeChild(div);
  });

  it('does not call handler when clicking inside the element', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useOnClickOutside<HTMLDivElement>(handler));

    const div = document.createElement('div');
    const child = document.createElement('span');
    div.appendChild(child);
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    act(() => {
      child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('does not call handler when active is false', () => {
    const handler = vi.fn();
    renderHook(() => useOnClickOutside<HTMLDivElement>(handler, false));

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call handler when ref is null', () => {
    const handler = vi.fn();
    renderHook(() => useOnClickOutside<HTMLDivElement>(handler));

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    // ref.current is null — handler should not be called
    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const handler = vi.fn();
    const { unmount } = renderHook(() => useOnClickOutside<HTMLDivElement>(handler));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('uses latest handler', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ handler }) => useOnClickOutside<HTMLDivElement>(handler),
      { initialProps: { handler: handler1 } }
    );

    const div = document.createElement('div');
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    rerender({ handler: handler2 });

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
    document.body.removeChild(div);
  });

  it('resubscribes when active changes from false to true', () => {
    const handler = vi.fn();
    const { result, rerender } = renderHook(
      ({ active }) => useOnClickOutside<HTMLDivElement>(handler, active),
      { initialProps: { active: false } }
    );

    const div = document.createElement('div');
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(handler).not.toHaveBeenCalled();

    rerender({ active: true });

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(div);
  });

  it('does not call handler when clicking directly on the element itself', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useOnClickOutside<HTMLDivElement>(handler));

    const div = document.createElement('div');
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    act(() => {
      div.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('does not call handler when clicking on a deeply nested child', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useOnClickOutside<HTMLDivElement>(handler));

    const div = document.createElement('div');
    const child1 = document.createElement('div');
    const child2 = document.createElement('span');
    child1.appendChild(child2);
    div.appendChild(child1);
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    act(() => {
      child2.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('stops firing when active switches from true to false', () => {
    const handler = vi.fn();
    const { result, rerender } = renderHook(
      ({ active }) => useOnClickOutside<HTMLDivElement>(handler, active),
      { initialProps: { active: true } }
    );

    const div = document.createElement('div');
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(handler).toHaveBeenCalledTimes(1);

    rerender({ active: false });

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(div);
  });

  it('default active parameter is true', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useOnClickOutside<HTMLDivElement>(handler));

    const div = document.createElement('div');
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);
    document.body.removeChild(div);
  });

  it('ref is stable across rerenders', () => {
    const handler = vi.fn();
    const { result, rerender } = renderHook(() => useOnClickOutside<HTMLDivElement>(handler));
    const ref1 = result.current;
    rerender();
    expect(result.current).toBe(ref1);
  });

  it('handles multiple outside clicks', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useOnClickOutside<HTMLDivElement>(handler));

    const div = document.createElement('div');
    document.body.appendChild(div);
    (result.current as { current: HTMLDivElement | null }).current = div;

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledTimes(3);
    document.body.removeChild(div);
  });
});
