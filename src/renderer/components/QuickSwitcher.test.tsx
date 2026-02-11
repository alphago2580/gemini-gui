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

  it('ArrowUp wraps from first to last item', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    // First item is selected by default (index 0), ArrowUp should wrap to last (index 2)
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('3');
  });

  it('ArrowDown wraps from last to first item', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    // Go to last: down 3 times (0→1→2→0 wrap)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('does not propagate click from switcher panel to overlay', () => {
    const { container } = render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const panel = container.querySelector('.quick-switcher')!;
    fireEvent.click(panel);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('sets aria-selected on the currently highlighted item', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const options = screen.getAllByRole('option');
    // First item selected by default
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-selected')).toBe('false');
  });

  it('resets search query when reopened', () => {
    const { rerender } = render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    fireEvent.change(input, { target: { value: 'react' } });
    expect(screen.queryByText('TypeScript 질문')).not.toBeInTheDocument();

    // Close and reopen
    rerender(
      <QuickSwitcher isOpen={false} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    rerender(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    // All conversations should be visible again
    expect(screen.getByText('TypeScript 질문')).toBeInTheDocument();
  });

  it('does not select on Enter when no filtered results', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('mouseEnter updates selected index', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const options = screen.getAllByRole('option');
    fireEvent.mouseEnter(options[2]); // hover over 3rd item
    fireEvent.keyDown(screen.getByLabelText('대화 검색'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('3');
  });

  it('current conversation has "current" CSS class', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const options = screen.getAllByRole('option');
    expect(options[0].classList.contains('current')).toBe(true);
    expect(options[1].classList.contains('current')).toBe(false);
  });

  it('does not show current badge for non-active conversations', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    // Only one badge should exist
    expect(screen.getAllByText('현재')).toHaveLength(1);
  });

  it('handles null currentConversationId', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId={null} onSelect={onSelect} />
    );
    expect(screen.queryByText('현재')).not.toBeInTheDocument();
  });

  it('onChange resets selectedIndex to 0', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    const input = screen.getByLabelText('대화 검색');
    // Navigate to second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Type to filter — selectedIndex should reset to 0
    fireEvent.change(input, { target: { value: 'TypeScript' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('2'); // First (and only) filtered result
  });

  it('has listbox role on the list container', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('has correct placeholder text', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    expect(screen.getByPlaceholderText('대화 전환...')).toBeInTheDocument();
  });

  it('shows date for each conversation', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={conversations} currentConversationId="1" onSelect={onSelect} />
    );
    // Dates should be rendered via toLocaleDateString
    const meta = document.querySelectorAll('.quick-switcher-item-meta');
    expect(meta.length).toBe(3);
  });

  it('handles empty conversations list', () => {
    render(
      <QuickSwitcher isOpen={true} onClose={onClose} conversations={[]} currentConversationId={null} onSelect={onSelect} />
    );
    expect(screen.getByText('일치하는 대화가 없습니다')).toBeInTheDocument();
  });
});
