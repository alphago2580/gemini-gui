import React from 'react';
import { PerformanceData, RenderMetric } from '../hooks/usePerformanceMonitor';
import './PerformancePanel.css';

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
    <div className="perf-overlay" onClick={onClose} role="dialog" aria-label="성능 모니터">
      <div className="perf-modal" onClick={e => e.stopPropagation()}>
        <div className="perf-header">
          <h2>성능 모니터</h2>
          <div className="perf-header-actions">
            <button
              className={`perf-toggle-btn ${isMonitoring ? 'active' : ''}`}
              onClick={onToggleMonitoring}
              aria-label={isMonitoring ? '모니터링 중지' : '모니터링 시작'}
            >
              {isMonitoring ? '중지' : '시작'}
            </button>
            <button className="perf-reset-btn" onClick={onReset} aria-label="성능 데이터 초기화">
              초기화
            </button>
            <button className="perf-close-btn" onClick={onClose} aria-label="성능 모니터 닫기">
              ×
            </button>
          </div>
        </div>

        <div className="perf-content">
          <div className="perf-status">
            <span className={`perf-status-dot ${isMonitoring ? 'monitoring' : 'stopped'}`} />
            {isMonitoring ? '모니터링 중' : '모니터링 중지됨'}
          </div>

          <div className="perf-metrics">
            <div className="perf-metric-card">
              <span className="perf-metric-label">렌더 횟수</span>
              <span className="perf-metric-value">{data.renderCount}</span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">총 렌더 시간</span>
              <span className="perf-metric-value">{formatDuration(data.totalRenderTime)}</span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">평균 렌더 시간</span>
              <span className="perf-metric-value">{formatDuration(data.averageRenderTime)}</span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">최고 느린 렌더</span>
              <span className={`perf-metric-value ${getRenderSpeedClass(data.slowestRender)}`}>
                {formatDuration(data.slowestRender)}
              </span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">최고 빠른 렌더</span>
              <span className={`perf-metric-value ${getRenderSpeedClass(data.fastestRender)}`}>
                {formatDuration(data.fastestRender)}
              </span>
            </div>
            <div className="perf-metric-card">
              <span className="perf-metric-label">메모리 사용량</span>
              <span className="perf-metric-value">{formatMemory(data.memoryUsageMB)}</span>
            </div>
          </div>

          <div className="perf-app-stats">
            <h3>앱 상태</h3>
            <div className="perf-app-stats-row">
              <span>메시지 수: {data.messageCount}</span>
              <span>대화 수: {data.conversationCount}</span>
            </div>
          </div>

          {data.recentRenders.length > 0 && (
            <div className="perf-recent">
              <h3>최근 렌더 ({data.recentRenders.length})</h3>
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
