export type Comparator<T> = (a: T, b: T) => number;

export class PriorityQueue<T> {
  private heap: T[] = [];
  private comparator: Comparator<T>;

  constructor(comparator: Comparator<T> = (a: T, b: T) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }) {
    this.comparator = comparator;
  }

  static fromArray<T>(items: T[], comparator?: Comparator<T>): PriorityQueue<T> {
    const pq = new PriorityQueue<T>(comparator);
    for (const item of items) {
      pq.enqueue(item);
    }
    return pq;
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  enqueue(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.isEmpty) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  contains(item: T): boolean {
    return this.heap.indexOf(item) !== -1;
  }

  toArray(): T[] {
    const copy = new PriorityQueue<T>(this.comparator);
    copy.heap = [...this.heap];
    const result: T[] = [];
    while (!copy.isEmpty) {
      result.push(copy.dequeue()!);
    }
    return result;
  }

  clear(): void {
    this.heap = [];
  }

  clone(): PriorityQueue<T> {
    const copy = new PriorityQueue<T>(this.comparator);
    copy.heap = [...this.heap];
    return copy;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.comparator(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.comparator(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}
