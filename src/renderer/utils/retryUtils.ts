/**
 * Retry utilities for handling transient failures with configurable strategies.
 */

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 1,
  maxDelayMs: 30000,
};

/** Calculate delay for a given attempt with exponential backoff. */
export function calculateDelay(
  attempt: number,
  baseDelay: number,
  multiplier: number = 1,
  maxDelay: number = 30000
): number {
  const delay = baseDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/** Add random jitter to a delay to prevent thundering herd. */
export function addJitter(delayMs: number, jitterFactor: number = 0.5): number {
  const jitter = delayMs * jitterFactor * Math.random();
  return Math.round(delayMs + jitter);
}

/** Sleep for a specified duration. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function with configurable backoff strategy.
 * Returns a result object with success status, data/error, and attempt count.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const data = await fn();
      return { success: true, data, attempts: attempt };
    } catch (error) {
      lastError = error;

      if (attempt >= opts.maxAttempts) {
        break;
      }

      if (opts.shouldRetry && !opts.shouldRetry(error, attempt)) {
        break;
      }

      const delay = calculateDelay(
        attempt,
        opts.delayMs,
        opts.backoffMultiplier,
        opts.maxDelayMs
      );

      opts.onRetry?.(error, attempt, delay);

      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: opts.maxAttempts,
  };
}

/**
 * Retry a synchronous function.
 * Note: No delay between attempts (synchronous context).
 */
export function retrySync<T>(
  fn: () => T,
  maxAttempts: number = 3,
  shouldRetry?: (error: unknown, attempt: number) => boolean
): RetryResult<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = fn();
      return { success: true, data, attempts: attempt };
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts) break;
      if (shouldRetry && !shouldRetry(error, attempt)) break;
    }
  }

  return { success: false, error: lastError, attempts: maxAttempts };
}

/** Create a retryable version of an async function with pre-configured options. */
export function withRetry<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: Partial<RetryOptions> = {}
): (...args: TArgs) => Promise<RetryResult<TReturn>> {
  return (...args: TArgs) => retry(() => fn(...args), options);
}

/** Check if an error is a network error (common retry target). */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error instanceof Error) {
    const networkMessages = [
      'network',
      'timeout',
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
    ];
    return networkMessages.some((msg) =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
  return false;
}

/** Check if an HTTP status code is retryable. */
export function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}
