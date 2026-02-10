import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('Plain text', () => {
    it('renders plain text as paragraph', () => {
      render(<MarkdownRenderer content="Hello world" />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders multiple lines as separate paragraphs', () => {
      render(<MarkdownRenderer content={'Line 1\n\nLine 2'} />);
      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
    });
  });

  describe('Headings', () => {
    it('renders h1 heading', () => {
      const { container } = render(<MarkdownRenderer content="# Title" />);
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1?.textContent).toBe('Title');
    });

    it('renders h2 heading', () => {
      const { container } = render(<MarkdownRenderer content="## Subtitle" />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2?.textContent).toBe('Subtitle');
    });

    it('renders h3 heading', () => {
      const { container } = render(<MarkdownRenderer content="### Section" />);
      const h3 = container.querySelector('h3');
      expect(h3).toBeInTheDocument();
      expect(h3?.textContent).toBe('Section');
    });

    it('renders h4-h6 headings', () => {
      const { container } = render(
        <MarkdownRenderer content={'#### H4\n##### H5\n###### H6'} />
      );
      expect(container.querySelector('h4')?.textContent).toBe('H4');
      expect(container.querySelector('h5')?.textContent).toBe('H5');
      expect(container.querySelector('h6')?.textContent).toBe('H6');
    });
  });

  describe('Inline formatting', () => {
    it('renders bold text with **', () => {
      const { container } = render(<MarkdownRenderer content="This is **bold** text" />);
      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toBe('bold');
    });

    it('renders italic text with *', () => {
      const { container } = render(<MarkdownRenderer content="This is *italic* text" />);
      const em = container.querySelector('em');
      expect(em).toBeInTheDocument();
      expect(em?.textContent).toBe('italic');
    });

    it('renders inline code with backticks', () => {
      const { container } = render(<MarkdownRenderer content="Use `const x = 1` here" />);
      const code = container.querySelector('.md-inline-code');
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toBe('const x = 1');
    });

    it('renders links', () => {
      const { container } = render(
        <MarkdownRenderer content="Visit [Google](https://google.com)" />
      );
      const link = container.querySelector('a.md-link');
      expect(link).toBeInTheDocument();
      expect(link?.textContent).toBe('Google');
      expect(link?.getAttribute('href')).toBe('https://google.com');
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('renders mixed inline formatting', () => {
      const { container } = render(
        <MarkdownRenderer content="**Bold** and *italic* and `code`" />
      );
      expect(container.querySelector('strong')?.textContent).toBe('Bold');
      expect(container.querySelector('em')?.textContent).toBe('italic');
      expect(container.querySelector('.md-inline-code')?.textContent).toBe('code');
    });
  });

  describe('Code blocks', () => {
    it('renders fenced code block', () => {
      const content = '```\nconst x = 1;\nconsole.log(x);\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const pre = container.querySelector('pre.md-code-block');
      expect(pre).toBeInTheDocument();
      expect(pre?.querySelector('code')?.textContent).toBe('const x = 1;\nconsole.log(x);');
    });

    it('renders code block with language label', () => {
      const content = '```javascript\nconst x = 1;\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const langLabel = container.querySelector('.md-code-lang');
      expect(langLabel).toBeInTheDocument();
      expect(langLabel?.textContent).toBe('javascript');
    });

    it('renders code block without language label when no language specified', () => {
      const content = '```\nplain code\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const langLabel = container.querySelector('.md-code-lang');
      expect(langLabel).not.toBeInTheDocument();
    });

    it('renders multiple code blocks', () => {
      const content = '```python\nprint("hello")\n```\n\nSome text\n\n```js\nalert("hi")\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const codeBlocks = container.querySelectorAll('pre.md-code-block');
      expect(codeBlocks.length).toBe(2);
    });
  });

  describe('Lists', () => {
    it('renders unordered list with -', () => {
      const content = '- Item 1\n- Item 2\n- Item 3';
      const { container } = render(<MarkdownRenderer content={content} />);
      const ul = container.querySelector('ul.md-list');
      expect(ul).toBeInTheDocument();
      const items = ul?.querySelectorAll('li');
      expect(items?.length).toBe(3);
      expect(items?.[0].textContent).toBe('Item 1');
    });

    it('renders unordered list with *', () => {
      const content = '* Apple\n* Banana';
      const { container } = render(<MarkdownRenderer content={content} />);
      const ul = container.querySelector('ul.md-list');
      expect(ul).toBeInTheDocument();
      const items = ul?.querySelectorAll('li');
      expect(items?.length).toBe(2);
    });

    it('renders ordered list', () => {
      const content = '1. First\n2. Second\n3. Third';
      const { container } = render(<MarkdownRenderer content={content} />);
      const ol = container.querySelector('ol.md-list');
      expect(ol).toBeInTheDocument();
      const items = ol?.querySelectorAll('li');
      expect(items?.length).toBe(3);
      expect(items?.[0].textContent).toBe('First');
    });
  });

  describe('Blockquote', () => {
    it('renders blockquote', () => {
      const { container } = render(<MarkdownRenderer content="> This is a quote" />);
      const bq = container.querySelector('blockquote.md-blockquote');
      expect(bq).toBeInTheDocument();
      expect(bq?.textContent).toBe('This is a quote');
    });
  });

  describe('Horizontal rule', () => {
    it('renders --- as horizontal rule', () => {
      const { container } = render(<MarkdownRenderer content="---" />);
      const hr = container.querySelector('hr.md-hr');
      expect(hr).toBeInTheDocument();
    });

    it('renders *** as horizontal rule', () => {
      const { container } = render(<MarkdownRenderer content="***" />);
      const hr = container.querySelector('hr.md-hr');
      expect(hr).toBeInTheDocument();
    });
  });

  describe('Complex content', () => {
    it('renders mixed content with headers, code, and lists', () => {
      const content = [
        '# Guide',
        '',
        'Here is a **code example**:',
        '',
        '```typescript',
        'function greet(name: string) {',
        '  return `Hello, ${name}!`;',
        '}',
        '```',
        '',
        'Steps:',
        '1. Write the code',
        '2. Run `npm test`',
        '3. Deploy',
      ].join('\n');

      const { container } = render(<MarkdownRenderer content={content} />);
      expect(container.querySelector('h1')?.textContent).toBe('Guide');
      expect(container.querySelector('strong')?.textContent).toBe('code example');
      expect(container.querySelector('pre.md-code-block')).toBeInTheDocument();
      expect(container.querySelector('.md-code-lang')?.textContent).toBe('typescript');
      expect(container.querySelector('ol.md-list')).toBeInTheDocument();
      expect(container.querySelectorAll('li').length).toBe(3);
    });

    it('renders empty content without errors', () => {
      const { container } = render(<MarkdownRenderer content="" />);
      expect(container.querySelector('.md-rendered')).toBeInTheDocument();
    });

    it('preserves code block content exactly', () => {
      const code = '  if (x) {\n    console.log(x);\n  }';
      const content = '```\n' + code + '\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      expect(container.querySelector('pre code')?.textContent).toBe(code);
    });
  });

  describe('Syntax highlighting', () => {
    it('applies syntax highlighting spans to code blocks with language', () => {
      const content = '```javascript\nconst x = 1;\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const keywordSpan = container.querySelector('.sh-keyword');
      expect(keywordSpan).toBeInTheDocument();
      expect(keywordSpan?.textContent).toBe('const');
    });

    it('highlights numbers in code blocks', () => {
      const content = '```js\nconst x = 42;\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const numberSpan = container.querySelector('.sh-number');
      expect(numberSpan).toBeInTheDocument();
      expect(numberSpan?.textContent).toBe('42');
    });

    it('highlights strings in code blocks', () => {
      const content = '```python\nprint("hello")\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const stringSpan = container.querySelector('.sh-string');
      expect(stringSpan).toBeInTheDocument();
    });

    it('does not apply highlighting when no language specified', () => {
      const content = '```\nconst x = 1;\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const highlightSpan = container.querySelector('[class^="sh-"]');
      expect(highlightSpan).not.toBeInTheDocument();
    });

    it('preserves code text content with highlighting', () => {
      const content = '```js\nconst sum = (a, b) => a + b;\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      const code = container.querySelector('code');
      expect(code?.textContent).toBe('const sum = (a, b) => a + b;');
    });
  });

  describe('Math rendering', () => {
    describe('Inline math', () => {
      it('renders inline math with $...$ delimiters', () => {
        const { container } = render(
          <MarkdownRenderer content="The formula $E = mc^2$ is famous" />
        );
        const mathSpan = container.querySelector('.math-inline');
        expect(mathSpan).toBeInTheDocument();
      });

      it('renders Greek letters in inline math', () => {
        const { container } = render(
          <MarkdownRenderer content={"The angle $\\alpha$ is small"} />
        );
        const mathSpan = container.querySelector('.math-inline');
        expect(mathSpan).toBeInTheDocument();
        expect(mathSpan?.textContent).toContain('\u03B1');
      });

      it('renders superscripts in inline math', () => {
        const { container } = render(
          <MarkdownRenderer content="Calculate $x^2$" />
        );
        const mathSpan = container.querySelector('.math-inline');
        expect(mathSpan).toBeInTheDocument();
        expect(mathSpan?.textContent).toContain('\u00B2');
      });

      it('renders math symbols in inline math', () => {
        const { container } = render(
          <MarkdownRenderer content={"For all $x \\leq y$"} />
        );
        const mathSpan = container.querySelector('.math-inline');
        expect(mathSpan).toBeInTheDocument();
        expect(mathSpan?.textContent).toContain('\u2264');
      });

      it('adds aria-label for accessibility', () => {
        const { container } = render(
          <MarkdownRenderer content="Value $x^2$" />
        );
        const mathSpan = container.querySelector('.math-inline');
        expect(mathSpan?.getAttribute('aria-label')).toBe('수식: x^2');
      });

      it('does not render $5 as math (lone dollar)', () => {
        const { container } = render(
          <MarkdownRenderer content="Price is $5" />
        );
        const mathSpan = container.querySelector('.math-inline');
        // $5 is a single char after $, but our regex requires non-space non-$ start
        // $5 should not match because there's no closing $
        expect(mathSpan).not.toBeInTheDocument();
      });
    });

    describe('Block math', () => {
      it('renders block math with $$ delimiters', () => {
        const content = '$$\nx^2 + y^2 = z^2\n$$';
        const { container } = render(<MarkdownRenderer content={content} />);
        const mathBlock = container.querySelector('.math-block');
        expect(mathBlock).toBeInTheDocument();
      });

      it('renders single-line block math', () => {
        const content = '$$ E = mc^2 $$';
        const { container } = render(<MarkdownRenderer content={content} />);
        const mathBlock = container.querySelector('.math-block');
        expect(mathBlock).toBeInTheDocument();
      });

      it('renders fraction in block math', () => {
        const content = '$$\n\\frac{a}{b}\n$$';
        const { container } = render(<MarkdownRenderer content={content} />);
        const mathBlock = container.querySelector('.math-block');
        expect(mathBlock).toBeInTheDocument();
        expect(mathBlock?.querySelector('.math-frac')).toBeInTheDocument();
      });

      it('renders sqrt in block math', () => {
        const content = '$$\n\\sqrt{x}\n$$';
        const { container } = render(<MarkdownRenderer content={content} />);
        const mathBlock = container.querySelector('.math-block');
        expect(mathBlock).toBeInTheDocument();
        expect(mathBlock?.textContent).toContain('\u221A');
      });

      it('adds role="math" for accessibility', () => {
        const content = '$$\nx^2\n$$';
        const { container } = render(<MarkdownRenderer content={content} />);
        const mathBlock = container.querySelector('[role="math"]');
        expect(mathBlock).toBeInTheDocument();
      });

      it('adds aria-label with original LaTeX', () => {
        const content = '$$\nx^2 + y^2 = z^2\n$$';
        const { container } = render(<MarkdownRenderer content={content} />);
        const mathBlock = container.querySelector('.math-block');
        expect(mathBlock?.getAttribute('aria-label')).toBe('수식: x^2 + y^2 = z^2');
      });
    });

    describe('Math with other Markdown', () => {
      it('renders math alongside text and code', () => {
        const content = [
          '# Quadratic Formula',
          '',
          'The solution is $x = \\frac{-b}{2a}$.',
          '',
          '```python',
          'import math',
          '```',
          '',
          '$$',
          'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
          '$$',
        ].join('\n');

        const { container } = render(<MarkdownRenderer content={content} />);
        expect(container.querySelector('h1')).toBeInTheDocument();
        expect(container.querySelector('.math-inline')).toBeInTheDocument();
        expect(container.querySelector('pre.md-code-block')).toBeInTheDocument();
        expect(container.querySelector('.math-block')).toBeInTheDocument();
      });

      it('does not parse math inside code blocks', () => {
        const content = '```\n$x^2$\n```';
        const { container } = render(<MarkdownRenderer content={content} />);
        expect(container.querySelector('.math-inline')).not.toBeInTheDocument();
        expect(container.querySelector('pre code')?.textContent).toBe('$x^2$');
      });
    });
  });

  describe('Copy button', () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText },
      });
      mockWriteText.mockClear();
    });

    it('renders copy button on code blocks', () => {
      const content = '```js\nconst x = 1;\n```';
      render(<MarkdownRenderer content={content} />);
      expect(screen.getByLabelText('코드 복사')).toBeInTheDocument();
    });

    it('renders copy button on code blocks without language', () => {
      const content = '```\nplain code\n```';
      render(<MarkdownRenderer content={content} />);
      expect(screen.getByLabelText('코드 복사')).toBeInTheDocument();
    });

    it('copies code to clipboard on click', async () => {
      const content = '```js\nconst x = 1;\n```';
      render(<MarkdownRenderer content={content} />);
      fireEvent.click(screen.getByLabelText('코드 복사'));
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('const x = 1;');
      });
    });

    it('shows copied feedback after clicking', async () => {
      const content = '```js\nconst x = 1;\n```';
      render(<MarkdownRenderer content={content} />);
      fireEvent.click(screen.getByLabelText('코드 복사'));
      await waitFor(() => {
        expect(screen.getByLabelText('복사됨')).toBeInTheDocument();
      });
    });

    it('shows copy text initially, not checkmark', () => {
      const content = '```python\nprint("hi")\n```';
      render(<MarkdownRenderer content={content} />);
      const btn = screen.getByLabelText('코드 복사');
      expect(btn.textContent).toBe('복사');
    });

    it('renders copy button on each code block when multiple exist', () => {
      const content = '```js\na\n```\n\ntext\n\n```py\nb\n```';
      render(<MarkdownRenderer content={content} />);
      const buttons = screen.getAllByLabelText('코드 복사');
      expect(buttons.length).toBe(2);
    });
  });

  describe('Tables', () => {
    it('renders a simple table', () => {
      const content = '| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |';
      const { container } = render(<MarkdownRenderer content={content} />);
      const table = container.querySelector('table.md-table');
      expect(table).toBeInTheDocument();
    });

    it('renders table headers', () => {
      const content = '| Name | Age |\n|------|-----|\n| Alice | 30 |';
      const { container } = render(<MarkdownRenderer content={content} />);
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBe(2);
      expect(headers[0].textContent).toBe('Name');
      expect(headers[1].textContent).toBe('Age');
    });

    it('renders table body cells', () => {
      const content = '| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |';
      const { container } = render(<MarkdownRenderer content={content} />);
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBe(4);
      expect(cells[0].textContent).toBe('Alice');
      expect(cells[1].textContent).toBe('30');
      expect(cells[2].textContent).toBe('Bob');
      expect(cells[3].textContent).toBe('25');
    });

    it('renders inline markdown in table cells', () => {
      const content = '| Feature | Status |\n|---------|--------|\n| **Bold** | `done` |';
      const { container } = render(<MarkdownRenderer content={content} />);
      const bold = container.querySelector('td strong');
      expect(bold).toBeInTheDocument();
      expect(bold?.textContent).toBe('Bold');
      const code = container.querySelector('td .md-inline-code');
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toBe('done');
    });

    it('supports right-aligned columns', () => {
      const content = '| Name | Price |\n|------|------:|\n| Item | 100 |';
      const { container } = render(<MarkdownRenderer content={content} />);
      const headers = container.querySelectorAll('th');
      expect(headers[1].style.textAlign).toBe('right');
      const cells = container.querySelectorAll('td');
      expect(cells[1].style.textAlign).toBe('right');
    });

    it('supports center-aligned columns', () => {
      const content = '| Name | Score |\n|------|:-----:|\n| Test | 95 |';
      const { container } = render(<MarkdownRenderer content={content} />);
      const headers = container.querySelectorAll('th');
      expect(headers[1].style.textAlign).toBe('center');
    });

    it('handles empty cells', () => {
      const content = '| A | B |\n|---|---|\n| x |  |';
      const { container } = render(<MarkdownRenderer content={content} />);
      const cells = container.querySelectorAll('td');
      expect(cells[0].textContent).toBe('x');
      expect(cells[1].textContent).toBe('');
    });

    it('renders table with text before and after', () => {
      const content = 'Before table\n\n| H1 | H2 |\n|----|----|\n| A | B |\n\nAfter table';
      const { container } = render(<MarkdownRenderer content={content} />);
      expect(container.querySelector('table.md-table')).toBeInTheDocument();
      expect(screen.getByText('Before table')).toBeInTheDocument();
      expect(screen.getByText('After table')).toBeInTheDocument();
    });

    it('renders multiple tables', () => {
      const content = '| A |\n|---|\n| 1 |\n\nText\n\n| B |\n|---|\n| 2 |';
      const { container } = render(<MarkdownRenderer content={content} />);
      const tables = container.querySelectorAll('table.md-table');
      expect(tables.length).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('renders blockquote with inline formatting', () => {
      const { container } = render(
        <MarkdownRenderer content="> This is **bold** in a quote" />
      );
      const bq = container.querySelector('blockquote.md-blockquote');
      expect(bq).toBeInTheDocument();
      const strong = bq?.querySelector('strong');
      expect(strong?.textContent).toBe('bold');
    });

    it('renders list items with inline code', () => {
      const content = '- Use `npm install`\n- Run `npm test`';
      const { container } = render(<MarkdownRenderer content={content} />);
      const codes = container.querySelectorAll('.md-inline-code');
      expect(codes.length).toBe(2);
      expect(codes[0].textContent).toBe('npm install');
      expect(codes[1].textContent).toBe('npm test');
    });

    it('transitions from unordered to ordered list', () => {
      const content = '- Item A\n- Item B\n1. First\n2. Second';
      const { container } = render(<MarkdownRenderer content={content} />);
      const ul = container.querySelector('ul.md-list');
      const ol = container.querySelector('ol.md-list');
      expect(ul).toBeInTheDocument();
      expect(ol).toBeInTheDocument();
    });

    it('renders ___ as horizontal rule', () => {
      const { container } = render(<MarkdownRenderer content="___" />);
      const hr = container.querySelector('hr.md-hr');
      expect(hr).toBeInTheDocument();
    });

    it('renders headings with inline formatting', () => {
      const { container } = render(
        <MarkdownRenderer content="## A **bold** heading" />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      const strong = h2?.querySelector('strong');
      expect(strong?.textContent).toBe('bold');
    });

    it('handles code block immediately after paragraph without blank line', () => {
      const content = 'Some text\n```js\nconst x = 1;\n```';
      const { container } = render(<MarkdownRenderer content={content} />);
      expect(screen.getByText('Some text')).toBeInTheDocument();
      expect(container.querySelector('pre.md-code-block')).toBeInTheDocument();
    });

    it('renders only-newline content without crashing', () => {
      const { container } = render(<MarkdownRenderer content={'\n\n\n'} />);
      const rendered = container.querySelector('.md-rendered');
      expect(rendered).toBeInTheDocument();
      // No code blocks, tables, or heading elements should be produced
      expect(rendered?.querySelector('pre')).not.toBeInTheDocument();
      expect(rendered?.querySelector('table')).not.toBeInTheDocument();
      expect(rendered?.querySelector('h1')).not.toBeInTheDocument();
    });

    it('renders link inside a list item', () => {
      const content = '- Visit [docs](https://docs.example.com)';
      const { container } = render(<MarkdownRenderer content={content} />);
      const link = container.querySelector('li a.md-link');
      expect(link).toBeInTheDocument();
      expect(link?.textContent).toBe('docs');
      expect(link?.getAttribute('href')).toBe('https://docs.example.com');
    });
  });
});
