import { useState, useEffect } from 'react';

export interface BatteryState {
  /** Whether the device is supported */
  isSupported: boolean;
  /** Whether the battery is currently charging */
  charging: boolean;
  /** Time in seconds until battery is fully charged (Infinity if not charging) */
  chargingTime: number;
  /** Time in seconds until battery is fully discharged (Infinity if charging) */
  dischargingTime: number;
  /** Battery level from 0 to 1 */
  level: number;
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export function useBattery(): BatteryState {
  const [state, setState] = useState<BatteryState>({
    isSupported: typeof navigator !== 'undefined' && 'getBattery' in navigator,
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
    level: 1,
  });

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (!nav.getBattery) return;

    let battery: BatteryManager | null = null;

    const updateState = () => {
      if (!battery) return;
      setState({
        isSupported: true,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        level: battery.level,
      });
    };

    nav.getBattery().then((b) => {
      battery = b;
      updateState();

      b.addEventListener('chargingchange', updateState);
      b.addEventListener('chargingtimechange', updateState);
      b.addEventListener('dischargingtimechange', updateState);
      b.addEventListener('levelchange', updateState);
    }).catch(() => {
      setState((prev) => ({ ...prev, isSupported: false }));
    });

    return () => {
      if (battery) {
        battery.removeEventListener('chargingchange', updateState);
        battery.removeEventListener('chargingtimechange', updateState);
        battery.removeEventListener('dischargingtimechange', updateState);
        battery.removeEventListener('levelchange', updateState);
      }
    };
  }, []);

  return state;
}
