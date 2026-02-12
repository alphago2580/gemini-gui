import { describe, it, expect, vi } from 'vitest';
import { runHarnessLoop, HarnessEvent, AgentLike, QueueLike, GitOpsLike, TestGateLike } from './harness';

function createMockAgent(): AgentLike {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  return {
    start: vi.fn(async () => {
      // Simulate immediate completion
      setTimeout(() => {
        listeners['complete']?.forEach(fn => fn());
      }, 0);
    }),
    stop: vi.fn(async () => {}),
    isRunning: vi.fn(() => false),
    on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(listener);
    }),
    removeAllListeners: vi.fn((event?: string) => {
      if (event) {
        delete listeners[event];
      } else {
        Object.keys(listeners).forEach(k => delete listeners[k]);
      }
    }),
  };
}

function createMockQueue(tasks: Array<{ id: string; title: string; description: string }>): QueueLike {
  const pending = [...tasks];
  return {
    claim: vi.fn(async () => pending.shift() || null),
    complete: vi.fn(async () => {}),
    fail: vi.fn(async () => {}),
  };
}

function createMockGitOps(mergeSuccess = true, mergeRetryCount = 0): GitOpsLike {
  return {
    createWorktree: vi.fn(async () => '/tmp/worktree'),
    removeWorktree: vi.fn(async () => {}),
    mergeBranch: vi.fn(async () => ({
      success: mergeSuccess,
      retryCount: mergeRetryCount,
      conflictFiles: mergeSuccess ? undefined : ['file.ts'],
    })),
    hasNewCommits: vi.fn(async () => true),
  };
}

function createMockTestGate(results: boolean[]): TestGateLike {
  let callIndex = 0;
  return {
    runTests: vi.fn(async () => {
      const success = results[callIndex] ?? results[results.length - 1];
      callIndex++;
      return { success, rawOutput: success ? 'All tests passed' : 'FAIL: some test' };
    }),
  };
}

describe('Harness', () => {
  describe('runHarnessLoop', () => {
    it('should claim task, run agent, test, and merge on success', async () => {
      const agent = createMockAgent();
      const queue = createMockQueue([{ id: '1', title: 'Task 1', description: 'Do something' }]);
      const gitOps = createMockGitOps(true);
      const testGate = createMockTestGate([true]);

      const events: HarnessEvent[] = [];
      const signal = { stopped: false };

      // Stop after first cycle
      const origClaim = queue.claim as ReturnType<typeof vi.fn>;
      let callCount = 0;
      origClaim.mockImplementation(async () => {
        callCount++;
        if (callCount > 1) {
          signal.stopped = true;
          return null;
        }
        return { id: '1', title: 'Task 1', description: 'Do something' };
      });

      await runHarnessLoop(agent, queue, gitOps, testGate, {}, (e) => events.push(e), signal);

      const types = events.map(e => e.type);
      expect(types).toContain('claim');
      expect(types).toContain('test-result');
      expect(types).toContain('merge');
      expect(types).toContain('complete');
    });

    it('should retry when tests fail', async () => {
      const agent = createMockAgent();
      const queue = createMockQueue([]);
      const gitOps = createMockGitOps(true);
      // First test fails, second succeeds
      const testGate = createMockTestGate([false, true]);

      const events: HarnessEvent[] = [];
      const signal = { stopped: false };

      const origClaim = queue.claim as ReturnType<typeof vi.fn>;
      let callCount = 0;
      origClaim.mockImplementation(async () => {
        callCount++;
        if (callCount > 1) {
          signal.stopped = true;
          return null;
        }
        return { id: '2', title: 'Task 2', description: 'Do something' };
      });

      await runHarnessLoop(agent, queue, gitOps, testGate, { maxRetries: 3 }, (e) => events.push(e), signal);

      const testResults = events.filter(e => e.type === 'test-result');
      expect(testResults.length).toBeGreaterThan(1);
      expect(testResults[0].success).toBe(false);
      expect(testResults[1].success).toBe(true);
    });

    it('should fail task when max retries exceeded', async () => {
      const agent = createMockAgent();
      const queue = createMockQueue([]);
      const gitOps = createMockGitOps(true);
      // Tests always fail
      const testGate = createMockTestGate([false]);

      const events: HarnessEvent[] = [];
      const signal = { stopped: false };

      const origClaim = queue.claim as ReturnType<typeof vi.fn>;
      let callCount = 0;
      origClaim.mockImplementation(async () => {
        callCount++;
        if (callCount > 1) {
          signal.stopped = true;
          return null;
        }
        return { id: '3', title: 'Task 3', description: 'Do something' };
      });

      await runHarnessLoop(agent, queue, gitOps, testGate, { maxRetries: 2 }, (e) => events.push(e), signal);

      const types = events.map(e => e.type);
      expect(types).toContain('fail');
      expect(queue.fail).toHaveBeenCalled();
    });

    it('should idle with backoff when queue is empty', async () => {
      const agent = createMockAgent();
      const queue = createMockQueue([]);
      const gitOps = createMockGitOps(true);
      const testGate = createMockTestGate([true]);

      const events: HarnessEvent[] = [];
      const signal = { stopped: false };

      // Stop after 2 idle cycles
      let idleCount = 0;
      const origClaim = queue.claim as ReturnType<typeof vi.fn>;
      origClaim.mockImplementation(async () => {
        idleCount++;
        if (idleCount >= 2) signal.stopped = true;
        return null;
      });

      await runHarnessLoop(agent, queue, gitOps, testGate, { idleBackoffMs: 10 }, (e) => events.push(e), signal);

      const types = events.map(e => e.type);
      expect(types).toContain('idle');
    });

    it('should handle merge conflicts with retry', async () => {
      const agent = createMockAgent();
      const queue = createMockQueue([]);
      // Merge succeeds after internal retries (retryCount > 0)
      const gitOps = createMockGitOps(true, 2);
      const testGate = createMockTestGate([true]);

      const events: HarnessEvent[] = [];
      const signal = { stopped: false };

      const origClaim = queue.claim as ReturnType<typeof vi.fn>;
      let callCount = 0;
      origClaim.mockImplementation(async () => {
        callCount++;
        if (callCount > 1) {
          signal.stopped = true;
          return null;
        }
        return { id: '5', title: 'Task 5', description: 'Conflict task' };
      });

      await runHarnessLoop(agent, queue, gitOps, testGate, {}, (e) => events.push(e), signal);

      const mergeEvents = events.filter(e => e.type === 'merge');
      expect(mergeEvents.length).toBe(1);
      expect(mergeEvents[0].retryCount).toBeGreaterThan(0);
    });
  });
});
