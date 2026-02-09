import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from '../../preload/types';

const createMessage = (overrides: Partial<Message> = {}): Message => ({
  role: 'user',
  content: 'Hello world',
  timestamp: new Date('2025-01-01T12:00:00'),
  ...overrides,
});

describe('MessageBubble', () => {
  const defaultProps = {
    message: createMessage(),
    index: 0,
    isStreaming: false,
    isLastAssistant: false,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  };

  it('renders user message with correct role label', () => {
    render(<MessageBubble {...defaultProps} />);
    expect(screen.getByText('사용자')).toBeInTheDocument();
  });

  it('renders assistant message with correct role label', () => {
    render(
      <MessageBubble
        {...defaultProps}
        message={createMessage({ role: 'assistant' })}
      />
    );
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('renders message content via MarkdownRenderer', () => {
    render(<MessageBubble {...defaultProps} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders timestamp', () => {
    render(<MessageBubble {...defaultProps} />);
    const timestamp = defaultProps.message.timestamp.toLocaleTimeString();
    expect(screen.getByText(timestamp)).toBeInTheDocument();
  });

  it('has role="article" with correct aria-label for user message', () => {
    render(<MessageBubble {...defaultProps} />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', '사용자 메시지');
  });

  it('has role="article" with correct aria-label for assistant message', () => {
    render(
      <MessageBubble
        {...defaultProps}
        message={createMessage({ role: 'assistant' })}
      />
    );
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', 'Gemini 메시지');
  });

  it('applies user CSS class for user messages', () => {
    const { container } = render(<MessageBubble {...defaultProps} />);
    expect(container.querySelector('.message.user')).toBeInTheDocument();
  });

  it('applies assistant CSS class for assistant messages', () => {
    const { container } = render(
      <MessageBubble
        {...defaultProps}
        message={createMessage({ role: 'assistant' })}
      />
    );
    expect(container.querySelector('.message.assistant')).toBeInTheDocument();
  });

  describe('Delete', () => {
    it('renders delete button with aria-label', () => {
      render(<MessageBubble {...defaultProps} />);
      expect(screen.getByLabelText('메시지 삭제')).toBeInTheDocument();
    });

    it('calls onDelete with index when clicked', () => {
      const onDelete = vi.fn();
      render(<MessageBubble {...defaultProps} index={3} onDelete={onDelete} />);
      fireEvent.click(screen.getByLabelText('메시지 삭제'));
      expect(onDelete).toHaveBeenCalledWith(3);
    });
  });

  describe('Edit', () => {
    it('shows edit button only for user messages', () => {
      render(<MessageBubble {...defaultProps} />);
      expect(screen.getByLabelText('메시지 수정')).toBeInTheDocument();
    });

    it('does not show edit button for assistant messages', () => {
      render(
        <MessageBubble
          {...defaultProps}
          message={createMessage({ role: 'assistant' })}
        />
      );
      expect(screen.queryByLabelText('메시지 수정')).not.toBeInTheDocument();
    });

    it('enters edit mode when edit button is clicked', () => {
      render(<MessageBubble {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('메시지 수정'));
      expect(screen.getByLabelText('메시지 수정 입력')).toBeInTheDocument();
    });

    it('populates edit textarea with message content', () => {
      render(<MessageBubble {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('메시지 수정'));
      const textarea = screen.getByLabelText('메시지 수정 입력') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Hello world');
    });

    it('hides edit button when in edit mode', () => {
      render(<MessageBubble {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('메시지 수정'));
      expect(screen.queryByLabelText('메시지 수정')).not.toBeInTheDocument();
    });

    it('calls onEdit with index and content on save', () => {
      const onEdit = vi.fn();
      render(<MessageBubble {...defaultProps} index={2} onEdit={onEdit} />);
      fireEvent.click(screen.getByLabelText('메시지 수정'));
      const textarea = screen.getByLabelText('메시지 수정 입력');
      fireEvent.change(textarea, { target: { value: 'Updated content' } });
      fireEvent.click(screen.getByLabelText('수정 저장'));
      expect(onEdit).toHaveBeenCalledWith(2, 'Updated content');
    });

    it('exits edit mode on save', () => {
      render(<MessageBubble {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('메시지 수정'));
      fireEvent.click(screen.getByLabelText('수정 저장'));
      expect(screen.queryByLabelText('메시지 수정 입력')).not.toBeInTheDocument();
    });

    it('exits edit mode on cancel without calling onEdit', () => {
      const onEdit = vi.fn();
      render(<MessageBubble {...defaultProps} onEdit={onEdit} />);
      fireEvent.click(screen.getByLabelText('메시지 수정'));
      fireEvent.click(screen.getByLabelText('수정 취소'));
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByLabelText('메시지 수정 입력')).not.toBeInTheDocument();
    });

    it('does not call onEdit when saving empty content', () => {
      const onEdit = vi.fn();
      render(<MessageBubble {...defaultProps} onEdit={onEdit} />);
      fireEvent.click(screen.getByLabelText('메시지 수정'));
      const textarea = screen.getByLabelText('메시지 수정 입력');
      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.click(screen.getByLabelText('수정 저장'));
      expect(onEdit).not.toHaveBeenCalled();
    });

    it('applies editing CSS class when in edit mode', () => {
      const { container } = render(<MessageBubble {...defaultProps} />);
      expect(container.querySelector('.message.editing')).not.toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('메시지 수정'));
      expect(container.querySelector('.message.editing')).toBeInTheDocument();
    });
  });

  describe('Fork', () => {
    it('renders fork button when onFork is provided', () => {
      render(<MessageBubble {...defaultProps} onFork={vi.fn()} />);
      expect(screen.getByLabelText('여기서 분기')).toBeInTheDocument();
    });

    it('does not render fork button when onFork is not provided', () => {
      render(<MessageBubble {...defaultProps} />);
      expect(screen.queryByLabelText('여기서 분기')).not.toBeInTheDocument();
    });

    it('calls onFork with index when fork button is clicked', () => {
      const onFork = vi.fn();
      render(<MessageBubble {...defaultProps} index={2} onFork={onFork} />);
      fireEvent.click(screen.getByLabelText('여기서 분기'));
      expect(onFork).toHaveBeenCalledWith(2);
    });

    it('renders fork button for both user and assistant messages', () => {
      const onFork = vi.fn();
      const { rerender } = render(
        <MessageBubble {...defaultProps} onFork={onFork} />
      );
      expect(screen.getByLabelText('여기서 분기')).toBeInTheDocument();

      rerender(
        <MessageBubble
          {...defaultProps}
          message={createMessage({ role: 'assistant' })}
          onFork={onFork}
        />
      );
      expect(screen.getByLabelText('여기서 분기')).toBeInTheDocument();
    });
  });

  describe('Streaming cursor', () => {
    it('shows streaming cursor on last assistant message when streaming', () => {
      const { container } = render(
        <MessageBubble
          {...defaultProps}
          message={createMessage({ role: 'assistant' })}
          isStreaming={true}
          isLastAssistant={true}
        />
      );
      expect(container.querySelector('.streaming-cursor')).toBeInTheDocument();
    });

    it('does not show streaming cursor on non-last assistant message', () => {
      const { container } = render(
        <MessageBubble
          {...defaultProps}
          message={createMessage({ role: 'assistant' })}
          isStreaming={true}
          isLastAssistant={false}
        />
      );
      expect(container.querySelector('.streaming-cursor')).not.toBeInTheDocument();
    });

    it('does not show streaming cursor on user message', () => {
      const { container } = render(
        <MessageBubble
          {...defaultProps}
          isStreaming={true}
          isLastAssistant={true}
        />
      );
      expect(container.querySelector('.streaming-cursor')).not.toBeInTheDocument();
    });

    it('does not show streaming cursor when not streaming', () => {
      const { container } = render(
        <MessageBubble
          {...defaultProps}
          message={createMessage({ role: 'assistant' })}
          isStreaming={false}
          isLastAssistant={true}
        />
      );
      expect(container.querySelector('.streaming-cursor')).not.toBeInTheDocument();
    });
  });
});
