import {
  createFixedWindowLimiter,
  createSlidingWindowLimiter,
  createTokenBucket,
  createLeakyBucket,
} from './rateLimitUtils';

describe('rateLimitUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createFixedWindowLimiter', () => {
    it('allows requests within limit', () => {
      const limiter = createFixedWindowLimiter(3, 1000);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
    });

    it('blocks requests exceeding limit', () => {
      const limiter = createFixedWindowLimiter(2, 1000);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false);
    });

    it('resets after window expires', () => {
      const limiter = createFixedWindowLimiter(1, 100);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false);

      vi.advanceTimersByTime(101);
      expect(limiter.tryAcquire()).toBe(true);
    });

    it('reports remaining correctly', () => {
      const limiter = createFixedWindowLimiter(3, 1000);
      expect(limiter.remaining()).toBe(3);
      limiter.tryAcquire();
      expect(limiter.remaining()).toBe(2);
      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.remaining()).toBe(0);
    });

    it('reset restores capacity', () => {
      const limiter = createFixedWindowLimiter(2, 1000);
      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.remaining()).toBe(0);
      limiter.reset();
      expect(limiter.remaining()).toBe(2);
    });

    it('retryAfter returns 0 when available', () => {
      const limiter = createFixedWindowLimiter(2, 1000);
      expect(limiter.retryAfter()).toBe(0);
    });

    it('retryAfter returns positive when exhausted', () => {
      const limiter = createFixedWindowLimiter(1, 1000);
      limiter.tryAcquire();
      const retry = limiter.retryAfter();
      expect(retry).toBeGreaterThan(0);
      expect(retry).toBeLessThanOrEqual(1000);
    });
  });

  describe('createSlidingWindowLimiter', () => {
    it('allows requests within limit', () => {
      const limiter = createSlidingWindowLimiter(3, 1000);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
    });

    it('blocks requests exceeding limit', () => {
      const limiter = createSlidingWindowLimiter(2, 1000);
      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.tryAcquire()).toBe(false);
    });

    it('allows requests as old ones expire', () => {
      const limiter = createSlidingWindowLimiter(2, 100);
      limiter.tryAcquire();
      vi.advanceTimersByTime(50);
      limiter.tryAcquire();
      expect(limiter.tryAcquire()).toBe(false);

      vi.advanceTimersByTime(51); // first request now expired
      expect(limiter.tryAcquire()).toBe(true);
    });

    it('reports remaining correctly', () => {
      const limiter = createSlidingWindowLimiter(3, 1000);
      expect(limiter.remaining()).toBe(3);
      limiter.tryAcquire();
      expect(limiter.remaining()).toBe(2);
    });

    it('reset clears all timestamps', () => {
      const limiter = createSlidingWindowLimiter(2, 1000);
      limiter.tryAcquire();
      limiter.tryAcquire();
      limiter.reset();
      expect(limiter.remaining()).toBe(2);
    });

    it('retryAfter returns 0 when available', () => {
      const limiter = createSlidingWindowLimiter(2, 1000);
      expect(limiter.retryAfter()).toBe(0);
    });

    it('retryAfter returns ms until oldest expires', () => {
      const limiter = createSlidingWindowLimiter(1, 100);
      limiter.tryAcquire();
      const retry = limiter.retryAfter();
      expect(retry).toBeGreaterThan(0);
      expect(retry).toBeLessThanOrEqual(100);
    });

    it('partial expiry allows limited requests', () => {
      const limiter = createSlidingWindowLimiter(3, 100);
      limiter.tryAcquire(); // t=0
      vi.advanceTimersByTime(30);
      limiter.tryAcquire(); // t=30
      vi.advanceTimersByTime(30);
      limiter.tryAcquire(); // t=60
      expect(limiter.tryAcquire()).toBe(false);

      vi.advanceTimersByTime(41); // t=101, first expired
      expect(limiter.remaining()).toBe(1);
      expect(limiter.tryAcquire()).toBe(true);
    });
  });

  describe('createTokenBucket', () => {
    it('starts with full capacity', () => {
      const bucket = createTokenBucket(10, 1, 100);
      expect(bucket.available()).toBe(10);
    });

    it('consumes tokens on acquire', () => {
      const bucket = createTokenBucket(5, 1, 100);
      expect(bucket.tryAcquire()).toBe(true);
      expect(bucket.available()).toBe(4);
    });

    it('rejects when no tokens', () => {
      const bucket = createTokenBucket(1, 1, 1000);
      expect(bucket.tryAcquire()).toBe(true);
      expect(bucket.tryAcquire()).toBe(false);
    });

    it('refills tokens over time', () => {
      const bucket = createTokenBucket(5, 1, 100);
      bucket.tryAcquire();
      bucket.tryAcquire();
      expect(bucket.available()).toBe(3);

      vi.advanceTimersByTime(100);
      expect(bucket.available()).toBe(4);
    });

    it('does not exceed max tokens', () => {
      const bucket = createTokenBucket(3, 1, 100);
      vi.advanceTimersByTime(1000); // Would produce 10 tokens
      expect(bucket.available()).toBe(3);
    });

    it('consumes multiple tokens at once', () => {
      const bucket = createTokenBucket(10, 1, 100);
      expect(bucket.tryAcquire(5)).toBe(true);
      expect(bucket.available()).toBe(5);
    });

    it('rejects when not enough tokens for multi-consume', () => {
      const bucket = createTokenBucket(3, 1, 100);
      expect(bucket.tryAcquire(5)).toBe(false);
      expect(bucket.available()).toBe(3);
    });

    it('reset restores full capacity', () => {
      const bucket = createTokenBucket(5, 1, 100);
      bucket.tryAcquire(5);
      expect(bucket.available()).toBe(0);
      bucket.reset();
      expect(bucket.available()).toBe(5);
    });

    it('retryAfter returns 0 when available', () => {
      const bucket = createTokenBucket(5, 1, 100);
      expect(bucket.retryAfter()).toBe(0);
    });

    it('retryAfter returns time until enough tokens', () => {
      const bucket = createTokenBucket(5, 1, 100);
      bucket.tryAcquire(5);
      const retry = bucket.retryAfter(2);
      expect(retry).toBe(200); // Need 2 tokens, 1 per 100ms
    });

    it('refills at correct rate', () => {
      const bucket = createTokenBucket(10, 2, 100); // 2 tokens per 100ms
      bucket.tryAcquire(10);
      expect(bucket.available()).toBe(0);

      vi.advanceTimersByTime(100);
      expect(bucket.available()).toBe(2);

      vi.advanceTimersByTime(100);
      expect(bucket.available()).toBe(4);
    });
  });

  describe('createLeakyBucket', () => {
    it('accepts requests within capacity', () => {
      const bucket = createLeakyBucket(3, 1, 100);
      expect(bucket.tryAcquire()).toBe(true);
      expect(bucket.tryAcquire()).toBe(true);
      expect(bucket.tryAcquire()).toBe(true);
    });

    it('rejects when full', () => {
      const bucket = createLeakyBucket(2, 1, 100);
      bucket.tryAcquire();
      bucket.tryAcquire();
      expect(bucket.tryAcquire()).toBe(false);
    });

    it('leaks over time', () => {
      const bucket = createLeakyBucket(2, 1, 100);
      bucket.tryAcquire();
      bucket.tryAcquire();
      expect(bucket.tryAcquire()).toBe(false);

      vi.advanceTimersByTime(100);
      expect(bucket.tryAcquire()).toBe(true);
    });

    it('reports queue size', () => {
      const bucket = createLeakyBucket(5, 1, 100);
      bucket.tryAcquire();
      bucket.tryAcquire();
      expect(bucket.queueSize()).toBe(2);
    });

    it('queue size decreases over time', () => {
      const bucket = createLeakyBucket(5, 1, 100);
      bucket.tryAcquire();
      bucket.tryAcquire();
      bucket.tryAcquire();
      expect(bucket.queueSize()).toBe(3);

      vi.advanceTimersByTime(200);
      expect(bucket.queueSize()).toBe(1);
    });

    it('queue does not go below 0', () => {
      const bucket = createLeakyBucket(5, 1, 100);
      bucket.tryAcquire();
      vi.advanceTimersByTime(1000);
      expect(bucket.queueSize()).toBe(0);
    });

    it('reset empties the queue', () => {
      const bucket = createLeakyBucket(3, 1, 100);
      bucket.tryAcquire();
      bucket.tryAcquire();
      bucket.reset();
      expect(bucket.queueSize()).toBe(0);
    });

    it('leaks at correct rate', () => {
      const bucket = createLeakyBucket(10, 2, 100); // 2 per 100ms
      for (let i = 0; i < 6; i++) bucket.tryAcquire();
      expect(bucket.queueSize()).toBe(6);

      vi.advanceTimersByTime(100);
      expect(bucket.queueSize()).toBe(4);

      vi.advanceTimersByTime(100);
      expect(bucket.queueSize()).toBe(2);
    });
  });
});
