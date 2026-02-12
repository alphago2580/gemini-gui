import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { Agent } from './agent';

describe('Agent', () => {
  describe('constructor', () => {
    it('should initialize with idle status', () => {
      // const agent = new Agent('agent-1', 'claude', config);
      // expect(agent.status).toBe('idle');
      // expect(agent.currentTask).toBeNull();
      expect(true).toBe(false); // TODO: implement
    });
  });

  describe('start', () => {
    it('should spawn CLI process and set status to working', () => {
      // await agent.start(task, '/tmp/worktree', 'Build X');
      // expect(agent.status).toBe('working');
      // expect(agent.isRunning()).toBe(true);
      expect(true).toBe(false); // TODO: implement
    });

    it('should emit output events from CLI stdout', () => {
      // const outputs: string[] = [];
      // agent.on('output', (data) => outputs.push(data));
      // await agent.start(task, worktree, prompt);
      // expect(outputs.length).toBeGreaterThan(0);
      expect(true).toBe(false); // TODO: implement
    });

    it('should emit complete when CLI process exits', () => {
      // const complete = vi.fn();
      // agent.on('complete', complete);
      // ... wait for process to finish ...
      // expect(complete).toHaveBeenCalled();
      expect(true).toBe(false); // TODO: implement
    });

    it('should emit timeout when exceeding time limit', () => {
      // const timeout = vi.fn();
      // agent.on('timeout', timeout);
      // agent with 1s timeout
      // expect(timeout).toHaveBeenCalled();
      expect(true).toBe(false); // TODO: implement
    });
  });

  describe('stop', () => {
    it('should kill the CLI process', () => {
      // await agent.start(task, worktree, prompt);
      // await agent.stop();
      // expect(agent.isRunning()).toBe(false);
      // expect(agent.status).toBe('idle');
      expect(true).toBe(false); // TODO: implement
    });
  });

  describe('elapsed', () => {
    it('should return elapsed time in seconds', () => {
      // agent.startedAt = Date.now() - 5000;
      // expect(agent.elapsed()).toBeCloseTo(5, 0);
      expect(true).toBe(false); // TODO: implement
    });

    it('should return 0 when not started', () => {
      // expect(agent.elapsed()).toBe(0);
      expect(true).toBe(false); // TODO: implement
    });
  });
});
