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

  it('has token-usage CSS class on root', () => {
    const { container } = render(<TokenUsage usage={defaultUsage} />);
    expect(container.querySelector('.token-usage')).toBeInTheDocument();
  });

  it('renders token-usage-label span', () => {
    const { container } = render(<TokenUsage usage={defaultUsage} />);
    const label = container.querySelector('.token-usage-label');
    expect(label).toBeInTheDocument();
    expect(label!.textContent).toBe('토큰:');
  });

  it('renders two token-usage-item spans', () => {
    const { container } = render(<TokenUsage usage={defaultUsage} />);
    const items = container.querySelectorAll('.token-usage-item');
    expect(items).toHaveLength(2);
  });

  it('renders token-usage-total span', () => {
    const { container } = render(<TokenUsage usage={defaultUsage} />);
    const total = container.querySelector('.token-usage-total');
    expect(total).toBeInTheDocument();
  });

  it('renders token-icon spans with correct characters', () => {
    const { container } = render(<TokenUsage usage={defaultUsage} />);
    const icons = container.querySelectorAll('.token-icon');
    expect(icons).toHaveLength(2);
    expect(icons[0].textContent).toBe('↑');
    expect(icons[1].textContent).toBe('↓');
  });

  it('handles single digit token counts', () => {
    const smallUsage = { inputTokens: 1, outputTokens: 2, totalTokens: 3 };
    render(<TokenUsage usage={smallUsage} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('= 3')).toBeInTheDocument();
  });

  it('root element is a div', () => {
    const { container } = render(<TokenUsage usage={defaultUsage} />);
    const root = container.firstElementChild;
    expect(root!.tagName).toBe('DIV');
  });

  it('updates when usage prop changes via rerender', () => {
    const { rerender } = render(<TokenUsage usage={defaultUsage} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    const newUsage = { inputTokens: 500, outputTokens: 300, totalTokens: 800 };
    rerender(<TokenUsage usage={newUsage} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('= 800')).toBeInTheDocument();
    expect(screen.queryByText('100')).not.toBeInTheDocument();
  });

  describe('ProgressBar integration', () => {
    it('does not show progress bar without maxTokens', () => {
      const { container } = render(<TokenUsage usage={defaultUsage} />);
      expect(container.querySelector('.token-usage-progress')).not.toBeInTheDocument();
    });

    it('shows progress bar when maxTokens is provided', () => {
      render(<TokenUsage usage={defaultUsage} maxTokens={1000} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not show progress bar when maxTokens is 0', () => {
      const { container } = render(<TokenUsage usage={defaultUsage} maxTokens={0} />);
      expect(container.querySelector('.token-usage-progress')).not.toBeInTheDocument();
    });

    it('shows percentage on progress bar', () => {
      render(<TokenUsage usage={defaultUsage} maxTokens={1000} />);
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('uses warning variant when usage exceeds 70%', () => {
      const highUsage = { inputTokens: 500, outputTokens: 300, totalTokens: 800 };
      const { container } = render(<TokenUsage usage={highUsage} maxTokens={1000} />);
      expect(container.querySelector('.progress-fill--warning')).toBeInTheDocument();
    });

    it('uses error variant when usage exceeds 90%', () => {
      const veryHighUsage = { inputTokens: 600, outputTokens: 400, totalTokens: 1000 };
      const { container } = render(<TokenUsage usage={veryHighUsage} maxTokens={1000} />);
      expect(container.querySelector('.progress-fill--error')).toBeInTheDocument();
    });

    it('uses default variant when usage is below 70%', () => {
      const { container } = render(<TokenUsage usage={defaultUsage} maxTokens={1000} />);
      expect(container.querySelector('.progress-fill--default')).toBeInTheDocument();
    });
  });
});
