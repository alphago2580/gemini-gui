import { describe, it, expect, vi } from 'vitest';
// import { runHarnessLoop, HarnessEvent } from './harness';

describe('Harness', () => {
  describe('runHarnessLoop', () => {
    it('should claim task, run agent, test, and merge on success', () => {
      // Mock: queue with 1 task, agent completes, tests pass, merge succeeds
      // const events: HarnessEvent[] = [];
      // await runHarnessLoop(agent, queue, gitOps, testGate, config, (e) => events.push(e));
      // expect(events.map(e => e.type)).toContain('claim');
      // expect(events.map(e => e.type)).toContain('test-result');
      // expect(events.map(e => e.type)).toContain('merge');
      // expect(events.map(e => e.type)).toContain('complete');
      expect(true).toBe(false); // TODO: implement
    });

    it('should retry when tests fail', () => {
      // Mock: tests fail first time, pass second time
      // const events: HarnessEvent[] = [];
      // await runHarnessLoop(...);
      // const testResults = events.filter(e => e.type === 'test-result');
      // expect(testResults.length).toBeGreaterThan(1);
      expect(true).toBe(false); // TODO: implement
    });

    it('should fail task when max retries exceeded', () => {
      // Mock: tests always fail
      // const events: HarnessEvent[] = [];
      // await runHarnessLoop(...);
      // expect(events.map(e => e.type)).toContain('fail');
      expect(true).toBe(false); // TODO: implement
    });

    it('should idle with backoff when queue is empty', () => {
      // Mock: empty queue
      // const events: HarnessEvent[] = [];
      // run loop for a short time
      // expect(events.map(e => e.type)).toContain('idle');
      expect(true).toBe(false); // TODO: implement
    });

    it('should handle merge conflicts with retry', () => {
      // Mock: merge fails first, succeeds after rebase
      // expect merge event to show retryCount > 0
      expect(true).toBe(false); // TODO: implement
    });
  });
});
