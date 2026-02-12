import { describe, it, expect, beforeEach } from 'vitest';
import { Scaler } from './scaler';

describe('Scaler', () => {
  let scaler: Scaler;

  beforeEach(() => {
    scaler = new Scaler({
      minAgents: 1,
      maxAgents: 8,
      scaleUpThreshold: 2,
      scaleDownThreshold: 0,
      cooldownMs: 30_000,
    });
  });

  describe('evaluate', () => {
    it('should recommend scale-up when pending tasks exceed threshold', () => {
      const decision = scaler.evaluate(2, 5, 0);
      expect(decision.action).toBe('scale-up');
      expect(decision.to).toBeGreaterThan(2);
    });

    it('should recommend scale-down when idle agents exceed threshold', () => {
      const decision = scaler.evaluate(4, 0, 3);
      expect(decision.action).toBe('scale-down');
      expect(decision.to).toBeLessThan(4);
    });

    it('should return none when no scaling needed', () => {
      const decision = scaler.evaluate(3, 1, 0);
      expect(decision.action).toBe('none');
      expect(decision.to).toBe(3);
    });

    it('should not scale below minAgents', () => {
      const decision = scaler.evaluate(1, 0, 1);
      expect(decision.action).toBe('none');
      expect(decision.to).toBe(1);
    });

    it('should not scale above maxAgents', () => {
      const decision = scaler.evaluate(8, 10, 0);
      expect(decision.action).toBe('none');
      expect(decision.to).toBe(8);
    });

    it('should respect cooldown period', () => {
      scaler.recordScaleEvent();
      const decision = scaler.evaluate(2, 5, 0);
      expect(decision.action).toBe('none');
      expect(decision.reason).toContain('cooldown');
    });

    it('should allow scaling after cooldown expires', () => {
      scaler.resetCooldown();
      const decision = scaler.evaluate(2, 5, 0);
      expect(decision.action).toBe('scale-up');
    });

    it('should include reason in decision', () => {
      const decision = scaler.evaluate(2, 5, 0);
      expect(decision.reason).toBeTruthy();
      expect(typeof decision.reason).toBe('string');
    });

    it('should cap scale-up to maxAgents', () => {
      const decision = scaler.evaluate(6, 20, 0);
      expect(decision.to).toBeLessThanOrEqual(8);
    });

    it('should cap scale-down to minAgents', () => {
      const decision = scaler.evaluate(3, 0, 3);
      expect(decision.to).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the config', () => {
      const config = scaler.getConfig();
      expect(config.minAgents).toBe(1);
      expect(config.maxAgents).toBe(8);
    });

    it('should use default config when none provided', () => {
      const defaultScaler = new Scaler();
      const config = defaultScaler.getConfig();
      expect(config.minAgents).toBe(1);
      expect(config.maxAgents).toBe(8);
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const state = scaler.getState(4, 3, 1);
      expect(state.currentAgents).toBe(4);
      expect(state.pendingTasks).toBe(3);
      expect(state.idleAgents).toBe(1);
      expect(state.activeAgents).toBe(3);
    });

    it('should include desired agents based on evaluation', () => {
      const state = scaler.getState(2, 5, 0);
      expect(state.desiredAgents).toBeGreaterThan(2);
    });
  });

  describe('resetCooldown', () => {
    it('should allow immediate scaling after reset', () => {
      scaler.recordScaleEvent();
      const blocked = scaler.evaluate(2, 5, 0);
      expect(blocked.action).toBe('none');

      scaler.resetCooldown();
      const allowed = scaler.evaluate(2, 5, 0);
      expect(allowed.action).toBe('scale-up');
    });
  });
});
