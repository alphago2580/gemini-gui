import { renderHook, act } from '@testing-library/react';
import { useSticky } from './useSticky';

describe('useSticky', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
  let lastObserverOptions: IntersectionObserverInit | undefined;

  beforeEach(() => {
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();
    lastObserverOptions = undefined;

    const MockIntersectionObserver = class {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void, options?: IntersectionObserverInit) {
        intersectionCallback = callback;
        lastObserverOptions = options;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
    };

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with isSticky false', () => {
    const { result } = renderHook(() => useSticky());
    expect(result.current.isSticky).toBe(false);
  });

  it('initializes with scrollY 0', () => {
    const { result } = renderHook(() => useSticky());
    expect(result.current.scrollY).toBe(0);
  });

  it('provides sentinelRef', () => {
    const { result } = renderHook(() => useSticky());
    expect(result.current.sentinelRef).toBeDefined();
    expect(result.current.sentinelRef.current).toBeNull();
  });

  it('sets isSticky to true when sentinel is not intersecting', () => {
    const sentinel = document.createElement('div');
    const { result } = renderHook(() => {
      const r = useSticky();
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });

    act(() => {
      intersectionCallback([
        { isIntersecting: false } as IntersectionObserverEntry,
      ]);
    });
    expect(result.current.isSticky).toBe(true);
  });

  it('sets isSticky to false when sentinel is intersecting', () => {
    const sentinel = document.createElement('div');
    const { result } = renderHook(() => {
      const r = useSticky();
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });

    act(() => {
      intersectionCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });
    expect(result.current.isSticky).toBe(true);

    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });
    expect(result.current.isSticky).toBe(false);
  });

  it('tracks scrollY on scroll events', () => {
    const { result } = renderHook(() => useSticky());

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 200, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.scrollY).toBe(200);
  });

  it('does not observe when disabled', () => {
    renderHook(() => useSticky({ enabled: false }));
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('resets sticky when disabled', () => {
    const sentinel = document.createElement('div');
    const { result, rerender } = renderHook(
      ({ enabled }) => {
        const r = useSticky({ enabled });
        (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
        return r;
      },
      { initialProps: { enabled: true } }
    );

    act(() => {
      intersectionCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });
    expect(result.current.isSticky).toBe(true);

    rerender({ enabled: false });
    expect(result.current.isSticky).toBe(false);
  });

  it('passes offset as rootMargin', () => {
    const sentinel = document.createElement('div');
    renderHook(() => {
      const r = useSticky({ offset: 50 });
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });

    expect(lastObserverOptions?.rootMargin).toBe('-50px 0px 0px 0px');
  });

  it('cleans up scroll listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useSticky());
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('disconnects observer on unmount', () => {
    const sentinel = document.createElement('div');

    const { unmount } = renderHook(() => {
      const r = useSticky();
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });

    expect(mockObserve).toHaveBeenCalledWith(sentinel);

    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('uses default offset of 0', () => {
    const sentinel = document.createElement('div');
    renderHook(() => {
      const r = useSticky();
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });

    expect(lastObserverOptions?.rootMargin).toBe('-0px 0px 0px 0px');
  });

  it('intersection callback with isIntersecting true sets isSticky false', () => {
    const sentinel = document.createElement('div');
    const { result } = renderHook(() => {
      const r = useSticky();
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });
    expect(result.current.isSticky).toBe(false);
  });

  it('multiple scroll events update scrollY', () => {
    const { result } = renderHook(() => useSticky());
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.scrollY).toBe(100);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.scrollY).toBe(500);
  });

  it('observer uses threshold 0', () => {
    const sentinel = document.createElement('div');
    renderHook(() => {
      const r = useSticky();
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });
    expect(lastObserverOptions?.threshold).toBe(0);
  });

  it('disabled hook does not listen for scroll events', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useSticky({ enabled: false }));
    const scrollCalls = addSpy.mock.calls.filter(c => c[0] === 'scroll');
    expect(scrollCalls.length).toBe(0);
    addSpy.mockRestore();
  });

  it('re-enabling hook starts observing again', () => {
    const sentinel = document.createElement('div');
    const { rerender } = renderHook(
      ({ enabled }) => {
        const r = useSticky({ enabled });
        (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
        return r;
      },
      { initialProps: { enabled: false } }
    );
    expect(mockObserve).not.toHaveBeenCalled();
    rerender({ enabled: true });
    expect(mockObserve).toHaveBeenCalled();
  });

  it('large offset is applied correctly', () => {
    const sentinel = document.createElement('div');
    renderHook(() => {
      const r = useSticky({ offset: 200 });
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });
    expect(lastObserverOptions?.rootMargin).toBe('-200px 0px 0px 0px');
  });

  it('multiple intersection entries processes last entry', () => {
    const sentinel = document.createElement('div');
    const { result } = renderHook(() => {
      const r = useSticky();
      (r.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = sentinel;
      return r;
    });
    act(() => {
      intersectionCallback([
        { isIntersecting: true } as IntersectionObserverEntry,
        { isIntersecting: false } as IntersectionObserverEntry,
      ]);
    });
    // The loop processes all entries, so the last one wins
    expect(result.current.isSticky).toBe(true);
  });

  it('scrollY starts at 0 when enabled', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    const { result } = renderHook(() => useSticky({ enabled: true }));
    expect(result.current.scrollY).toBe(0);
  });
});
