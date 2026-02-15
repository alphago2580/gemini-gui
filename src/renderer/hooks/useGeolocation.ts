import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: GeolocationPositionError | null;
  loading: boolean;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  /** If true, watches position continuously. Default: false */
  watch?: boolean;
}

const initialState: GeolocationState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
  timestamp: null,
  error: null,
  loading: false,
};

/**
 * Provides access to the browser's Geolocation API.
 * Supports both one-shot and continuous (watch) position tracking.
 */
export function useGeolocation(options: UseGeolocationOptions = {}): GeolocationState & { requestPosition: () => void } {
  const { enableHighAccuracy = false, timeout = 10000, maximumAge = 0, watch = false } = options;
  const [state, setState] = useState<GeolocationState>(initialState);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      error: null,
      loading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: { code: 2, message: 'Geolocation not supported', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError,
        loading: false,
      }));
      return;
    }
    setState(prev => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { enableHighAccuracy, timeout, maximumAge });
  }, [handleSuccess, handleError, enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    if (!watch) return;
    if (!navigator.geolocation) return;
    setState(prev => ({ ...prev, loading: true }));
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, { enableHighAccuracy, timeout, maximumAge });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [watch, handleSuccess, handleError, enableHighAccuracy, timeout, maximumAge]);

  return { ...state, requestPosition };
}
