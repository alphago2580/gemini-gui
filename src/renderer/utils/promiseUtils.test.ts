import {
  withTimeout,
  TimeoutError,
  delay,
  withRetry,
  settleAll,
  deferred,
  sequential,
  pool,
} from './promiseUtils';

describe('promiseUtils', () => {
  describe('delay', () => {
    it('resolves after specified time', async () => {
      vi.useFakeTimers();
      const p = delay(100);
      vi.advanceTimersByTime(100);
      await expect(p).resolves.toBeUndefined();
      vi.useRealTimers();
    });

    it('does not resolve before specified time', async () => {
      vi.useFakeTimers();
      let resolved = false;
      delay(100).then(() => { resolved = true; });
      vi.advanceTimersByTime(99);
      await Promise.resolve();
      expect(resolved).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('withTimeout', () => {
    it('resolves when promise completes before timeout', async () => {
      const p = withTimeout(Promise.resolve(42), 1000);
      await expect(p).resolves.toBe(42);
    });

    it('rejects with TimeoutError when promise exceeds timeout', async () => {
      vi.useFakeTimers();
      const slow = new Promise(() => {});
      const p = withTimeout(slow, 100);
      vi.advanceTimersByTime(100);
      await expect(p).rejects.toThrow(TimeoutError);
      vi.useRealTimers();
    });

    it('TimeoutError contains timeout duration', async () => {
      vi.useFakeTimers();
      const slow = new Promise(() => {});
      const p = withTimeout(slow, 500);
      vi.advanceTimersByTime(500);
      await expect(p).rejects.toThrow('500ms');
      vi.useRealTimers();
    });

    it('passes through promise rejection', async () => {
      const p = withTimeout(Promise.reject(new Error('fail')), 1000);
      await expect(p).rejects.toThrow('fail');
    });

    it('TimeoutError has correct name', () => {
      const err = new TimeoutError(100);
      expect(err.name).toBe('TimeoutError');
      expect(err instanceof Error).toBe(true);
    });
  });

  describe('withRetry', () => {
    it('returns result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      const result = await withRetry(fn);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail1'))
        .mockResolvedValue('ok');
      const result = await withRetry(fn, { delayMs: 1 });
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throws after all attempts exhausted', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('always fail'));
      await expect(withRetry(fn, { attempts: 2, delayMs: 1 })).rejects.toThrow('always fail');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('calls onRetry callback', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('e1'))
        .mockResolvedValue('ok');
      await withRetry(fn, { delayMs: 1, onRetry });
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
    });

    it('applies exponential backoff', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('e1'))
        .mockRejectedValueOnce(new Error('e2'))
        .mockResolvedValue('ok');
      const result = await withRetry(fn, { attempts: 3, delayMs: 1, backoff: true });
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('defaults to 3 attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(withRetry(fn, { delayMs: 1 })).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('settleAll', () => {
    it('returns fulfilled results', async () => {
      const results = await settleAll([
        Promise.resolve(1),
        Promise.resolve(2),
      ]);
      expect(results).toEqual([
        { status: 'fulfilled', value: 1 },
        { status: 'fulfilled', value: 2 },
      ]);
    });

    it('returns rejected results', async () => {
      const results = await settleAll([
        Promise.reject('err'),
      ]);
      expect(results).toEqual([
        { status: 'rejected', reason: 'err' },
      ]);
    });

    it('handles mixed results', async () => {
      const results = await settleAll([
        Promise.resolve('ok'),
        Promise.reject('bad'),
        Promise.resolve(42),
      ]);
      expect(results[0]).toEqual({ status: 'fulfilled', value: 'ok' });
      expect(results[1]).toEqual({ status: 'rejected', reason: 'bad' });
      expect(results[2]).toEqual({ status: 'fulfilled', value: 42 });
    });

    it('handles empty array', async () => {
      const results = await settleAll([]);
      expect(results).toEqual([]);
    });
  });

  describe('deferred', () => {
    it('creates a resolvable deferred', async () => {
      const d = deferred<number>();
      d.resolve(42);
      await expect(d.promise).resolves.toBe(42);
    });

    it('creates a rejectable deferred', async () => {
      const d = deferred<number>();
      d.reject(new Error('fail'));
      await expect(d.promise).rejects.toThrow('fail');
    });

    it('promise is pending until resolved', async () => {
      const d = deferred<string>();
      let resolved = false;
      d.promise.then(() => { resolved = true; });
      await Promise.resolve();
      expect(resolved).toBe(false);
      d.resolve('done');
      await Promise.resolve();
      expect(resolved).toBe(true);
    });

    it('returns object with promise, resolve, reject', () => {
      const d = deferred<number>();
      expect(d.promise).toBeInstanceOf(Promise);
      expect(typeof d.resolve).toBe('function');
      expect(typeof d.reject).toBe('function');
    });
  });

  describe('sequential', () => {
    it('executes tasks in order', async () => {
      const order: number[] = [];
      const tasks = [
        async () => { order.push(1); return 'a'; },
        async () => { order.push(2); return 'b'; },
        async () => { order.push(3); return 'c'; },
      ];
      const results = await sequential(tasks);
      expect(results).toEqual(['a', 'b', 'c']);
      expect(order).toEqual([1, 2, 3]);
    });

    it('handles empty array', async () => {
      const results = await sequential([]);
      expect(results).toEqual([]);
    });

    it('propagates errors', async () => {
      const tasks = [
        async () => 1,
        async () => { throw new Error('fail'); },
        async () => 3,
      ];
      await expect(sequential(tasks)).rejects.toThrow('fail');
    });
  });

  describe('pool', () => {
    it('executes all tasks with limited concurrency', async () => {
      const results = await pool(
        [async () => 1, async () => 2, async () => 3],
        2
      );
      expect(results).toEqual([1, 2, 3]);
    });

    it('respects concurrency limit', async () => {
      let maxConcurrent = 0;
      let current = 0;
      const tasks = Array.from({ length: 5 }, () => async () => {
        current++;
        maxConcurrent = Math.max(maxConcurrent, current);
        await new Promise(r => setTimeout(r, 10));
        current--;
        return current;
      });
      await pool(tasks, 2);
      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });

    it('handles empty array', async () => {
      const results = await pool([], 3);
      expect(results).toEqual([]);
    });

    it('preserves result order', async () => {
      const tasks = [
        async () => { await new Promise(r => setTimeout(r, 30)); return 'slow'; },
        async () => { await new Promise(r => setTimeout(r, 10)); return 'fast'; },
        async () => 'instant',
      ];
      const results = await pool(tasks, 2);
      expect(results).toEqual(['slow', 'fast', 'instant']);
    });

    it('handles concurrency larger than task count', async () => {
      const results = await pool(
        [async () => 'a', async () => 'b'],
        10
      );
      expect(results).toEqual(['a', 'b']);
    });
  });
});
