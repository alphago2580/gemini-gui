import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InlineSearch from './InlineSearch';

const defaultProps = {
  isOpen: true,
  query: '',
  matchCount: 0,
  currentMatchIndex: 0,
  onQueryChange: vi.fn(),
  onNext: vi.fn(),
  onPrev: vi.fn(),
  onClose: vi.fn(),
};

describe('InlineSearch', () => {
  it('renders nothing when not open', () => {
    const { container } = render(<InlineSearch {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders search input when open', () => {
    render(<InlineSearch {...defaultProps} />);
    expect(screen.getByPlaceholderText('대화 내 검색...')).toBeInTheDocument();
  });

  it('shows match count when query is present', () => {
    render(<InlineSearch {...defaultProps} query="test" matchCount={5} currentMatchIndex={2} />);
    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('shows 0/0 when query has no matches', () => {
    render(<InlineSearch {...defaultProps} query="test" matchCount={0} />);
    expect(screen.getByText('0/0')).toBeInTheDocument();
  });

  it('calls onQueryChange when typing', () => {
    const onQueryChange = vi.fn();
    render(<InlineSearch {...defaultProps} onQueryChange={onQueryChange} />);
    fireEvent.change(screen.getByPlaceholderText('대화 내 검색...'), { target: { value: 'hello' } });
    expect(onQueryChange).toHaveBeenCalledWith('hello');
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<InlineSearch {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(screen.getByPlaceholderText('대화 내 검색...'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onNext on Enter key', () => {
    const onNext = vi.fn();
    render(<InlineSearch {...defaultProps} onNext={onNext} />);
    fireEvent.keyDown(screen.getByPlaceholderText('대화 내 검색...'), { key: 'Enter' });
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onPrev on Shift+Enter key', () => {
    const onPrev = vi.fn();
    render(<InlineSearch {...defaultProps} onPrev={onPrev} />);
    fireEvent.keyDown(screen.getByPlaceholderText('대화 내 검색...'), { key: 'Enter', shiftKey: true });
    expect(onPrev).toHaveBeenCalled();
  });

  it('next/prev buttons are disabled when matchCount is 0', () => {
    render(<InlineSearch {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const prevBtn = buttons.find(b => b.getAttribute('aria-label') === '이전 결과');
    const nextBtn = buttons.find(b => b.getAttribute('aria-label') === '다음 결과');
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });

  it('next/prev buttons are enabled when matchCount > 0', () => {
    render(<InlineSearch {...defaultProps} query="test" matchCount={3} />);
    const buttons = screen.getAllByRole('button');
    const prevBtn = buttons.find(b => b.getAttribute('aria-label') === '이전 결과');
    const nextBtn = buttons.find(b => b.getAttribute('aria-label') === '다음 결과');
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<InlineSearch {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('검색 닫기'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty count string when query is empty', () => {
    const { container } = render(<InlineSearch {...defaultProps} query="" matchCount={0} />);
    const countSpan = container.querySelector('.inline-search-count');
    expect(countSpan?.textContent).toBe('');
  });

  it('shows 1/1 for single match at index 0', () => {
    render(<InlineSearch {...defaultProps} query="test" matchCount={1} currentMatchIndex={0} />);
    expect(screen.getByText('1/1')).toBeInTheDocument();
  });

  it('has role="search" with correct aria-label', () => {
    render(<InlineSearch {...defaultProps} />);
    expect(screen.getByRole('search', { name: '대화 내 검색' })).toBeInTheDocument();
  });

  it('has inline-search-bar class on container', () => {
    const { container } = render(<InlineSearch {...defaultProps} />);
    expect(container.querySelector('.inline-search-bar')).toBeTruthy();
  });

  it('has inline-search-input class on input', () => {
    const { container } = render(<InlineSearch {...defaultProps} />);
    expect(container.querySelector('.inline-search-input')).toBeTruthy();
  });

  it('prev button has correct title attribute', () => {
    render(<InlineSearch {...defaultProps} />);
    const prevBtn = screen.getByLabelText('이전 결과');
    expect(prevBtn.getAttribute('title')).toBe('이전 결과 (Shift+Enter)');
  });

  it('next button has correct title attribute', () => {
    render(<InlineSearch {...defaultProps} />);
    const nextBtn = screen.getByLabelText('다음 결과');
    expect(nextBtn.getAttribute('title')).toBe('다음 결과 (Enter)');
  });

  it('close button has correct title attribute', () => {
    render(<InlineSearch {...defaultProps} />);
    const closeBtn = screen.getByLabelText('검색 닫기');
    expect(closeBtn.getAttribute('title')).toBe('닫기 (Esc)');
  });

  it('does not call onNext or onPrev on non-special keys', () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    render(<InlineSearch {...defaultProps} onNext={onNext} onPrev={onPrev} />);
    fireEvent.keyDown(screen.getByPlaceholderText('대화 내 검색...'), { key: 'a' });
    fireEvent.keyDown(screen.getByPlaceholderText('대화 내 검색...'), { key: 'ArrowDown' });
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('calls onPrev when prev button is clicked', () => {
    const onPrev = vi.fn();
    render(<InlineSearch {...defaultProps} query="test" matchCount={3} onPrev={onPrev} />);
    fireEvent.click(screen.getByLabelText('이전 결과'));
    expect(onPrev).toHaveBeenCalled();
  });

  it('calls onNext when next button is clicked', () => {
    const onNext = vi.fn();
    render(<InlineSearch {...defaultProps} query="test" matchCount={3} onNext={onNext} />);
    fireEvent.click(screen.getByLabelText('다음 결과'));
    expect(onNext).toHaveBeenCalled();
  });
});
