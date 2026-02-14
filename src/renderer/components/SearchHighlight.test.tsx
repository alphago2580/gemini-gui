import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SearchHighlight from './SearchHighlight';

describe('SearchHighlight', () => {
  it('renders plain text when query is empty', () => {
    const { container } = render(
      <SearchHighlight text="Hello world" query="" />
    );
    expect(container.textContent).toBe('Hello world');
    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });

  it('renders plain text when there are no matches', () => {
    const { container } = render(
      <SearchHighlight text="Hello world" query="xyz" />
    );
    expect(container.textContent).toBe('Hello world');
    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });

  it('highlights a single match', () => {
    const { container } = render(
      <SearchHighlight text="Hello world" query="world" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('world');
    expect(marks[0]).toHaveClass('search-highlight-match');
  });

  it('highlights multiple matches', () => {
    const { container } = render(
      <SearchHighlight text="foo bar foo baz foo" query="foo" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(3);
    marks.forEach(mark => {
      expect(mark.textContent).toBe('foo');
    });
  });

  it('preserves text between matches', () => {
    const { container } = render(
      <SearchHighlight text="abc def abc" query="abc" />
    );
    expect(container.textContent).toBe('abc def abc');
  });

  it('is case-insensitive by default', () => {
    const { container } = render(
      <SearchHighlight text="Hello HELLO hello" query="hello" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(3);
    expect(marks[0].textContent).toBe('Hello');
    expect(marks[1].textContent).toBe('HELLO');
    expect(marks[2].textContent).toBe('hello');
  });

  it('supports case-sensitive matching', () => {
    const { container } = render(
      <SearchHighlight text="Hello HELLO hello" query="hello" caseSensitive={true} />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('hello');
  });

  it('escapes regex special characters in query', () => {
    const { container } = render(
      <SearchHighlight text="price is $10.00 (USD)" query="$10.00" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('$10.00');
  });

  it('handles query with parentheses', () => {
    const { container } = render(
      <SearchHighlight text="call fn(x)" query="fn(x)" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('fn(x)');
  });

  it('handles query with brackets', () => {
    const { container } = render(
      <SearchHighlight text="array[0]" query="[0]" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('[0]');
  });

  it('highlights active match with active class', () => {
    const { container } = render(
      <SearchHighlight text="aa bb aa" query="aa" activeMatchIndex={1} />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0]).not.toHaveClass('search-highlight-active');
    expect(marks[1]).toHaveClass('search-highlight-active');
  });

  it('sets aria-current on active match', () => {
    const { container } = render(
      <SearchHighlight text="ab ab ab" query="ab" activeMatchIndex={0} />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks[0]).toHaveAttribute('aria-current', 'true');
    expect(marks[1]).not.toHaveAttribute('aria-current');
    expect(marks[2]).not.toHaveAttribute('aria-current');
  });

  it('sets data-match-index on each match', () => {
    const { container } = render(
      <SearchHighlight text="x y x y x" query="x" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks[0]).toHaveAttribute('data-match-index', '0');
    expect(marks[1]).toHaveAttribute('data-match-index', '1');
    expect(marks[2]).toHaveAttribute('data-match-index', '2');
  });

  it('calls onMatchCount with number of matches', () => {
    const onMatchCount = vi.fn();
    render(
      <SearchHighlight text="a b a c a" query="a" onMatchCount={onMatchCount} />
    );
    expect(onMatchCount).toHaveBeenCalledWith(3);
  });

  it('calls onMatchCount with 0 when no matches', () => {
    const onMatchCount = vi.fn();
    render(
      <SearchHighlight text="hello" query="xyz" onMatchCount={onMatchCount} />
    );
    expect(onMatchCount).toHaveBeenCalledWith(0);
  });

  it('calls onMatchCount with 0 when query is empty', () => {
    const onMatchCount = vi.fn();
    render(
      <SearchHighlight text="hello" query="" onMatchCount={onMatchCount} />
    );
    expect(onMatchCount).toHaveBeenCalledWith(0);
  });

  it('uses custom highlight class name', () => {
    const { container } = render(
      <SearchHighlight text="test match" query="match" highlightClassName="custom-hl" />
    );
    const mark = container.querySelector('mark');
    expect(mark).toHaveClass('custom-hl');
    expect(mark).not.toHaveClass('search-highlight-match');
  });

  it('uses custom active class name', () => {
    const { container } = render(
      <SearchHighlight
        text="test match"
        query="match"
        activeMatchIndex={0}
        activeClassName="custom-active"
      />
    );
    const mark = container.querySelector('mark');
    expect(mark).toHaveClass('custom-active');
    expect(mark).not.toHaveClass('search-highlight-active');
  });

  it('renders with aria-label showing match count', () => {
    const { container } = render(
      <SearchHighlight text="a b a" query="a" />
    );
    const wrapper = container.querySelector('.search-highlight-text');
    expect(wrapper).toHaveAttribute('aria-label', '검색 결과 2건');
  });

  it('renders empty text without errors', () => {
    const { container } = render(
      <SearchHighlight text="" query="test" />
    );
    expect(container.textContent).toBe('');
    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });

  it('handles query that matches entire text', () => {
    const { container } = render(
      <SearchHighlight text="hello" query="hello" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('hello');
    expect(container.textContent).toBe('hello');
  });

  it('handles overlapping match positions correctly (non-overlapping)', () => {
    const { container } = render(
      <SearchHighlight text="aaa" query="aa" />
    );
    // "aa" in "aaa" should match once at index 0, next search starts at 2
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('aa');
  });

  it('handles Korean text search', () => {
    const { container } = render(
      <SearchHighlight text="안녕하세요 반갑습니다 안녕하세요" query="안녕하세요" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    marks.forEach(mark => {
      expect(mark.textContent).toBe('안녕하세요');
    });
  });

  it('does not highlight when activeMatchIndex exceeds match count', () => {
    const { container } = render(
      <SearchHighlight text="abc abc" query="abc" activeMatchIndex={5} />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    marks.forEach(mark => {
      expect(mark).not.toHaveClass('search-highlight-active');
      expect(mark).not.toHaveAttribute('aria-current');
    });
  });

  it('handles single character query', () => {
    const { container } = render(
      <SearchHighlight text="banana" query="a" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(3);
  });

  it('handles query at start of text', () => {
    const { container } = render(
      <SearchHighlight text="hello world" query="hello" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('hello');
  });

  it('handles query at end of text', () => {
    const { container } = render(
      <SearchHighlight text="hello world" query="world" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('world');
  });

  it('has search-highlight-text class on wrapper', () => {
    const { container } = render(
      <SearchHighlight text="test" query="" />
    );
    expect(container.querySelector('.search-highlight-text')).toBeInTheDocument();
  });

  it('preserves whitespace in text', () => {
    const { container } = render(
      <SearchHighlight text="hello   world" query="world" />
    );
    expect(container.textContent).toBe('hello   world');
  });

  it('handles query with dot', () => {
    const { container } = render(
      <SearchHighlight text="file.txt and file.doc" query="." />
    );
    // "." should be treated as literal, not regex wildcard
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    marks.forEach(mark => {
      expect(mark.textContent).toBe('.');
    });
  });

  it('handles query with plus sign', () => {
    const { container } = render(
      <SearchHighlight text="a + b = c" query="+" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('+');
  });

  it('handles query with asterisk', () => {
    const { container } = render(
      <SearchHighlight text="a * b" query="*" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('*');
  });
});
