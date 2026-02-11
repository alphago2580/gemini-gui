import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamepad } from './useGamepad';

function createMockGamepad(overrides: Partial<Gamepad> = {}): Gamepad {
  return {
    id: 'Test Controller',
    index: 0,
    connected: true,
    buttons: [
      { pressed: false, touched: false, value: 0 },
      { pressed: true, touched: true, value: 1.0 },
    ] as GamepadButton[],
    axes: [0.0, -0.5, 0.3, 0.0],
    timestamp: 12345,
    mapping: 'standard',
    hapticActuators: [],
    vibrationActuator: null,
    ...overrides,
  } as Gamepad;
}

describe('useGamepad', () => {
  let mockGetGamepads: ReturnType<typeof vi.fn>;
  let mockRAF: ReturnType<typeof vi.fn>;
  let mockCancelRAF: ReturnType<typeof vi.fn>;
  let rafCallback: FrameRequestCallback | null = null;
  let performanceNowValue: number;

  beforeEach(() => {
    mockGetGamepads = vi.fn().mockReturnValue([null, null, null, null]);
    Object.defineProperty(navigator, 'getGamepads', {
      value: mockGetGamepads,
      writable: true,
      configurable: true,
    });

    performanceNowValue = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => performanceNowValue);

    mockRAF = vi.fn((cb: FrameRequestCallback) => {
      rafCallback = cb;
      return 1;
    });
    mockCancelRAF = vi.fn();

    vi.stubGlobal('requestAnimationFrame', mockRAF);
    vi.stubGlobal('cancelAnimationFrame', mockCancelRAF);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rafCallback = null;
  });

  it('detects support', () => {
    const { result } = renderHook(() => useGamepad());
    expect(result.current.isSupported).toBe(true);
  });

  it('returns empty gamepads initially', () => {
    const { result } = renderHook(() => useGamepad());
    expect(result.current.gamepads).toEqual([]);
  });

  it('polls gamepads on animation frame', () => {
    const mockGp = createMockGamepad();
    mockGetGamepads.mockReturnValue([mockGp, null, null, null]);

    const { result } = renderHook(() => useGamepad());

    performanceNowValue = 150;
    act(() => {
      if (rafCallback) rafCallback(150);
    });

    expect(result.current.gamepads).toHaveLength(1);
    expect(result.current.gamepads[0].id).toBe('Test Controller');
    expect(result.current.gamepads[0].index).toBe(0);
    expect(result.current.gamepads[0].connected).toBe(true);
  });

  it('maps buttons correctly', () => {
    const mockGp = createMockGamepad();
    mockGetGamepads.mockReturnValue([mockGp, null, null, null]);

    const { result } = renderHook(() => useGamepad());

    performanceNowValue = 150;
    act(() => {
      if (rafCallback) rafCallback(150);
    });

    expect(result.current.gamepads[0].buttons).toHaveLength(2);
    expect(result.current.gamepads[0].buttons[0]).toEqual({
      pressed: false,
      touched: false,
      value: 0,
    });
    expect(result.current.gamepads[0].buttons[1]).toEqual({
      pressed: true,
      touched: true,
      value: 1.0,
    });
  });

  it('maps axes correctly', () => {
    const mockGp = createMockGamepad();
    mockGetGamepads.mockReturnValue([mockGp, null, null, null]);

    const { result } = renderHook(() => useGamepad());

    performanceNowValue = 150;
    act(() => {
      if (rafCallback) rafCallback(150);
    });

    expect(result.current.gamepads[0].axes).toEqual([0.0, -0.5, 0.3, 0.0]);
  });

  it('handles multiple gamepads', () => {
    const gp1 = createMockGamepad({ id: 'Controller A', index: 0 });
    const gp2 = createMockGamepad({ id: 'Controller B', index: 1 });
    mockGetGamepads.mockReturnValue([gp1, gp2, null, null]);

    const { result } = renderHook(() => useGamepad());

    performanceNowValue = 150;
    act(() => {
      if (rafCallback) rafCallback(150);
    });

    expect(result.current.gamepads).toHaveLength(2);
    expect(result.current.gamepads[0].id).toBe('Controller A');
    expect(result.current.gamepads[1].id).toBe('Controller B');
  });

  it('getGamepad returns specific gamepad by index', () => {
    const gp1 = createMockGamepad({ id: 'Controller A', index: 0 });
    const gp2 = createMockGamepad({ id: 'Controller B', index: 1 });
    mockGetGamepads.mockReturnValue([gp1, gp2, null, null]);

    const { result } = renderHook(() => useGamepad());

    performanceNowValue = 150;
    act(() => {
      if (rafCallback) rafCallback(150);
    });

    expect(result.current.getGamepad(0)?.id).toBe('Controller A');
    expect(result.current.getGamepad(1)?.id).toBe('Controller B');
    expect(result.current.getGamepad(2)).toBeNull();
  });

  it('responds to gamepadconnected event', () => {
    const mockGp = createMockGamepad();
    mockGetGamepads.mockReturnValue([null, null, null, null]);

    renderHook(() => useGamepad());

    mockGetGamepads.mockReturnValue([mockGp, null, null, null]);
    act(() => {
      window.dispatchEvent(new Event('gamepadconnected'));
    });
  });

  it('responds to gamepaddisconnected event', () => {
    const mockGp = createMockGamepad();
    mockGetGamepads.mockReturnValue([mockGp, null, null, null]);

    const { result } = renderHook(() => useGamepad());

    performanceNowValue = 150;
    act(() => {
      if (rafCallback) rafCallback(150);
    });
    expect(result.current.gamepads).toHaveLength(1);

    mockGetGamepads.mockReturnValue([null, null, null, null]);
    act(() => {
      window.dispatchEvent(new Event('gamepaddisconnected'));
    });

    expect(result.current.gamepads).toHaveLength(0);
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useGamepad());
    unmount();
    expect(mockCancelRAF).toHaveBeenCalled();
  });

  it('respects poll interval', () => {
    const mockGp = createMockGamepad();
    mockGetGamepads.mockReturnValue([mockGp, null, null, null]);

    const { result } = renderHook(() => useGamepad({ pollInterval: 500 }));

    // Too early, should not poll
    performanceNowValue = 200;
    act(() => {
      if (rafCallback) rafCallback(200);
    });
    expect(result.current.gamepads).toEqual([]);

    // Now enough time has passed
    performanceNowValue = 600;
    act(() => {
      if (rafCallback) rafCallback(600);
    });
    expect(result.current.gamepads).toHaveLength(1);
  });

  it('handles unsupported browser', () => {
    Object.defineProperty(navigator, 'getGamepads', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGamepad());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.gamepads).toEqual([]);
  });
});
