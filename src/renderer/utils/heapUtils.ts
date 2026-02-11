export type CompareFn<T> = (a: T, b: T) => number;

const defaultMinCompare = <T>(a: T, b: T): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

export class BinaryHeap<T> {
  private heap: T[] = [];
  private compare: CompareFn<T>;

  constructor(compare: CompareFn<T> = defaultMinCompare) {
    this.compare = compare;
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  push(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.isEmpty) return undefined;

    const top = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  toArray(): T[] {
    return [...this.heap];
  }

  clear(): void {
    this.heap = [];
  }

  contains(value: T): boolean {
    return this.heap.includes(value);
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }

      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

export function createMinHeap<T>(compare?: CompareFn<T>): BinaryHeap<T> {
  return new BinaryHeap(compare ?? defaultMinCompare);
}

export function createMaxHeap<T>(compare?: CompareFn<T>): BinaryHeap<T> {
  const maxCompare = compare
    ? (a: T, b: T) => -compare(a, b)
    : (a: T, b: T) => {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
      };
  return new BinaryHeap(maxCompare);
}

export function heapify<T>(arr: T[], compare: CompareFn<T> = defaultMinCompare): BinaryHeap<T> {
  const heap = new BinaryHeap(compare);
  for (const item of arr) {
    heap.push(item);
  }
  return heap;
}

export function nSmallest<T>(arr: T[], n: number, compare: CompareFn<T> = defaultMinCompare): T[] {
  const heap = heapify(arr, compare);
  const result: T[] = [];
  for (let i = 0; i < Math.min(n, arr.length); i++) {
    const val = heap.pop();
    if (val !== undefined) result.push(val);
  }
  return result;
}

export function nLargest<T>(arr: T[], n: number, compare: CompareFn<T> = defaultMinCompare): T[] {
  const reverseCompare = (a: T, b: T) => -compare(a, b);
  return nSmallest(arr, n, reverseCompare);
}

export function isMinHeap<T>(arr: T[], compare: CompareFn<T> = defaultMinCompare): boolean {
  for (let i = 0; i < arr.length; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < arr.length && compare(arr[i], arr[left]) > 0) return false;
    if (right < arr.length && compare(arr[i], arr[right]) > 0) return false;
  }
  return true;
}

export function mergeHeaps<T>(heap1: BinaryHeap<T>, heap2: BinaryHeap<T>, compare: CompareFn<T> = defaultMinCompare): BinaryHeap<T> {
  const merged = new BinaryHeap(compare);
  for (const item of heap1.toArray()) {
    merged.push(item);
  }
  for (const item of heap2.toArray()) {
    merged.push(item);
  }
  return merged;
}
