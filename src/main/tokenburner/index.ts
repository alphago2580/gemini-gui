// TokenBurner — barrel exports

// Shared types
export type {
  TaskPriority,
  TaskStatus,
  AgentStatus,
  Task,
  TaskInput,
  QueueStatus,
  MergeResult,
  Commit,
  TestResult,
  TypeCheckResult,
  AgentConfig,
  AgentTask,
  HarnessEventType,
  HarnessEvent,
  HarnessConfig,
  TaskLike,
  AgentLike,
  QueueLike,
  GitOpsLike,
  TestGateLike,
  TaskMetric,
  MetricsSummary,
  AgentStats,
  AgentState,
  DashboardData,
  TokenBurnerConfig,
} from './types';

// Engine
export { TokenBurnerEngine } from './engine';
export type {
  TokenBurnerEngineOptions,
  EngineConfig,
  EngineEvent,
  EngineAgentState,
  EngineDashboardData,
  EngineMetricsSummary,
  ITaskQueue,
  IMetricsCollector,
  IAgent,
} from './engine';

// Agent
export { Agent } from './agent';

// Harness
export { runHarnessLoop } from './harness';

// TaskQueue
export { TaskQueue } from './taskQueue';

// GitOps
export { GitOps } from './gitOps';

// TestGate
export { TestGate } from './testGate';

// Metrics
export { MetricsCollector } from './metrics';

// Planner
export { Planner } from './planner';
export type { PlannerTask, ExecutionPlan, PlanPhase } from './planner';

// Scaler
export { Scaler } from './scaler';
export type { ScalerConfig, ScalerState, ScaleDecision } from './scaler';
