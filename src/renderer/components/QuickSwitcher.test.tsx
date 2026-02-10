import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickSwitcher from './QuickSwitcher';
import type { Conversation } from '../../preload/types';

const conversations: Conversation[] = [
  { id: '1', title: 'React 대화', timestamp: new Date('2026-01-01'), messages: [
    { id: 'm1', role: 'user', content: 'hello', timestamp: new Date() },
    { id: 'm2', role: 'assistant', content: 'hi', timestamp: new Date() },
    { id: 'm3', role: 'user', content: 'how?', timestamp: new Date() },
    { id: 'm4', role: 'assistant', content: 'like this', timestamp: new Date() },
    { id: 'm5', role: 'user', content: 'thanks', timestamp: new Date() },
  ] },
  { id: '2', title: 'TypeScript 질문', timestamp: new Date('2026-01-02'), messages: Array.from({ length: 10 }, (_, i) => ({
    id: `m${i}`, role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant', content: `msg${i}`, timestamp: new Date(),
  })) },
  { id: '3', title: 'Python 코드', timestamp: new Date('2026-01-03'), messages: [
    { id: 'p1', role: 'user', content: 'code', timestamp: new Date() },
    { id: 'p2', role: 'assistant', content: 'here', timestamp: new Date() },
    { id: 'p3', role: 'user', content: 'more', timestamp: new Date() },
  ] },
];

describe('QuickSwitcher', () => {
  const onClose = vi.fn();
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <QuickSwitcher isOpen={false} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    expect(container.querySelector('.quick-switcher-overlay')).toBeNull();
  });

  it('renders all conversations when open', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    expect(screen.getByText('React 대화')).toBeInTheDocument();
    expect(screen.getByText('TypeScript 질문')).toBeInTheDocument();
    expect(screen.getByText('Python 코드')).toBeInTheDocument();
  });

  it('filters conversations by search query', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    fireEvent.change(input, { target: { value: 'react' } });
    expect(screen.getByText('React 대화')).toBeInTheDocument();
    expect(screen.queryByText('TypeScript 질문')).not.toBeInTheDocument();
  });

  it('shows current badge for active conversation', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    expect(screen.getByText('현재')).toBeInTheDocument();
  });

  it('calls onSelect when conversation is clicked', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText('TypeScript 질문'));
    expect(onClose).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith('2');
  });

  it('navigates with keyboard and selects with Enter', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('2');
  });

  it('closes on Escape', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty state when no matches', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    expect(screen.getByText('일치하는 대화가 없습니다')).toBeInTheDocument();
  });

  it('shows message count for each conversation', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    expect(screen.getByText(/5개 메시지/)).toBeInTheDocument();
    expect(screen.getByText(/10개 메시지/)).toBeInTheDocument();
  });
});
