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
      const id = engine.addTask('Test', 'Description', 'high');
      expect(id).toBeDefined();
      const status = engine.getQueueStatus();
      expect(status.pending).toBe(1);
    });
  });

  describe('getDashboardData', () => {
    it('should return complete dashboard state', async () => {
      await engine.init(tmpDir);
      const data = engine.getDashboardData();
      expect(data).toHaveProperty('projectName');
      expect(data).toHaveProperty('agents');
      expect(data).toHaveProperty('queue');
      expect(data).toHaveProperty('metrics');
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
});
