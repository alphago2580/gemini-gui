import { useState, useEffect, useCallback, useRef } from 'react';

export interface GamepadState {
  id: string;
  index: number;
  connected: boolean;
  buttons: GamepadButtonState[];
  axes: number[];
  timestamp: number;
}

export interface GamepadButtonState {
  pressed: boolean;
  touched: boolean;
  value: number;
}

export interface UseGamepadOptions {
  pollInterval?: number;
}

export interface UseGamepadReturn {
  gamepads: GamepadState[];
  isSupported: boolean;
  getGamepad: (index: number) => GamepadState | null;
}

function mapGamepad(gp: Gamepad): GamepadState {
  return {
    id: gp.id,
    index: gp.index,
    connected: gp.connected,
    buttons: Array.from(gp.buttons).map(btn => ({
      pressed: btn.pressed,
      touched: btn.touched,
      value: btn.value,
    })),
    axes: Array.from(gp.axes),
    timestamp: gp.timestamp,
  };
}

function checkGamepadSupport(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function';
}

export function useGamepad(options: UseGamepadOptions = {}): UseGamepadReturn {
  const { pollInterval = 100 } = options;
  const isSupported = checkGamepadSupport();

  const [gamepads, setGamepads] = useState<GamepadState[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastPollRef = useRef(0);

  const pollGamepads = useCallback(() => {
    if (!isSupported) return;

    const now = performance.now();
    if (now - lastPollRef.current >= pollInterval) {
      lastPollRef.current = now;
      const rawGamepads = navigator.getGamepads();
      const mapped: GamepadState[] = [];
      for (const gp of rawGamepads) {
        if (gp) {
          mapped.push(mapGamepad(gp));
        }
      }
      setGamepads(mapped);
    }

    // Cancel any existing frame before scheduling a new one to prevent duplicate chains
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(pollGamepads);
  }, [isSupported, pollInterval]);

  useEffect(() => {
    if (!isSupported) return;

    const handleConnect = () => {
      pollGamepads();
    };

    const handleDisconnect = () => {
      const rawGamepads = navigator.getGamepads();
      const mapped: GamepadState[] = [];
      for (const gp of rawGamepads) {
        if (gp) {
          mapped.push(mapGamepad(gp));
        }
      }
      setGamepads(mapped);
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    rafRef.current = requestAnimationFrame(pollGamepads);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isSupported, pollGamepads]);

  const getGamepad = useCallback((index: number): GamepadState | null => {
    return gamepads.find(gp => gp.index === index) ?? null;
  }, [gamepads]);

  return { gamepads, isSupported, getGamepad };
}
