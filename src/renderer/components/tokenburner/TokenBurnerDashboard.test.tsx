import { describe, it, expect, vi } from 'vitest';
// import { render, screen } from '@testing-library/react';
// import { TokenBurnerDashboard } from './TokenBurnerDashboard';

// Mock electronAPI
vi.stubGlobal('window', {
  ...globalThis.window,
  electronAPI: {
    tokenburner: {
      getDashboard: vi.fn().mockResolvedValue({
        projectName: 'test-project',
        projectPath: '/tmp/test',
        isRunning: true,
        agents: [
          { id: 'agent-1', status: 'working', model: 'claude', currentTask: { title: 'Build Button' } },
          { id: 'agent-2', status: 'idle', model: 'gemini', currentTask: null },
        ],
        queue: { pending: 5, active: 2, complete: 10, failed: 1, total: 18 },
        metrics: { totalTasks: 18, completed: 10, failed: 1, successRate: 0.91, avgDuration: 480 },
        recentEvents: [],
        gitLog: [],
      }),
      onEvent: vi.fn(),
      removeAllListeners: vi.fn(),
    }
  }
});

describe('TokenBurnerDashboard', () => {
  it('should render project name', () => {
    // render(<TokenBurnerDashboard />);
    // expect(screen.getByText('test-project')).toBeInTheDocument();
    expect(true).toBe(false); // TODO: implement
  });

  it('should show agent count', () => {
    // render(<TokenBurnerDashboard />);
    // expect(screen.getByText(/2.*agents/i)).toBeInTheDocument();
    expect(true).toBe(false); // TODO: implement
  });

  it('should display queue status', () => {
    // render(<TokenBurnerDashboard />);
    // expect(screen.getByText('5')).toBeInTheDocument(); // pending
    expect(true).toBe(false); // TODO: implement
  });

  it('should show metrics summary', () => {
    // render(<TokenBurnerDashboard />);
    // expect(screen.getByText('91%')).toBeInTheDocument(); // success rate
    expect(true).toBe(false); // TODO: implement
  });

  it('should have stop and pause buttons', () => {
    // render(<TokenBurnerDashboard />);
    // expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    // expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(true).toBe(false); // TODO: implement
  });
});
