import {
  diffObjects,
  getChanges,
  hasChanges,
  diffArrays,
  diffLines,
  createPatch,
  applyPatch,
  deepEqual,
  deepDiffObjects,
} from './diffUtils';

describe('diffUtils', () => {
  describe('diffObjects', () => {
    it('detects unchanged values', () => {
      const diff = diffObjects({ a: 1, b: 2 }, { a: 1, b: 2 });
      expect(diff).toEqual([
        { type: 'unchanged', key: 'a', oldValue: 1, newValue: 1 },
        { type: 'unchanged', key: 'b', oldValue: 2, newValue: 2 },
      ]);
    });

    it('detects added keys', () => {
      const diff = diffObjects({ a: 1 }, { a: 1, b: 2 });
      const added = diff.find((d) => d.key === 'b');
      expect(added?.type).toBe('added');
      expect(added?.newValue).toBe(2);
    });

    it('detects removed keys', () => {
      const diff = diffObjects({ a: 1, b: 2 }, { a: 1 });
      const removed = diff.find((d) => d.key === 'b');
      expect(removed?.type).toBe('removed');
      expect(removed?.oldValue).toBe(2);
    });

    it('detects changed values', () => {
      const diff = diffObjects({ a: 1 }, { a: 2 });
      expect(diff[0]).toEqual({ type: 'changed', key: 'a', oldValue: 1, newValue: 2 });
    });

    it('handles empty objects', () => {
      expect(diffObjects({}, {})).toEqual([]);
    });

    it('detects all changes in mixed diff', () => {
      const diff = diffObjects(
        { kept: 1, changed: 'old', removed: true },
        { kept: 1, changed: 'new', added: false }
      );
      expect(diff).toHaveLength(4);
      expect(diff.find((d) => d.key === 'kept')?.type).toBe('unchanged');
      expect(diff.find((d) => d.key === 'changed')?.type).toBe('changed');
      expect(diff.find((d) => d.key === 'removed')?.type).toBe('removed');
      expect(diff.find((d) => d.key === 'added')?.type).toBe('added');
    });
  });

  describe('getChanges', () => {
    it('returns only non-unchanged entries', () => {
      const changes = getChanges({ a: 1, b: 2 }, { a: 1, b: 3 });
      expect(changes).toHaveLength(1);
      expect(changes[0].key).toBe('b');
      expect(changes[0].type).toBe('changed');
    });

    it('returns empty for identical objects', () => {
      expect(getChanges({ a: 1 }, { a: 1 })).toEqual([]);
    });
  });

  describe('hasChanges', () => {
    it('returns true for different objects', () => {
      expect(hasChanges({ a: 1 }, { a: 2 })).toBe(true);
    });

    it('returns false for identical objects', () => {
      expect(hasChanges({ a: 1 }, { a: 1 })).toBe(false);
    });

    it('detects added properties', () => {
      expect(hasChanges({}, { a: 1 })).toBe(true);
    });
  });

  describe('diffArrays', () => {
    it('diffs identical arrays', () => {
      const diff = diffArrays([1, 2, 3], [1, 2, 3]);
      expect(diff.every((d) => d.type === 'unchanged')).toBe(true);
    });

    it('detects additions', () => {
      const diff = diffArrays([1, 3], [1, 2, 3]);
      const added = diff.filter((d) => d.type === 'added');
      expect(added).toHaveLength(1);
      expect(added[0].value).toBe(2);
    });

    it('detects removals', () => {
      const diff = diffArrays([1, 2, 3], [1, 3]);
      const removed = diff.filter((d) => d.type === 'removed');
      expect(removed).toHaveLength(1);
      expect(removed[0].value).toBe(2);
    });

    it('handles empty old array', () => {
      const diff = diffArrays([], [1, 2]);
      expect(diff.every((d) => d.type === 'added')).toBe(true);
      expect(diff).toHaveLength(2);
    });

    it('handles empty new array', () => {
      const diff = diffArrays([1, 2], []);
      expect(diff.every((d) => d.type === 'removed')).toBe(true);
      expect(diff).toHaveLength(2);
    });

    it('handles both empty', () => {
      expect(diffArrays([], [])).toEqual([]);
    });

    it('uses custom equality', () => {
      const old = [{ id: 1, v: 'a' }, { id: 2, v: 'b' }];
      const next = [{ id: 1, v: 'a' }, { id: 3, v: 'c' }];
      const diff = diffArrays(old, next, (a, b) => a.id === b.id);
      const removed = diff.filter((d) => d.type === 'removed');
      const added = diff.filter((d) => d.type === 'added');
      expect(removed).toHaveLength(1);
      expect(removed[0].value.id).toBe(2);
      expect(added).toHaveLength(1);
      expect(added[0].value.id).toBe(3);
    });
  });

  describe('diffLines', () => {
    it('diffs identical text', () => {
      const diff = diffLines('a\nb\nc', 'a\nb\nc');
      expect(diff.every((d) => d.type === 'unchanged')).toBe(true);
    });

    it('detects added lines', () => {
      const diff = diffLines('a\nc', 'a\nb\nc');
      const added = diff.filter((d) => d.type === 'added');
      expect(added).toHaveLength(1);
      expect(added[0].line).toBe('b');
    });

    it('detects removed lines', () => {
      const diff = diffLines('a\nb\nc', 'a\nc');
      const removed = diff.filter((d) => d.type === 'removed');
      expect(removed).toHaveLength(1);
      expect(removed[0].line).toBe('b');
    });

    it('handles empty strings', () => {
      const diff = diffLines('', '');
      expect(diff).toHaveLength(1);
      expect(diff[0].type).toBe('unchanged');
    });

    it('assigns line numbers', () => {
      const diff = diffLines('a\nb', 'a\nc\nb');
      diff.forEach((d, i) => {
        expect(d.lineNumber).toBe(i + 1);
      });
    });
  });

  describe('createPatch', () => {
    it('creates patch with changed values', () => {
      const patch = createPatch({ a: 1, b: 2 }, { a: 1, b: 3 });
      expect(patch).toEqual({ b: 3 });
    });

    it('includes added values', () => {
      const patch = createPatch({ a: 1 }, { a: 1, b: 2 });
      expect(patch).toEqual({ b: 2 });
    });

    it('returns empty patch for identical objects', () => {
      expect(createPatch({ a: 1 }, { a: 1 })).toEqual({});
    });

    it('does not include removed keys', () => {
      const patch = createPatch({ a: 1, b: 2 }, { a: 1 });
      expect(patch).toEqual({});
    });
  });

  describe('applyPatch', () => {
    it('applies changes', () => {
      const result = applyPatch({ a: 1, b: 2 }, { b: 3 });
      expect(result).toEqual({ a: 1, b: 3 });
    });

    it('adds new properties', () => {
      const result = applyPatch<Record<string, number>>({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('returns copy with empty patch', () => {
      const obj = { a: 1 };
      const result = applyPatch(obj, {});
      expect(result).toEqual({ a: 1 });
      expect(result).not.toBe(obj);
    });
  });

  describe('deepEqual', () => {
    it('compares primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('a', 'a')).toBe(true);
      expect(deepEqual(true, false)).toBe(false);
    });

    it('compares null', () => {
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(null, 0)).toBe(false);
    });

    it('compares arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    });

    it('compares objects', () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('compares nested objects', () => {
      expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
      expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);
    });

    it('handles different types', () => {
      expect(deepEqual(1, '1')).toBe(false);
      expect(deepEqual([], {})).toBe(false);
    });
  });

  describe('deepDiffObjects', () => {
    it('diffs flat objects', () => {
      const diff = deepDiffObjects({ a: 1 }, { a: 2 });
      expect(diff[0]).toEqual({ type: 'changed', key: 'a', oldValue: 1, newValue: 2 });
    });

    it('diffs nested objects recursively', () => {
      const diff = deepDiffObjects(
        { user: { name: 'Alice', age: 30 } },
        { user: { name: 'Alice', age: 31 } }
      );
      const changed = diff.find((d) => d.type === 'changed');
      expect(changed?.key).toBe('user.age');
      expect(changed?.oldValue).toBe(30);
      expect(changed?.newValue).toBe(31);
    });

    it('handles added nested properties', () => {
      const diff = deepDiffObjects(
        { user: { name: 'Alice' } },
        { user: { name: 'Alice', email: 'a@b.com' } }
      );
      const added = diff.find((d) => d.type === 'added');
      expect(added?.key).toBe('user.email');
    });

    it('handles removed nested properties', () => {
      const diff = deepDiffObjects(
        { user: { name: 'Alice', age: 30 } },
        { user: { name: 'Alice' } }
      );
      const removed = diff.find((d) => d.type === 'removed');
      expect(removed?.key).toBe('user.age');
    });

    it('detects array changes as single change', () => {
      const diff = deepDiffObjects(
        { tags: ['a', 'b'] },
        { tags: ['a', 'c'] }
      );
      const changed = diff.find((d) => d.type === 'changed');
      expect(changed?.key).toBe('tags');
    });

    it('detects unchanged nested objects', () => {
      const diff = deepDiffObjects(
        { meta: { version: 1 } },
        { meta: { version: 1 } }
      );
      expect(diff.every((d) => d.type === 'unchanged')).toBe(true);
    });
  });
});
