import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import QuoteReply from './QuoteReply';
import type { QuoteData } from './QuoteReply';

describe('QuoteReply', () => {
  const mockDismiss = vi.fn();
  const mockNavigate = vi.fn();

  const createQuote = (overrides: Partial<QuoteData> = {}): QuoteData => ({
    text: '안녕하세요, 이것은 인용 텍스트입니다.',
    senderRole: 'assistant',
    ...overrides,
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when quote is null', () => {
    const { container } = render(
      <QuoteReply quote={null} onDismiss={mockDismiss} />
    );
    expect(container.querySelector('.quote-reply')).not.toBeInTheDocument();
  });

  it('renders the quoted text', () => {
    render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(screen.getByText('안녕하세요, 이것은 인용 텍스트입니다.')).toBeInTheDocument();
  });

  it('renders sender label for assistant role', () => {
    render(
      <QuoteReply quote={createQuote({ senderRole: 'assistant' })} onDismiss={mockDismiss} />
    );
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('renders sender label for user role', () => {
    render(
      <QuoteReply quote={createQuote({ senderRole: 'user' })} onDismiss={mockDismiss} />
    );
    expect(screen.getByText('사용자')).toBeInTheDocument();
  });

  it('applies correct role class for user', () => {
    const { container } = render(
      <QuoteReply quote={createQuote({ senderRole: 'user' })} onDismiss={mockDismiss} />
    );
    expect(container.querySelector('.quote-reply--user')).toBeInTheDocument();
  });

  it('applies correct role class for assistant', () => {
    const { container } = render(
      <QuoteReply quote={createQuote({ senderRole: 'assistant' })} onDismiss={mockDismiss} />
    );
    expect(container.querySelector('.quote-reply--assistant')).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '인용 답장');
  });

  it('has aria-live="polite"', () => {
    render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const dismissFn = vi.fn();
    render(
      <QuoteReply quote={createQuote()} onDismiss={dismissFn} />
    );
    fireEvent.click(screen.getByRole('button', { name: '인용 취소' }));
    expect(dismissFn).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when Escape key is pressed', () => {
    const dismissFn = vi.fn();
    const { container } = render(
      <QuoteReply quote={createQuote()} onDismiss={dismissFn} />
    );
    const quoteEl = container.querySelector('.quote-reply')!;
    fireEvent.keyDown(quoteEl, { key: 'Escape' });
    expect(dismissFn).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss on non-Escape keys', () => {
    const dismissFn = vi.fn();
    const { container } = render(
      <QuoteReply quote={createQuote()} onDismiss={dismissFn} />
    );
    const quoteEl = container.querySelector('.quote-reply')!;
    fireEvent.keyDown(quoteEl, { key: 'Enter' });
    expect(dismissFn).not.toHaveBeenCalled();
  });

  it('truncates long text at maxLength', () => {
    const longText = 'a'.repeat(200);
    render(
      <QuoteReply quote={createQuote({ text: longText })} onDismiss={mockDismiss} maxLength={50} />
    );
    const textEl = screen.getByText('a'.repeat(50) + '…');
    expect(textEl).toBeInTheDocument();
  });

  it('does not truncate text shorter than maxLength', () => {
    render(
      <QuoteReply
        quote={createQuote({ text: '짧은 텍스트' })}
        onDismiss={mockDismiss}
        maxLength={100}
      />
    );
    expect(screen.getByText('짧은 텍스트')).toBeInTheDocument();
  });

  it('uses default maxLength of 120', () => {
    const text = 'x'.repeat(130);
    render(
      <QuoteReply quote={createQuote({ text })} onDismiss={mockDismiss} />
    );
    expect(screen.getByText('x'.repeat(120) + '…')).toBeInTheDocument();
  });

  it('shows title tooltip for truncated text', () => {
    const longText = 'b'.repeat(200);
    render(
      <QuoteReply quote={createQuote({ text: longText })} onDismiss={mockDismiss} maxLength={50} />
    );
    const textEl = screen.getByText('b'.repeat(50) + '…');
    expect(textEl).toHaveAttribute('title', longText);
  });

  it('does not show title tooltip for short text', () => {
    render(
      <QuoteReply
        quote={createQuote({ text: '짧은 텍스트' })}
        onDismiss={mockDismiss}
      />
    );
    const textEl = screen.getByText('짧은 텍스트');
    expect(textEl).not.toHaveAttribute('title');
  });

  describe('navigation', () => {
    it('makes text clickable when messageIndex and onNavigate are provided', () => {
      const { container } = render(
        <QuoteReply
          quote={createQuote({ messageIndex: 5 })}
          onDismiss={mockDismiss}
          onNavigate={mockNavigate}
        />
      );
      expect(container.querySelector('.quote-reply-text--clickable')).toBeInTheDocument();
    });

    it('text is not clickable when messageIndex is not provided', () => {
      const { container } = render(
        <QuoteReply
          quote={createQuote()}
          onDismiss={mockDismiss}
          onNavigate={mockNavigate}
        />
      );
      expect(container.querySelector('.quote-reply-text--clickable')).not.toBeInTheDocument();
    });

    it('text is not clickable when onNavigate is not provided', () => {
      const { container } = render(
        <QuoteReply
          quote={createQuote({ messageIndex: 5 })}
          onDismiss={mockDismiss}
        />
      );
      expect(container.querySelector('.quote-reply-text--clickable')).not.toBeInTheDocument();
    });

    it('calls onNavigate with messageIndex when text is clicked', () => {
      const navigateFn = vi.fn();
      render(
        <QuoteReply
          quote={createQuote({ messageIndex: 3 })}
          onDismiss={mockDismiss}
          onNavigate={navigateFn}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: '원본 메시지로 이동' }));
      expect(navigateFn).toHaveBeenCalledWith(3);
    });

    it('navigable text has role="button"', () => {
      render(
        <QuoteReply
          quote={createQuote({ messageIndex: 0 })}
          onDismiss={mockDismiss}
          onNavigate={mockNavigate}
        />
      );
      expect(screen.getByRole('button', { name: '원본 메시지로 이동' })).toBeInTheDocument();
    });

    it('navigable text responds to Enter key', () => {
      const navigateFn = vi.fn();
      render(
        <QuoteReply
          quote={createQuote({ messageIndex: 7 })}
          onDismiss={mockDismiss}
          onNavigate={navigateFn}
        />
      );
      const textBtn = screen.getByRole('button', { name: '원본 메시지로 이동' });
      fireEvent.keyDown(textBtn, { key: 'Enter' });
      expect(navigateFn).toHaveBeenCalledWith(7);
    });

    it('navigable text responds to Space key', () => {
      const navigateFn = vi.fn();
      render(
        <QuoteReply
          quote={createQuote({ messageIndex: 2 })}
          onDismiss={mockDismiss}
          onNavigate={navigateFn}
        />
      );
      const textBtn = screen.getByRole('button', { name: '원본 메시지로 이동' });
      fireEvent.keyDown(textBtn, { key: ' ' });
      expect(navigateFn).toHaveBeenCalledWith(2);
    });

    it('navigable text has aria-label', () => {
      render(
        <QuoteReply
          quote={createQuote({ messageIndex: 0 })}
          onDismiss={mockDismiss}
          onNavigate={mockNavigate}
        />
      );
      const textBtn = screen.getByRole('button', { name: '원본 메시지로 이동' });
      expect(textBtn).toHaveAttribute('aria-label', '원본 메시지로 이동');
    });
  });

  it('dismiss button has aria-label', () => {
    render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(screen.getByRole('button', { name: '인용 취소' })).toBeInTheDocument();
  });

  it('dismiss button has title attribute', () => {
    render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    const btn = screen.getByRole('button', { name: '인용 취소' });
    expect(btn).toHaveAttribute('title', '인용 취소');
  });

  it('dismiss button displays × character', () => {
    render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    const btn = screen.getByRole('button', { name: '인용 취소' });
    expect(btn.textContent).toBe('×');
  });

  it('has quote-reply-accent element', () => {
    const { container } = render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(container.querySelector('.quote-reply-accent')).toBeInTheDocument();
  });

  it('has quote-reply-content wrapper', () => {
    const { container } = render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(container.querySelector('.quote-reply-content')).toBeInTheDocument();
  });

  it('has quote-reply-sender element', () => {
    const { container } = render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(container.querySelector('.quote-reply-sender')).toBeInTheDocument();
  });

  it('has quote-reply-text element', () => {
    const { container } = render(
      <QuoteReply quote={createQuote()} onDismiss={mockDismiss} />
    );
    expect(container.querySelector('.quote-reply-text')).toBeInTheDocument();
  });
});
