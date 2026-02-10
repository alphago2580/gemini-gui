import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Breadcrumb from './Breadcrumb';
import type { BreadcrumbItem } from './Breadcrumb';

describe('Breadcrumb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('renders nothing when items array is empty', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.querySelector('.breadcrumb')).toBeNull();
  });

  it('renders a single item without separator', () => {
    const items: BreadcrumbItem[] = [{ label: '홈' }];
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  it('renders multiple items with separators', () => {
    const items: BreadcrumbItem[] = [
      { label: '홈', onClick: vi.fn() },
      { label: '설정', onClick: vi.fn() },
      { label: '프로필' },
    ];
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('설정')).toBeInTheDocument();
    expect(screen.getByText('프로필')).toBeInTheDocument();
    expect(screen.getAllByText('/')).toHaveLength(2);
  });

  it('renders custom separator', () => {
    const items: BreadcrumbItem[] = [
      { label: '1', onClick: vi.fn() },
      { label: '2' },
    ];
    render(<Breadcrumb items={items} separator=">" />);
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('renders icons when provided', () => {
    const items: BreadcrumbItem[] = [
      { label: '홈', icon: '🏠', onClick: vi.fn() },
      { label: '문서' },
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const icon = container.querySelector('.breadcrumb__icon');
    expect(icon).toBeTruthy();
    expect(icon?.textContent).toBe('🏠');
  });

  it('hides icons from screen readers', () => {
    const items: BreadcrumbItem[] = [
      { label: '홈', icon: '🏠', onClick: vi.fn() },
      { label: '끝' },
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const icon = container.querySelector('.breadcrumb__icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Clickable items ---

  it('renders clickable items as buttons', () => {
    const onClick = vi.fn();
    const items: BreadcrumbItem[] = [
      { label: '홈', onClick },
      { label: '현재 페이지' },
    ];
    render(<Breadcrumb items={items} />);

    const button = screen.getByRole('button', { name: '홈' });
    expect(button).toHaveClass('breadcrumb__link');
  });

  it('calls onClick when clickable item is clicked', () => {
    const onClick = vi.fn();
    const items: BreadcrumbItem[] = [
      { label: '홈', onClick },
      { label: '끝' },
    ];
    render(<Breadcrumb items={items} />);

    fireEvent.click(screen.getByRole('button', { name: '홈' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders last item as text (not clickable)', () => {
    const onClick = vi.fn();
    const items: BreadcrumbItem[] = [
      { label: '홈', onClick: vi.fn() },
      { label: '마지막', onClick },
    ];
    render(<Breadcrumb items={items} />);

    const lastText = screen.getByText('마지막');
    expect(lastText).toHaveClass('breadcrumb__text--current');
    expect(lastText.tagName).toBe('SPAN');
  });

  it('renders non-clickable middle items as text', () => {
    const items: BreadcrumbItem[] = [
      { label: '홈', onClick: vi.fn() },
      { label: '중간' },
      { label: '끝' },
    ];
    render(<Breadcrumb items={items} />);

    const middle = screen.getByText('중간');
    expect(middle).toHaveClass('breadcrumb__text');
    expect(middle.tagName).toBe('SPAN');
  });

  // --- Collapse (maxItems) ---

  it('collapses items when exceeding maxItems', () => {
    const items: BreadcrumbItem[] = [
      { label: 'A', onClick: vi.fn() },
      { label: 'B', onClick: vi.fn() },
      { label: 'C', onClick: vi.fn() },
      { label: 'D', onClick: vi.fn() },
      { label: 'E' },
    ];
    render(<Breadcrumb items={items} maxItems={3} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.queryByText('B')).not.toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
  });

  it('renders custom collapsed label', () => {
    const items: BreadcrumbItem[] = [
      { label: 'A', onClick: vi.fn() },
      { label: 'B', onClick: vi.fn() },
      { label: 'C', onClick: vi.fn() },
      { label: 'D' },
    ];
    render(<Breadcrumb items={items} maxItems={2} collapsedLabel="•••" />);
    expect(screen.getByText('•••')).toBeInTheDocument();
  });

  it('expands collapsed items when collapse button is clicked', () => {
    const items: BreadcrumbItem[] = [
      { label: 'A', onClick: vi.fn() },
      { label: 'B', onClick: vi.fn() },
      { label: 'C', onClick: vi.fn() },
      { label: 'D' },
    ];
    render(<Breadcrumb items={items} maxItems={2} />);

    expect(screen.queryByText('B')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('...'));

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('does not collapse when items count equals maxItems', () => {
    const items: BreadcrumbItem[] = [
      { label: 'A', onClick: vi.fn() },
      { label: 'B', onClick: vi.fn() },
      { label: 'C' },
    ];
    render(<Breadcrumb items={items} maxItems={3} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('does not collapse when maxItems is not set', () => {
    const items: BreadcrumbItem[] = [
      { label: 'A', onClick: vi.fn() },
      { label: 'B', onClick: vi.fn() },
      { label: 'C', onClick: vi.fn() },
      { label: 'D', onClick: vi.fn() },
      { label: 'E' },
    ];
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  // --- Accessibility ---

  it('has nav element with aria-label', () => {
    const items: BreadcrumbItem[] = [{ label: '홈' }];
    render(<Breadcrumb items={items} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', '탐색 경로');
  });

  it('marks last item with aria-current="page"', () => {
    const items: BreadcrumbItem[] = [
      { label: '홈', onClick: vi.fn() },
      { label: '현재' },
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const lastItem = container.querySelector('[aria-current="page"]');
    expect(lastItem).toBeTruthy();
    expect(lastItem?.textContent).toContain('현재');
  });

  it('does not mark non-last items with aria-current', () => {
    const items: BreadcrumbItem[] = [
      { label: '홈', onClick: vi.fn() },
      { label: '현재' },
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const allItems = container.querySelectorAll('.breadcrumb__item');
    expect(allItems[0]).not.toHaveAttribute('aria-current');
  });

  it('hides separators from screen readers', () => {
    const items: BreadcrumbItem[] = [
      { label: 'A', onClick: vi.fn() },
      { label: 'B' },
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const separator = container.querySelector('.breadcrumb__separator');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
  });

  it('collapse button has accessible label', () => {
    const items: BreadcrumbItem[] = [
      { label: 'A', onClick: vi.fn() },
      { label: 'B', onClick: vi.fn() },
      { label: 'C', onClick: vi.fn() },
      { label: 'D' },
    ];
    render(<Breadcrumb items={items} maxItems={2} />);
    const collapseBtn = screen.getByLabelText('숨겨진 경로 표시');
    expect(collapseBtn).toBeInTheDocument();
    expect(collapseBtn).toHaveAttribute('title', '모두 표시');
  });

  it('uses ordered list for breadcrumb items', () => {
    const items: BreadcrumbItem[] = [{ label: '홈' }];
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
