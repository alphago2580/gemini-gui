import type { ScalerConfig, ScalerState, ScaleDecision } from './types';

export type { ScalerConfig, ScalerState, ScaleDecision };

const DEFAULT_CONFIG: ScalerConfig = {
  minAgents: 1,
  maxAgents: 8,
  scaleUpThreshold: 2,
  scaleDownThreshold: 0,
  cooldownMs: 30_000,
};

export class Scaler {
  private config: ScalerConfig;
  private lastScaleTime: number = 0;

  constructor(config: Partial<ScalerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  evaluate(currentAgents: number, pendingTasks: number, idleAgents: number): ScaleDecision {
    const now = Date.now();
    const inCooldown = now - this.lastScaleTime < this.config.cooldownMs;

    if (inCooldown) {
      return {
        action: 'none',
        from: currentAgents,
        to: currentAgents,
        reason: 'In cooldown period',
      };
    }

    if (pendingTasks > this.config.scaleUpThreshold && currentAgents < this.config.maxAgents) {
      const needed = Math.min(
        pendingTasks - this.config.scaleUpThreshold,
        this.config.maxAgents - currentAgents
      );
      const target = currentAgents + needed;
      return {
        action: 'scale-up',
        from: currentAgents,
        to: target,
        reason: `${pendingTasks} pending tasks exceed threshold of ${this.config.scaleUpThreshold}`,
      };
    }

    if (idleAgents > this.config.scaleDownThreshold && currentAgents > this.config.minAgents) {
      const removable = Math.min(
        idleAgents - this.config.scaleDownThreshold,
        currentAgents - this.config.minAgents
      );
      const target = currentAgents - removable;
      return {
        action: 'scale-down',
        from: currentAgents,
        to: target,
        reason: `${idleAgents} idle agents exceed threshold of ${this.config.scaleDownThreshold}`,
      };
    }

    return {
      action: 'none',
      from: currentAgents,
      to: currentAgents,
      reason: 'No scaling needed',
    };
  }

  recordScaleEvent(): void {
    this.lastScaleTime = Date.now();
  }

  getConfig(): ScalerConfig {
    return { ...this.config };
  }

  getState(currentAgents: number, pendingTasks: number, idleAgents: number): ScalerState {
    const decision = this.evaluate(currentAgents, pendingTasks, idleAgents);
    return {
      currentAgents,
      desiredAgents: decision.to,
      lastScaleTime: this.lastScaleTime,
      pendingTasks,
      activeAgents: currentAgents - idleAgents,
      idleAgents,
    };
  }

  resetCooldown(): void {
    this.lastScaleTime = 0;
  }
}
