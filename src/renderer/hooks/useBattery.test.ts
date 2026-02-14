import { renderHook, waitFor } from '@testing-library/react';
import { useBattery } from './useBattery';

describe('useBattery', () => {
  let mockBattery: {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockBattery = {
      charging: true,
      chargingTime: 3600,
      dischargingTime: Infinity,
      level: 0.75,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  function setupBatteryAPI(resolved = true) {
    const getBattery = resolved
      ? vi.fn().mockResolvedValue(mockBattery)
      : vi.fn().mockRejectedValue(new Error('not supported'));

    Object.defineProperty(navigator, 'getBattery', {
      value: getBattery,
      writable: true,
      configurable: true,
    });
  }

  function removeBatteryAPI() {
    // Must delete the property, not just set to undefined,
    // because 'getBattery' in navigator checks property existence
    if ('getBattery' in navigator) {
      delete (navigator as Record<string, unknown>).getBattery;
    }
  }

  it('initializes with default state', () => {
    removeBatteryAPI();
    const { result } = renderHook(() => useBattery());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.level).toBe(1);
    expect(result.current.charging).toBe(false);
  });

  it('reads battery state on mount', async () => {
    setupBatteryAPI();
    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current.charging).toBe(true);
    });
    expect(result.current.level).toBe(0.75);
    expect(result.current.chargingTime).toBe(3600);
    expect(result.current.dischargingTime).toBe(Infinity);
    expect(result.current.isSupported).toBe(true);
  });

  it('adds event listeners', async () => {
    setupBatteryAPI();
    renderHook(() => useBattery());

    await waitFor(() => {
      expect(mockBattery.addEventListener).toHaveBeenCalledWith('chargingchange', expect.any(Function));
    });
    expect(mockBattery.addEventListener).toHaveBeenCalledWith('chargingtimechange', expect.any(Function));
    expect(mockBattery.addEventListener).toHaveBeenCalledWith('dischargingtimechange', expect.any(Function));
    expect(mockBattery.addEventListener).toHaveBeenCalledWith('levelchange', expect.any(Function));
  });

  it('removes event listeners on unmount', async () => {
    setupBatteryAPI();
    const { unmount } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(mockBattery.addEventListener).toHaveBeenCalled();
    });

    unmount();
    expect(mockBattery.removeEventListener).toHaveBeenCalledWith('chargingchange', expect.any(Function));
    expect(mockBattery.removeEventListener).toHaveBeenCalledWith('chargingtimechange', expect.any(Function));
    expect(mockBattery.removeEventListener).toHaveBeenCalledWith('dischargingtimechange', expect.any(Function));
    expect(mockBattery.removeEventListener).toHaveBeenCalledWith('levelchange', expect.any(Function));
  });

  it('updates when battery level changes', async () => {
    setupBatteryAPI();
    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current.level).toBe(0.75);
    });

    // Simulate level change
    mockBattery.level = 0.5;
    const levelHandler = (mockBattery.addEventListener.mock.calls as [string, () => void][]).find(
      (call) => call[0] === 'levelchange'
    )?.[1];
    if (levelHandler) {
      levelHandler();
      await waitFor(() => {
        expect(result.current.level).toBe(0.5);
      });
    }
  });

  it('updates when charging state changes', async () => {
    setupBatteryAPI();
    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current.charging).toBe(true);
    });

    mockBattery.charging = false;
    const handler = (mockBattery.addEventListener.mock.calls as [string, () => void][]).find(
      (call) => call[0] === 'chargingchange'
    )?.[1];
    if (handler) {
      handler();
      await waitFor(() => {
        expect(result.current.charging).toBe(false);
      });
    }
  });

  it('handles getBattery rejection', async () => {
    setupBatteryAPI(false);
    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(false);
    });
  });

  it('handles missing getBattery API', () => {
    removeBatteryAPI();
    const { result } = renderHook(() => useBattery());
    expect(result.current.isSupported).toBe(false);
  });

  it('reports dischargingTime when not charging', async () => {
    mockBattery.charging = false;
    mockBattery.chargingTime = Infinity;
    mockBattery.dischargingTime = 7200;
    setupBatteryAPI();

    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current.dischargingTime).toBe(7200);
    });
    expect(result.current.charging).toBe(false);
    expect(result.current.chargingTime).toBe(Infinity);
  });

  it('reports full battery correctly', async () => {
    mockBattery.level = 1;
    mockBattery.charging = false;
    mockBattery.dischargingTime = Infinity;
    setupBatteryAPI();

    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
      expect(result.current.dischargingTime).toBe(Infinity);
    });
    expect(result.current.level).toBe(1);
    expect(result.current.charging).toBe(false);
  });
});
