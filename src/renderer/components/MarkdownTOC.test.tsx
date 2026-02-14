import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarkdownTOC, { extractHeadings } from './MarkdownTOC';

const simpleMarkdown = `# Introduction
Some text here.

## Getting Started
More text.

### Installation
Install instructions.

### Configuration
Config details.

## API Reference
API docs.
`;

const multiLevelMarkdown = `# Title
## Section 1
### Subsection 1.1
#### Detail 1.1.1
## Section 2
### Subsection 2.1
`;

const codeBlockMarkdown = `# Real Heading

\`\`\`markdown
# This is inside a code block
## Not a real heading
\`\`\`

## Another Real Heading
`;

const koreanMarkdown = `# 소개
## 시작하기
### 설치 방법
## 사용법
`;

describe('extractHeadings', () => {
  it('extracts headings from markdown text', () => {
    const headings = extractHeadings(simpleMarkdown, 1, 4);
    expect(headings).toHaveLength(5);
    expect(headings[0]).toEqual({ id: 'introduction', text: 'Introduction', level: 1 });
    expect(headings[1]).toEqual({ id: 'getting-started', text: 'Getting Started', level: 2 });
    expect(headings[2]).toEqual({ id: 'installation', text: 'Installation', level: 3 });
    expect(headings[3]).toEqual({ id: 'configuration', text: 'Configuration', level: 3 });
    expect(headings[4]).toEqual({ id: 'api-reference', text: 'API Reference', level: 2 });
  });

  it('respects minLevel and maxLevel filters', () => {
    const headings = extractHeadings(simpleMarkdown, 2, 3);
    expect(headings).toHaveLength(4);
    expect(headings.every(h => h.level >= 2 && h.level <= 3)).toBe(true);
  });

  it('skips headings inside fenced code blocks', () => {
    const headings = extractHeadings(codeBlockMarkdown, 1, 4);
    expect(headings).toHaveLength(2);
    expect(headings[0].text).toBe('Real Heading');
    expect(headings[1].text).toBe('Another Real Heading');
  });

  it('handles Korean text in headings', () => {
    const headings = extractHeadings(koreanMarkdown, 1, 4);
    expect(headings).toHaveLength(4);
    expect(headings[0].text).toBe('소개');
    expect(headings[1].text).toBe('시작하기');
    expect(headings[2].text).toBe('설치 방법');
    expect(headings[3].text).toBe('사용법');
  });

  it('returns empty array for text without headings', () => {
    const headings = extractHeadings('Just plain text.\nNo headings here.', 1, 6);
    expect(headings).toHaveLength(0);
  });

  it('returns empty array for empty string', () => {
    const headings = extractHeadings('', 1, 6);
    expect(headings).toHaveLength(0);
  });

  it('generates slug IDs from heading text', () => {
    const md = '# Hello World\n## Some Title Here';
    const headings = extractHeadings(md, 1, 6);
    expect(headings[0].id).toBe('hello-world');
    expect(headings[1].id).toBe('some-title-here');
  });

  it('handles headings up to level 6', () => {
    const md = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    const headings = extractHeadings(md, 1, 6);
    expect(headings).toHaveLength(6);
    expect(headings.map(h => h.level)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('does not match lines with more than 6 hashes', () => {
    const md = '####### Not a heading\n# Real heading';
    const headings = extractHeadings(md, 1, 6);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe('Real heading');
  });

  it('handles multiple code blocks correctly', () => {
    const md = `# Before
\`\`\`
# Inside first block
\`\`\`
## Between
\`\`\`
# Inside second block
\`\`\`
### After`;
    const headings = extractHeadings(md, 1, 6);
    expect(headings).toHaveLength(3);
    expect(headings.map(h => h.text)).toEqual(['Before', 'Between', 'After']);
  });

  it('generates fallback IDs for headings with only special characters', () => {
    const md = '# ???';
    const headings = extractHeadings(md, 1, 6);
    expect(headings).toHaveLength(1);
    expect(headings[0].id).toBe('heading-0');
  });
});

describe('MarkdownTOC', () => {
  it('renders headings as a list', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('API Reference')).toBeInTheDocument();
  });

  it('renders with nav element and aria-label', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', '목차');
  });

  it('renders header with TOC title', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    expect(screen.getByText('목차')).toBeInTheDocument();
  });

  it('shows empty message when no headings found', () => {
    render(<MarkdownTOC markdown="No headings here" />);
    expect(screen.getByText('제목이 없습니다')).toBeInTheDocument();
  });

  it('returns null when markdown has no headings and defaultCollapsed is true', () => {
    const { container } = render(
      <MarkdownTOC markdown="No headings here" defaultCollapsed={true} />
    );
    expect(container.querySelector('.markdown-toc')).toBeNull();
  });

  it('collapses and expands when header is clicked', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    const header = screen.getByRole('button', { name: '목차 접기/펼치기' });

    // Initially expanded
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Introduction')).toBeInTheDocument();

    // Collapse
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Introduction')).not.toBeInTheDocument();

    // Expand again
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Introduction')).toBeInTheDocument();
  });

  it('starts collapsed when defaultCollapsed is true', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} defaultCollapsed={true} />);
    const header = screen.getByRole('button', { name: '목차 접기/펼치기' });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Introduction')).not.toBeInTheDocument();
  });

  it('calls onHeadingClick when a heading is clicked', () => {
    const onHeadingClick = vi.fn();
    render(
      <MarkdownTOC markdown={simpleMarkdown} onHeadingClick={onHeadingClick} />
    );

    fireEvent.click(screen.getByText('Installation'));
    expect(onHeadingClick).toHaveBeenCalledWith({
      id: 'installation',
      text: 'Installation',
      level: 3,
    });
  });

  it('highlights active heading', () => {
    render(
      <MarkdownTOC markdown={simpleMarkdown} activeId="getting-started" />
    );

    const activeButton = screen.getByText('Getting Started');
    expect(activeButton).toHaveClass('markdown-toc-link--active');
    expect(activeButton).toHaveAttribute('aria-current', 'location');

    const inactiveButton = screen.getByText('Introduction');
    expect(inactiveButton).not.toHaveClass('markdown-toc-link--active');
    expect(inactiveButton).not.toHaveAttribute('aria-current');
  });

  it('applies correct level classes for indentation', () => {
    render(<MarkdownTOC markdown={multiLevelMarkdown} maxLevel={4} />);

    const title = screen.getByText('Title');
    expect(title).toHaveClass('markdown-toc-link--level-1');

    const section1 = screen.getByText('Section 1');
    expect(section1).toHaveClass('markdown-toc-link--level-2');

    const subsection = screen.getByText('Subsection 1.1');
    expect(subsection).toHaveClass('markdown-toc-link--level-3');

    const detail = screen.getByText('Detail 1.1.1');
    expect(detail).toHaveClass('markdown-toc-link--level-4');
  });

  it('filters headings by minLevel', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} minLevel={2} />);
    expect(screen.queryByText('Introduction')).not.toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('filters headings by maxLevel', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} maxLevel={2} />);
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.queryByText('Installation')).not.toBeInTheDocument();
    expect(screen.queryByText('Configuration')).not.toBeInTheDocument();
  });

  it('heading buttons have accessible labels', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    expect(screen.getByLabelText('Introduction(으)로 이동')).toBeInTheDocument();
    expect(screen.getByLabelText('Getting Started(으)로 이동')).toBeInTheDocument();
  });

  it('heading buttons have title attributes', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    const btn = screen.getByText('Introduction');
    expect(btn).toHaveAttribute('title', 'Introduction');
  });

  it('toggles with keyboard Enter on header', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    const header = screen.getByRole('button', { name: '목차 접기/펼치기' });

    fireEvent.keyDown(header, { key: 'Enter' });
    expect(header).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(header, { key: 'Enter' });
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles with keyboard Space on header', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    const header = screen.getByRole('button', { name: '목차 접기/펼치기' });

    fireEvent.keyDown(header, { key: ' ' });
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onHeadingClick on Enter key on heading button', () => {
    const onHeadingClick = vi.fn();
    render(
      <MarkdownTOC markdown={simpleMarkdown} onHeadingClick={onHeadingClick} />
    );

    const btn = screen.getByText('Configuration');
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(onHeadingClick).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Configuration' })
    );
  });

  it('calls onHeadingClick on Space key on heading button', () => {
    const onHeadingClick = vi.fn();
    render(
      <MarkdownTOC markdown={simpleMarkdown} onHeadingClick={onHeadingClick} />
    );

    const btn = screen.getByText('Configuration');
    fireEvent.keyDown(btn, { key: ' ' });
    expect(onHeadingClick).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Configuration' })
    );
  });

  it('does not crash when onHeadingClick is not provided', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    // Should not throw
    fireEvent.click(screen.getByText('Introduction'));
  });

  it('renders collapsed class when collapsed', () => {
    const { container } = render(
      <MarkdownTOC markdown={simpleMarkdown} defaultCollapsed={true} />
    );
    expect(container.querySelector('.markdown-toc--collapsed')).toBeInTheDocument();
  });

  it('does not render collapsed class when expanded', () => {
    const { container } = render(
      <MarkdownTOC markdown={simpleMarkdown} defaultCollapsed={false} />
    );
    expect(container.querySelector('.markdown-toc--collapsed')).toBeNull();
  });

  it('renders list items with correct role', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
  });

  it('handles Korean headings', () => {
    render(<MarkdownTOC markdown={koreanMarkdown} />);
    expect(screen.getByText('소개')).toBeInTheDocument();
    expect(screen.getByText('시작하기')).toBeInTheDocument();
    expect(screen.getByText('설치 방법')).toBeInTheDocument();
    expect(screen.getByText('사용법')).toBeInTheDocument();
  });

  it('ignores headings inside code blocks', () => {
    render(<MarkdownTOC markdown={codeBlockMarkdown} />);
    expect(screen.getByText('Real Heading')).toBeInTheDocument();
    expect(screen.getByText('Another Real Heading')).toBeInTheDocument();
    expect(screen.queryByText('This is inside a code block')).not.toBeInTheDocument();
    expect(screen.queryByText('Not a real heading')).not.toBeInTheDocument();
  });

  it('renders correct number of buttons (headings + toggle)', () => {
    render(<MarkdownTOC markdown={simpleMarkdown} />);
    // 5 heading buttons + 1 toggle header button
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);
  });

  it('updates when markdown prop changes', () => {
    const { rerender } = render(
      <MarkdownTOC markdown="# First" />
    );
    expect(screen.getByText('First')).toBeInTheDocument();

    rerender(<MarkdownTOC markdown="# Second" />);
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
