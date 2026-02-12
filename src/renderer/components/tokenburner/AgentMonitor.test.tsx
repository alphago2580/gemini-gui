import { describe, it, expect, vi } from 'vitest';
// import { render, screen } from '@testing-library/react';
// import { AgentMonitor } from './AgentMonitor';

describe('AgentMonitor', () => {
  const mockAgents = [
    { id: 'agent-1', model: 'claude', status: 'working', currentTask: { title: 'Build Button' }, elapsed: 120, completed: 5, failed: 0 },
    { id: 'agent-2', model: 'gemini', status: 'testing', currentTask: { title: 'Add hook' }, elapsed: 45, completed: 3, failed: 1 },
    { id: 'agent-3', model: 'claude', status: 'idle', currentTask: null, elapsed: 0, completed: 2, failed: 0 },
    { id: 'agent-4', model: 'claude', status: 'error', currentTask: null, elapsed: 0, completed: 1, failed: 2 },
  ];

  it('should render agent cards', () => {
    // render(<AgentMonitor agents={mockAgents} />);
    // expect(screen.getByText('agent-1')).toBeInTheDocument();
    // expect(screen.getByText('agent-2')).toBeInTheDocument();
    expect(true).toBe(false); // TODO: implement
  });

  it('should show model icons', () => {
    // Claude = 🤖, Gemini = 💎
    // render(<AgentMonitor agents={mockAgents} />);
    expect(true).toBe(false); // TODO: implement
  });

  it('should show status with correct color', () => {
    // working=green, testing=yellow, idle=gray, error=red
    // render(<AgentMonitor agents={mockAgents} />);
    expect(true).toBe(false); // TODO: implement
  });

  it('should show current task title when working', () => {
    // render(<AgentMonitor agents={mockAgents} />);
    // expect(screen.getByText('Build Button')).toBeInTheDocument();
    expect(true).toBe(false); // TODO: implement
  });

  it('should show elapsed time', () => {
    // render(<AgentMonitor agents={mockAgents} />);
    // expect(screen.getByText(/2m/)).toBeInTheDocument(); // 120s
    expect(true).toBe(false); // TODO: implement
  });

  it('should show success/fail badge', () => {
    // render(<AgentMonitor agents={mockAgents} />);
    // agent-1: 5/0, agent-2: 3/1, etc.
    expect(true).toBe(false); // TODO: implement
  });
});
