/**
 * Bloom Filter — a space-efficient probabilistic data structure
 * that tests whether an element is a member of a set.
 * False positives are possible, but false negatives are not.
 */

export interface BloomFilterOptions {
  size?: number;
  hashCount?: number;
}

export interface BloomFilter<T = string> {
  add: (item: T) => void;
  has: (item: T) => boolean;
  clear: () => void;
  getBitArray: () => boolean[];
  getSize: () => number;
  getHashCount: () => number;
  getItemCount: () => number;
  getFalsePositiveRate: () => number;
  merge: (other: BloomFilter<T>) => BloomFilter<T>;
  toJSON: () => BloomFilterJSON;
}

export interface BloomFilterJSON {
  size: number;
  hashCount: number;
  bits: number[];
  itemCount: number;
}

function hashString(str: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getHashes(item: string, hashCount: number, size: number): number[] {
  const hashes: number[] = [];
  for (let i = 0; i < hashCount; i++) {
    hashes.push(hashString(item, i * 0x9e3779b9) % size);
  }
  return hashes;
}

export function createBloomFilter<T = string>(
  options: BloomFilterOptions = {}
): BloomFilter<T> {
  const { size = 1024, hashCount = 7 } = options;

  const bits = new Array<boolean>(size).fill(false);
  let itemCount = 0;

  const toStr = (item: T): string => String(item);

  const add = (item: T): void => {
    const hashes = getHashes(toStr(item), hashCount, size);
    for (const h of hashes) {
      bits[h] = true;
    }
    itemCount++;
  };

  const has = (item: T): boolean => {
    const hashes = getHashes(toStr(item), hashCount, size);
    return hashes.every((h) => bits[h]);
  };

  const clear = (): void => {
    bits.fill(false);
    itemCount = 0;
  };

  const getBitArray = (): boolean[] => [...bits];

  const getSize = (): number => size;

  const getHashCount = (): number => hashCount;

  const getItemCount = (): number => itemCount;

  const getFalsePositiveRate = (): number => {
    if (itemCount === 0) return 0;
    // Approximation: (1 - e^(-kn/m))^k
    const exponent = -(hashCount * itemCount) / size;
    return Math.pow(1 - Math.exp(exponent), hashCount);
  };

  const merge = (other: BloomFilter<T>): BloomFilter<T> => {
    const otherBits = other.getBitArray();
    if (otherBits.length !== size) {
      throw new Error('Cannot merge Bloom filters of different sizes');
    }
    if (other.getHashCount() !== hashCount) {
      throw new Error('Cannot merge Bloom filters with different hash counts');
    }
    const merged = createBloomFilter<T>({ size, hashCount });
    const mergedBits = merged.getBitArray();
    for (let i = 0; i < size; i++) {
      if (bits[i] || otherBits[i]) {
        // We need to set bits directly — use a workaround via internal access
        // Instead, rebuild by adding known items. Since we can't reconstruct items,
        // we serialize and deserialize.
      }
      mergedBits[i] = bits[i] || otherBits[i];
    }
    // Return a filter with merged bits
    return bloomFilterFromBits(mergedBits, hashCount, itemCount + other.getItemCount());
  };

  const toJSON = (): BloomFilterJSON => {
    const setBits: number[] = [];
    for (let i = 0; i < size; i++) {
      if (bits[i]) setBits.push(i);
    }
    return { size, hashCount, bits: setBits, itemCount };
  };

  return {
    add,
    has,
    clear,
    getBitArray,
    getSize,
    getHashCount,
    getItemCount,
    getFalsePositiveRate,
    merge,
    toJSON,
  };
}

function bloomFilterFromBits<T = string>(
  bitArray: boolean[],
  hashCount: number,
  itemCount: number
): BloomFilter<T> {
  const size = bitArray.length;
  const bits = [...bitArray];
  let count = itemCount;

  const toStr = (item: T): string => String(item);

  const add = (item: T): void => {
    const hashes = getHashes(toStr(item), hashCount, size);
    for (const h of hashes) {
      bits[h] = true;
    }
    count++;
  };

  const has = (item: T): boolean => {
    const hashes = getHashes(toStr(item), hashCount, size);
    return hashes.every((h) => bits[h]);
  };

  const clear = (): void => {
    bits.fill(false);
    count = 0;
  };

  const getBitArray = (): boolean[] => [...bits];
  const getSize = (): number => size;
  const getHashCount = (): number => hashCount;
  const getItemCount = (): number => count;

  const getFalsePositiveRate = (): number => {
    if (count === 0) return 0;
    const exponent = -(hashCount * count) / size;
    return Math.pow(1 - Math.exp(exponent), hashCount);
  };

  const merge = (other: BloomFilter<T>): BloomFilter<T> => {
    const otherBits = other.getBitArray();
    if (otherBits.length !== size) {
      throw new Error('Cannot merge Bloom filters of different sizes');
    }
    if (other.getHashCount() !== hashCount) {
      throw new Error('Cannot merge Bloom filters with different hash counts');
    }
    const mergedBits = bits.map((b, i) => b || otherBits[i]);
    return bloomFilterFromBits<T>(mergedBits, hashCount, count + other.getItemCount());
  };

  const toJSON = (): BloomFilterJSON => {
    const setBits: number[] = [];
    for (let i = 0; i < size; i++) {
      if (bits[i]) setBits.push(i);
    }
    return { size, hashCount, bits: setBits, itemCount: count };
  };

  return {
    add,
    has,
    clear,
    getBitArray,
    getSize,
    getHashCount,
    getItemCount,
    getFalsePositiveRate,
    merge,
    toJSON,
  };
}

export function bloomFilterFromJSON<T = string>(json: BloomFilterJSON): BloomFilter<T> {
  const bits = new Array<boolean>(json.size).fill(false);
  for (const idx of json.bits) {
    bits[idx] = true;
  }
  return bloomFilterFromBits<T>(bits, json.hashCount, json.itemCount);
}

/**
 * Calculate optimal Bloom filter size for given parameters.
 * @param expectedItems - Expected number of items
 * @param falsePositiveRate - Desired false positive rate (0 to 1)
 * @returns Optimal filter size and hash count
 */
export function optimalBloomFilterParams(
  expectedItems: number,
  falsePositiveRate: number
): { size: number; hashCount: number } {
  if (expectedItems <= 0 || falsePositiveRate <= 0 || falsePositiveRate >= 1) {
    return { size: 1024, hashCount: 7 };
  }
  const m = Math.ceil(
    -(expectedItems * Math.log(falsePositiveRate)) / (Math.log(2) ** 2)
  );
  const k = Math.round((m / expectedItems) * Math.log(2));
  return { size: m, hashCount: Math.max(1, k) };
}
