import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Badge from './Badge';

describe('Badge', () => {
  it('renders count as text', () => {
    render(<Badge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders custom text', () => {
    render(<Badge text="NEW" />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('caps count at maxCount with plus', () => {
    render(<Badge count={150} maxCount={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('shows exact count when below maxCount', () => {
    render(<Badge count={50} maxCount={99} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('hides when count is 0 and no text', () => {
    const { container } = render(<Badge count={0} />);
    expect(container.querySelector('.badge')).not.toBeInTheDocument();
  });

  it('shows text even when count is 0', () => {
    render(<Badge count={0} text="0" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders as dot when dot prop is true', () => {
    const { container } = render(<Badge dot />);
    expect(container.querySelector('.badge--dot')).toBeInTheDocument();
  });

  it('does not show text content in dot mode', () => {
    render(<Badge count={5} dot />);
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('wraps children with badge overlay', () => {
    render(
      <Badge count={3}>
        <button>알림</button>
      </Badge>
    );
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('positions badge as overlay on children', () => {
    const { container } = render(
      <Badge count={1}>
        <span>아이콘</span>
      </Badge>
    );
    expect(container.querySelector('.badge-wrapper')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(<Badge count={1} />);
    expect(container.querySelector('.badge--default')).toBeInTheDocument();
  });

  it('applies primary variant class', () => {
    const { container } = render(<Badge count={1} variant="primary" />);
    expect(container.querySelector('.badge--primary')).toBeInTheDocument();
  });

  it('applies success variant class', () => {
    const { container } = render(<Badge count={1} variant="success" />);
    expect(container.querySelector('.badge--success')).toBeInTheDocument();
  });

  it('applies warning variant class', () => {
    const { container } = render(<Badge count={1} variant="warning" />);
    expect(container.querySelector('.badge--warning')).toBeInTheDocument();
  });

  it('applies error variant class', () => {
    const { container } = render(<Badge count={1} variant="error" />);
    expect(container.querySelector('.badge--error')).toBeInTheDocument();
  });

  it('has role="status"', () => {
    render(<Badge count={5} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label with count', () => {
    render(<Badge count={5} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5개');
  });

  it('has aria-label for dot mode', () => {
    render(<Badge dot />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '알림 있음');
  });

  it('is hidden when visible is false', () => {
    const { container } = render(<Badge count={5} visible={false} />);
    expect(container.querySelector('.badge')).not.toBeInTheDocument();
  });

  it('renders children even when visible is false', () => {
    render(
      <Badge count={5} visible={false}>
        <span>콘텐츠</span>
      </Badge>
    );
    expect(screen.getByText('콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('uses custom maxCount', () => {
    render(<Badge count={20} maxCount={9} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('prefers text over count', () => {
    render(<Badge count={5} text="공지" />);
    expect(screen.getByText('공지')).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });
});
