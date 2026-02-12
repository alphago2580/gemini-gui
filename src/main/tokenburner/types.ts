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
  retries?: number;
  error?: string;
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

// Planner types

export interface PlannerTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dependencies: string[];
  estimatedDuration?: number;
  assignedAgent?: string;
}

export interface ExecutionPlan {
  phases: PlanPhase[];
  totalTasks: number;
  estimatedDuration: number;
  criticalPath: string[];
}

export interface PlanPhase {
  phase: number;
  tasks: PlannerTask[];
  parallelizable: boolean;
}

// Scaler types

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
