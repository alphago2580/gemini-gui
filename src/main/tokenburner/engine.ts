import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

// ── Type definitions for dependent modules ──
// These interfaces define the contracts that other modules (agent, taskQueue,
// gitOps, testGate, harness, metrics) must implement. They are kept here so
// the engine can compile independently while those modules are still in flight.

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'active' | 'complete' | 'failed';
export type AgentStatus = 'idle' | 'working' | 'error';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  createdAt: number;
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

export interface ITaskQueue {
  add(title: string, description: string, priority?: TaskPriority): string;
  claim(agentId: string): Task | null;
  complete(taskId: string): void;
  fail(taskId: string, reason: string): void;
  unclaim(taskId: string): void;
  get(taskId: string): Task | null;
  list(status?: TaskStatus): Task[];
  status(): QueueStatus;
  import(tasks: Array<{ title: string; description: string; priority?: TaskPriority }>): void;
}

export interface AgentState {
  id: string;
  status: AgentStatus;
  currentTask: Task | null;
  startedAt: number | null;
  model: string;
}

export interface IAgent {
  id: string;
  status: AgentStatus;
  currentTask: Task | null;
  startedAt: number | null;
  model: string;
  start(task: Task, worktreePath: string, prompt: string): void;
  stop(): void;
  isRunning(): boolean;
  elapsed(): number;
  on(event: string, listener: (...args: unknown[]) => void): void;
  removeAllListeners(): void;
}

export interface TaskMetric {
  taskId: string;
  agentId: string;
  model: string;
  duration: number;
  success: boolean;
  timestamp: number;
}

export interface MetricsSummary {
  totalTasks: number;
  successRate: number;
  avgDuration: number;
  totalDuration: number;
}

export interface IMetricsCollector {
  recordTask(metric: TaskMetric): void;
  getSummary(): MetricsSummary;
  getAgentStats(agentId: string): { completed: number; failed: number; avgDuration: number };
}

export interface EngineConfig {
  project: {
    repo: string;
    name: string;
  };
  agents: {
    count: number;
    model: string;
    timeoutSeconds: number;
  };
  maxRetries: number;
}

export interface DashboardData {
  projectName: string;
  agents: AgentState[];
  queue: QueueStatus;
  metrics: MetricsSummary;
  isRunning: boolean;
}

export interface EngineEvent {
  type: 'agent-started' | 'agent-stopped' | 'agent-output' | 'agent-complete' | 'agent-error' | 'task-added' | 'task-completed' | 'task-failed' | 'engine-started' | 'engine-stopped';
  agentId?: string;
  taskId?: string;
  data?: unknown;
  timestamp: number;
}

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
      return { totalTasks: 0, successRate: 0, avgDuration: 0, totalDuration: 0 };
    }
    const successes = this.records.filter((r) => r.success).length;
    const totalDuration = this.records.reduce((sum, r) => sum + r.duration, 0);
    return {
      totalTasks: this.records.length,
      successRate: successes / this.records.length,
      avgDuration: totalDuration / this.records.length,
      totalDuration,
    };
  }

  getAgentStats(agentId: string): { completed: number; failed: number; avgDuration: number } {
    const agentRecords = this.records.filter((r) => r.agentId === agentId);
    if (agentRecords.length === 0) return { completed: 0, failed: 0, avgDuration: 0 };
    const completed = agentRecords.filter((r) => r.success).length;
    const failed = agentRecords.filter((r) => !r.success).length;
    const avgDuration = agentRecords.reduce((s, r) => s + r.duration, 0) / agentRecords.length;
    return { completed, failed, avgDuration };
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

export interface TokenBurnerEngineOptions {
  queue?: ITaskQueue;
  metrics?: IMetricsCollector;
  agentFactory?: (id: string, model: string) => IAgent;
}

export class TokenBurnerEngine extends EventEmitter {
  private config: EngineConfig;
  private queue: ITaskQueue;
  private metrics: IMetricsCollector;
  private agents: IAgent[] = [];
  private running = false;
  private agentFactory: (id: string, model: string) => IAgent;

  constructor(options?: TokenBurnerEngineOptions) {
    super();
    this.config = {
      project: { repo: '', name: '' },
      agents: { count: 0, model: 'claude', timeoutSeconds: 300 },
      maxRetries: 3,
    };
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

  addTask(title: string, description: string, priority: TaskPriority = 'normal'): string {
    const id = this.queue.add(title, description, priority);
    this.emitEvent('task-added', undefined, id);
    return id;
  }

  getQueueStatus(): QueueStatus {
    return this.queue.status();
  }

  getDashboardData(): DashboardData {
    return {
      projectName: this.config.project.name,
      agents: this.getAgentStates(),
      queue: this.queue.status(),
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
