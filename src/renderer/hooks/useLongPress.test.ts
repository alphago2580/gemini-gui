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
});
