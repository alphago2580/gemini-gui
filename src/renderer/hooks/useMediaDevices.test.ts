import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaDevices } from './useMediaDevices';

const mockDevices = [
  { deviceId: 'mic-1', groupId: 'g1', kind: 'audioinput', label: 'Microphone 1' },
  { deviceId: 'mic-2', groupId: 'g2', kind: 'audioinput', label: 'Microphone 2' },
  { deviceId: 'speaker-1', groupId: 'g1', kind: 'audiooutput', label: 'Speaker 1' },
  { deviceId: 'cam-1', groupId: 'g3', kind: 'videoinput', label: 'Camera 1' },
];

describe('useMediaDevices', () => {
  let deviceChangeListeners: ((e: Event) => void)[];
  let enumerateDevicesMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    deviceChangeListeners = [];
    enumerateDevicesMock = vi.fn().mockResolvedValue(mockDevices);

    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: enumerateDevicesMock,
        addEventListener: vi.fn((_event: string, handler: (e: Event) => void) => {
          deviceChangeListeners.push(handler);
        }),
        removeEventListener: vi.fn((_event: string, handler: (e: Event) => void) => {
          deviceChangeListeners = deviceChangeListeners.filter((h) => h !== handler);
        }),
      },
    });
  });

  afterEach(() => {
    deviceChangeListeners = [];
    vi.restoreAllMocks();
  });

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useMediaDevices());
    expect(result.current.isSupported).toBe(true);
  });

  it('enumerates devices on mount', async () => {
    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.devices).toHaveLength(4);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('categorizes audio inputs', async () => {
    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.audioInputs).toHaveLength(2);
    });

    expect(result.current.audioInputs[0].kind).toBe('audioinput');
    expect(result.current.audioInputs[1].label).toBe('Microphone 2');
  });

  it('categorizes audio outputs', async () => {
    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.audioOutputs).toHaveLength(1);
    });

    expect(result.current.audioOutputs[0].kind).toBe('audiooutput');
    expect(result.current.audioOutputs[0].label).toBe('Speaker 1');
  });

  it('categorizes video inputs', async () => {
    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.videoInputs).toHaveLength(1);
    });

    expect(result.current.videoInputs[0].kind).toBe('videoinput');
    expect(result.current.videoInputs[0].label).toBe('Camera 1');
  });

  it('handles enumeration error', async () => {
    enumerateDevicesMock.mockRejectedValue(new Error('Permission denied'));

    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.error).toBe('Permission denied');
    });

    expect(result.current.devices).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles non-Error thrown values', async () => {
    enumerateDevicesMock.mockRejectedValue('unknown error');

    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to enumerate devices');
    });
  });

  it('refreshes device list on devicechange event', async () => {
    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.devices).toHaveLength(4);
    });

    const newDevices = [
      { deviceId: 'mic-3', groupId: 'g4', kind: 'audioinput', label: 'New Mic' },
    ];
    enumerateDevicesMock.mockResolvedValue(newDevices);

    await act(async () => {
      deviceChangeListeners.forEach((l) => l(new Event('devicechange')));
    });

    await waitFor(() => {
      expect(result.current.devices).toHaveLength(1);
    });

    expect(result.current.devices[0].label).toBe('New Mic');
  });

  it('manual refresh works', async () => {
    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.devices).toHaveLength(4);
    });

    enumerateDevicesMock.mockResolvedValue([]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.devices).toHaveLength(0);
  });

  it('cleans up devicechange listener on unmount', async () => {
    const { unmount } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(enumerateDevicesMock).toHaveBeenCalled();
    });

    unmount();

    expect(navigator.mediaDevices.removeEventListener).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function)
    );
  });

  it('handles unsupported MediaDevices API', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useMediaDevices());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.error).toBe('MediaDevices API is not supported');
    expect(result.current.devices).toHaveLength(0);
  });

  it('maps device properties correctly', async () => {
    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.devices).toHaveLength(4);
    });

    const mic = result.current.devices[0];
    expect(mic.deviceId).toBe('mic-1');
    expect(mic.groupId).toBe('g1');
    expect(mic.kind).toBe('audioinput');
    expect(mic.label).toBe('Microphone 1');
  });

  it('return shape matches UseMediaDevicesResult', async () => {
    const { result } = renderHook(() => useMediaDevices());

    expect(result.current).toHaveProperty('devices');
    expect(result.current).toHaveProperty('audioInputs');
    expect(result.current).toHaveProperty('audioOutputs');
    expect(result.current).toHaveProperty('videoInputs');
    expect(result.current).toHaveProperty('isSupported');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refresh');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('returns empty arrays when no devices of type exist', async () => {
    enumerateDevicesMock.mockResolvedValue([
      { deviceId: 'cam-1', groupId: 'g1', kind: 'videoinput', label: 'Camera' },
    ]);

    const { result } = renderHook(() => useMediaDevices());

    await waitFor(() => {
      expect(result.current.devices).toHaveLength(1);
    });

    expect(result.current.audioInputs).toHaveLength(0);
    expect(result.current.audioOutputs).toHaveLength(0);
    expect(result.current.videoInputs).toHaveLength(1);
  });
});
