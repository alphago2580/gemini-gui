import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MessageList from './MessageList';
import type { Message } from '../../preload/types';

function makeMessages(count: number): Message[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
    content: `Message ${i}`,
    timestamp: new Date(2025, 0, 1, 0, i),
  }));
}

const defaultRenderMessage = vi.fn((message: Message, globalIndex: number) => (
  <div key={message.id || globalIndex} data-testid={`message-${globalIndex}`}>
    {message.content}
  </div>
));

function setScrollProps(
  el: HTMLElement,
  opts: { scrollHeight: number; scrollTop: number; clientHeight: number }
) {
  Object.defineProperty(el, 'scrollHeight', { value: opts.scrollHeight, configurable: true });
  Object.defineProperty(el, 'scrollTop', { value: opts.scrollTop, configurable: true, writable: true });
  Object.defineProperty(el, 'clientHeight', { value: opts.clientHeight, configurable: true });
}

beforeEach(() => {
  defaultRenderMessage.mockClear();
});

describe('MessageList', () => {
  // --- Basic rendering ---

  it('renders all messages when count is less than initialBatch', () => {
    const messages = makeMessages(5);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={30}
      />
    );
    expect(screen.getByTestId('message-0')).toBeInTheDocument();
    expect(screen.getByTestId('message-4')).toBeInTheDocument();
    expect(defaultRenderMessage).toHaveBeenCalledTimes(5);
  });

  it('renders with log role and ARIA label', () => {
    render(
      <MessageList
        messages={makeMessages(3)}
        renderMessage={defaultRenderMessage}
        ariaLabel="테스트 메시지 목록"
      />
    );
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-label', '테스트 메시지 목록');
  });

  it('uses default ARIA label', () => {
    render(
      <MessageList
        messages={makeMessages(1)}
        renderMessage={defaultRenderMessage}
      />
    );
    expect(screen.getByRole('log')).toHaveAttribute('aria-label', '대화 메시지');
  });

  it('applies custom className', () => {
    render(
      <MessageList
        messages={makeMessages(1)}
        renderMessage={defaultRenderMessage}
        className="custom-class"
      />
    );
    expect(screen.getByRole('log')).toHaveClass('message-list', 'custom-class');
  });

  it('applies compact class when viewMode is compact', () => {
    render(
      <MessageList
        messages={makeMessages(1)}
        renderMessage={defaultRenderMessage}
        viewMode="compact"
      />
    );
    expect(screen.getByRole('log')).toHaveClass('message-list--compact');
  });

  // --- Empty state ---

  it('renders empty state when no messages', () => {
    render(
      <MessageList
        messages={[]}
        renderMessage={defaultRenderMessage}
        renderEmpty={() => <div data-testid="empty-state">비어 있음</div>}
      />
    );
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('does not render empty state when messages exist', () => {
    render(
      <MessageList
        messages={makeMessages(1)}
        renderMessage={defaultRenderMessage}
        renderEmpty={() => <div data-testid="empty-state">비어 있음</div>}
      />
    );
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
  });

  // --- Loading state ---

  it('renders loading indicator when isLoading', () => {
    render(
      <MessageList
        messages={makeMessages(2)}
        renderMessage={defaultRenderMessage}
        isLoading={true}
        renderLoading={() => <div data-testid="loading">로딩 중...</div>}
      />
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('does not render loading indicator when not loading', () => {
    render(
      <MessageList
        messages={makeMessages(2)}
        renderMessage={defaultRenderMessage}
        isLoading={false}
        renderLoading={() => <div data-testid="loading">로딩 중...</div>}
      />
    );
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  // --- Footer ---

  it('renders footer content', () => {
    render(
      <MessageList
        messages={makeMessages(2)}
        renderMessage={defaultRenderMessage}
        renderFooter={() => <div data-testid="footer">풋터</div>}
      />
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  // --- Infinite scroll (lazy loading older messages) ---

  it('shows only initialBatch messages from the end', () => {
    const messages = makeMessages(50);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
      />
    );
    // Should show last 10 messages (indices 40-49)
    expect(screen.getByTestId('message-40')).toBeInTheDocument();
    expect(screen.getByTestId('message-49')).toBeInTheDocument();
    expect(screen.queryByTestId('message-39')).not.toBeInTheDocument();
  });

  it('shows load more button when there are hidden messages', () => {
    const messages = makeMessages(50);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
      />
    );
    const btn = screen.getByRole('button', { name: /이전 메시지 더 보기/ });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('40개 남음');
  });

  it('does not show load more button when all messages visible', () => {
    const messages = makeMessages(5);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={30}
      />
    );
    expect(screen.queryByRole('button', { name: /이전 메시지 더 보기/ })).not.toBeInTheDocument();
  });

  it('loads more messages when load more button is clicked', () => {
    const messages = makeMessages(50);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
        batchSize={10}
      />
    );

    // Initially, message-39 should not be visible
    expect(screen.queryByTestId('message-39')).not.toBeInTheDocument();

    // Click load more
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /이전 메시지 더 보기/ }));
    });

    // Now message-30 to message-39 should be visible
    expect(screen.getByTestId('message-30')).toBeInTheDocument();
    expect(screen.getByTestId('message-39')).toBeInTheDocument();
  });

  it('loads more messages when scrolled to top', () => {
    const messages = makeMessages(50);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
        batchSize={10}
        threshold={100}
      />
    );

    const container = screen.getByRole('log');
    setScrollProps(container, { scrollHeight: 2000, scrollTop: 50, clientHeight: 500 });

    act(() => {
      fireEvent.scroll(container);
    });

    // More messages should now be visible
    expect(screen.getByTestId('message-30')).toBeInTheDocument();
  });

  it('does not load more when scrolled away from top', () => {
    const messages = makeMessages(50);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
        batchSize={10}
        threshold={100}
      />
    );

    const container = screen.getByRole('log');
    setScrollProps(container, { scrollHeight: 2000, scrollTop: 500, clientHeight: 500 });

    act(() => {
      fireEvent.scroll(container);
    });

    // message-39 should still not be visible
    expect(screen.queryByTestId('message-39')).not.toBeInTheDocument();
  });

  // --- Global index correctness ---

  it('passes correct global indices to renderMessage', () => {
    const messages = makeMessages(50);
    const mockRender = vi.fn((msg: Message, idx: number) => (
      <div key={msg.id || idx} data-testid={`msg-${idx}`}>{msg.content}</div>
    ));

    render(
      <MessageList
        messages={messages}
        renderMessage={mockRender}
        initialBatch={10}
      />
    );

    // First rendered message should have globalIndex 40
    expect(mockRender).toHaveBeenCalledWith(messages[40], 40);
    // Last rendered message should have globalIndex 49
    expect(mockRender).toHaveBeenCalledWith(messages[49], 49);
  });

  // --- Conversation switch ---

  it('resets visible count when messages array changes drastically', () => {
    const messages1 = makeMessages(50);
    const { rerender } = render(
      <MessageList
        messages={messages1}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
      />
    );

    // Show last 10 of first conversation
    expect(screen.getByTestId('message-40')).toBeInTheDocument();
    expect(screen.queryByTestId('message-0')).not.toBeInTheDocument();

    // Switch to a new, smaller conversation
    const messages2 = makeMessages(3);
    rerender(
      <MessageList
        messages={messages2}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
      />
    );

    // All 3 messages of new conversation should be visible
    expect(screen.getByTestId('message-0')).toBeInTheDocument();
    expect(screen.getByTestId('message-2')).toBeInTheDocument();
  });

  // --- New message appended ---

  it('shows new message when appended to conversation', () => {
    const messages = makeMessages(40);
    const { rerender } = render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={30}
      />
    );

    // Last message visible
    expect(screen.getByTestId('message-39')).toBeInTheDocument();

    // Add a new message
    const newMessages: Message[] = [...messages, {
      id: 'msg-40',
      role: 'assistant' as const,
      content: 'Message 40',
      timestamp: new Date(2025, 0, 1, 0, 40),
    }];

    rerender(
      <MessageList
        messages={newMessages}
        renderMessage={defaultRenderMessage}
        initialBatch={30}
      />
    );

    // New message should be visible
    expect(screen.getByTestId('message-40')).toBeInTheDocument();
  });

  // --- onScroll forwarding ---

  it('forwards scroll events to onScroll handler', () => {
    const onScroll = vi.fn();
    render(
      <MessageList
        messages={makeMessages(3)}
        renderMessage={defaultRenderMessage}
        onScroll={onScroll}
      />
    );

    const container = screen.getByRole('log');
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 500, clientHeight: 500 });

    act(() => {
      fireEvent.scroll(container);
    });

    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  // --- aria-live ---

  it('has aria-live polite attribute', () => {
    render(
      <MessageList
        messages={makeMessages(1)}
        renderMessage={defaultRenderMessage}
      />
    );
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
  });

  // --- Load more remaining count updates ---

  it('updates remaining count after loading more', () => {
    const messages = makeMessages(50);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
        batchSize={15}
      />
    );

    expect(screen.getByRole('button', { name: /이전 메시지 더 보기/ })).toHaveTextContent('40개 남음');

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /이전 메시지 더 보기/ }));
    });

    expect(screen.getByRole('button', { name: /이전 메시지 더 보기/ })).toHaveTextContent('25개 남음');
  });

  // --- All messages loaded ---

  it('hides load more button after all messages loaded', () => {
    const messages = makeMessages(15);
    render(
      <MessageList
        messages={messages}
        renderMessage={defaultRenderMessage}
        initialBatch={10}
        batchSize={10}
      />
    );

    expect(screen.getByRole('button', { name: /이전 메시지 더 보기/ })).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /이전 메시지 더 보기/ }));
    });

    // All 15 messages now visible, no more button
    expect(screen.queryByRole('button', { name: /이전 메시지 더 보기/ })).not.toBeInTheDocument();
  });
});
