import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Pagination, { generatePageRange } from './Pagination';

describe('generatePageRange', () => {
  it('returns [1] for single page', () => {
    expect(generatePageRange(1, 1, 1)).toEqual([1]);
  });

  it('returns all pages when total is small', () => {
    expect(generatePageRange(1, 3, 1)).toEqual([1, 2, 3]);
  });

  it('returns ellipsis on right side when on first page', () => {
    const result = generatePageRange(1, 10, 1);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(2);
    expect(result).toContain('ellipsis');
    expect(result[result.length - 1]).toBe(10);
  });

  it('returns ellipsis on left side when on last page', () => {
    const result = generatePageRange(10, 10, 1);
    expect(result[0]).toBe(1);
    expect(result).toContain('ellipsis');
    expect(result[result.length - 2]).toBe(9);
    expect(result[result.length - 1]).toBe(10);
  });

  it('returns ellipsis on both sides when in the middle', () => {
    const result = generatePageRange(5, 10, 1);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe('ellipsis');
    expect(result).toContain(4);
    expect(result).toContain(5);
    expect(result).toContain(6);
    expect(result[result.length - 1]).toBe(10);
  });

  it('respects siblingCount', () => {
    const result = generatePageRange(5, 10, 2);
    expect(result).toContain(3);
    expect(result).toContain(4);
    expect(result).toContain(5);
    expect(result).toContain(6);
    expect(result).toContain(7);
  });
});

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />
    );
    expect(container.querySelector('.pagination')).toBeNull();
  });

  it('renders page buttons', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByLabelText('1 페이지')).toBeInTheDocument();
    expect(screen.getByLabelText('2 페이지')).toBeInTheDocument();
    expect(screen.getByLabelText('5 페이지')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByLabelText('이전 페이지')).toBeInTheDocument();
    expect(screen.getByLabelText('다음 페이지')).toBeInTheDocument();
  });

  it('renders first/last buttons when showFirstLast is true (default)', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByLabelText('첫 페이지')).toBeInTheDocument();
    expect(screen.getByLabelText('마지막 페이지')).toBeInTheDocument();
  });

  it('hides first/last buttons when showFirstLast is false', () => {
    render(<Pagination {...defaultProps} showFirstLast={false} />);
    expect(screen.queryByLabelText('첫 페이지')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('마지막 페이지')).not.toBeInTheDocument();
  });

  // --- Active page ---

  it('marks current page as active', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    const activeBtn = screen.getByLabelText('3 페이지');
    expect(activeBtn).toHaveClass('pagination__btn--active');
    expect(activeBtn).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark non-current pages as active', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    const btn2 = screen.getByLabelText('2 페이지');
    expect(btn2).not.toHaveClass('pagination__btn--active');
    expect(btn2).not.toHaveAttribute('aria-current');
  });

  // --- Click handlers ---

  it('calls onPageChange with page number when page is clicked', () => {
    render(<Pagination {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('2 페이지'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with previous page on previous click', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    fireEvent.click(screen.getByLabelText('이전 페이지'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with next page on next click', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    fireEvent.click(screen.getByLabelText('다음 페이지'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange with 1 on first page click', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    fireEvent.click(screen.getByLabelText('첫 페이지'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with totalPages on last page click', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    fireEvent.click(screen.getByLabelText('마지막 페이지'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(5);
  });

  // --- Disabled states ---

  it('disables previous and first buttons on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    expect(screen.getByLabelText('이전 페이지')).toBeDisabled();
    expect(screen.getByLabelText('첫 페이지')).toBeDisabled();
  });

  it('disables next and last buttons on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    expect(screen.getByLabelText('다음 페이지')).toBeDisabled();
    expect(screen.getByLabelText('마지막 페이지')).toBeDisabled();
  });

  it('disables all buttons when disabled prop is true', () => {
    render(<Pagination {...defaultProps} currentPage={3} disabled={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  // --- Accessibility ---

  it('has nav element with aria-label', () => {
    render(<Pagination {...defaultProps} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', '페이지 탐색');
  });

  it('uses list for page items', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('hides ellipsis from screen readers', () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />
    );
    const { container } = render(
      <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />
    );
    const ellipses = container.querySelectorAll('.pagination__ellipsis');
    ellipses.forEach(el => {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('does not call onPageChange for previous when on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    fireEvent.click(screen.getByLabelText('이전 페이지'));
    expect(defaultProps.onPageChange).not.toHaveBeenCalled();
  });

  it('does not call onPageChange for next when on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    fireEvent.click(screen.getByLabelText('다음 페이지'));
    expect(defaultProps.onPageChange).not.toHaveBeenCalled();
  });

  it('renders nothing for negative totalPages', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={-1} onPageChange={vi.fn()} />
    );
    expect(container.querySelector('.pagination')).toBeNull();
  });

  it('renders single page without ellipsis', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.querySelector('.pagination__ellipsis')).toBeNull();
    expect(screen.getByLabelText('1 페이지')).toBeInTheDocument();
  });

  it('nav buttons have title attributes', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    expect(screen.getByLabelText('이전 페이지')).toHaveAttribute('title', '이전 페이지');
    expect(screen.getByLabelText('다음 페이지')).toHaveAttribute('title', '다음 페이지');
    expect(screen.getByLabelText('첫 페이지')).toHaveAttribute('title', '첫 페이지');
    expect(screen.getByLabelText('마지막 페이지')).toHaveAttribute('title', '마지막 페이지');
  });

  it('pagination__list class exists', () => {
    const { container } = render(<Pagination {...defaultProps} />);
    expect(container.querySelector('.pagination__list')).toBeInTheDocument();
  });

  it('pagination__btn--nav class on nav buttons', () => {
    const { container } = render(<Pagination {...defaultProps} />);
    const navButtons = container.querySelectorAll('.pagination__btn--nav');
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('two pages renders without ellipsis', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={2} onPageChange={vi.fn()} />
    );
    expect(container.querySelector('.pagination__ellipsis')).toBeNull();
    expect(screen.getByLabelText('1 페이지')).toBeInTheDocument();
    expect(screen.getByLabelText('2 페이지')).toBeInTheDocument();
  });
});

describe('generatePageRange — additional', () => {
  it('returns [1] for totalPages <= 1', () => {
    expect(generatePageRange(1, 0, 1)).toEqual([1]);
  });

  it('adjacent to first page shows no left ellipsis', () => {
    const result = generatePageRange(2, 10, 1);
    expect(result[0]).toBe(1);
    // No ellipsis between 1 and 2
    expect(result[1]).toBe(2);
    expect(result[2]).toBe(3);
  });

  it('adjacent to last page shows no right ellipsis', () => {
    const result = generatePageRange(9, 10, 1);
    expect(result[result.length - 1]).toBe(10);
    expect(result[result.length - 2]).toBe(9);
  });
});
