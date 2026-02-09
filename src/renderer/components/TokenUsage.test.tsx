import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TokenUsage from './TokenUsage';

describe('TokenUsage', () => {
  const defaultUsage = { inputTokens: 100, outputTokens: 50, totalTokens: 150 };

  it('renders token usage display', () => {
    render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows input token count', () => {
    render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows output token count', () => {
    render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('shows total token count', () => {
    render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByText('= 150')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '토큰 사용량');
  });

  it('shows label text', () => {
    render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByText('토큰:')).toBeInTheDocument();
  });

  it('formats large numbers with locale string', () => {
    const largeUsage = { inputTokens: 1234567, outputTokens: 89012, totalTokens: 1323579 };
    render(<TokenUsage usage={largeUsage} />);
    // toLocaleString formats numbers with commas (varies by locale)
    expect(screen.getByText(Number(1234567).toLocaleString())).toBeInTheDocument();
    expect(screen.getByText(Number(89012).toLocaleString())).toBeInTheDocument();
  });

  it('shows up/down arrow icons for input/output', () => {
    render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  it('has title attributes on token items', () => {
    render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByTitle('입력 토큰')).toBeInTheDocument();
    expect(screen.getByTitle('출력 토큰')).toBeInTheDocument();
    expect(screen.getByTitle('총 토큰')).toBeInTheDocument();
  });

  it('handles zero token counts', () => {
    const zeroUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    render(<TokenUsage usage={zeroUsage} />);
    expect(screen.getByText('= 0')).toBeInTheDocument();
  });
});
