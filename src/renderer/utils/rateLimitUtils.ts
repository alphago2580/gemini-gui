/**
 * Rate limiting utilities for controlling execution frequency.
 */

export interface RateLimiterResult {
  /** Try to consume one token. Returns true if allowed. */
  tryAcquire: () => boolean;
  /** Number of remaining tokens */
  remaining: () => number;
  /** Reset the limiter */
  reset: () => void;
  /** Time in ms until next token becomes available (0 if available now) */
  retryAfter: () => number;
}

/**
 * Fixed window rate limiter.
 * Allows `maxRequests` within each `windowMs` time window.
 */
export function createFixedWindowLimiter(
  maxRequests: number,
  windowMs: number
): RateLimiterResult {
  let count = 0;
  let windowStart = Date.now();

  function checkWindow() {
    const now = Date.now();
    if (now - windowStart >= windowMs) {
      count = 0;
      windowStart = now;
    }
  }

  return {
    tryAcquire() {
      checkWindow();
      if (count < maxRequests) {
        count++;
        return true;
      }
      return false;
    },
    remaining() {
      checkWindow();
      return Math.max(0, maxRequests - count);
    },
    reset() {
      count = 0;
      windowStart = Date.now();
    },
    retryAfter() {
      checkWindow();
      if (count < maxRequests) return 0;
      return windowMs - (Date.now() - windowStart);
    },
  };
}

/**
 * Sliding window rate limiter.
 * Tracks individual request timestamps for precise limiting.
 */
export function createSlidingWindowLimiter(
  maxRequests: number,
  windowMs: number
): RateLimiterResult {
  const timestamps: number[] = [];

  function pruneOld() {
    const cutoff = Date.now() - windowMs;
    while (timestamps.length > 0 && timestamps[0] <= cutoff) {
      timestamps.shift();
    }
  }

  return {
    tryAcquire() {
      pruneOld();
      if (timestamps.length < maxRequests) {
        timestamps.push(Date.now());
        return true;
      }
      return false;
    },
    remaining() {
      pruneOld();
      return Math.max(0, maxRequests - timestamps.length);
    },
    reset() {
      timestamps.length = 0;
    },
    retryAfter() {
      pruneOld();
      if (timestamps.length < maxRequests) return 0;
      return Math.max(0, timestamps[0] + windowMs - Date.now());
    },
  };
}

export interface TokenBucketResult {
  /** Try to consume `count` tokens (default 1). Returns true if enough tokens. */
  tryAcquire: (count?: number) => boolean;
  /** Current available tokens */
  available: () => number;
  /** Reset to full capacity */
  reset: () => void;
  /** Time in ms until `count` tokens are available (0 if available now) */
  retryAfter: (count?: number) => number;
}

/**
 * Token bucket rate limiter.
 * Tokens refill at a constant rate up to maxTokens capacity.
 */
export function createTokenBucket(
  maxTokens: number,
  refillRate: number,
  refillIntervalMs: number
): TokenBucketResult {
  let tokens = maxTokens;
  let lastRefill = Date.now();

  function refill() {
    const now = Date.now();
    const elapsed = now - lastRefill;
    const newTokens = Math.floor(elapsed / refillIntervalMs) * refillRate;
    if (newTokens > 0) {
      tokens = Math.min(maxTokens, tokens + newTokens);
      lastRefill = now;
    }
  }

  return {
    tryAcquire(count = 1) {
      refill();
      if (tokens >= count) {
        tokens -= count;
        return true;
      }
      return false;
    },
    available() {
      refill();
      return tokens;
    },
    reset() {
      tokens = maxTokens;
      lastRefill = Date.now();
    },
    retryAfter(count = 1) {
      refill();
      if (tokens >= count) return 0;
      const needed = count - tokens;
      const intervalsNeeded = Math.ceil(needed / refillRate);
      return intervalsNeeded * refillIntervalMs;
    },
  };
}

export interface LeakyBucketResult {
  /** Add a request to the bucket. Returns true if accepted. */
  tryAcquire: () => boolean;
  /** Current queue size */
  queueSize: () => number;
  /** Reset the bucket */
  reset: () => void;
}

/**
 * Leaky bucket rate limiter.
 * Requests are queued up to `capacity` and processed at `leakRate` per `leakIntervalMs`.
 */
export function createLeakyBucket(
  capacity: number,
  leakRate: number,
  leakIntervalMs: number
): LeakyBucketResult {
  let queue = 0;
  let lastLeak = Date.now();

  function leak() {
    const now = Date.now();
    const elapsed = now - lastLeak;
    const leaked = Math.floor(elapsed / leakIntervalMs) * leakRate;
    if (leaked > 0) {
      queue = Math.max(0, queue - leaked);
      lastLeak = now;
    }
  }

  return {
    tryAcquire() {
      leak();
      if (queue < capacity) {
        queue++;
        return true;
      }
      return false;
    },
    queueSize() {
      leak();
      return queue;
    },
    reset() {
      queue = 0;
      lastLeak = Date.now();
    },
  };
}
