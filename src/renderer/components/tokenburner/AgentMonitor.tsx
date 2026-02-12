import React from 'react';
import './AgentMonitor.css';

export type AgentStatus = 'working' | 'testing' | 'idle' | 'error';

export interface AgentTask {
  title: string;
}

export interface AgentInfo {
  id: string;
  model: string;
  status: AgentStatus;
  currentTask: AgentTask | null;
  elapsed: number;
  completed: number;
  failed: number;
}

export interface AgentMonitorProps {
  agents: AgentInfo[];
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  working: 'green',
  testing: 'yellow',
  idle: 'gray',
  error: 'red',
};

const MODEL_ICONS: Record<string, string> = {
  claude: '\uD83E\uDD16',
  gemini: '\uD83D\uDC8E',
};

export function formatElapsed(seconds: number): string {
  if (seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const AgentCard: React.FC<{ agent: AgentInfo }> = ({ agent }) => {
  const icon = MODEL_ICONS[agent.model] || '\uD83E\uDD16';
  const statusColor = STATUS_COLORS[agent.status] || 'gray';

  return (
    <div className="agent-card" data-status={agent.status}>
      <div className="agent-card-header">
        <span className="agent-model-icon" aria-label={agent.model}>{icon}</span>
        <span className="agent-id">{agent.id}</span>
        <span
          className={`agent-status-dot agent-status-dot--${statusColor}`}
          aria-label={agent.status}
        />
        <span className="agent-status-label">{agent.status}</span>
      </div>
      {agent.currentTask && (
        <div className="agent-task">
          {agent.currentTask.title}
        </div>
      )}
      <div className="agent-card-footer">
        {agent.elapsed > 0 && (
          <span className="agent-elapsed">{formatElapsed(agent.elapsed)}</span>
        )}
        <span className="agent-stats">
          <span className="agent-stats-success">{agent.completed}</span>
          /
          <span className="agent-stats-fail">{agent.failed}</span>
        </span>
      </div>
    </div>
  );
};

const AgentMonitor: React.FC<AgentMonitorProps> = ({ agents }) => {
  return (
    <div className="agent-monitor" role="region" aria-label="Agent Monitor">
      <h3 className="agent-monitor-title">Agents</h3>
      <div className="agent-monitor-grid">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(AgentMonitor);
