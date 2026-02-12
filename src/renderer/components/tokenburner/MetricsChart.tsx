import React from 'react';
import './MetricsChart.css';

export interface MetricsSummary {
  totalTasks: number;
  completed: number;
  failed: number;
  successRate: number;
  avgDuration: number;
}

export interface MetricsChartProps {
  metrics: MetricsSummary;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ metrics }) => {
  const successPercent = Math.round(metrics.successRate * 100);
  const failPercent = 100 - successPercent;

  return (
    <div className="metrics-chart" role="region" aria-label="Metrics">
      <h3 className="metrics-chart-title">Metrics</h3>

      <div className="metrics-cards">
        <div className="metrics-card">
          <span className="metrics-card-label">Total Tasks</span>
          <span className="metrics-card-value">{metrics.totalTasks}</span>
        </div>
        <div className="metrics-card">
          <span className="metrics-card-label">Completed</span>
          <span className="metrics-card-value metrics-card-value--success">{metrics.completed}</span>
        </div>
        <div className="metrics-card">
          <span className="metrics-card-label">Failed</span>
          <span className="metrics-card-value metrics-card-value--error">{metrics.failed}</span>
        </div>
        <div className="metrics-card">
          <span className="metrics-card-label">Success Rate</span>
          <span className="metrics-card-value">{formatPercent(metrics.successRate)}</span>
        </div>
        <div className="metrics-card">
          <span className="metrics-card-label">Avg Duration</span>
          <span className="metrics-card-value">{formatDuration(metrics.avgDuration)}</span>
        </div>
      </div>

      <div className="metrics-bar-container">
        <div className="metrics-bar">
          {successPercent > 0 && (
            <div
              className="metrics-bar-segment metrics-bar-segment--success"
              style={{ width: `${successPercent}%` }}
              aria-label={`Success: ${successPercent}%`}
            />
          )}
          {failPercent > 0 && metrics.failed > 0 && (
            <div
              className="metrics-bar-segment metrics-bar-segment--fail"
              style={{ width: `${failPercent}%` }}
              aria-label={`Failed: ${failPercent}%`}
            />
          )}
        </div>
        <div className="metrics-bar-legend">
          <span className="metrics-legend-item">
            <span className="metrics-legend-dot metrics-legend-dot--success" />
            Success {formatPercent(metrics.successRate)}
          </span>
          {metrics.failed > 0 && (
            <span className="metrics-legend-item">
              <span className="metrics-legend-dot metrics-legend-dot--fail" />
              Failed {formatPercent(1 - metrics.successRate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MetricsChart);
