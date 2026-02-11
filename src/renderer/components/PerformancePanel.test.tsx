import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PerformancePanel, { formatDuration, formatMemory } from './PerformancePanel';
import { PerformanceData } from '../hooks/usePerformanceMonitor';

const createMockData = (overrides: Partial<PerformanceData> = {}): PerformanceData => ({
  renderCount: 10,
  totalRenderTime: 50.5,
  averageRenderTime: 5.05,
  slowestRender: 12.3,
  fastestRender: 1.2,
  recentRenders: [],
  messageCount: 20,
  conversationCount: 3,
  memoryUsageMB: 45.2,
  ...overrides,
});

describe('formatDuration', () => {
  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0ms');
  });

  it('formats sub-millisecond as microseconds', () => {
    expect(formatDuration(0.5)).toBe('500\u00b5s');
  });

  it('formats milliseconds', () => {
    expect(formatDuration(5.3)).toBe('5.3ms');
  });

  it('formats seconds', () => {
    expect(formatDuration(1500)).toBe('1.50s');
  });
});

describe('formatMemory', () => {
  it('returns N/A for null', () => {
    expect(formatMemory(null)).toBe('N/A');
  });

  it('formats sub-MB as KB', () => {
    expect(formatMemory(0.5)).toBe('512 KB');
  });

  it('formats MB values', () => {
    expect(formatMemory(45.2)).toBe('45.2 MB');
  });
});

describe('PerformancePanel', () => {
  it('returns null when not open', () => {
    const { container } = render(
      <PerformancePanel
        isOpen={false}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when open', () => {
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText('성능 모니터')).toBeInTheDocument();
  });

  it('displays metric values', () => {
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('45.2 MB')).toBeInTheDocument();
  });

  it('shows monitoring status', () => {
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={true}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText('모니터링 중')).toBeInTheDocument();
  });

  it('shows stopped status when not monitoring', () => {
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText('모니터링 중지됨')).toBeInTheDocument();
  });

  it('calls onToggleMonitoring when toggle button clicked', () => {
    const onToggle = vi.fn();
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={onToggle}
        onReset={vi.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText('모니터링 시작'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when reset button clicked', () => {
    const onReset = vi.fn();
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByLabelText('성능 데이터 초기화'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <PerformancePanel
        isOpen={true}
        onClose={onClose}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText('성능 모니터 닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    render(
      <PerformancePanel
        isOpen={true}
        onClose={onClose}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays app stats', () => {
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData({ messageCount: 42, conversationCount: 7 })}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText('메시지 수: 42')).toBeInTheDocument();
    expect(screen.getByText('대화 수: 7')).toBeInTheDocument();
  });

  it('displays recent renders when available', () => {
    const data = createMockData({
      recentRenders: [
        { id: 'ChatContainer', phase: 'update', actualDuration: 5.5, baseDuration: 10, startTime: 100, commitTime: 105 },
        { id: 'ChatContainer', phase: 'mount', actualDuration: 12.0, baseDuration: 15, startTime: 0, commitTime: 12 },
      ],
    });
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={data}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText('최근 렌더 (2)')).toBeInTheDocument();
    expect(screen.getAllByText('ChatContainer')).toHaveLength(2);
  });

  it('has correct toggle button label when monitoring', () => {
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={true}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByLabelText('모니터링 중지')).toBeInTheDocument();
  });

  it('does not call onClose when modal body is clicked (stopPropagation)', () => {
    const onClose = vi.fn();
    render(
      <PerformancePanel
        isOpen={true}
        onClose={onClose}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('성능 모니터'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('displays perf-status-dot with monitoring class', () => {
    const { container } = render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={true}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const dot = container.querySelector('.perf-status-dot');
    expect(dot?.classList.contains('monitoring')).toBe(true);
  });

  it('displays perf-status-dot with stopped class when not monitoring', () => {
    const { container } = render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const dot = container.querySelector('.perf-status-dot');
    expect(dot?.classList.contains('stopped')).toBe(true);
  });

  it('shows M for mount phase and U for update phase in recent renders', () => {
    const data = createMockData({
      recentRenders: [
        { id: 'App', phase: 'mount', actualDuration: 3.0, baseDuration: 5, startTime: 0, commitTime: 3 },
        { id: 'App', phase: 'update', actualDuration: 1.0, baseDuration: 5, startTime: 10, commitTime: 11 },
      ],
    });
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={data}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('displays 6 metric cards', () => {
    const { container } = render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const cards = container.querySelectorAll('.perf-metric-card');
    expect(cards.length).toBe(6);
  });

  it('does not show recent renders section when empty', () => {
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData({ recentRenders: [] })}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.queryByText(/최근 렌더/)).not.toBeInTheDocument();
  });

  it('has dialog role and aria-label', () => {
    render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={false}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', '성능 모니터');
  });

  it('toggle button has active class when monitoring', () => {
    const { container } = render(
      <PerformancePanel
        isOpen={true}
        onClose={vi.fn()}
        data={createMockData()}
        isMonitoring={true}
        onToggleMonitoring={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const btn = container.querySelector('.perf-toggle-btn');
    expect(btn?.classList.contains('active')).toBe(true);
  });
});

describe('formatDuration edge cases', () => {
  it('formats exactly 1ms', () => {
    expect(formatDuration(1)).toBe('1.0ms');
  });

  it('formats exactly 1000ms as seconds', () => {
    expect(formatDuration(1000)).toBe('1.00s');
  });

  it('formats sub-millisecond precisely', () => {
    expect(formatDuration(0.001)).toBe('1\u00b5s');
  });
});

describe('formatMemory edge cases', () => {
  it('formats exactly 1 MB', () => {
    expect(formatMemory(1)).toBe('1.0 MB');
  });

  it('formats very small sub-MB value', () => {
    expect(formatMemory(0.001)).toBe('1 KB');
  });
});
