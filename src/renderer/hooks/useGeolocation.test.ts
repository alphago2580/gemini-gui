import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

describe('useGeolocation', () => {
  let mockGetCurrentPosition: ReturnType<typeof vi.fn>;
  let mockWatchPosition: ReturnType<typeof vi.fn>;
  let mockClearWatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetCurrentPosition = vi.fn();
    mockWatchPosition = vi.fn().mockReturnValue(42);
    mockClearWatch = vi.fn();
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
        watchPosition: mockWatchPosition,
        clearWatch: mockClearWatch,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with null values and loading false', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.accuracy).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('requestPosition sets loading and calls getCurrentPosition', () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.loading).toBe(true);
    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('updates state on successful position', () => {
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({
        coords: {
          latitude: 37.5,
          longitude: 127.0,
          accuracy: 10,
          altitude: 50,
          altitudeAccuracy: 5,
          heading: 90,
          speed: 1.5,
        },
        timestamp: 1234567890,
      } as GeolocationPosition);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.latitude).toBe(37.5);
    expect(result.current.longitude).toBe(127.0);
    expect(result.current.accuracy).toBe(10);
    expect(result.current.altitude).toBe(50);
    expect(result.current.heading).toBe(90);
    expect(result.current.speed).toBe(1.5);
    expect(result.current.timestamp).toBe(1234567890);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('updates state on error', () => {
    const geoError = {
      code: 1,
      message: 'User denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGetCurrentPosition.mockImplementation((_s: PositionCallback, error: PositionErrorCallback) => {
      error(geoError);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error).toBe(geoError);
    expect(result.current.loading).toBe(false);
  });

  it('starts watching position when watch option is true', () => {
    renderHook(() => useGeolocation({ watch: true }));
    expect(mockWatchPosition).toHaveBeenCalledTimes(1);
  });

  it('clears watch on unmount', () => {
    const { unmount } = renderHook(() => useGeolocation({ watch: true }));
    unmount();
    expect(mockClearWatch).toHaveBeenCalledWith(42);
  });

  it('does not watch when watch is false', () => {
    renderHook(() => useGeolocation({ watch: false }));
    expect(mockWatchPosition).not.toHaveBeenCalled();
  });

  it('passes options to getCurrentPosition', () => {
    const { result } = renderHook(() =>
      useGeolocation({ enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 })
    );

    act(() => {
      result.current.requestPosition();
    });

    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
    );
  });

  it('handles missing geolocation API', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.code).toBe(2);
    expect(result.current.loading).toBe(false);
  });

  it('error message contains "Geolocation not supported" when API missing', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error?.message).toBe('Geolocation not supported');
  });

  it('watch mode does nothing when geolocation API is missing', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation({ watch: true }));
    expect(result.current.loading).toBe(false);
    expect(mockWatchPosition).not.toHaveBeenCalled();
  });

  it('watch mode sets loading to true initially', () => {
    const { result } = renderHook(() => useGeolocation({ watch: true }));
    expect(result.current.loading).toBe(true);
  });

  it('watch mode receives position updates', () => {
    mockWatchPosition.mockImplementation((success: PositionCallback) => {
      success({
        coords: {
          latitude: 35.0,
          longitude: 129.0,
          accuracy: 20,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 9999999,
      } as GeolocationPosition);
      return 42;
    });

    const { result } = renderHook(() => useGeolocation({ watch: true }));

    expect(result.current.latitude).toBe(35.0);
    expect(result.current.longitude).toBe(129.0);
    expect(result.current.altitude).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('watch mode handles error callback', () => {
    const geoError = {
      code: 3,
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockWatchPosition.mockImplementation((_s: PositionCallback, error: PositionErrorCallback) => {
      error(geoError);
      return 42;
    });

    const { result } = renderHook(() => useGeolocation({ watch: true }));

    expect(result.current.error).toBe(geoError);
    expect(result.current.error?.code).toBe(3);
    expect(result.current.loading).toBe(false);
  });

  it('passes options to watchPosition', () => {
    renderHook(() =>
      useGeolocation({ watch: true, enableHighAccuracy: true, timeout: 3000, maximumAge: 500 })
    );

    expect(mockWatchPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true, timeout: 3000, maximumAge: 500 }
    );
  });

  it('requestPosition callback is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useGeolocation());
    const first = result.current.requestPosition;
    rerender();
    expect(result.current.requestPosition).toBe(first);
  });
});
