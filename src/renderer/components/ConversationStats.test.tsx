import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ConversationStats from './ConversationStats';
import { ConversationStatistics } from '../utils/conversationStats';

const createMockStats = (overrides: Partial<ConversationStatistics> = {}): ConversationStatistics => ({
  totalConversations: 5,
  totalMessages: 42,
  userMessages: 22,
  assistantMessages: 20,
  averageMessagesPerConversation: 8.4,
  longestConversation: { title: '가장 긴 대화', messageCount: 15 },
  shortestConversation: { title: '짧은 대화', messageCount: 2 },
  totalCharacters: 5000,
  averageMessageLength: 119,
  emptyConversations: 1,
  ...overrides,
});

describe('ConversationStats', () => {
  it('returns null when not open', () => {
    const { container } = render(
      <ConversationStats isOpen={false} onClose={vi.fn()} stats={createMockStats()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when open', () => {
    render(
      <ConversationStats isOpen={true} onClose={vi.fn()} stats={createMockStats()} />
    );
    expect(screen.getByText('대화 통계')).toBeInTheDocument();
  });

  it('displays conversation count', () => {
    render(
      <ConversationStats isOpen={true} onClose={vi.fn()} stats={createMockStats()} />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays total messages', () => {
    render(
      <ConversationStats isOpen={true} onClose={vi.fn()} stats={createMockStats()} />
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays longest conversation info', () => {
    render(
      <ConversationStats isOpen={true} onClose={vi.fn()} stats={createMockStats()} />
    );
    expect(screen.getAllByText(/가장 긴 대화/).length).toBeGreaterThan(0);
  });

  it('displays shortest conversation info', () => {
    render(
      <ConversationStats isOpen={true} onClose={vi.fn()} stats={createMockStats()} />
    );
    expect(screen.getAllByText(/짧은 대화/).length).toBeGreaterThan(0);
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <ConversationStats isOpen={true} onClose={onClose} stats={createMockStats()} />
    );
    fireEvent.click(screen.getByLabelText('통계 닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    render(
      <ConversationStats isOpen={true} onClose={onClose} stats={createMockStats()} />
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show longest/shortest when null', () => {
    render(
      <ConversationStats
        isOpen={true}
        onClose={vi.fn()}
        stats={createMockStats({ longestConversation: null, shortestConversation: null })}
      />
    );
    expect(screen.queryByText('가장 긴 대화')).toBeNull();
    expect(screen.queryByText('가장 짧은 대화')).toBeNull();
  });

  it('truncates long conversation titles', () => {
    const longTitle = 'A'.repeat(30);
    render(
      <ConversationStats
        isOpen={true}
        onClose={vi.fn()}
        stats={createMockStats({
          longestConversation: { title: longTitle, messageCount: 10 },
        })}
      />
    );
    expect(screen.getByText(/A{25}\.\.\./)).toBeInTheDocument();
  });
});
