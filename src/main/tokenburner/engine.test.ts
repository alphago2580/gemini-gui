import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TokenBurnerEngine } from './engine';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('TokenBurnerEngine', () => {
  let engine: TokenBurnerEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'engine-test-'));
    engine = new TokenBurnerEngine();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('init', () => {
    it('should initialize with project path', async () => {
      await engine.init(tmpDir);
      expect(engine.getConfig().project.repo).toBe(tmpDir);
    });

    it('should create .tokenburner directory', async () => {
      await engine.init(tmpDir);
      expect(fs.existsSync(path.join(tmpDir, '.tokenburner'))).toBe(true);
    });

    it('should create queue directory for TaskQueue', async () => {
      await engine.init(tmpDir);
      expect(fs.existsSync(path.join(tmpDir, '.tokenburner', 'queue'))).toBe(true);
    });
  });

  describe('launch/stop', () => {
    it('should launch specified number of agents', async () => {
      await engine.init(tmpDir);
      await engine.launch(4);
      const agents = engine.getAgentStates();
      expect(agents).toHaveLength(4);
    });

    it('should stop all agents', async () => {
      await engine.init(tmpDir);
      await engine.launch(4);
      await engine.stop();
      const agents = engine.getAgentStates();
      expect(agents.every((a) => a.status === 'idle')).toBe(true);
    });
  });

  describe('addTask', () => {
    it('should add task to queue', async () => {
      await engine.init(tmpDir);
      const id = await engine.addTask('Test', 'Description', 'high');
      expect(id).toBeDefined();
      const status = await engine.getQueueStatus();
      expect(status.pending).toBe(1);
    });

    it('should throw if called before init', async () => {
      await expect(engine.addTask('Test', 'Desc')).rejects.toThrow('Engine not initialized');
    });
  });

  describe('getDashboardData', () => {
    it('should return complete dashboard state', async () => {
      await engine.init(tmpDir);
      const data = await engine.getDashboardData();
      expect(data).toHaveProperty('projectName');
      expect(data).toHaveProperty('agents');
      expect(data).toHaveProperty('queue');
      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('isRunning');
    });
  });

  describe('events', () => {
    it('should emit agent events', async () => {
      const events: unknown[] = [];
      engine.on('engine-event', (e) => events.push(e));
      await engine.init(tmpDir);
      await engine.launch(1);
      expect(events.length).toBeGreaterThan(0);
      expect(events.some((e: any) => e.type === 'engine-started')).toBe(true);
    });
  });

  describe('metrics integration', () => {
    it('should use MetricsCollector for metrics', async () => {
      await engine.init(tmpDir);
      const metrics = engine.getMetrics();
      const summary = metrics.getSummary();
      expect(summary.totalTasks).toBe(0);
      expect(summary.successRate).toBe(0);
      expect(summary.avgDuration).toBe(0);
      expect(summary.totalDuration).toBe(0);
    });

    it('should record and report task metrics', async () => {
      await engine.init(tmpDir);
      const metrics = engine.getMetrics();
      metrics.recordTask({
        taskId: 'test-1',
        agentId: 'agent-1',
        model: 'claude',
        duration: 5000,
        success: true,
      });
      const summary = metrics.getSummary();
      expect(summary.totalTasks).toBe(1);
      expect(summary.successRate).toBe(1);
    });
  });

  describe('queue integration', () => {
    it('should use real TaskQueue after init', async () => {
      await engine.init(tmpDir);
      const queue = engine.getQueue();
      const id = await queue.add('Task 1', 'Description');
      const task = await queue.get(id);
      expect(task).not.toBeNull();
      expect(task!.title).toBe('Task 1');
    });

    it('should persist queue to disk', async () => {
      await engine.init(tmpDir);
      await engine.addTask('Persistent Task', 'Should be on disk');
      const queueFile = path.join(tmpDir, '.tokenburner', 'queue', 'queue.json');
      expect(fs.existsSync(queueFile)).toBe(true);
      const data = JSON.parse(fs.readFileSync(queueFile, 'utf-8'));
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Persistent Task');
    });
  });

  describe('custom dependencies', () => {
    it('should accept custom queue via options', async () => {
      const mockQueue = {
        add: vi.fn().mockResolvedValue('mock-id'),
        claim: vi.fn().mockResolvedValue(null),
        complete: vi.fn().mockResolvedValue(undefined),
        fail: vi.fn().mockResolvedValue(undefined),
        unclaim: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(null),
        list: vi.fn().mockResolvedValue([]),
        status: vi.fn().mockResolvedValue({ pending: 0, active: 0, complete: 0, failed: 0, total: 0 }),
        import: vi.fn().mockResolvedValue([]),
      };

      const customEngine = new TokenBurnerEngine({ queue: mockQueue });
      await customEngine.init(tmpDir);
      const id = await customEngine.addTask('Custom', 'Task');
      expect(id).toBe('mock-id');
      expect(mockQueue.add).toHaveBeenCalledWith('Custom', 'Task', 'normal');
    });
  });
});
