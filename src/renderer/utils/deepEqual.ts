/**
 * Deep equality comparison utility.
 * Compares two values recursively, supporting primitives,
 * arrays, plain objects, Date, RegExp, Map, Set, and nested structures.
 */

/**
 * Checks whether two values are deeply equal.
 * Handles primitives, arrays, plain objects, Date, RegExp, Map, and Set.
 * Correctly handles NaN, +0/-0, null, and undefined.
 * Detects circular references to avoid infinite recursion.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return internalDeepEqual(a, b, new Map<object, object>());
}

function internalDeepEqual(
  a: unknown,
  b: unknown,
  seen: Map<object, object>
): boolean {
  // Identical references or both same primitive
  if (Object.is(a, b)) return true;

  // If either is not an object (or is null), they're not equal
  if (
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object'
  ) {
    return false;
  }

  // Circular reference detection
  if (seen.has(a as object)) {
    return seen.get(a as object) === b;
  }
  seen.set(a as object, b as object);

  // Date comparison
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof Date !== b instanceof Date) return false;

  // RegExp comparison
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }
  if (a instanceof RegExp !== b instanceof RegExp) return false;

  // Map comparison
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key) || !internalDeepEqual(val, b.get(key), seen)) {
        return false;
      }
    }
    return true;
  }
  if (a instanceof Map !== b instanceof Map) return false;

  // Set comparison
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const val of a) {
      if (!b.has(val)) return false;
    }
    return true;
  }
  if (a instanceof Set !== b instanceof Set) return false;

  // Array comparison
  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray !== bIsArray) return false;

  if (aIsArray && bIsArray) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!internalDeepEqual(a[i], b[i], seen)) return false;
    }
    return true;
  }

  // Plain object comparison
  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);

  if (keysA.length !== keysB.length) return false;

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
    if (!internalDeepEqual(objA[key], objB[key], seen)) return false;
  }

  return true;
}
