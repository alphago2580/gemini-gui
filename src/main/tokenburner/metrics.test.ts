import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MetricsCollector, TaskMetric } from './metrics';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function makeMetric(overrides: Partial<TaskMetric> = {}): TaskMetric {
  return {
    taskId: 't1',
    agentId: 'a1',
    model: 'claude',
    duration: 60,
    success: true,
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('MetricsCollector', () => {
  let metrics: MetricsCollector;

  beforeEach(() => {
    metrics = new MetricsCollector();
  });

  describe('recordTask', () => {
    it('should record a completed task', () => {
      metrics.recordTask(makeMetric({ taskId: '1', agentId: 'a1', duration: 60 }));
      const summary = metrics.getSummary();
      expect(summary.totalTasks).toBe(1);
    });

    it('should store multiple records', () => {
      metrics.recordTask(makeMetric({ taskId: '1' }));
      metrics.recordTask(makeMetric({ taskId: '2' }));
      expect(metrics.getRecords()).toHaveLength(2);
    });
  });

  describe('getSummary', () => {
    it('should calculate correct success rate', () => {
      metrics.recordTask(makeMetric({ taskId: '1', success: true }));
      metrics.recordTask(makeMetric({ taskId: '2', success: true }));
      metrics.recordTask(makeMetric({ taskId: '3', success: true }));
      metrics.recordTask(makeMetric({ taskId: '4', success: false }));
      const summary = metrics.getSummary();
      expect(summary.successRate).toBe(0.75);
    });

    it('should calculate average duration', () => {
      metrics.recordTask(makeMetric({ taskId: '1', duration: 60 }));
      metrics.recordTask(makeMetric({ taskId: '2', duration: 120 }));
      metrics.recordTask(makeMetric({ taskId: '3', duration: 180 }));
      const summary = metrics.getSummary();
      expect(summary.avgDuration).toBe(120);
    });

    it('should return zero values when empty', () => {
      const summary = metrics.getSummary();
      expect(summary.totalTasks).toBe(0);
      expect(summary.successRate).toBe(0);
      expect(summary.avgDuration).toBe(0);
    });

    it('should count unique agents', () => {
      metrics.recordTask(makeMetric({ agentId: 'a1' }));
      metrics.recordTask(makeMetric({ agentId: 'a2' }));
      metrics.recordTask(makeMetric({ agentId: 'a1' }));
      const summary = metrics.getSummary();
      expect(summary.agentCount).toBe(2);
    });
  });

  describe('getAgentStats', () => {
    it('should return per-agent metrics', () => {
      metrics.recordTask(makeMetric({ agentId: 'a1', success: true, duration: 60 }));
      metrics.recordTask(makeMetric({ agentId: 'a1', success: false, duration: 120 }));
      const stats = metrics.getAgentStats('a1');
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.avgDuration).toBe(90);
    });

    it('should return zero stats for unknown agent', () => {
      const stats = metrics.getAgentStats('unknown');
      expect(stats.completed).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    it('should not include other agents records', () => {
      metrics.recordTask(makeMetric({ agentId: 'a1', success: true }));
      metrics.recordTask(makeMetric({ agentId: 'a2', success: false }));
      const stats = metrics.getAgentStats('a1');
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(0);
    });
  });

  describe('save/load', () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metrics-test-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should persist and restore metrics', async () => {
      metrics.recordTask(makeMetric({ taskId: 'saved-1' }));
      const filePath = path.join(tmpDir, 'metrics.json');
      await metrics.save(filePath);

      const loaded = new MetricsCollector();
      await loaded.load(filePath);
      expect(loaded.getSummary().totalTasks).toBe(1);
      expect(loaded.getRecords()[0].taskId).toBe('saved-1');
    });

    it('should persist multiple records', async () => {
      metrics.recordTask(makeMetric({ taskId: '1' }));
      metrics.recordTask(makeMetric({ taskId: '2' }));
      const filePath = path.join(tmpDir, 'metrics.json');
      await metrics.save(filePath);

      const loaded = new MetricsCollector();
      await loaded.load(filePath);
      expect(loaded.getSummary().totalTasks).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all records', () => {
      metrics.recordTask(makeMetric());
      metrics.recordTask(makeMetric());
      metrics.clear();
      expect(metrics.getSummary().totalTasks).toBe(0);
      expect(metrics.getRecords()).toHaveLength(0);
    });
  });
});
