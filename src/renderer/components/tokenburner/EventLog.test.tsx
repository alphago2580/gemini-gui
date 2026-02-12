import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EventLog, { EventLogEntry, formatTimestamp } from './EventLog';

const makeEntry = (overrides: Partial<EventLogEntry> & { id: string }): EventLogEntry => ({
  type: 'claim',
  message: 'Default message',
  timestamp: 1700000000000,
  ...overrides,
});

const mockEvents: EventLogEntry[] = [
  makeEntry({ id: '1', type: 'claim', message: 'Agent 1 claimed task t001', timestamp: 1700000000000, taskId: 't001', agentId: 'agent-1' }),
  makeEntry({ id: '2', type: 'test-result', message: 'Tests passed for t001', timestamp: 1700000060000, taskId: 't001', success: true }),
  makeEntry({ id: '3', type: 'merge', message: 'Merged t001 to master', timestamp: 1700000120000, taskId: 't001', success: true }),
  makeEntry({ id: '4', type: 'complete', message: 'Task t001 complete', timestamp: 1700000180000, taskId: 't001' }),
  makeEntry({ id: '5', type: 'fail', message: 'Task t002 failed', timestamp: 1700000240000, taskId: 't002' }),
  makeEntry({ id: '6', type: 'idle', message: 'Agent 2 idle', timestamp: 1700000300000, agentId: 'agent-2' }),
  makeEntry({ id: '7', type: 'error', message: 'Build error on t003', timestamp: 1700000360000, taskId: 't003' }),
];

describe('EventLog', () => {
  it('should render the Event Log title', () => {
    render(<EventLog events={mockEvents} />);
    expect(screen.getByText('Event Log')).toBeInTheDocument();
  });

  it('should render event entries with correct count', () => {
    const { container } = render(<EventLog events={mockEvents} />);
    const entries = container.querySelectorAll('.event-log-entry');
    expect(entries.length).toBe(mockEvents.length);
  });

  it('should show formatted timestamp for each entry', () => {
    render(<EventLog events={[makeEntry({ id: '1', timestamp: 1700000000000 })]} />);
    const formatted = formatTimestamp(1700000000000);
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it('should show type badge with correct text', () => {
    const { container } = render(<EventLog events={mockEvents} />);
    const badges = container.querySelectorAll('.event-log-badge');
    const badgeTexts = Array.from(badges).map((b) => b.textContent);
    expect(badgeTexts).toContain('claim');
    expect(badgeTexts).toContain('merge');
    expect(badgeTexts).toContain('complete');
    expect(badgeTexts).toContain('fail');
    expect(badgeTexts).toContain('idle');
    expect(badgeTexts).toContain('error');
  });

  it('should show message text for each entry', () => {
    render(<EventLog events={mockEvents} />);
    expect(screen.getByText('Agent 1 claimed task t001')).toBeInTheDocument();
    expect(screen.getByText('Task t002 failed')).toBeInTheDocument();
  });

  it('should show taskId chip when present', () => {
    render(<EventLog events={[makeEntry({ id: '1', taskId: 't099' })]} />);
    expect(screen.getByText('t099')).toBeInTheDocument();
  });

  it('should show agentId chip when present', () => {
    render(<EventLog events={[makeEntry({ id: '1', agentId: 'agent-5' })]} />);
    expect(screen.getByText('agent-5')).toBeInTheDocument();
  });

  it('should not show chips when taskId/agentId absent', () => {
    const { container } = render(<EventLog events={[makeEntry({ id: '1' })]} />);
    const chips = container.querySelectorAll('.event-log-chip');
    expect(chips.length).toBe(0);
  });

  it('should show all event types by default', () => {
    const { container } = render(<EventLog events={mockEvents} />);
    const entries = container.querySelectorAll('.event-log-entry');
    expect(entries.length).toBe(mockEvents.length);
  });

  it('should toggle event type off when filter badge is clicked', () => {
    const { container } = render(<EventLog events={mockEvents} />);
    const idleFilter = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'idle'
    );
    expect(idleFilter).toBeDefined();
    fireEvent.click(idleFilter!);
    const entries = container.querySelectorAll('.event-log-entry');
    expect(entries.length).toBe(mockEvents.length - 1);
  });

  it('should toggle event type back on when clicked again', () => {
    const { container } = render(<EventLog events={mockEvents} />);
    const idleFilter = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'idle'
    );
    fireEvent.click(idleFilter!);
    fireEvent.click(idleFilter!);
    const entries = container.querySelectorAll('.event-log-entry');
    expect(entries.length).toBe(mockEvents.length);
  });

  it('should filter correctly hiding matching events', () => {
    const events = [
      makeEntry({ id: '1', type: 'idle', message: 'idle 1' }),
      makeEntry({ id: '2', type: 'idle', message: 'idle 2' }),
      makeEntry({ id: '3', type: 'claim', message: 'claim 1' }),
    ];
    const { container } = render(<EventLog events={events} />);
    const idleFilter = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'idle'
    );
    fireEvent.click(idleFilter!);
    const entries = container.querySelectorAll('.event-log-entry');
    expect(entries.length).toBe(1);
    expect(screen.getByText('claim 1')).toBeInTheDocument();
  });

  it('should render empty state when events array is empty', () => {
    render(<EventLog events={[]} />);
    expect(screen.getByText('No events')).toBeInTheDocument();
  });

  it('should respect maxVisible prop', () => {
    const events = Array.from({ length: 10 }, (_, i) =>
      makeEntry({ id: String(i), type: 'claim', message: `Event ${i}` })
    );
    const { container } = render(<EventLog events={events} maxVisible={3} />);
    const entries = container.querySelectorAll('.event-log-entry');
    expect(entries.length).toBe(3);
  });
});

describe('formatTimestamp', () => {
  it('should format epoch ms to HH:MM:SS', () => {
    // 2023-11-14T22:13:20.000Z -> local time varies, so test structure
    const result = formatTimestamp(1700000000000);
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('should pad single digits', () => {
    // Midnight UTC = 00:00:00
    const midnight = new Date('2023-01-01T00:00:00Z').getTime();
    const result = formatTimestamp(midnight);
    expect(result).toMatch(/^\d{2}:\d{2}:00$/);
  });
});
