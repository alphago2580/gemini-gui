// TokenBurner shared types

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'active' | 'complete' | 'failed';
export type AgentStatus = 'idle' | 'working' | 'testing' | 'error' | 'stopped';

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
  completedAt?: Date;
  createdAt: Date;
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

// --- Agent types (from agent.ts) ---

export interface AgentConfig {
  timeoutMs: number;
  cliCommand: string;
  cliArgs?: string[];
  env?: NodeJS.ProcessEnv;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
}

// --- Harness types (from harness.ts) ---

export type HarnessEventType =
  | 'claim'
  | 'agent-start'
  | 'agent-complete'
  | 'test-result'
  | 'merge'
  | 'complete'
  | 'fail'
  | 'idle'
  | 'retry'
  | 'error';

export interface HarnessEvent {
  type: HarnessEventType;
  taskId?: string;
  message?: string;
  retryCount?: number;
  success?: boolean;
  timestamp: number;
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
  createWorktree(repoDir: string, agentId: string, branchName: string): Promise<string>;
  removeWorktree(worktreePath: string): Promise<void>;
  mergeBranch(repoDir: string, branch: string, target: string, retries?: number): Promise<{ success: boolean; retryCount: number; conflictFiles?: string[] }>;
  hasNewCommits(repoDir: string, branch: string, target: string): Promise<boolean>;
}

export interface TestGateLike {
  runTests(cwd: string, cmd: string): Promise<{ success: boolean; rawOutput: string }>;
}

// --- Metrics & Dashboard types ---

export interface TaskMetric {
  taskId: string;
  agentId: string;
  model: string;
  duration: number;
  success: boolean;
}

export interface MetricsSummary {
  totalTasks: number;
  successRate: number;
  avgDuration: number;
}

export interface AgentStats {
  completed: number;
  failed: number;
}

export interface AgentState {
  id: string;
  model: string;
  status: AgentStatus;
  currentTask: Task | null;
  elapsed: number;
  completed: number;
  failed: number;
}

export interface DashboardData {
  projectName: string;
  projectPath: string;
  isRunning: boolean;
  agents: AgentState[];
  queue: QueueStatus;
  metrics: MetricsSummary;
  recentEvents: HarnessEvent[];
  gitLog: Commit[];
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
