import React from 'react';
import { PerformanceData, RenderMetric } from '../hooks/usePerformanceMonitor';
import './PerformancePanel.css';
import * as S from '../constants/strings';

interface PerformancePanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: PerformanceData;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  onReset: () => void;
}

export function formatDuration(ms: number): string {
  if (ms === 0) return '0ms';
  if (ms < 1) return `${(ms * 1000).toFixed(0)}\u00b5s`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatMemory(mb: number | null): string {
  if (mb === null) return 'N/A';
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function getRenderSpeedClass(ms: number): string {
  if (ms <= 5) return 'fast';
  if (ms <= 16) return 'normal';
  return 'slow';
}

const PerformancePanelInner: React.FC<PerformancePanelProps> = ({
  isOpen,
  onClose,
  data,
  isMonitoring,
  onToggleMonitoring,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="perf-overlay" onClick={onClose} role="dialog" aria-label={S.PERF_LABEL}>
      <div className="perf-modal" onClick={e => e.stopPropagation()}>
        <div className="perf-header">
          <h2>{S.PERF_LABEL}</h2>
          <div className="perf-header-actions">
            <button
              className={`perf-toggle-btn ${isMonitoring ? 'active' : ''}`}
              onClick={onToggleMonitoring}
              aria-label={isMonitoring ? S.PERF_STOP_LABEL : S.PERF_START_LABEL}
            >
              {isMonitoring ? S.PERF_STOP : S.PERF_START}
            </button>
            <button className="perf-reset-btn" onClick={onReset} aria-label={S.PERF_RESET_LABEL}>
              {S.PERF_RESET}
            </button>
            <button className="perf-close-btn" onClick={onClose} aria-label={S.PERF_CLOSE_LABEL}>
              ×
            </button>
          </div>
        </div>

        <div className="perf-content">
          <div className="perf-status">
            <span className={`perf-status-dot ${isMonitoring ? 'monitoring' : 'stopped'}`} />
            {isMonitoring ? S.PERF_STATUS_ON : S.PERF_STATUS_OFF}
          </div>

          <div className="perf-metrics">
            <div className="perf-metric-card">
              <span className="perf-metric-label">{S.PERF_RENDER_COUNT}</span>
              <span className="perf-metric-value">{data.renderCount}</span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">{S.PERF_TOTAL_RENDER}</span>
              <span className="perf-metric-value">{formatDuration(data.totalRenderTime)}</span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">{S.PERF_AVG_RENDER}</span>
              <span className="perf-metric-value">{formatDuration(data.averageRenderTime)}</span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">{S.PERF_SLOWEST}</span>
              <span className={`perf-metric-value ${getRenderSpeedClass(data.slowestRender)}`}>
                {formatDuration(data.slowestRender)}
              </span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">{S.PERF_FASTEST}</span>
              <span className={`perf-metric-value ${getRenderSpeedClass(data.fastestRender)}`}>
                {formatDuration(data.fastestRender)}
              </span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">{S.PERF_MEMORY}</span>
              <span className="perf-metric-value">{formatMemory(data.memoryUsageMB)}</span>
            </div>
          </div>

          <div className="perf-app-stats">
            <h3>{S.PERF_APP_STATUS}</h3>
            <div className="perf-app-stats-row">
              <span>{S.PERF_MSG_COUNT_PREFIX} {data.messageCount}</span>
              <span>{S.PERF_CONV_COUNT_PREFIX} {data.conversationCount}</span>
            </div>
          </div>

          {data.recentRenders.length > 0 && (
            <div className="perf-recent">
              <h3>{S.PERF_RECENT_RENDERS} ({data.recentRenders.length})</h3>
              <div className="perf-recent-list">
                {data.recentRenders.slice(0, 20).map((metric: RenderMetric, index: number) => (
                  <div key={index} className="perf-recent-item">
                    <span className={`perf-recent-phase ${metric.phase}`}>
                      {metric.phase === 'mount' ? 'M' : 'U'}
                    </span>
                    <span className="perf-recent-id">{metric.id}</span>
                    <span className={`perf-recent-duration ${getRenderSpeedClass(metric.actualDuration)}`}>
                      {formatDuration(metric.actualDuration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PerformancePanel = React.memo(PerformancePanelInner);
export default PerformancePanel;
