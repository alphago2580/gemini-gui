import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

import type {
  TaskPriority,
  TaskStatus,
  AgentStatus,
  QueueStatus,
  TaskMetric,
} from './types';
import { TaskQueue } from './taskQueue';
import { MetricsCollector } from './metrics';

// Re-export shared types
export type { TaskPriority, TaskStatus, AgentStatus, QueueStatus };

// Engine's Task type — compatible with TaskQueue's numeric timestamps
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

// ── Interfaces for dependency injection ──

export interface ITaskQueue {
  add(title: string, description: string, priority?: TaskPriority): Promise<string>;
  claim(agentId: string): Promise<Task | null>;
  complete(taskId: string): Promise<void>;
  fail(taskId: string, reason: string): Promise<void>;
  unclaim(taskId: string): Promise<void>;
  get(taskId: string): Promise<Task | null>;
  list(status?: TaskStatus): Promise<Task[]>;
  status(): Promise<QueueStatus>;
  import(tasks: Array<{ title: string; description: string; priority?: TaskPriority }>): Promise<string[]>;
}

export interface EngineMetricsSummary {
  totalTasks: number;
  successRate: number;
  avgDuration: number;
  totalDuration: number;
}

export interface IMetricsCollector {
  recordTask(metric: TaskMetric): void;
  getSummary(): EngineMetricsSummary;
  getAgentStats(agentId: string): { completed: number; failed: number; avgDuration: number };
}

export interface IAgent {
  id: string;
  status: AgentStatus;
  currentTask: Task | null;
  startedAt: number | null;
  model: string;
  start(task: Task, worktreePath: string, prompt: string): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
  elapsed(): number;
  on(event: string, listener: (...args: unknown[]) => void): void;
  removeAllListeners(event?: string): void;
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

export interface EngineAgentState {
  id: string;
  status: AgentStatus;
  currentTask: Task | null;
  startedAt: number | null;
  model: string;
}

export interface EngineDashboardData {
  projectName: string;
  agents: EngineAgentState[];
  queue: QueueStatus;
  metrics: EngineMetricsSummary;
  isRunning: boolean;
}

export interface EngineEvent {
  type: 'agent-started' | 'agent-stopped' | 'agent-output' | 'agent-complete' | 'agent-error' | 'task-added' | 'task-completed' | 'task-failed' | 'engine-started' | 'engine-stopped';
  agentId?: string;
  taskId?: string;
  data?: unknown;
  timestamp: number;
}

// ── MetricsCollector adapter ──

class MetricsAdapter implements IMetricsCollector {
  private collector = new MetricsCollector();

  recordTask(metric: TaskMetric): void {
    this.collector.recordTask({ ...metric, timestamp: Date.now() });
  }

  getSummary(): EngineMetricsSummary {
    const s = this.collector.getSummary();
    return {
      totalTasks: s.totalTasks,
      successRate: s.successRate,
      avgDuration: s.avgDuration,
      totalDuration: s.totalDuration,
    };
  }

  getAgentStats(agentId: string): { completed: number; failed: number; avgDuration: number } {
    const s = this.collector.getAgentStats(agentId);
    return { completed: s.completed, failed: s.failed, avgDuration: s.avgDuration };
  }
}

// ── Stub Agent (used when no real agent factory is provided) ──

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

  async start(task: Task, _worktreePath: string, _prompt: string): Promise<void> {
    this.status = 'working';
    this.currentTask = task;
    this.startedAt = Date.now();
    this.emitter.emit('started', { agentId: this.id, taskId: task.id });
  }

  async stop(): Promise<void> {
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
  private queue: ITaskQueue | null;
  private metrics: IMetricsCollector;
  private agents: IAgent[] = [];
  private running = false;
  private agentFactory: (id: string, model: string) => IAgent;
  private customQueue: boolean;

  constructor(options?: TokenBurnerEngineOptions) {
    super();
    this.config = {
      project: { repo: '', name: '' },
      agents: { count: 0, model: 'claude', timeoutSeconds: 300 },
      maxRetries: 3,
    };
    this.queue = options?.queue ?? null;
    this.customQueue = !!options?.queue;
    this.metrics = options?.metrics ?? new MetricsAdapter();
    this.agentFactory = options?.agentFactory ?? ((id, model) => new StubAgent(id, model));
  }

  async init(projectPath: string): Promise<void> {
    this.config.project.repo = projectPath;
    this.config.project.name = path.basename(projectPath);

    const tbDir = path.join(projectPath, '.tokenburner');
    if (!fs.existsSync(tbDir)) {
      fs.mkdirSync(tbDir, { recursive: true });
    }

    // Wire up real TaskQueue if no custom queue was provided
    if (!this.customQueue) {
      const queueDir = path.join(tbDir, 'queue');
      this.queue = new TaskQueue(queueDir);
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
        await agent.stop();
      }
      agent.removeAllListeners();
    }
    this.running = false;
    this.emitEvent('engine-stopped');
  }

  getAgentStates(): EngineAgentState[] {
    return this.agents.map((a) => ({
      id: a.id,
      status: a.status,
      currentTask: a.currentTask,
      startedAt: a.startedAt,
      model: a.model,
    }));
  }

  async addTask(title: string, description: string, priority: TaskPriority = 'normal'): Promise<string> {
    const q = this.getQueue();
    const id = await q.add(title, description, priority);
    this.emitEvent('task-added', undefined, id);
    return id;
  }

  async getQueueStatus(): Promise<QueueStatus> {
    const q = this.getQueue();
    return q.status();
  }

  async getDashboardData(): Promise<EngineDashboardData> {
    const q = this.getQueue();
    return {
      projectName: this.config.project.name,
      agents: this.getAgentStates(),
      queue: await q.status(),
      metrics: this.metrics.getSummary(),
      isRunning: this.running,
    };
  }

  getQueue(): ITaskQueue {
    if (!this.queue) {
      throw new Error('Engine not initialized. Call init() first or provide a queue in options.');
    }
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
