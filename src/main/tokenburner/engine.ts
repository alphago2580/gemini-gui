import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { TaskQueue as FileTaskQueue } from './taskQueue';
import { MetricsCollector as FileMetricsCollector } from './metrics';
import type {
  TaskPriority,
  TaskStatus,
  AgentStatus,
  Task,
  QueueStatus,
  AgentState,
  AgentStats,
  TaskMetric,
  MetricsSummary,
  DashboardData,
  EngineConfig,
  EngineEvent,
  ITaskQueue,
  IAgent,
  IMetricsCollector,
  TokenBurnerEngineOptions,
} from './types';

// Re-export types that consumers of engine.ts may need
export type {
  TaskPriority,
  TaskStatus,
  AgentStatus,
  Task,
  QueueStatus,
  AgentState,
  AgentStats,
  TaskMetric,
  MetricsSummary,
  DashboardData,
  EngineConfig,
  EngineEvent,
  ITaskQueue,
  IAgent,
  IMetricsCollector,
  TokenBurnerEngineOptions,
};

// ── Default in-memory TaskQueue implementation ──

class InMemoryTaskQueue implements ITaskQueue {
  private tasks: Map<string, Task> = new Map();
  private counter = 0;

  add(title: string, description: string, priority: TaskPriority = 'normal'): string {
    const id = `task-${++this.counter}-${Date.now().toString(36)}`;
    const task: Task = {
      id,
      title,
      description,
      priority,
      status: 'pending',
      createdAt: Date.now(),
      retries: 0,
      maxRetries: 3,
    };
    this.tasks.set(id, task);
    return id;
  }

  claim(agentId: string): Task | null {
    const priorityOrder: TaskPriority[] = ['critical', 'high', 'normal', 'low'];
    for (const p of priorityOrder) {
      for (const task of this.tasks.values()) {
        if (task.status === 'pending' && task.priority === p) {
          task.status = 'active';
          task.assignee = agentId;
          return task;
        }
      }
    }
    return null;
  }

  complete(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'complete';
      task.completedAt = Date.now();
    }
  }

  fail(taskId: string, reason: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = 'pending';
        task.assignee = undefined;
      } else {
        task.status = 'failed';
        task.failReason = reason;
      }
    }
  }

  unclaim(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'pending';
      task.assignee = undefined;
    }
  }

  get(taskId: string): Task | null {
    return this.tasks.get(taskId) ?? null;
  }

  list(status?: TaskStatus): Task[] {
    const all = Array.from(this.tasks.values());
    return status ? all.filter((t) => t.status === status) : all;
  }

  status(): QueueStatus {
    let pending = 0, active = 0, complete = 0, failed = 0;
    for (const t of this.tasks.values()) {
      if (t.status === 'pending') pending++;
      else if (t.status === 'active') active++;
      else if (t.status === 'complete') complete++;
      else if (t.status === 'failed') failed++;
    }
    return { pending, active, complete, failed, total: this.tasks.size };
  }

  import(tasks: Array<{ title: string; description: string; priority?: TaskPriority }>): void {
    for (const t of tasks) {
      this.add(t.title, t.description, t.priority);
    }
  }
}

// ── Default in-memory MetricsCollector ──

class InMemoryMetrics implements IMetricsCollector {
  private records: TaskMetric[] = [];

  recordTask(metric: TaskMetric): void {
    this.records.push(metric);
  }

  getSummary(): MetricsSummary {
    if (this.records.length === 0) {
      return { totalTasks: 0, completed: 0, failed: 0, successRate: 0, avgDuration: 0, totalDuration: 0, agentCount: 0 };
    }
    const completed = this.records.filter((r) => r.success).length;
    const failed = this.records.length - completed;
    const totalDuration = this.records.reduce((sum, r) => sum + r.duration, 0);
    const uniqueAgents = new Set(this.records.map((r) => r.agentId));
    return {
      totalTasks: this.records.length,
      completed,
      failed,
      successRate: completed / this.records.length,
      avgDuration: totalDuration / this.records.length,
      totalDuration,
      agentCount: uniqueAgents.size,
    };
  }

  getAgentStats(agentId: string): AgentStats {
    const agentRecords = this.records.filter((r) => r.agentId === agentId);
    const completed = agentRecords.filter((r) => r.success).length;
    const failed = agentRecords.length - completed;
    const totalDuration = agentRecords.reduce((s, r) => s + r.duration, 0);
    return {
      agentId,
      completed,
      failed,
      totalDuration,
      avgDuration: agentRecords.length > 0 ? totalDuration / agentRecords.length : 0,
      successRate: agentRecords.length > 0 ? completed / agentRecords.length : 0,
    };
  }
}

// ── Stub Agent for engine-level orchestration testing ──

class StubAgent implements IAgent {
  id: string;
  status: AgentStatus = 'idle';
  currentTask: Task | null = null;
  startedAt: number | null = null;
  model: string;
  private emitter = new EventEmitter();

