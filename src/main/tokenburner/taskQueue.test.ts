import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskQueue } from './taskQueue';
import type { Task, QueueStatus } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('TaskQueue', () => {
  let queue: TaskQueue;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskqueue-test-'));
    queue = new TaskQueue(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('add', () => {
    it('should add a task with default priority', async () => {
      const id = await queue.add('Test task', 'Description');
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      const task = await queue.get(id);
      expect(task?.priority).toBe('normal');
      expect(task?.status).toBe('pending');
    });

    it('should add a task with specified priority', async () => {
      const id = await queue.add('Critical task', 'Urgent', 'critical');
      const task = await queue.get(id);
      expect(task?.priority).toBe('critical');
    });

    it('should generate unique IDs for each task', async () => {
      const id1 = await queue.add('Task 1', 'Desc 1');
      const id2 = await queue.add('Task 2', 'Desc 2');
      expect(id1).not.toBe(id2);
    });
  });

  describe('claim', () => {
    it('should claim the highest priority pending task', async () => {
      await queue.add('Low', 'desc', 'low');
      await queue.add('Critical', 'desc', 'critical');
      const task = await queue.claim('agent-1');
      expect(task?.title).toBe('Critical');
      expect(task?.status).toBe('active');
    });

    it('should return null when queue is empty', async () => {
      const task = await queue.claim('agent-1');
      expect(task).toBeNull();
    });

    it('should not give same task to two agents', async () => {
      await queue.add('Only task', 'desc');
      const t1 = await queue.claim('agent-1');
      const t2 = await queue.claim('agent-2');
      expect(t1).toBeDefined();
      expect(t2).toBeNull();
    });

    it('should claim FIFO within same priority', async () => {
      await queue.add('First', 'desc', 'normal');
      await queue.add('Second', 'desc', 'normal');
      const task = await queue.claim('agent-1');
      expect(task?.title).toBe('First');
    });
  });

  describe('complete', () => {
    it('should mark task as complete with timestamp', async () => {
      const id = await queue.add('Task', 'desc');
      await queue.claim('agent-1');
      await queue.complete(id);
      const task = await queue.get(id);
      expect(task?.status).toBe('complete');
      expect(task?.completedAt).toBeDefined();
    });
  });

  describe('fail', () => {
    it('should mark task as failed with reason', async () => {
      const id = await queue.add('Task', 'desc');
      await queue.claim('agent-1');
      await queue.fail(id, 'Test failures');
      const task = await queue.get(id);
      expect(task?.status).toBe('failed');
      expect(task?.failReason).toBe('Test failures');
    });

    it('should requeue task if retries remaining', async () => {
      const id = await queue.add('Task', 'desc');
      const task = await queue.get(id);
      task!.maxRetries = 3;
      await queue.claim('agent-1');
      await queue.fail(id, 'Fail 1');
      const updated = await queue.get(id);
      expect(updated?.status).toBe('pending');
      expect(updated?.retries).toBe(1);
    });
  });

  describe('unclaim', () => {
    it('should release active task back to pending', async () => {
      const id = await queue.add('Task', 'desc');
      await queue.claim('agent-1');
      await queue.unclaim(id);
      const task = await queue.get(id);
      expect(task?.status).toBe('pending');
      expect(task?.assignee).toBeUndefined();
    });
  });

  describe('status', () => {
    it('should return correct counts', async () => {
      await queue.add('T1', 'd');
      await queue.add('T2', 'd');
      await queue.claim('a1');
      const s = await queue.status();
      expect(s.pending).toBe(1);
      expect(s.active).toBe(1);
      expect(s.total).toBe(2);
    });
  });

  describe('list', () => {
    it('should list all tasks', async () => {
      await queue.add('T1', 'd');
      await queue.add('T2', 'd');
      const all = await queue.list();
      expect(all).toHaveLength(2);
    });

    it('should filter by status', async () => {
      await queue.add('T1', 'd');
      await queue.add('T2', 'd');
      await queue.claim('a1');
      const pending = await queue.list('pending');
      expect(pending).toHaveLength(1);
    });
  });

  describe('import', () => {
    it('should bulk import tasks', async () => {
      const tasks = [
        { title: 'T1', description: 'D1' },
        { title: 'T2', description: 'D2', priority: 'high' as const },
      ];
      await queue.import(tasks);
      const all = await queue.list();
      expect(all).toHaveLength(2);
    });
  });

  describe('persistence', () => {
    it('should persist tasks to disk and reload', async () => {
      await queue.add('Persistent task', 'should survive reload');
      const queue2 = new TaskQueue(tmpDir);
      const all = await queue2.list();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe('Persistent task');
    });
  });
});
