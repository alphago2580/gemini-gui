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
  claimedAt?: number;
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

export type HarnessEventType =
  | 'claim'
  | 'test-result'
  | 'merge'
  | 'complete'
  | 'fail'
  | 'idle'
  | 'error'
  | 'agent-start'
  | 'agent-complete'
  | 'retry';

export interface HarnessEvent {
  type: HarnessEventType;
  taskId?: string;
  agentId?: string;
  timestamp?: number;
  message?: string;
  success?: boolean;
  retryCount?: number;
  data?: Record<string, unknown>;
}

export interface HarnessConfig {
  maxRetries: number;
  idleBackoffMs: number;
  maxIdleBackoffMs: number;
  mergeRetries: number;
}

export interface TaskLike {
  id: string;
  title: string;
  description: string;
}

export interface AgentLike {
  start(task: TaskLike, worktreePath: string, prompt: string): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
  on(event: string, listener: (...args: unknown[]) => void): void;
  removeAllListeners(event?: string): void;
}

export interface QueueLike {
  claim(agentId: string): Promise<TaskLike | null>;
  complete(taskId: string): Promise<void>;
  fail(taskId: string, reason: string): Promise<void>;
}

export interface GitOpsLike {
  createWorktree(repoPath: string, agentId: string, branchName: string): Promise<string>;
  removeWorktree(worktreePath: string): Promise<void>;
  mergeBranch(repoPath: string, branchName: string, targetBranch: string, retries: number): Promise<MergeResult>;
  hasNewCommits(repoPath: string, branchName: string, targetBranch: string): Promise<boolean>;
}

export interface TestGateLike {
  runTests(worktreePath: string, command: string): Promise<{ success: boolean; rawOutput: string }>;
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
  completed: number;
  failed: number;
  successRate: number;
  avgDuration: number;
  totalDuration: number;
  agentCount: number;
}

export interface AgentStats {
  agentId: string;
  completed: number;
  failed: number;
  totalDuration: number;
  avgDuration: number;
  successRate: number;
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

export interface AgentConfig {
  cliCommand: string;
  cliArgs?: string[];
  timeoutMs: number;
  env?: NodeJS.ProcessEnv;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  retries?: number;
  maxRetries?: number;
  failReason?: string;
  completedAt?: number;
  claimedAt?: number;
  createdAt?: number;
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
  getAgentStats(agentId: string): AgentStats;
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

// ── Planner types ──

export interface PlannerTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dependencies: string[];
  estimatedDuration?: number;
}

export interface PlanPhase {
  phase: number;
  tasks: PlannerTask[];
  parallelizable: boolean;
}

export interface ExecutionPlan {
  phases: PlanPhase[];
  totalTasks: number;
  estimatedDuration: number;
  criticalPath: string[];
}

// ── Scaler types ──

export interface ScalerConfig {
  minAgents: number;
  maxAgents: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownMs: number;
}

export interface ScalerState {
  currentAgents: number;
  desiredAgents: number;
  lastScaleTime: number;
  pendingTasks: number;
  activeAgents: number;
  idleAgents: number;
}

export interface ScaleDecision {
  action: 'scale-up' | 'scale-down' | 'none';
  from: number;
  to: number;
  reason: string;
}
