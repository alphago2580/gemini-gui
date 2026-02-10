import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Timeline from './Timeline';
import type { TimelineItem } from './Timeline';

describe('Timeline', () => {
  const sampleItems: TimelineItem[] = [
    { id: '1', title: '프로젝트 시작', timestamp: '2024-01-01', description: '첫 번째 단계' },
    { id: '2', title: '개발 시작', timestamp: '2024-02-01' },
    { id: '3', title: '배포 완료', timestamp: '2024-03-01', variant: 'success' },
  ];

  // --- Rendering ---

  it('renders nothing when items is empty', () => {
    const { container } = render(<Timeline items={[]} />);
    expect(container.querySelector('.timeline')).toBeNull();
  });

  it('renders all items', () => {
    render(<Timeline items={sampleItems} />);
    expect(screen.getByText('프로젝트 시작')).toBeInTheDocument();
    expect(screen.getByText('개발 시작')).toBeInTheDocument();
    expect(screen.getByText('배포 완료')).toBeInTheDocument();
  });

  it('renders timestamps', () => {
    render(<Timeline items={sampleItems} />);
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('2024-02-01')).toBeInTheDocument();
    expect(screen.getByText('2024-03-01')).toBeInTheDocument();
  });

  it('renders descriptions when provided', () => {
    render(<Timeline items={sampleItems} />);
    expect(screen.getByText('첫 번째 단계')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const items: TimelineItem[] = [{ id: '1', title: '항목' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.timeline__description')).toBeNull();
  });

  it('does not render timestamp when not provided', () => {
    const items: TimelineItem[] = [{ id: '1', title: '항목' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.timeline__timestamp')).toBeNull();
  });

  // --- Orientation ---

  it('renders vertical by default', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    expect(container.querySelector('.timeline--vertical')).toBeTruthy();
  });

  it('renders horizontal when specified', () => {
    const { container } = render(<Timeline items={sampleItems} orientation="horizontal" />);
    expect(container.querySelector('.timeline--horizontal')).toBeTruthy();
  });

  // --- Variants ---

  it('applies default variant dot class', () => {
    const items: TimelineItem[] = [{ id: '1', title: '기본' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.timeline__dot--default')).toBeTruthy();
  });

  it('applies success variant dot class', () => {
    const items: TimelineItem[] = [{ id: '1', title: '성공', variant: 'success' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.timeline__dot--success')).toBeTruthy();
  });

  it('applies warning variant dot class', () => {
    const items: TimelineItem[] = [{ id: '1', title: '경고', variant: 'warning' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.timeline__dot--warning')).toBeTruthy();
  });

  it('applies error variant dot class', () => {
    const items: TimelineItem[] = [{ id: '1', title: '오류', variant: 'error' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.timeline__dot--error')).toBeTruthy();
  });

  it('applies info variant dot class', () => {
    const items: TimelineItem[] = [{ id: '1', title: '정보', variant: 'info' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.timeline__dot--info')).toBeTruthy();
  });

  // --- Icons ---

  it('renders icon when provided', () => {
    const items: TimelineItem[] = [{ id: '1', title: '항목', icon: '★' }];
    const { container } = render(<Timeline items={items} />);
    const icon = container.querySelector('.timeline__icon');
    expect(icon?.textContent).toBe('★');
  });

  it('hides icon from screen readers', () => {
    const items: TimelineItem[] = [{ id: '1', title: '항목', icon: '★' }];
    const { container } = render(<Timeline items={items} />);
    const icon = container.querySelector('.timeline__icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render icon element when not provided', () => {
    const items: TimelineItem[] = [{ id: '1', title: '항목' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.timeline__icon')).toBeNull();
  });

  // --- Line connector ---

  it('renders connecting lines between items (not after last)', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const lines = container.querySelectorAll('.timeline__line');
    expect(lines).toHaveLength(2); // 3 items = 2 lines
  });

  it('marks last item with --last modifier', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const items = container.querySelectorAll('.timeline__item');
    expect(items[items.length - 1]).toHaveClass('timeline__item--last');
    expect(items[0]).not.toHaveClass('timeline__item--last');
  });

  // --- Accessibility ---

  it('has role="list"', () => {
    render(<Timeline items={sampleItems} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('has aria-label', () => {
    render(<Timeline items={sampleItems} />);
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', '타임라인');
  });

  it('items have role="listitem"', () => {
    render(<Timeline items={sampleItems} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('timestamps use <time> element', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const times = container.querySelectorAll('time');
    expect(times).toHaveLength(3);
  });
});
