import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AgentMonitor, { AgentInfo, formatElapsed } from './AgentMonitor';

describe('AgentMonitor', () => {
  const mockAgents: AgentInfo[] = [
    { id: 'agent-1', model: 'claude', status: 'working', currentTask: { title: 'Build Button' }, elapsed: 120, completed: 5, failed: 0 },
    { id: 'agent-2', model: 'gemini', status: 'testing', currentTask: { title: 'Add hook' }, elapsed: 45, completed: 3, failed: 1 },
    { id: 'agent-3', model: 'claude', status: 'idle', currentTask: null, elapsed: 0, completed: 2, failed: 0 },
    { id: 'agent-4', model: 'claude', status: 'error', currentTask: null, elapsed: 0, completed: 1, failed: 2 },
  ];

  it('should render agent cards', () => {
    render(<AgentMonitor agents={mockAgents} />);
    expect(screen.getByText('agent-1')).toBeInTheDocument();
    expect(screen.getByText('agent-2')).toBeInTheDocument();
    expect(screen.getByText('agent-3')).toBeInTheDocument();
    expect(screen.getByText('agent-4')).toBeInTheDocument();
  });

  it('should show model icons', () => {
    // Claude = 🤖, Gemini = 💎
    render(<AgentMonitor agents={mockAgents} />);
    const icons = screen.getAllByLabelText('claude');
    expect(icons.length).toBe(3);
    expect(screen.getByLabelText('gemini')).toBeInTheDocument();
  });

  it('should show status with correct color', () => {
    // working=green, testing=yellow, idle=gray, error=red
    const { container } = render(<AgentMonitor agents={mockAgents} />);
    expect(container.querySelector('.agent-status-dot--green')).toBeInTheDocument();
    expect(container.querySelector('.agent-status-dot--yellow')).toBeInTheDocument();
    expect(container.querySelector('.agent-status-dot--gray')).toBeInTheDocument();
    expect(container.querySelector('.agent-status-dot--red')).toBeInTheDocument();
  });

  it('should show current task title when working', () => {
    render(<AgentMonitor agents={mockAgents} />);
    expect(screen.getByText('Build Button')).toBeInTheDocument();
    expect(screen.getByText('Add hook')).toBeInTheDocument();
  });

  it('should show elapsed time', () => {
    render(<AgentMonitor agents={mockAgents} />);
    expect(screen.getByText('2m')).toBeInTheDocument(); // 120s
    expect(screen.getByText('45s')).toBeInTheDocument();
  });

  it('should show success/fail badge', () => {
    render(<AgentMonitor agents={mockAgents} />);
    // agent-1: 5/0
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    // agent-2: 3/1
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });
});

describe('formatElapsed', () => {
  it('should format zero', () => {
    expect(formatElapsed(0)).toBe('0s');
  });

  it('should format seconds', () => {
    expect(formatElapsed(45)).toBe('45s');
  });

  it('should format minutes', () => {
    expect(formatElapsed(120)).toBe('2m');
  });

  it('should format minutes and seconds', () => {
    expect(formatElapsed(125)).toBe('2m 5s');
  });
});
