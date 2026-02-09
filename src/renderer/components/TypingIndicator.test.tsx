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
});
