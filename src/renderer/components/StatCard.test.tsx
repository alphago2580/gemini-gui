import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from './StatCard';

describe('StatCard', () => {
  // -- Basic rendering --
  it('renders with role="group"', () => {
    render(<StatCard label="총 메시지" value={42} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('has aria-label with label and value', () => {
    render(<StatCard label="총 메시지" value={42} />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '총 메시지: 42');
  });

  it('renders label text', () => {
    render(<StatCard label="총 메시지" value={42} />);
    expect(screen.getByText('총 메시지')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(<StatCard label="총 메시지" value={42} />);
    expect(screen.getByTestId('stat-card-value')).toHaveTextContent('42');
  });

  it('renders string value', () => {
    render(<StatCard label="상태" value="활성" />);
    expect(screen.getByTestId('stat-card-value')).toHaveTextContent('활성');
  });

  it('applies custom id', () => {
    const { container } = render(<StatCard label="총 메시지" value={42} id="my-stat" />);
    expect(container.querySelector('#my-stat')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StatCard label="총 메시지" value={42} className="custom" />);
    expect(container.querySelector('.stat-card.custom')).toBeInTheDocument();
  });

  // -- Variants --
  it('applies default variant class', () => {
    const { container } = render(<StatCard label="라벨" value={0} />);
    expect(container.querySelector('.stat-card')).toHaveClass('stat-card--default');
  });

  it('applies outlined variant class', () => {
    const { container } = render(<StatCard label="라벨" value={0} variant="outlined" />);
    expect(container.querySelector('.stat-card')).toHaveClass('stat-card--outlined');
  });

  it('applies elevated variant class', () => {
    const { container } = render(<StatCard label="라벨" value={0} variant="elevated" />);
    expect(container.querySelector('.stat-card')).toHaveClass('stat-card--elevated');
  });

  // -- Sizes --
  it('applies medium size by default', () => {
    const { container } = render(<StatCard label="라벨" value={0} />);
    expect(container.querySelector('.stat-card')).toHaveClass('stat-card--medium');
  });

  it('applies small size', () => {
    const { container } = render(<StatCard label="라벨" value={0} size="small" />);
    expect(container.querySelector('.stat-card')).toHaveClass('stat-card--small');
  });

  it('applies large size', () => {
    const { container } = render(<StatCard label="라벨" value={0} size="large" />);
    expect(container.querySelector('.stat-card')).toHaveClass('stat-card--large');
  });

  // -- Icon --
  it('does not render icon by default', () => {
    const { container } = render(<StatCard label="라벨" value={0} />);
    expect(container.querySelector('.stat-card-icon')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(<StatCard label="라벨" value={0} icon="📊" />);
    const icon = container.querySelector('.stat-card-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('📊');
  });

  it('icon has aria-hidden', () => {
    const { container } = render(<StatCard label="라벨" value={0} icon="📊" />);
    expect(container.querySelector('.stat-card-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  // -- Trend --
  it('does not render trend by default', () => {
    const { container } = render(<StatCard label="라벨" value={0} />);
    expect(container.querySelector('.stat-card-trend')).not.toBeInTheDocument();
  });

  it('renders up trend with arrow', () => {
    const { container } = render(<StatCard label="라벨" value={100} trend="up" />);
    const trend = container.querySelector('.stat-card-trend');
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveClass('stat-card-trend--up');
    expect(container.querySelector('.stat-card-trend-arrow')).toHaveTextContent('↑');
  });

  it('renders down trend with arrow', () => {
    const { container } = render(<StatCard label="라벨" value={100} trend="down" />);
    const trend = container.querySelector('.stat-card-trend');
    expect(trend).toHaveClass('stat-card-trend--down');
    expect(container.querySelector('.stat-card-trend-arrow')).toHaveTextContent('↓');
  });

  it('renders neutral trend with arrow', () => {
    const { container } = render(<StatCard label="라벨" value={100} trend="neutral" />);
    const trend = container.querySelector('.stat-card-trend');
    expect(trend).toHaveClass('stat-card-trend--neutral');
    expect(container.querySelector('.stat-card-trend-arrow')).toHaveTextContent('→');
  });

  it('renders trend text', () => {
    render(<StatCard label="라벨" value={100} trend="up" trendText="+12%" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders trend text without trend direction', () => {
    const { container } = render(<StatCard label="라벨" value={100} trendText="변동 없음" />);
    expect(screen.getByText('변동 없음')).toBeInTheDocument();
    expect(container.querySelector('.stat-card-trend-arrow')).not.toBeInTheDocument();
  });

  it('trend arrow has aria-hidden', () => {
    const { container } = render(<StatCard label="라벨" value={100} trend="up" />);
    expect(container.querySelector('.stat-card-trend-arrow')).toHaveAttribute('aria-hidden', 'true');
  });

  // -- Description --
  it('does not render description by default', () => {
    const { container } = render(<StatCard label="라벨" value={0} />);
    expect(container.querySelector('.stat-card-description')).not.toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StatCard label="라벨" value={100} description="지난 7일 기준" />);
    expect(screen.getByText('지난 7일 기준')).toBeInTheDocument();
  });

  // -- Custom color --
  it('does not set inline style without custom color', () => {
    const { container } = render(<StatCard label="라벨" value={0} />);
    expect(container.querySelector('.stat-card')).not.toHaveAttribute('style');
  });

  it('sets --stat-card-accent CSS variable with custom color', () => {
    const { container } = render(<StatCard label="라벨" value={0} color="#ff6b6b" />);
    const card = container.querySelector('.stat-card') as HTMLElement;
    expect(card.style.getPropertyValue('--stat-card-accent')).toBe('#ff6b6b');
  });

  // -- aria-label with string value --
  it('includes string value in aria-label', () => {
    render(<StatCard label="상태" value="활성" />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '상태: 활성');
  });

  // -- Combination of features --
  it('renders all features together', () => {
    const { container } = render(
      <StatCard
        label="총 토큰"
        value="1,234"
        trend="up"
        trendText="+15%"
        icon="🔢"
        variant="elevated"
        size="large"
        description="이번 주 사용량"
        color="#6c5ce7"
        id="full-stat"
        className="extra"
      />,
    );
    const card = container.querySelector('.stat-card');
    expect(card).toHaveClass('stat-card--elevated', 'stat-card--large', 'extra');
    expect(card).toHaveAttribute('id', 'full-stat');
    expect(container.querySelector('.stat-card-icon')).toHaveTextContent('🔢');
    expect(screen.getByText('총 토큰')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-value')).toHaveTextContent('1,234');
    expect(container.querySelector('.stat-card-trend')).toHaveClass('stat-card-trend--up');
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('이번 주 사용량')).toBeInTheDocument();
  });

  // -- Edge cases --
  it('renders zero value', () => {
    render(<StatCard label="에러" value={0} />);
    expect(screen.getByTestId('stat-card-value')).toHaveTextContent('0');
  });

  it('renders large number value', () => {
    render(<StatCard label="토큰" value={1000000} />);
    expect(screen.getByTestId('stat-card-value')).toHaveTextContent('1000000');
  });

  it('renders empty string value', () => {
    render(<StatCard label="상태" value="" />);
    expect(screen.getByTestId('stat-card-value')).toBeInTheDocument();
  });

  // -- Wrapper element --
  it('renders as a div element', () => {
    const { container } = render(<StatCard label="라벨" value={0} />);
    const wrapper = container.querySelector('.stat-card');
    expect(wrapper?.tagName).toBe('DIV');
  });
});
