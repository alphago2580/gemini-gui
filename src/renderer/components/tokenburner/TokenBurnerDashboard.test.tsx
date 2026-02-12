import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TokenBurnerDashboard, { DashboardData } from './TokenBurnerDashboard';

const mockData: DashboardData = {
  projectName: 'test-project',
  projectPath: '/tmp/test',
  isRunning: true,
  agents: [
    { id: 'agent-1', status: 'working', model: 'claude', currentTask: { title: 'Build Button' }, elapsed: 60, completed: 3, failed: 0 },
    { id: 'agent-2', status: 'idle', model: 'gemini', currentTask: null, elapsed: 0, completed: 1, failed: 0 },
  ],
  queue: { pending: 5, active: 2, complete: 10, failed: 1, total: 18 },
  metrics: { totalTasks: 18, completed: 10, failed: 1, successRate: 0.91, avgDuration: 480 },
  recentEvents: [],
  gitLog: [],
};

describe('TokenBurnerDashboard', () => {
  it('should render project name', () => {
    render(<TokenBurnerDashboard initialData={mockData} />);
    expect(screen.getByText('test-project')).toBeInTheDocument();
  });

  it('should show agent count', () => {
    render(<TokenBurnerDashboard initialData={mockData} />);
    expect(screen.getByText(/2 agents/i)).toBeInTheDocument();
  });

  it('should display queue status', () => {
    render(<TokenBurnerDashboard initialData={mockData} />);
    expect(screen.getByText(/5 pending/)).toBeInTheDocument();
  });

  it('should show metrics summary', () => {
    render(<TokenBurnerDashboard initialData={mockData} />);
    expect(screen.getByText('91%')).toBeInTheDocument(); // success rate
  });

  it('should have stop and pause buttons', () => {
    render(<TokenBurnerDashboard initialData={mockData} />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('should show running status', () => {
    render(<TokenBurnerDashboard initialData={mockData} />);
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('should show stopped status', () => {
    const stoppedData = { ...mockData, isRunning: false };
    render(<TokenBurnerDashboard initialData={stoppedData} />);
    expect(screen.getByText('Stopped')).toBeInTheDocument();
  });
});
