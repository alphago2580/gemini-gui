import { describe, it, expect } from 'vitest';
import { PriorityQueue } from './priorityQueueUtils';

describe('PriorityQueue', () => {
  describe('min queue (default)', () => {
    it('creates empty queue', () => {
      const pq = new PriorityQueue<number>();
      expect(pq.size).toBe(0);
      expect(pq.isEmpty).toBe(true);
      expect(pq.peek()).toBeUndefined();
    });

    it('enqueues and peeks minimum', () => {
      const pq = new PriorityQueue<number>();
      pq.enqueue(5);
      pq.enqueue(3);
      pq.enqueue(7);
      expect(pq.peek()).toBe(3);
      expect(pq.size).toBe(3);
    });

    it('dequeues in order', () => {
      const pq = new PriorityQueue<number>();
      pq.enqueue(5);
      pq.enqueue(1);
      pq.enqueue(3);
      pq.enqueue(2);
      pq.enqueue(4);

      expect(pq.dequeue()).toBe(1);
      expect(pq.dequeue()).toBe(2);
      expect(pq.dequeue()).toBe(3);
      expect(pq.dequeue()).toBe(4);
      expect(pq.dequeue()).toBe(5);
    });

    it('dequeues undefined from empty queue', () => {
      const pq = new PriorityQueue<number>();
      expect(pq.dequeue()).toBeUndefined();
    });

    it('handles single element', () => {
      const pq = new PriorityQueue<number>();
      pq.enqueue(42);
      expect(pq.peek()).toBe(42);
      expect(pq.dequeue()).toBe(42);
      expect(pq.isEmpty).toBe(true);
    });

    it('handles duplicate values', () => {
      const pq = new PriorityQueue<number>();
      pq.enqueue(3);
      pq.enqueue(1);
      pq.enqueue(3);
      pq.enqueue(1);
      expect(pq.dequeue()).toBe(1);
      expect(pq.dequeue()).toBe(1);
      expect(pq.dequeue()).toBe(3);
      expect(pq.dequeue()).toBe(3);
    });

    it('contains checks element presence', () => {
      const pq = new PriorityQueue<number>();
      pq.enqueue(1);
      pq.enqueue(2);
      pq.enqueue(3);
      expect(pq.contains(2)).toBe(true);
      expect(pq.contains(5)).toBe(false);
    });

    it('clears queue', () => {
      const pq = new PriorityQueue<number>();
      pq.enqueue(1);
      pq.enqueue(2);
      pq.clear();
      expect(pq.isEmpty).toBe(true);
      expect(pq.size).toBe(0);
    });
  });

  describe('max queue (custom comparator)', () => {
    it('dequeues maximum first', () => {
      const pq = new PriorityQueue<number>((a, b) => b - a);
      pq.enqueue(1);
      pq.enqueue(5);
      pq.enqueue(3);
      expect(pq.dequeue()).toBe(5);
      expect(pq.dequeue()).toBe(3);
      expect(pq.dequeue()).toBe(1);
    });
  });

  describe('object queue', () => {
    interface Task { priority: number; name: string }

    it('orders by priority', () => {
      const pq = new PriorityQueue<Task>((a, b) => a.priority - b.priority);
      pq.enqueue({ priority: 3, name: 'low' });
      pq.enqueue({ priority: 1, name: 'high' });
      pq.enqueue({ priority: 2, name: 'medium' });

      expect(pq.dequeue()?.name).toBe('high');
      expect(pq.dequeue()?.name).toBe('medium');
      expect(pq.dequeue()?.name).toBe('low');
    });
  });

  describe('fromArray', () => {
    it('creates queue from array', () => {
      const pq = PriorityQueue.fromArray([5, 3, 1, 4, 2]);
      expect(pq.size).toBe(5);
      expect(pq.dequeue()).toBe(1);
      expect(pq.dequeue()).toBe(2);
    });

    it('creates queue with custom comparator', () => {
      const pq = PriorityQueue.fromArray([1, 5, 3], (a, b) => b - a);
      expect(pq.dequeue()).toBe(5);
    });

    it('creates empty queue from empty array', () => {
      const pq = PriorityQueue.fromArray<number>([]);
      expect(pq.isEmpty).toBe(true);
    });
  });

  describe('toArray', () => {
    it('returns sorted array', () => {
      const pq = PriorityQueue.fromArray([5, 3, 1, 4, 2]);
      expect(pq.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not modify original queue', () => {
      const pq = PriorityQueue.fromArray([3, 1, 2]);
      pq.toArray();
      expect(pq.size).toBe(3);
      expect(pq.peek()).toBe(1);
    });

    it('returns empty array for empty queue', () => {
      const pq = new PriorityQueue<number>();
      expect(pq.toArray()).toEqual([]);
    });
  });

  describe('clone', () => {
    it('creates independent copy', () => {
      const original = PriorityQueue.fromArray([3, 1, 2]);
      const copy = original.clone();
      expect(copy.size).toBe(3);
      expect(copy.dequeue()).toBe(1);
      expect(original.size).toBe(3);
    });

    it('preserves comparator', () => {
      const original = PriorityQueue.fromArray([1, 5, 3], (a, b) => b - a);
      const copy = original.clone();
      expect(copy.dequeue()).toBe(5);
    });
  });

  describe('string queue', () => {
    it('orders strings lexicographically', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('banana');
      pq.enqueue('apple');
      pq.enqueue('cherry');
      expect(pq.dequeue()).toBe('apple');
      expect(pq.dequeue()).toBe('banana');
      expect(pq.dequeue()).toBe('cherry');
    });
  });

  describe('stress test', () => {
    it('handles many elements correctly', () => {
      const pq = new PriorityQueue<number>();
      const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
      for (const v of values) pq.enqueue(v);

      const sorted = [...values].sort((a, b) => a - b);
      const result: number[] = [];
      while (!pq.isEmpty) result.push(pq.dequeue()!);

      expect(result).toEqual(sorted);
    });
  });
});
