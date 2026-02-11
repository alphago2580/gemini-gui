import { useState, useEffect, useCallback } from 'react';

export interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
}

export interface UseMediaDevicesResult {
  devices: MediaDeviceInfo[];
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook that enumerates available media devices (cameras, microphones, speakers).
 * Provides categorized lists and auto-refreshes on device changes.
 */
export function useMediaDevices(): UseMediaDevicesResult {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.enumerateDevices === 'function';

  const refresh = useCallback(async () => {
    if (!isSupported) {
      setError('MediaDevices API is not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const mapped: MediaDeviceInfo[] = deviceList.map((d) => ({
        deviceId: d.deviceId,
        groupId: d.groupId,
        kind: d.kind as MediaDeviceInfo['kind'],
        label: d.label,
      }));
      setDevices(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enumerate devices');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  useEffect(() => {
    refresh();

    if (!isSupported) return;

    const handleDeviceChange = () => {
      refresh();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [refresh, isSupported]);

  const audioInputs = devices.filter((d) => d.kind === 'audioinput');
  const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');
  const videoInputs = devices.filter((d) => d.kind === 'videoinput');

  return {
    devices,
    audioInputs,
    audioOutputs,
    videoInputs,
    isSupported,
    isLoading,
    error,
    refresh,
  };
}
