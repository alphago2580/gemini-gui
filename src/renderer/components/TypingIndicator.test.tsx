import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TypingIndicator from './TypingIndicator';

describe('TypingIndicator', () => {
  it('renders with role="status"', () => {
    render(<TypingIndicator />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<TypingIndicator />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '응답 생성 중');
  });

  it('shows Gemini role label', () => {
    render(<TypingIndicator />);
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('shows "생각하는 중..." when not streaming', () => {
    render(<TypingIndicator />);
    expect(screen.getByText('생각하는 중...')).toBeInTheDocument();
  });

  it('shows "입력 중..." when streaming', () => {
    render(<TypingIndicator isStreaming />);
    expect(screen.getByText('입력 중...')).toBeInTheDocument();
  });

  it('defaults isStreaming to false', () => {
    render(<TypingIndicator />);
    expect(screen.getByText('생각하는 중...')).toBeInTheDocument();
    expect(screen.queryByText('입력 중...')).not.toBeInTheDocument();
  });

  it('renders three animation dots', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('.typing-dots span');
    expect(dots.length).toBe(3);
  });

  it('dots container has aria-hidden for screen readers', () => {
    const { container } = render(<TypingIndicator />);
    const dotsContainer = container.querySelector('.typing-dots');
    expect(dotsContainer).toHaveAttribute('aria-hidden', 'true');
  });

  it('switches text based on isStreaming prop', () => {
    const { rerender } = render(<TypingIndicator isStreaming={false} />);
    expect(screen.getByText('생각하는 중...')).toBeInTheDocument();

    rerender(<TypingIndicator isStreaming={true} />);
    expect(screen.getByText('입력 중...')).toBeInTheDocument();
    expect(screen.queryByText('생각하는 중...')).not.toBeInTheDocument();
  });

  it('has typing-indicator CSS class', () => {
    const { container } = render(<TypingIndicator />);
    expect(container.querySelector('.typing-indicator')).toBeInTheDocument();
  });

  it('has typing-indicator-header with role span', () => {
    const { container } = render(<TypingIndicator />);
    const header = container.querySelector('.typing-indicator-header');
    expect(header).toBeInTheDocument();
    const roleSpan = header!.querySelector('.role');
    expect(roleSpan).toBeInTheDocument();
    expect(roleSpan!.textContent).toBe('Gemini');
  });

  it('has typing-indicator-content container', () => {
    const { container } = render(<TypingIndicator />);
    expect(container.querySelector('.typing-indicator-content')).toBeInTheDocument();
  });

  it('typing-text span contains text node', () => {
    const { container } = render(<TypingIndicator />);
    const textSpan = container.querySelector('.typing-text');
    expect(textSpan).toBeInTheDocument();
    expect(textSpan!.textContent).toBe('생각하는 중...');
  });

  it('renders with isStreaming=false explicitly', () => {
    render(<TypingIndicator isStreaming={false} />);
    expect(screen.getByText('생각하는 중...')).toBeInTheDocument();
    expect(screen.queryByText('입력 중...')).not.toBeInTheDocument();
  });

  it('dots are span elements without text content', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('.typing-dots span');
    dots.forEach(dot => {
      expect(dot.textContent).toBe('');
      expect(dot.tagName).toBe('SPAN');
    });
  });

  it('root element is a div with correct class', () => {
    const { container } = render(<TypingIndicator />);
    const root = container.firstElementChild;
    expect(root!.tagName).toBe('DIV');
    expect(root).toHaveClass('typing-indicator');
  });

  it('rerender from streaming to non-streaming updates text', () => {
    const { rerender } = render(<TypingIndicator isStreaming={true} />);
    expect(screen.getByText('입력 중...')).toBeInTheDocument();
    rerender(<TypingIndicator isStreaming={false} />);
    expect(screen.getByText('생각하는 중...')).toBeInTheDocument();
    expect(screen.queryByText('입력 중...')).not.toBeInTheDocument();
  });

  it('role status element contains both dots and text', () => {
    const { container } = render(<TypingIndicator />);
    const status = screen.getByRole('status');
    const dots = status.querySelector('.typing-dots');
    const text = status.querySelector('.typing-text');
    expect(dots).toBeInTheDocument();
    expect(text).toBeInTheDocument();
  });
});
