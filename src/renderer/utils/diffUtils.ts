/**
 * Diff and comparison utilities for detecting changes between values.
 */

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry<T> {
  type: DiffType;
  key: string;
  oldValue?: T;
  newValue?: T;
}

export interface ArrayDiffEntry<T> {
  type: 'added' | 'removed' | 'unchanged';
  value: T;
  index: number;
}

export interface LineDiffEntry {
  type: 'added' | 'removed' | 'unchanged';
  line: string;
  lineNumber: number;
}

/** Compute a shallow diff between two objects. */
export function diffObjects<T extends Record<string, unknown>>(
  oldObj: T,
  newObj: T
): DiffEntry<unknown>[] {
  const entries: DiffEntry<unknown>[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const inOld = key in oldObj;
    const inNew = key in newObj;

    if (inOld && !inNew) {
      entries.push({ type: 'removed', key, oldValue: oldObj[key] });
    } else if (!inOld && inNew) {
      entries.push({ type: 'added', key, newValue: newObj[key] });
    } else if (oldObj[key] !== newObj[key]) {
      entries.push({ type: 'changed', key, oldValue: oldObj[key], newValue: newObj[key] });
    } else {
      entries.push({ type: 'unchanged', key, oldValue: oldObj[key], newValue: newObj[key] });
    }
  }

  return entries;
}

/** Get only the changed entries from an object diff. */
export function getChanges<T extends Record<string, unknown>>(
  oldObj: T,
  newObj: T
): DiffEntry<unknown>[] {
  return diffObjects(oldObj, newObj).filter((e) => e.type !== 'unchanged');
}

/** Check if two objects have any differences. */
export function hasChanges<T extends Record<string, unknown>>(
  oldObj: T,
  newObj: T
): boolean {
  return getChanges(oldObj, newObj).length > 0;
}

/**
 * Compute the longest common subsequence (LCS) length table.
 * Used internally for array and line diffs.
 */
function lcsTable<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (eq(a[i - 1], b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/** Compute a diff between two arrays using LCS. */
export function diffArrays<T>(
  oldArr: T[],
  newArr: T[],
  eq: (a: T, b: T) => boolean = (a, b) => a === b
): ArrayDiffEntry<T>[] {
  const dp = lcsTable(oldArr, newArr, eq);
  const entries: ArrayDiffEntry<T>[] = [];

  let i = oldArr.length;
  let j = newArr.length;

  // Backtrack through LCS table
  const stack: ArrayDiffEntry<T>[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && eq(oldArr[i - 1], newArr[j - 1])) {
      stack.push({ type: 'unchanged', value: oldArr[i - 1], index: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', value: newArr[j - 1], index: j - 1 });
      j--;
    } else {
      stack.push({ type: 'removed', value: oldArr[i - 1], index: i - 1 });
      i--;
    }
  }

  // Reverse to get forward order
  while (stack.length > 0) {
    entries.push(stack.pop()!);
  }

  return entries;
}

/** Compute a line-by-line diff of two strings. */
export function diffLines(oldText: string, newText: string): LineDiffEntry[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const arrayDiff = diffArrays(oldLines, newLines);

  return arrayDiff.map((entry, idx) => ({
    type: entry.type,
    line: entry.value,
    lineNumber: idx + 1,
  }));
}

/** Create a patch object from two objects (only changed/added/removed fields). */
export function createPatch<T extends Record<string, unknown>>(
  oldObj: T,
  newObj: T
): Partial<T> {
  const patch: Record<string, unknown> = {};
  const diff = getChanges(oldObj, newObj);

  for (const entry of diff) {
    if (entry.type === 'added' || entry.type === 'changed') {
      patch[entry.key] = entry.newValue;
    }
  }

  return patch as Partial<T>;
}

/** Apply a patch to an object. */
export function applyPatch<T extends Record<string, unknown>>(
  obj: T,
  patch: Partial<T>
): T {
  return { ...obj, ...patch };
}

/** Deep equality check for objects and arrays. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, idx) => deepEqual(item, b[idx]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
  }

  return false;
}

/**
 * Compute a deep diff between two objects.
 * Recursively diffs nested objects and arrays.
 */
export function deepDiffObjects(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  parentPath: string = ''
): DiffEntry<unknown>[] {
  const entries: DiffEntry<unknown>[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const inOld = key in oldObj;
    const inNew = key in newObj;

    if (inOld && !inNew) {
      entries.push({ type: 'removed', key: path, oldValue: oldObj[key] });
    } else if (!inOld && inNew) {
      entries.push({ type: 'added', key: path, newValue: newObj[key] });
    } else if (deepEqual(oldObj[key], newObj[key])) {
      entries.push({ type: 'unchanged', key: path, oldValue: oldObj[key], newValue: newObj[key] });
    } else if (
      typeof oldObj[key] === 'object' && oldObj[key] !== null && !Array.isArray(oldObj[key]) &&
      typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])
    ) {
      entries.push(
        ...deepDiffObjects(
          oldObj[key] as Record<string, unknown>,
          newObj[key] as Record<string, unknown>,
          path
        )
      );
    } else {
      entries.push({ type: 'changed', key: path, oldValue: oldObj[key], newValue: newObj[key] });
    }
  }

  return entries;
}
