/**
 * TypeScript type guard utilities for runtime type checking.
 */

/** Check if value is a string */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Check if value is a number (excluding NaN) */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/** Check if value is a boolean */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/** Check if value is null or undefined */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/** Check if value is not null and not undefined */
export function isNonNil<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/** Check if value is a plain object (not array, not null, not Date, etc.) */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Check if value is an array */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/** Check if value is a function */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/** Check if value is a Date object and is valid */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** Check if value is a RegExp */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

/** Check if value is a Promise-like (thenable) */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Record<string, unknown>).then === 'function'
  );
}

/** Check if value is an Error instance */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/** Check if value is a Map */
export function isMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map;
}

/** Check if value is a Set */
export function isSet(value: unknown): value is Set<unknown> {
  return value instanceof Set;
}

/** Check if value is a non-empty string */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/** Check if value is a non-empty array */
export function isNonEmptyArray<T>(value: T[]): value is [T, ...T[]];
export function isNonEmptyArray(value: unknown): value is [unknown, ...unknown[]];
export function isNonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

/** Check if value is a finite number */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Check if value is an integer */
export function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

/** Check if value is a positive number (> 0) */
export function isPositive(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/** Check if value is a negative number (< 0) */
export function isNegative(value: unknown): value is number {
  return isNumber(value) && value < 0;
}

/**
 * Check if an object has a specific property.
 * Narrows the type to include that property.
 */
export function hasProperty<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return typeof value === 'object' && value !== null && key in value;
}

/**
 * Check if an object has all specified properties.
 */
export function hasProperties<K extends string>(
  value: unknown,
  keys: K[]
): value is Record<K, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  return keys.every((key) => key in value);
}

/**
 * Assert a value is of a given type at runtime, throwing if not.
 */
export function assertType<T>(
  value: unknown,
  guard: (v: unknown) => v is T,
  message?: string
): asserts value is T {
  if (!guard(value)) {
    throw new TypeError(message ?? `Type assertion failed`);
  }
}
