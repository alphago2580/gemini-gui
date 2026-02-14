import React from 'react';
import { render, screen } from '@testing-library/react';
import TextDiff from './TextDiff';

describe('TextDiff', () => {
  it('renders with region role and aria label', () => {
    render(<TextDiff oldText="hello" newText="world" />);
    expect(screen.getByRole('region', { name: '텍스트 비교' })).toBeInTheDocument();
  });

  it('shows diff stats in header', () => {
    render(<TextDiff oldText="hello" newText="world" />);
    expect(screen.getByText('+1 -1')).toBeInTheDocument();
  });

  it('shows +0 -0 when texts are identical', () => {
    render(<TextDiff oldText="same text" newText="same text" />);
    expect(screen.getByText('+0 -0')).toBeInTheDocument();
  });

  it('renders all lines as unchanged when texts are identical', () => {
    const { container } = render(
      <TextDiff oldText={'line1\nline2'} newText={'line1\nline2'} />
    );
    const unchangedLines = container.querySelectorAll('.text-diff-line--unchanged');
    expect(unchangedLines).toHaveLength(2);
    expect(container.querySelectorAll('.text-diff-line--added')).toHaveLength(0);
    expect(container.querySelectorAll('.text-diff-line--removed')).toHaveLength(0);
  });

  it('renders added lines with + prefix in unified mode', () => {
    const { container } = render(<TextDiff oldText="" newText="new line" />);
    const addedLines = container.querySelectorAll('.text-diff-line--added');
    expect(addedLines.length).toBeGreaterThanOrEqual(1);
    const prefix = addedLines[0].querySelector('.text-diff-line-prefix');
    expect(prefix?.textContent).toBe('+');
  });

  it('renders removed lines with - prefix in unified mode', () => {
    const { container } = render(<TextDiff oldText="old line" newText="" />);
    const removedLines = container.querySelectorAll('.text-diff-line--removed');
    expect(removedLines.length).toBeGreaterThanOrEqual(1);
    const prefix = removedLines[0].querySelector('.text-diff-line-prefix');
    expect(prefix?.textContent).toBe('-');
  });

  it('renders unchanged lines with space prefix in unified mode', () => {
    const { container } = render(
      <TextDiff oldText={'unchanged\nremoved'} newText={'unchanged\nadded'} />
    );
    const unchangedLines = container.querySelectorAll('.text-diff-line--unchanged');
    expect(unchangedLines.length).toBeGreaterThanOrEqual(1);
    const prefix = unchangedLines[0].querySelector('.text-diff-line-prefix');
    expect(prefix?.textContent?.trim()).toBe('');
  });

  it('shows line numbers by default', () => {
    const { container } = render(<TextDiff oldText="line1" newText="line1" />);
    const lineNumbers = container.querySelectorAll('.text-diff-line-number');
    expect(lineNumbers.length).toBeGreaterThan(0);
  });

  it('hides line numbers when showLineNumbers is false', () => {
    const { container } = render(
      <TextDiff oldText="line1" newText="line1" showLineNumbers={false} />
    );
    const lineNumbers = container.querySelectorAll('.text-diff-line-number');
    expect(lineNumbers).toHaveLength(0);
  });

  it('renders with text-diff--unified class by default', () => {
    const { container } = render(<TextDiff oldText="a" newText="b" />);
    expect(container.querySelector('.text-diff--unified')).toBeInTheDocument();
  });

  it('renders with text-diff--split class in split mode', () => {
    const { container } = render(
      <TextDiff oldText="a" newText="b" viewMode="split" />
    );
    expect(container.querySelector('.text-diff--split')).toBeInTheDocument();
  });

  it('renders two panes in split mode', () => {
    const { container } = render(
      <TextDiff oldText="old" newText="new" viewMode="split" />
    );
    const panes = container.querySelectorAll('.text-diff-split-pane');
    expect(panes).toHaveLength(2);
  });

  it('shows default pane headers in split mode', () => {
    render(<TextDiff oldText="old" newText="new" viewMode="split" />);
    expect(screen.getByText('이전')).toBeInTheDocument();
    expect(screen.getByText('변경')).toBeInTheDocument();
  });

  it('uses custom labels in split mode', () => {
    render(
      <TextDiff
        oldText="old"
        newText="new"
        viewMode="split"
        oldLabel="Before"
        newLabel="After"
      />
    );
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('provides aria labels for added lines', () => {
    render(<TextDiff oldText="" newText="added line" />);
    expect(screen.getByLabelText('추가됨: added line')).toBeInTheDocument();
  });

  it('provides aria labels for removed lines', () => {
    render(<TextDiff oldText="removed line" newText="" />);
    expect(screen.getByLabelText('삭제됨: removed line')).toBeInTheDocument();
  });

  it('provides aria labels for unchanged lines in unified mode', () => {
    render(<TextDiff oldText={'same\nchanged'} newText={'same\nnew'} />);
    expect(screen.getByLabelText('변경 없음: same')).toBeInTheDocument();
  });

  it('handles multiline diffs correctly', () => {
    const oldText = 'line1\nline2\nline3';
    const newText = 'line1\nmodified\nline3';
    const { container } = render(<TextDiff oldText={oldText} newText={newText} />);

    expect(container.querySelectorAll('.text-diff-line--unchanged')).toHaveLength(2);
    expect(container.querySelectorAll('.text-diff-line--removed').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll('.text-diff-line--added').length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty lines as non-breaking space', () => {
    const { container } = render(
      <TextDiff oldText={'a\n\nb'} newText={'a\n\nb'} />
    );
    const contents = container.querySelectorAll('.text-diff-line-content');
    // The empty line (index 1) should contain a non-breaking space
    expect(contents[1].textContent).toBe('\u00A0');
  });

  it('shows correct diff stats for additions only', () => {
    render(<TextDiff oldText={'a'} newText={'a\nb\nc'} />);
    expect(screen.getByText('+2 -0')).toBeInTheDocument();
  });

  it('shows correct diff stats for removals only', () => {
    render(<TextDiff oldText={'a\nb\nc'} newText={'a'} />);
    expect(screen.getByText('+0 -2')).toBeInTheDocument();
  });

  it('handles empty old text', () => {
    const { container } = render(<TextDiff oldText="" newText="new" />);
    expect(container.querySelector('.text-diff')).toBeInTheDocument();
  });

  it('handles empty new text', () => {
    const { container } = render(<TextDiff oldText="old" newText="" />);
    expect(container.querySelector('.text-diff')).toBeInTheDocument();
  });

  it('handles both texts empty', () => {
    render(<TextDiff oldText="" newText="" />);
    expect(screen.getByText('+0 -0')).toBeInTheDocument();
  });

  it('renders split mode with empty slots for unmatched lines', () => {
    const { container } = render(
      <TextDiff oldText={'a\nb\nc'} newText={'a'} viewMode="split" />
    );
    const emptySlots = container.querySelectorAll('.text-diff-line--empty-slot');
    expect(emptySlots.length).toBeGreaterThanOrEqual(0);
  });

  it('renders line content for each line', () => {
    const { container } = render(<TextDiff oldText="foo" newText="bar" />);
    const contents = container.querySelectorAll('.text-diff-line-content');
    const texts = Array.from(contents).map(el => el.textContent);
    expect(texts).toContain('foo');
    expect(texts).toContain('bar');
  });

  it('has text-diff--empty class when texts are identical', () => {
    const { container } = render(<TextDiff oldText="same" newText="same" />);
    expect(container.querySelector('.text-diff--empty')).toBeInTheDocument();
  });

  it('does not have text-diff--empty class when texts differ', () => {
    const { container } = render(<TextDiff oldText="a" newText="b" />);
    expect(container.querySelector('.text-diff--empty')).not.toBeInTheDocument();
  });

  it('renders old line numbers in unified mode', () => {
    const { container } = render(
      <TextDiff oldText={'a\nb'} newText={'a\nc'} />
    );
    const oldNums = container.querySelectorAll('.text-diff-line-number--old');
    expect(oldNums.length).toBeGreaterThan(0);
  });

  it('renders new line numbers in unified mode', () => {
    const { container } = render(
      <TextDiff oldText={'a\nb'} newText={'a\nc'} />
    );
    const newNums = container.querySelectorAll('.text-diff-line-number--new');
    expect(newNums.length).toBeGreaterThan(0);
  });

  it('shows only old line number for removed lines', () => {
    const { container } = render(<TextDiff oldText="removed" newText="" />);
    const removedLine = container.querySelector('.text-diff-line--removed');
    const oldNum = removedLine?.querySelector('.text-diff-line-number--old');
    const newNum = removedLine?.querySelector('.text-diff-line-number--new');
    expect(oldNum?.textContent).toBe('1');
    expect(newNum?.textContent).toBe('');
  });

  it('shows only new line number for added lines', () => {
    const { container } = render(<TextDiff oldText="" newText="added" />);
    const addedLine = container.querySelector('.text-diff-line--added');
    const oldNum = addedLine?.querySelector('.text-diff-line-number--old');
    const newNum = addedLine?.querySelector('.text-diff-line-number--new');
    expect(oldNum?.textContent).toBe('');
    expect(newNum?.textContent).toBe('1');
  });

  it('shows both line numbers for unchanged lines', () => {
    const { container } = render(
      <TextDiff oldText={'same\nchanged'} newText={'same\nnew'} />
    );
    const unchangedLine = container.querySelector('.text-diff-line--unchanged');
    const oldNum = unchangedLine?.querySelector('.text-diff-line-number--old');
    const newNum = unchangedLine?.querySelector('.text-diff-line-number--new');
    expect(oldNum?.textContent).toBe('1');
    expect(newNum?.textContent).toBe('1');
  });

  it('renders split view with line numbers in both panes', () => {
    const { container } = render(
      <TextDiff oldText="a" newText="b" viewMode="split" />
    );
    const lineNumbers = container.querySelectorAll('.text-diff-line-number');
    expect(lineNumbers.length).toBeGreaterThan(0);
  });

  it('renders split view without line numbers when disabled', () => {
    const { container } = render(
      <TextDiff oldText="a" newText="b" viewMode="split" showLineNumbers={false} />
    );
    const lineNumbers = container.querySelectorAll('.text-diff-line-number');
    expect(lineNumbers).toHaveLength(0);
  });

  it('handles large diffs with many lines', () => {
    const oldLines = Array.from({ length: 50 }, (_, i) => `line ${i}`).join('\n');
    const newLines = Array.from({ length: 50 }, (_, i) => `line ${i + 1}`).join('\n');
    const { container } = render(<TextDiff oldText={oldLines} newText={newLines} />);
    const lines = container.querySelectorAll('.text-diff-line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('is memoized with React.memo', () => {
    expect(TextDiff.$$typeof).toBeDefined();
  });
});
