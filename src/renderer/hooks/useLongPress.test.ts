import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns event handler functions', () => {
    const { result } = renderHook(() =>
      useLongPress({ onLongPress: vi.fn() })
    );

    expect(result.current.onMouseDown).toBeTypeOf('function');
    expect(result.current.onMouseUp).toBeTypeOf('function');
    expect(result.current.onMouseLeave).toBeTypeOf('function');
    expect(result.current.onTouchStart).toBeTypeOf('function');
    expect(result.current.onTouchEnd).toBeTypeOf('function');
  });

  it('triggers onLongPress after threshold', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, threshold: 300 })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => vi.advanceTimersByTime(300));

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onLongPress before threshold', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, threshold: 500 })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => vi.advanceTimersByTime(400));

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('calls onClick on short press (mouseUp before threshold)', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onClick, threshold: 500 })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.onMouseUp(mockEvent));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('does not call onClick after long press', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onClick, threshold: 300 })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => vi.advanceTimersByTime(300));
    act(() => result.current.onMouseUp(mockEvent));

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onStart when press begins', () => {
    const onStart = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress: vi.fn(), onStart })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onEnd when press ends', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress: vi.fn(), onEnd })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => result.current.onMouseUp(mockEvent));

    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('cancels long press on mouse leave', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, threshold: 300 })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.onMouseLeave(mockEvent));
    act(() => vi.advanceTimersByTime(300));

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('uses default threshold of 500ms', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => vi.advanceTimersByTime(499));
    expect(onLongPress).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('works with touch events', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onClick, threshold: 300 })
    );

    const mockEvent = {} as React.TouchEvent;
    act(() => result.current.onTouchStart(mockEvent));
    act(() => vi.advanceTimersByTime(300));
    act(() => result.current.onTouchEnd(mockEvent));

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('touch short press calls onClick', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onClick, threshold: 500 })
    );

    const mockEvent = {} as React.TouchEvent;
    act(() => result.current.onTouchStart(mockEvent));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.onTouchEnd(mockEvent));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('onEnd is called after long press completes on mouseUp', () => {
    const onEnd = vi.fn();
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onEnd, threshold: 200 })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.onMouseUp(mockEvent));

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('onStart receives the event object', () => {
    const onStart = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress: vi.fn(), onStart })
    );

    const mockEvent = { clientX: 100 } as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));

    expect(onStart).toHaveBeenCalledWith(mockEvent);
  });

  it('onLongPress receives the original event', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, threshold: 100 })
    );

    const mockEvent = { clientY: 50 } as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => vi.advanceTimersByTime(100));

    expect(onLongPress).toHaveBeenCalledWith(mockEvent);
  });

  it('mouse leave does not call onEnd', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress: vi.fn(), onEnd })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => result.current.onMouseLeave(mockEvent));

    expect(onEnd).not.toHaveBeenCalled();
  });

  it('rapid mouseDown-mouseUp-mouseDown-mouseUp produces two clicks', () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onClick, threshold: 500 })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    act(() => result.current.onMouseUp(mockEvent));
    act(() => result.current.onMouseDown(mockEvent));
    act(() => result.current.onMouseUp(mockEvent));

    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('clears pending timer on unmount', () => {
    const onLongPress = vi.fn();
    const { result, unmount } = renderHook(() =>
      useLongPress({ onLongPress, threshold: 500 })
    );

    const mockEvent = {} as React.MouseEvent;
    act(() => result.current.onMouseDown(mockEvent));
    // Timer is pending, unmount before it fires
    unmount();
    act(() => vi.advanceTimersByTime(500));

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('onMouseLeave handler is stable when options do not change', () => {
    const onLongPress = vi.fn();
    const { result, rerender } = renderHook(
      ({ opts }) => useLongPress(opts),
      { initialProps: { opts: { onLongPress } } }
    );
    const firstLeave = result.current.onMouseLeave;
    rerender({ opts: { onLongPress } });
    // onMouseLeave has no deps on options callbacks, should be stable
    expect(result.current.onMouseLeave).toBe(firstLeave);
  });
});
