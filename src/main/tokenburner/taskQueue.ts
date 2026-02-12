import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'active' | 'complete' | 'failed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  createdAt: number;
  claimedAt?: number;
  completedAt?: number;
  failReason?: string;
  retries: number;
  maxRetries: number;
}

export interface QueueStatus {
  pending: number;
  active: number;
  complete: number;
  failed: number;
  total: number;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function generateId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export class TaskQueue {
  private tasks: Map<string, Task> = new Map();
  private storageDir: string;

  constructor(storageDir: string) {
    this.storageDir = storageDir;
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    this.loadFromDisk();
  }

  async add(title: string, description: string, priority: TaskPriority = 'normal'): Promise<string> {
    const id = generateId();
    const task: Task = {
      id,
      title,
      description,
      priority,
      status: 'pending',
      createdAt: Date.now(),
      retries: 0,
      maxRetries: 0,
    };
    this.tasks.set(id, task);
    this.saveToDisk();
    return id;
  }

  async get(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async claim(agentId: string): Promise<Task | null> {
    const pending = Array.from(this.tasks.values())
      .filter((t) => t.status === 'pending')
      .sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt - b.createdAt;
      });

    if (pending.length === 0) return null;

    const task = pending[0];
    task.status = 'active';
    task.assignee = agentId;
    task.claimedAt = Date.now();
    this.saveToDisk();
    return task;
  }

  async complete(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    task.status = 'complete';
    task.completedAt = Date.now();
    this.saveToDisk();
  }

  async fail(id: string, reason: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Task not found: ${id}`);

    task.retries += 1;

    if (task.retries <= task.maxRetries) {
      task.status = 'pending';
      task.assignee = undefined;
      task.claimedAt = undefined;
      task.failReason = undefined;
    } else {
      task.status = 'failed';
      task.failReason = reason;
    }
    this.saveToDisk();
  }

  async unclaim(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    task.status = 'pending';
    task.assignee = undefined;
    task.claimedAt = undefined;
    this.saveToDisk();
  }

  async status(): Promise<QueueStatus> {
    const tasks = Array.from(this.tasks.values());
    return {
      pending: tasks.filter((t) => t.status === 'pending').length,
      active: tasks.filter((t) => t.status === 'active').length,
      complete: tasks.filter((t) => t.status === 'complete').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      total: tasks.length,
    };
  }

  async list(statusFilter?: TaskStatus): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    if (statusFilter) {
      return tasks.filter((t) => t.status === statusFilter);
    }
    return tasks;
  }

  async import(items: Array<{ title: string; description: string; priority?: TaskPriority }>): Promise<string[]> {
    const ids: string[] = [];
    for (const item of items) {
      const id = await this.add(item.title, item.description, item.priority ?? 'normal');
      ids.push(id);
    }
    return ids;
  }

  private saveToDisk(): void {
    const filePath = path.join(this.storageDir, 'queue.json');
    const data = Array.from(this.tasks.values());
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private loadFromDisk(): void {
    const filePath = path.join(this.storageDir, 'queue.json');
    if (!fs.existsSync(filePath)) return;
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data: Task[] = JSON.parse(raw);
      this.tasks.clear();
      for (const task of data) {
        this.tasks.set(task.id, task);
      }
    } catch {
      // Corrupted file, start fresh
      this.tasks.clear();
    }
  }
}