  constructor(id: string, model: string) {
    this.id = id;
    this.model = model;
  }

  start(task: Task, _worktreePath: string, _prompt: string): void {
    this.status = 'working';
    this.currentTask = task;
    this.startedAt = Date.now();
    this.emitter.emit('started', { agentId: this.id, taskId: task.id });
  }

  stop(): void {
    this.status = 'idle';
    this.currentTask = null;
    this.startedAt = null;
    this.emitter.emit('stopped', { agentId: this.id });
  }

  isRunning(): boolean {
    return this.status === 'working';
  }

  elapsed(): number {
    if (!this.startedAt) return 0;
    return (Date.now() - this.startedAt) / 1000;
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    this.emitter.on(event, listener);
  }

  removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }
}

// ── TokenBurnerEngine ──

export class TokenBurnerEngine extends EventEmitter {
  private config: EngineConfig;
  private queue: ITaskQueue;
  private metrics: IMetricsCollector;
  private agents: IAgent[] = [];
  private running = false;
  private agentFactory: (id: string, model: string) => IAgent;

  private initialized = false;
  private customQueue: boolean;

  constructor(options?: TokenBurnerEngineOptions) {
    super();
    this.config = {
      project: { repo: '', name: '' },
      agents: { count: 0, model: 'claude', timeoutSeconds: 300 },
      maxRetries: 3,
    };
    this.customQueue = !!options?.queue;
    this.queue = options?.queue ?? new InMemoryTaskQueue();
    this.metrics = options?.metrics ?? new InMemoryMetrics();
    this.agentFactory = options?.agentFactory ?? ((id, model) => new StubAgent(id, model));
  }

  async init(projectPath: string): Promise<void> {
    this.config.project.repo = projectPath;
    this.config.project.name = path.basename(projectPath);

    const tbDir = path.join(projectPath, '.tokenburner');
    if (!fs.existsSync(tbDir)) {
      fs.mkdirSync(tbDir, { recursive: true });
    }

    // Swap to file-backed TaskQueue and MetricsCollector if no custom ones provided
    if (!this.customQueue) {
      const queueDir = path.join(tbDir, 'queue');
      this.queue = new FileTaskQueue(queueDir);
    }

    this.initialized = true;
  }

  getConfig(): EngineConfig {
    return { ...this.config };
  }

  async launch(count: number): Promise<void> {
    this.config.agents.count = count;
    this.running = true;

    for (let i = 0; i < count; i++) {
      const agentId = `agent-${i + 1}`;
      const agent = this.agentFactory(agentId, this.config.agents.model);
      this.agents.push(agent);

      agent.on('started', (data: unknown) => {
        this.emitEvent('agent-started', agentId, undefined, data);
      });
      agent.on('stopped', (data: unknown) => {
        this.emitEvent('agent-stopped', agentId, undefined, data);
      });
      agent.on('output', (data: unknown) => {
        this.emitEvent('agent-output', agentId, undefined, data);
      });
      agent.on('complete', (data: unknown) => {
        this.emitEvent('agent-complete', agentId, undefined, data);
      });
      agent.on('error', (data: unknown) => {
        this.emitEvent('agent-error', agentId, undefined, data);
      });
    }

    this.emitEvent('engine-started');
  }

  async stop(): Promise<void> {
    for (const agent of this.agents) {
      if (agent.isRunning()) {
        agent.stop();
      }
      agent.removeAllListeners();
    }
    this.running = false;
    this.emitEvent('engine-stopped');
  }

  getAgentStates(): AgentState[] {
    return this.agents.map((a) => ({
      id: a.id,
      status: a.status,
      currentTask: a.currentTask,
      startedAt: a.startedAt,
      model: a.model,
    }));
  }

  async addTask(title: string, description: string, priority: TaskPriority = 'normal'): Promise<string> {
    if (!this.initialized) {
      throw new Error('Engine not initialized — call init() first');
    }
    const id = await this.queue.add(title, description, priority);
    this.emitEvent('task-added', undefined, id);
    return id;
  }

  async getQueueStatus(): Promise<QueueStatus> {
    return this.queue.status();
  }

  async getDashboardData(): Promise<DashboardData> {
    return {
      projectName: this.config.project.name,
      agents: this.getAgentStates(),
      queue: await this.queue.status(),
      metrics: this.metrics.getSummary(),
      isRunning: this.running,
    };
  }

  getQueue(): ITaskQueue {
    return this.queue;
  }

  getMetrics(): IMetricsCollector {
    return this.metrics;
  }

  isRunning(): boolean {
    return this.running;
  }

  private emitEvent(
    type: EngineEvent['type'],
    agentId?: string,
    taskId?: string,
    data?: unknown
  ): void {
    const event: EngineEvent = { type, agentId, taskId, data, timestamp: Date.now() };
    this.emit('engine-event', event);
  }
}
