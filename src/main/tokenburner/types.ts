// TokenBurner shared types

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'active' | 'complete' | 'failed';
export type AgentStatus = 'idle' | 'working' | 'testing' | 'error';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  retries: number;
  maxRetries: number;
  failReason?: string;
  completedAt?: number;
  createdAt: number;
}

export interface TaskInput {
  title: string;
  description: string;
  priority?: TaskPriority;
}

export interface QueueStatus {
  pending: number;
  active: number;
  complete: number;
  failed: number;
  total: number;
}

export interface MergeResult {
  success: boolean;
  retryCount?: number;
  conflictFiles?: string[];
}

export interface Commit {
  hash: string;
  message: string;
}

export interface TestResult {
  success: boolean;
  totalTests: number;
  passed: number;
  failedTests: Array<{ name: string; error: string }>;
  rawOutput: string;
}

export interface TypeCheckResult {
  success: boolean;
  errorCount: number;
  errors: Array<{ file: string }>;
}

export interface HarnessEvent {
  type: 'claim' | 'test-result' | 'merge' | 'complete' | 'fail' | 'idle';
  taskId?: string;
  agentId?: string;
  data?: Record<string, unknown>;
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

export interface AgentStats {
  completed: number;
  failed: number;
}

export interface AgentState {
  id: string;
  status: AgentStatus;
  currentTask: Task | null;
  startedAt: number | null;
  model: string;
}

export interface DashboardData {
  projectName: string;
  agents: AgentState[];
  queue: QueueStatus;
  metrics: MetricsSummary;
  isRunning: boolean;
}

export interface TokenBurnerConfig {
  project: {
    repo: string;
    mainBranch: string;
    testCommand: string;
  };
  agents: {
    count: number;
    model: string;
    timeout: number;
  };
  task: {
    maxRetries: number;
  };
}

// ── Engine-specific interfaces ──

export interface ITaskQueue {
  add(title: string, description: string, priority?: TaskPriority): string | Promise<string>;
  claim(agentId: string): Task | null | Promise<Task | null>;
  complete(taskId: string): void | Promise<void>;
  fail(taskId: string, reason: string): void | Promise<void>;
  unclaim(taskId: string): void | Promise<void>;
  get(taskId: string): Task | null | Promise<Task | null>;
  list(status?: TaskStatus): Task[] | Promise<Task[]>;
  status(): QueueStatus | Promise<QueueStatus>;
  import(tasks: Array<{ title: string; description: string; priority?: TaskPriority }>): void | Promise<string[]>;
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

export interface EngineEvent {
  type: 'agent-started' | 'agent-stopped' | 'agent-output' | 'agent-complete' | 'agent-error' | 'task-added' | 'task-completed' | 'task-failed' | 'engine-started' | 'engine-stopped';
  agentId?: string;
  taskId?: string;
  data?: unknown;
  timestamp: number;
}

export interface TokenBurnerEngineOptions {
  queue?: ITaskQueue;
  metrics?: IMetricsCollector;
  agentFactory?: (id: string, model: string) => IAgent;
}
