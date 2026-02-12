import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MetricsChart, { MetricsSummary, formatDuration, formatPercent } from './MetricsChart';

describe('MetricsChart', () => {
  const mockMetrics: MetricsSummary = {
    totalTasks: 18,
    completed: 10,
    failed: 1,
    successRate: 0.91,
    avgDuration: 480,
  };

  it('should render total tasks', () => {
    render(<MetricsChart metrics={mockMetrics} />);
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('should render completed count', () => {
    render(<MetricsChart metrics={mockMetrics} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should render failed count', () => {
    render(<MetricsChart metrics={mockMetrics} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render success rate', () => {
    render(<MetricsChart metrics={mockMetrics} />);
    expect(screen.getByText('91%')).toBeInTheDocument();
  });

  it('should render avg duration', () => {
    render(<MetricsChart metrics={mockMetrics} />);
    expect(screen.getByText('8m')).toBeInTheDocument(); // 480s = 8m
  });

  it('should render progress bar', () => {
    const { container } = render(<MetricsChart metrics={mockMetrics} />);
    expect(container.querySelector('.metrics-bar-segment--success')).toBeInTheDocument();
  });

  it('should render with zero metrics', () => {
    const zeroMetrics: MetricsSummary = {
      totalTasks: 0,
      completed: 0,
      failed: 0,
      successRate: 0,
      avgDuration: 0,
    };
    render(<MetricsChart metrics={zeroMetrics} />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3);
  });
});

describe('formatDuration', () => {
  it('should format zero', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  it('should format seconds', () => {
    expect(formatDuration(30)).toBe('30s');
  });

  it('should format minutes', () => {
    expect(formatDuration(480)).toBe('8m');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2m 5s');
  });
});

describe('formatPercent', () => {
  it('should format rate as percent', () => {
    expect(formatPercent(0.91)).toBe('91%');
  });

  it('should format zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });

  it('should format one', () => {
    expect(formatPercent(1)).toBe('100%');
  });
});
