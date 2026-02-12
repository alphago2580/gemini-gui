import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Agent, AgentConfig, AgentTask } from './agent';

const defaultConfig: AgentConfig = {
  timeoutMs: 0,
  cliCommand: 'echo',
  cliArgs: [],
};

const sampleTask: AgentTask = {
  id: 'task-1',
  title: 'Test task',
  description: 'A test task description',
};

describe('Agent', () => {
  describe('constructor', () => {
    it('should initialize with idle status', () => {
      const agent = new Agent('agent-1', 'claude', defaultConfig);
      expect(agent.status).toBe('idle');
      expect(agent.currentTask).toBeNull();
    });
  });

  describe('start', () => {
    it('should spawn CLI process and set status to working', async () => {
      const config: AgentConfig = {
        timeoutMs: 5000,
        cliCommand: 'echo',
        cliArgs: ['hello'],
      };
      const agent = new Agent('agent-1', 'claude', config);

      // Start returns immediately; the process will finish quickly since it's `echo`
      const startPromise = agent.start(sampleTask, '/tmp', 'Build X');
      expect(agent.status).toBe('working');
      expect(agent.isRunning()).toBe(true);

      // Wait for the process to complete
      await new Promise<void>(resolve => {
        agent.on('complete', () => resolve());
      });
    });

    it('should emit output events from CLI stdout', async () => {
      const config: AgentConfig = {
        timeoutMs: 5000,
        cliCommand: 'echo',
        cliArgs: [],
      };
      const agent = new Agent('agent-1', 'claude', config);

      const outputs: string[] = [];
      agent.on('output', (data: string) => outputs.push(data));

      await agent.start(sampleTask, '/tmp', 'test prompt');

      await new Promise<void>(resolve => {
        agent.on('complete', () => resolve());
      });

      // echo outputs something to stdout (the args include --worktree, --prompt, etc.)
      expect(outputs.length).toBeGreaterThan(0);
    });

    it('should emit complete when CLI process exits', async () => {
      const config: AgentConfig = {
        timeoutMs: 5000,
        cliCommand: 'echo',
        cliArgs: ['done'],
      };
      const agent = new Agent('agent-1', 'claude', config);

      const complete = vi.fn();
      agent.on('complete', complete);

      await agent.start(sampleTask, '/tmp', 'Build X');

      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 500);
      });

      expect(complete).toHaveBeenCalled();
    });

    it('should emit timeout when exceeding time limit', async () => {
      const config: AgentConfig = {
        timeoutMs: 100, // Very short timeout
        cliCommand: 'bash',
        cliArgs: ['-c', 'sleep 10'],
      };
      const agent = new Agent('agent-1', 'claude', config);

      const timeout = vi.fn();
      agent.on('timeout', timeout);

      await agent.start(sampleTask, '/tmp', 'Build X');

      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 500);
      });

      expect(timeout).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should kill the CLI process', async () => {
      const config: AgentConfig = {
        timeoutMs: 10000,
        cliCommand: 'bash',
        cliArgs: ['-c', 'sleep 30'],
      };
      const agent = new Agent('agent-1', 'claude', config);

      await agent.start(sampleTask, '/tmp', 'Build X');
      expect(agent.isRunning()).toBe(true);

      await agent.stop();
      expect(agent.isRunning()).toBe(false);
      expect(agent.status).toBe('idle');
    });
  });

  describe('elapsed', () => {
    it('should return elapsed time in seconds', () => {
      const agent = new Agent('agent-1', 'claude', defaultConfig);
      agent.startedAt = Date.now() - 5000;
      expect(agent.elapsed()).toBeCloseTo(5, 0);
    });

    it('should return 0 when not started', () => {
      const agent = new Agent('agent-1', 'claude', defaultConfig);
      expect(agent.elapsed()).toBe(0);
    });
  });
});
