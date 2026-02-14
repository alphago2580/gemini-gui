import React, { useEffect, useState, useCallback } from 'react';
import AgentMonitor, { AgentInfo } from './AgentMonitor';
import TaskQueuePanel, { TaskItem, TaskPriority } from './TaskQueuePanel';
import MetricsChart, { MetricsSummary } from './MetricsChart';
import PlannerWizard, { PlannerTaskInput } from './PlannerWizard';
import ConfigPanel, { TokenBurnerConfig } from './ConfigPanel';
import './TokenBurnerDashboard.css';

export interface QueueStatus {
  pending: number;
  active: number;
  complete: number;
  failed: number;
  total: number;
}

export interface DashboardData {
  projectName: string;
  projectPath: string;
  isRunning: boolean;
  agents: AgentInfo[];
  queue: QueueStatus;
  metrics: MetricsSummary;
  recentEvents: Array<{ type: string; message: string; timestamp: number }>;
  gitLog: Array<{ hash: string; message: string }>;
  tasks?: TaskItem[];
}

export interface TokenBurnerDashboardProps {
  initialData?: DashboardData;
  onBack?: () => void;
}

const DEFAULT_DATA: DashboardData = {
  projectName: '',
  projectPath: '',
  isRunning: false,
  agents: [],
  queue: { pending: 0, active: 0, complete: 0, failed: 0, total: 0 },
  metrics: { totalTasks: 0, completed: 0, failed: 0, successRate: 0, avgDuration: 0 },
  recentEvents: [],
  gitLog: [],
};

function createDefaultConfig(projectPath: string): TokenBurnerConfig {
  return {
    project: { repo: projectPath, mainBranch: 'main', testCommand: 'npm test' },
    agents: { count: 2, model: 'claude', timeout: 300 },
    task: { maxRetries: 3 },
  };
}

const TokenBurnerDashboard: React.FC<TokenBurnerDashboardProps> = ({ initialData }) => {
  const [data, setData] = useState<DashboardData>(initialData || DEFAULT_DATA);
  const [loading, setLoading] = useState(!initialData);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<TokenBurnerConfig>(() =>
    createDefaultConfig((initialData || DEFAULT_DATA).projectPath),
  );
  const [localTasks, setLocalTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    if (initialData) return;

    const api = (window as unknown as Record<string, unknown>).electronAPI as
      | { tokenburner?: { getDashboard?: () => Promise<DashboardData>; onEvent?: (cb: (data: DashboardData) => void) => void; removeAllListeners?: () => void } }
      | undefined;

    if (!api?.tokenburner?.getDashboard) {
      setLoading(false);
      return;
    }

    api.tokenburner.getDashboard().then((d) => {
      setData(d);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    if (api.tokenburner.onEvent) {
      api.tokenburner.onEvent((d) => setData(d));
    }

    return () => {
      api?.tokenburner?.removeAllListeners?.();
    };
  }, [initialData]);

  const handleStop = useCallback(() => {
    // Will be wired to IPC
  }, []);

  const handlePause = useCallback(() => {
    // Will be wired to IPC
  }, []);

  const handleAddTask = useCallback((_title: string, _priority: TaskPriority) => {
    // Will be wired to IPC
  }, []);

  const handlePlanSubmit = useCallback((plannerTasks: PlannerTaskInput[]) => {
    const newItems: TaskItem[] = plannerTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: 'pending' as const,
      priority: t.priority,
    }));
    setLocalTasks((prev) => [...prev, ...newItems]);
    setShowPlanner(false);
  }, []);

  const handleConfigSave = useCallback((newConfig: TokenBurnerConfig) => {
    setConfig(newConfig);
    setShowConfig(false);
  }, []);

  const handleConfigCancel = useCallback(() => {
    setShowConfig(false);
  }, []);

  if (loading) {
    return <div className="tb-dashboard-loading">Loading...</div>;
  }

  const agentCount = data.agents.length;
  const tasks: TaskItem[] = [...(data.tasks || []), ...localTasks];

  return (
    <div className="tb-dashboard" role="main" aria-label="Token Burner Dashboard">
      <header className="tb-dashboard-header">
        <div className="tb-dashboard-title-row">
          <h2 className="tb-dashboard-project">{data.projectName}</h2>
          <span className={`tb-dashboard-status ${data.isRunning ? 'tb-dashboard-status--running' : 'tb-dashboard-status--stopped'}`}>
            {data.isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
        <div className="tb-dashboard-summary">
          <span>{agentCount} agents</span>
          <span className="tb-dashboard-sep">|</span>
          <span>{data.queue.pending} pending</span>
          <span className="tb-dashboard-sep">|</span>
          <span>{data.queue.active} active</span>
          <span className="tb-dashboard-sep">|</span>
          <span>{data.queue.complete} complete</span>
        </div>
        <div className="tb-dashboard-actions">
          <button className="tb-btn tb-btn--primary" onClick={() => setShowPlanner(true)} aria-label="Plan Tasks">
            Plan Tasks
          </button>
          <button className="tb-btn tb-btn--secondary" onClick={() => setShowConfig((v) => !v)} aria-label="Settings">
            Settings
          </button>
          <button className="tb-btn tb-btn--danger" onClick={handleStop} aria-label="Stop">
            Stop
          </button>
          <button className="tb-btn tb-btn--warning" onClick={handlePause} aria-label="Pause">
            Pause
          </button>
        </div>
      </header>

      {showConfig && (
        <section className="tb-dashboard-config-section">
          <ConfigPanel
            config={config}
            onSave={handleConfigSave}
            onCancel={handleConfigCancel}
            disabled={data.isRunning}
          />
        </section>
      )}

      <div className="tb-dashboard-grid">
        <section className="tb-dashboard-section">
          <AgentMonitor agents={data.agents} />
        </section>
        <section className="tb-dashboard-section">
          <MetricsChart metrics={data.metrics} />
        </section>
        <section className="tb-dashboard-section tb-dashboard-section--wide">
          <TaskQueuePanel tasks={tasks} onAddTask={handleAddTask} />
        </section>
      </div>

      <PlannerWizard
        open={showPlanner}
        onClose={() => setShowPlanner(false)}
        onSubmit={handlePlanSubmit}
      />
    </div>
  );
};

export default React.memo(TokenBurnerDashboard);
