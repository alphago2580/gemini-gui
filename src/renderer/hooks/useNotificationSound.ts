import { useCallback, useRef } from 'react';

/**
 * Plays a short notification chime using Web Audio API.
 * No external audio files needed — generates a pleasant two-tone beep.
 */
export function useNotificationSound(enabled: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    if (!enabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      // First tone (C5 = 523 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = 523;
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      // Second tone (E5 = 659 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 659;
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext may not be available in some environments
    }
  }, [enabled]);

  return { play };
}
