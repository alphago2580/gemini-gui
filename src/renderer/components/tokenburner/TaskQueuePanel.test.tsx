import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TaskQueuePanel, { TaskItem } from './TaskQueuePanel';

describe('TaskQueuePanel', () => {
  const mockTasks: TaskItem[] = [
    { id: '1', title: 'Build Button', status: 'complete', priority: 'high' },
    { id: '2', title: 'Add useAuth', status: 'active', priority: 'normal', assignee: 'agent-1' },
    { id: '3', title: 'Fix tests', status: 'pending', priority: 'critical' },
    { id: '4', title: 'Broken task', status: 'failed', priority: 'low', failReason: 'Test failure' },
  ];

  it('should render all tasks', () => {
    render(<TaskQueuePanel tasks={mockTasks} />);
    expect(screen.getByText('Build Button')).toBeInTheDocument();
    expect(screen.getByText('Add useAuth')).toBeInTheDocument();
    expect(screen.getByText('Fix tests')).toBeInTheDocument();
    expect(screen.getByText('Broken task')).toBeInTheDocument();
  });

  it('should show status badges', () => {
    const { container } = render(<TaskQueuePanel tasks={mockTasks} />);
    // Status badges on task items (tabs also share the same text)
    expect(container.querySelector('.task-status-badge--complete')).toBeInTheDocument();
    expect(container.querySelector('.task-status-badge--active')).toBeInTheDocument();
    expect(container.querySelector('.task-status-badge--pending')).toBeInTheDocument();
    expect(container.querySelector('.task-status-badge--failed')).toBeInTheDocument();
  });

  it('should filter by status tab', () => {
    render(<TaskQueuePanel tasks={mockTasks} />);
    // Click Pending tab (in the tablist, not status badge)
    const tabs = screen.getAllByRole('tab');
    const pendingTab = tabs.find(t => t.textContent === 'Pending')!;
    fireEvent.click(pendingTab);
    expect(screen.getByText('Fix tests')).toBeInTheDocument();
    expect(screen.queryByText('Build Button')).not.toBeInTheDocument();
  });

  it('should show add task form', () => {
    render(<TaskQueuePanel tasks={mockTasks} onAddTask={vi.fn()} />);
    fireEvent.click(screen.getByText('Add Task'));
    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
  });

  it('should show priority colors', () => {
    // Critical = red, high = orange, normal = blue, low = gray
    const { container } = render(<TaskQueuePanel tasks={mockTasks} />);
    expect(container.querySelector('.task-priority-dot--red')).toBeInTheDocument();
    expect(container.querySelector('.task-priority-dot--orange')).toBeInTheDocument();
    expect(container.querySelector('.task-priority-dot--blue')).toBeInTheDocument();
    expect(container.querySelector('.task-priority-dot--gray')).toBeInTheDocument();
  });

  it('should call onAddTask when submitting', () => {
    const onAddTask = vi.fn();
    render(<TaskQueuePanel tasks={mockTasks} onAddTask={onAddTask} />);
    fireEvent.click(screen.getByText('Add Task'));
    const input = screen.getByPlaceholderText('Task title');
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(screen.getByText('Add'));
    expect(onAddTask).toHaveBeenCalledWith('New task', 'normal');
  });

  it('should not show add button without onAddTask', () => {
    render(<TaskQueuePanel tasks={mockTasks} />);
    expect(screen.queryByText('Add Task')).not.toBeInTheDocument();
  });
});
