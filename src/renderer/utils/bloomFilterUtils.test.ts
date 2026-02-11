import { describe, it, expect } from 'vitest';
import {
  createBloomFilter,
  bloomFilterFromJSON,
  optimalBloomFilterParams,
} from './bloomFilterUtils';

describe('bloomFilterUtils', () => {
  describe('createBloomFilter', () => {
    it('creates a bloom filter with default options', () => {
      const bf = createBloomFilter();
      expect(bf.getSize()).toBe(1024);
      expect(bf.getHashCount()).toBe(7);
      expect(bf.getItemCount()).toBe(0);
    });

    it('creates a bloom filter with custom options', () => {
      const bf = createBloomFilter({ size: 512, hashCount: 3 });
      expect(bf.getSize()).toBe(512);
      expect(bf.getHashCount()).toBe(3);
    });

    it('reports has as false for items not added', () => {
      const bf = createBloomFilter();
      expect(bf.has('hello')).toBe(false);
      expect(bf.has('world')).toBe(false);
    });

    it('reports has as true for added items', () => {
      const bf = createBloomFilter();
      bf.add('hello');
      bf.add('world');
      expect(bf.has('hello')).toBe(true);
      expect(bf.has('world')).toBe(true);
    });

    it('tracks item count', () => {
      const bf = createBloomFilter();
      bf.add('a');
      bf.add('b');
      bf.add('c');
      expect(bf.getItemCount()).toBe(3);
    });

    it('clears the filter', () => {
      const bf = createBloomFilter();
      bf.add('hello');
      bf.add('world');
      bf.clear();
      expect(bf.has('hello')).toBe(false);
      expect(bf.has('world')).toBe(false);
      expect(bf.getItemCount()).toBe(0);
    });

    it('returns bit array', () => {
      const bf = createBloomFilter({ size: 32 });
      const bits = bf.getBitArray();
      expect(bits).toHaveLength(32);
      expect(bits.every((b) => b === false)).toBe(true);
    });

    it('bit array has some true bits after adding', () => {
      const bf = createBloomFilter({ size: 64 });
      bf.add('test');
      const bits = bf.getBitArray();
      expect(bits.some((b) => b === true)).toBe(true);
    });

    it('bit array is a copy', () => {
      const bf = createBloomFilter({ size: 32 });
      const bits = bf.getBitArray();
      bits[0] = true;
      expect(bf.getBitArray()[0]).toBe(false);
    });

    it('false positive rate is 0 when empty', () => {
      const bf = createBloomFilter();
      expect(bf.getFalsePositiveRate()).toBe(0);
    });

    it('false positive rate increases with items', () => {
      const bf = createBloomFilter({ size: 64, hashCount: 3 });
      bf.add('a');
      const rate1 = bf.getFalsePositiveRate();

      for (let i = 0; i < 20; i++) {
        bf.add(`item-${i}`);
      }
      const rate2 = bf.getFalsePositiveRate();

      expect(rate2).toBeGreaterThan(rate1);
    });

    it('false positive rate is between 0 and 1', () => {
      const bf = createBloomFilter({ size: 128 });
      for (let i = 0; i < 50; i++) {
        bf.add(`item-${i}`);
      }
      const rate = bf.getFalsePositiveRate();
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThanOrEqual(1);
    });
  });

  describe('merge', () => {
    it('merges two bloom filters', () => {
      const bf1 = createBloomFilter({ size: 128, hashCount: 3 });
      const bf2 = createBloomFilter({ size: 128, hashCount: 3 });

      bf1.add('hello');
      bf2.add('world');

      const merged = bf1.merge(bf2);

      expect(merged.has('hello')).toBe(true);
      expect(merged.has('world')).toBe(true);
    });

    it('throws on different sizes', () => {
      const bf1 = createBloomFilter({ size: 128, hashCount: 3 });
      const bf2 = createBloomFilter({ size: 256, hashCount: 3 });

      expect(() => bf1.merge(bf2)).toThrow('Cannot merge Bloom filters of different sizes');
    });

    it('throws on different hash counts', () => {
      const bf1 = createBloomFilter({ size: 128, hashCount: 3 });
      const bf2 = createBloomFilter({ size: 128, hashCount: 5 });

      expect(() => bf1.merge(bf2)).toThrow(
        'Cannot merge Bloom filters with different hash counts'
      );
    });

    it('merged filter has combined item count', () => {
      const bf1 = createBloomFilter({ size: 128, hashCount: 3 });
      const bf2 = createBloomFilter({ size: 128, hashCount: 3 });

      bf1.add('a');
      bf1.add('b');
      bf2.add('c');

      const merged = bf1.merge(bf2);
      expect(merged.getItemCount()).toBe(3);
    });
  });

  describe('toJSON / fromJSON', () => {
    it('serializes to JSON', () => {
      const bf = createBloomFilter({ size: 64, hashCount: 3 });
      bf.add('hello');

      const json = bf.toJSON();

      expect(json.size).toBe(64);
      expect(json.hashCount).toBe(3);
      expect(json.itemCount).toBe(1);
      expect(Array.isArray(json.bits)).toBe(true);
      expect(json.bits.length).toBeGreaterThan(0);
    });

    it('deserializes from JSON', () => {
      const bf = createBloomFilter({ size: 64, hashCount: 3 });
      bf.add('hello');
      bf.add('world');

      const json = bf.toJSON();
      const restored = bloomFilterFromJSON(json);

      expect(restored.has('hello')).toBe(true);
      expect(restored.has('world')).toBe(true);
      expect(restored.getSize()).toBe(64);
      expect(restored.getHashCount()).toBe(3);
      expect(restored.getItemCount()).toBe(2);
    });

    it('serialized bits are only set indices', () => {
      const bf = createBloomFilter({ size: 64, hashCount: 3 });
      bf.add('test');

      const json = bf.toJSON();

      // All bits entries should be valid indices
      for (const idx of json.bits) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(64);
      }
    });

    it('round-trip preserves behavior', () => {
      const bf = createBloomFilter({ size: 128, hashCount: 5 });
      const items = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
      items.forEach((item) => bf.add(item));

      const restored = bloomFilterFromJSON(bf.toJSON());

      for (const item of items) {
        expect(restored.has(item)).toBe(true);
      }
    });

    it('restored filter can add new items', () => {
      const bf = createBloomFilter({ size: 128, hashCount: 3 });
      bf.add('existing');

      const restored = bloomFilterFromJSON(bf.toJSON());
      restored.add('new-item');

      expect(restored.has('existing')).toBe(true);
      expect(restored.has('new-item')).toBe(true);
      expect(restored.getItemCount()).toBe(2);
    });
  });

  describe('optimalBloomFilterParams', () => {
    it('returns default params for invalid inputs', () => {
      expect(optimalBloomFilterParams(0, 0.01)).toEqual({ size: 1024, hashCount: 7 });
      expect(optimalBloomFilterParams(100, 0)).toEqual({ size: 1024, hashCount: 7 });
      expect(optimalBloomFilterParams(100, 1)).toEqual({ size: 1024, hashCount: 7 });
      expect(optimalBloomFilterParams(-1, 0.5)).toEqual({ size: 1024, hashCount: 7 });
    });

    it('returns reasonable params for typical inputs', () => {
      const { size, hashCount } = optimalBloomFilterParams(1000, 0.01);

      expect(size).toBeGreaterThan(0);
      expect(hashCount).toBeGreaterThan(0);
      // For 1000 items at 1% FPR, size should be around 9585
      expect(size).toBeGreaterThan(5000);
      expect(size).toBeLessThan(20000);
    });

    it('smaller FPR requires larger filter', () => {
      const { size: size1 } = optimalBloomFilterParams(1000, 0.1);
      const { size: size2 } = optimalBloomFilterParams(1000, 0.01);
      const { size: size3 } = optimalBloomFilterParams(1000, 0.001);

      expect(size2).toBeGreaterThan(size1);
      expect(size3).toBeGreaterThan(size2);
    });

    it('more items require larger filter', () => {
      const { size: size1 } = optimalBloomFilterParams(100, 0.01);
      const { size: size2 } = optimalBloomFilterParams(1000, 0.01);

      expect(size2).toBeGreaterThan(size1);
    });

    it('hash count is at least 1', () => {
      const { hashCount } = optimalBloomFilterParams(1, 0.99);
      expect(hashCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('handles numeric items via toString', () => {
      const bf = createBloomFilter<number>();
      bf.add(42);
      bf.add(100);

      expect(bf.has(42)).toBe(true);
      expect(bf.has(100)).toBe(true);
      expect(bf.has(999)).toBe(false);
    });

    it('handles empty string', () => {
      const bf = createBloomFilter();
      bf.add('');
      expect(bf.has('')).toBe(true);
    });

    it('handles unicode strings', () => {
      const bf = createBloomFilter();
      bf.add('안녕하세요');
      bf.add('こんにちは');

      expect(bf.has('안녕하세요')).toBe(true);
      expect(bf.has('こんにちは')).toBe(true);
    });

    it('handles large number of items', () => {
      const bf = createBloomFilter({ size: 10000, hashCount: 7 });
      for (let i = 0; i < 500; i++) {
        bf.add(`item-${i}`);
      }

      // All added items must be found (no false negatives)
      for (let i = 0; i < 500; i++) {
        expect(bf.has(`item-${i}`)).toBe(true);
      }

      expect(bf.getItemCount()).toBe(500);
    });

    it('merged filter can be further merged', () => {
      const bf1 = createBloomFilter({ size: 64, hashCount: 3 });
      const bf2 = createBloomFilter({ size: 64, hashCount: 3 });
      const bf3 = createBloomFilter({ size: 64, hashCount: 3 });

      bf1.add('a');
      bf2.add('b');
      bf3.add('c');

      const merged12 = bf1.merge(bf2);
      const mergedAll = merged12.merge(bf3);

      expect(mergedAll.has('a')).toBe(true);
      expect(mergedAll.has('b')).toBe(true);
      expect(mergedAll.has('c')).toBe(true);
    });
  });
});
