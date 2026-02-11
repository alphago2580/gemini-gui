import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateDelay,
  addJitter,
  sleep,
  retry,
  retrySync,
  withRetry,
  isNetworkError,
  isRetryableStatus,
} from './retryUtils';

describe('retryUtils', () => {
  describe('calculateDelay', () => {
    it('returns base delay for first attempt', () => {
      expect(calculateDelay(1, 1000)).toBe(1000);
    });

    it('applies exponential backoff', () => {
      expect(calculateDelay(1, 1000, 2)).toBe(1000);
      expect(calculateDelay(2, 1000, 2)).toBe(2000);
      expect(calculateDelay(3, 1000, 2)).toBe(4000);
      expect(calculateDelay(4, 1000, 2)).toBe(8000);
    });

    it('respects max delay', () => {
      expect(calculateDelay(10, 1000, 2, 5000)).toBe(5000);
    });

    it('defaults to multiplier 1 (no backoff)', () => {
      expect(calculateDelay(1, 500)).toBe(500);
      expect(calculateDelay(5, 500)).toBe(500);
    });

    it('defaults max delay to 30000', () => {
      expect(calculateDelay(100, 1000, 2)).toBe(30000);
    });
  });

  describe('addJitter', () => {
    it('returns a value >= base delay', () => {
      for (let i = 0; i < 20; i++) {
        expect(addJitter(1000)).toBeGreaterThanOrEqual(1000);
      }
    });

    it('returns a value <= base delay * (1 + jitterFactor)', () => {
      for (let i = 0; i < 20; i++) {
        expect(addJitter(1000, 0.5)).toBeLessThanOrEqual(1500);
      }
    });

    it('returns integer values', () => {
      for (let i = 0; i < 10; i++) {
        const result = addJitter(1000, 0.3);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('with zero jitter returns base delay', () => {
      expect(addJitter(1000, 0)).toBe(1000);
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('resolves after specified ms', async () => {
      const promise = sleep(500);
      vi.advanceTimersByTime(500);
      await expect(promise).resolves.toBeUndefined();
    });

    it('does not resolve before specified ms', async () => {
      let resolved = false;
      sleep(100).then(() => { resolved = true; });

      vi.advanceTimersByTime(50);
      await Promise.resolve();
      expect(resolved).toBe(false);

      vi.advanceTimersByTime(50);
      await Promise.resolve();
    });
  });

  describe('retry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns success on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      const resultPromise = retry(fn);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('ok');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('ok');

      const resultPromise = retry(fn, { maxAttempts: 3, delayMs: 100 });

      // First attempt fails, wait for delay
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('ok');
      expect(result.attempts).toBe(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('returns failure after all attempts exhausted', async () => {
      const error = new Error('always fail');
      const fn = vi.fn().mockRejectedValue(error);

      const resultPromise = retry(fn, { maxAttempts: 3, delayMs: 10 });

      await vi.advanceTimersByTimeAsync(10);
      await vi.advanceTimersByTimeAsync(10);

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.attempts).toBe(3);
    });

    it('calls onRetry callback', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('ok');

      const resultPromise = retry(fn, {
        maxAttempts: 3,
        delayMs: 50,
        onRetry,
      });

      await vi.advanceTimersByTimeAsync(50);
      await resultPromise;

      expect(onRetry).toHaveBeenCalledWith(
        expect.any(Error),
        1,
        50
      );
    });

    it('stops retrying when shouldRetry returns false', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      const resultPromise = retry(fn, {
        maxAttempts: 5,
        delayMs: 10,
        shouldRetry: (_error, attempt) => attempt < 2,
      });

      await vi.advanceTimersByTimeAsync(10);

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('uses exponential backoff', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('1'))
        .mockRejectedValueOnce(new Error('2'))
        .mockResolvedValue('ok');

      const resultPromise = retry(fn, {
        maxAttempts: 3,
        delayMs: 100,
        backoffMultiplier: 2,
        onRetry,
      });

      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      await resultPromise;

      expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1, 100);
      expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2, 200);
    });

    it('uses default options when none specified', async () => {
      const fn = vi.fn().mockResolvedValue('data');
      const result = await retry(fn);

      expect(result.success).toBe(true);
      expect(result.data).toBe('data');
    });
  });

  describe('retrySync', () => {
    it('returns success on first attempt', () => {
      const fn = vi.fn().mockReturnValue('ok');
      const result = retrySync(fn);

      expect(result.success).toBe(true);
      expect(result.data).toBe('ok');
      expect(result.attempts).toBe(1);
    });

    it('retries and succeeds', () => {
      let count = 0;
      const fn = () => {
        count++;
        if (count < 3) throw new Error('fail');
        return 'ok';
      };

      const result = retrySync(fn, 5);

      expect(result.success).toBe(true);
      expect(result.data).toBe('ok');
      expect(result.attempts).toBe(3);
    });

    it('returns failure when all attempts exhausted', () => {
      const fn = vi.fn(() => { throw new Error('fail'); });
      const result = retrySync(fn, 3);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.attempts).toBe(3);
    });

    it('stops when shouldRetry returns false', () => {
      const fn = vi.fn(() => { throw new Error('fail'); });
      const result = retrySync(fn, 5, () => false);

      expect(result.success).toBe(false);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes error and attempt to shouldRetry', () => {
      const shouldRetry = vi.fn().mockReturnValue(true);
      const error = new Error('fail');
      const fn = vi.fn(() => { throw error; });

      retrySync(fn, 3, shouldRetry);

      expect(shouldRetry).toHaveBeenCalledWith(error, 1);
      expect(shouldRetry).toHaveBeenCalledWith(error, 2);
    });

    it('defaults to 3 max attempts', () => {
      const fn = vi.fn(() => { throw new Error('fail'); });
      retrySync(fn);

      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('wraps async function with retry behavior', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const retryable = withRetry(fn, { maxAttempts: 2, delayMs: 10 });

      const result = await retryable();

      expect(result.success).toBe(true);
      expect(result.data).toBe('result');
    });

    it('passes arguments through to wrapped function', async () => {
      const fn = vi.fn(async (a: number, b: string) => `${a}-${b}`);
      const retryable = withRetry(fn, { maxAttempts: 2, delayMs: 10 });

      const result = await retryable(42, 'hello');

      expect(result.success).toBe(true);
      expect(result.data).toBe('42-hello');
      expect(fn).toHaveBeenCalledWith(42, 'hello');
    });

    it('retries wrapped function on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('ok');

      const retryable = withRetry(fn, { maxAttempts: 3, delayMs: 10 });
      const resultPromise = retryable();

      await vi.advanceTimersByTimeAsync(10);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isNetworkError', () => {
    it('detects TypeError with fetch message', () => {
      expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    });

    it('detects network-related error messages', () => {
      expect(isNetworkError(new Error('Network error occurred'))).toBe(true);
      expect(isNetworkError(new Error('Request timeout'))).toBe(true);
      expect(isNetworkError(new Error('ECONNREFUSED'))).toBe(true);
      expect(isNetworkError(new Error('ECONNRESET'))).toBe(true);
      expect(isNetworkError(new Error('ETIMEDOUT'))).toBe(true);
      expect(isNetworkError(new Error('ENOTFOUND'))).toBe(true);
    });

    it('returns false for non-network errors', () => {
      expect(isNetworkError(new Error('Validation failed'))).toBe(false);
      expect(isNetworkError(new Error('Not found'))).toBe(false);
    });

    it('returns false for non-Error values', () => {
      expect(isNetworkError('string')).toBe(false);
      expect(isNetworkError(42)).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('isRetryableStatus', () => {
    it('returns true for 429 (Too Many Requests)', () => {
      expect(isRetryableStatus(429)).toBe(true);
    });

    it('returns true for 502 (Bad Gateway)', () => {
      expect(isRetryableStatus(502)).toBe(true);
    });

    it('returns true for 503 (Service Unavailable)', () => {
      expect(isRetryableStatus(503)).toBe(true);
    });

    it('returns true for 504 (Gateway Timeout)', () => {
      expect(isRetryableStatus(504)).toBe(true);
    });

    it('returns false for non-retryable statuses', () => {
      expect(isRetryableStatus(200)).toBe(false);
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(401)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);
      expect(isRetryableStatus(500)).toBe(false);
    });
  });
});
