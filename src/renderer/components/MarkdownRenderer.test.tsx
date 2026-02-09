import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
