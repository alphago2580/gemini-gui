import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MarkdownEditor from './MarkdownEditor';

// Mock MarkdownRenderer to avoid complex rendering in tests
vi.mock('./MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-rendered">{content}</div>
  ),
}));

describe('MarkdownEditor', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with write mode by default', () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByLabelText('마크다운 입력')).toBeInTheDocument();
  });

  it('renders three mode tabs', () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByText('작성')).toBeInTheDocument();
    expect(screen.getByText('미리보기')).toBeInTheDocument();
    expect(screen.getByText('분할')).toBeInTheDocument();
  });

  it('marks write tab as active by default', () => {
    render(<MarkdownEditor {...defaultProps} />);
    const writeTab = screen.getByText('작성');
    expect(writeTab).toHaveAttribute('aria-selected', 'true');
    expect(writeTab).toHaveClass('active');
  });

  it('shows textarea in write mode', () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByLabelText('마크다운 입력')).toBeInTheDocument();
    expect(screen.queryByLabelText('마크다운 미리보기')).not.toBeInTheDocument();
  });

  it('switches to preview mode when preview tab is clicked', () => {
    render(<MarkdownEditor {...defaultProps} value="**bold**" />);
    fireEvent.click(screen.getByText('미리보기'));
    expect(screen.queryByLabelText('마크다운 입력')).not.toBeInTheDocument();
    expect(screen.getByLabelText('마크다운 미리보기')).toBeInTheDocument();
  });

  it('shows both textarea and preview in split mode', () => {
    render(<MarkdownEditor {...defaultProps} value="hello" />);
    fireEvent.click(screen.getByText('분할'));
    expect(screen.getByLabelText('마크다운 입력')).toBeInTheDocument();
    expect(screen.getByLabelText('마크다운 미리보기')).toBeInTheDocument();
  });

  it('calls onChange when text is typed', () => {
    const onChange = vi.fn();
    render(<MarkdownEditor {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('마크다운 입력'), {
      target: { value: 'hello world' },
    });
    expect(onChange).toHaveBeenCalledWith('hello world');
  });

  it('displays value in textarea', () => {
    render(<MarkdownEditor {...defaultProps} value="test content" />);
    const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;
    expect(textarea.value).toBe('test content');
  });

  it('passes value to MarkdownRenderer in preview mode', () => {
    render(<MarkdownEditor {...defaultProps} value="# Hello" />);
    fireEvent.click(screen.getByText('미리보기'));
    expect(screen.getByTestId('markdown-rendered')).toHaveTextContent('# Hello');
  });

  it('shows placeholder in textarea when value is empty', () => {
    render(<MarkdownEditor {...defaultProps} placeholder="내용을 입력하세요" />);
    const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('내용을 입력하세요');
  });

  it('shows placeholder in preview when value is empty', () => {
    render(<MarkdownEditor {...defaultProps} placeholder="내용을 입력하세요" />);
    fireEvent.click(screen.getByText('미리보기'));
    expect(screen.getByText('내용을 입력하세요')).toBeInTheDocument();
    expect(screen.getByText('내용을 입력하세요')).toHaveClass('markdown-editor-preview-empty');
  });

  it('respects defaultMode prop', () => {
    render(<MarkdownEditor {...defaultProps} defaultMode="preview" value="test" />);
    expect(screen.queryByLabelText('마크다운 입력')).not.toBeInTheDocument();
    expect(screen.getByLabelText('마크다운 미리보기')).toBeInTheDocument();
  });

  it('respects defaultMode split', () => {
    render(<MarkdownEditor {...defaultProps} defaultMode="split" value="test" />);
    expect(screen.getByLabelText('마크다운 입력')).toBeInTheDocument();
    expect(screen.getByLabelText('마크다운 미리보기')).toBeInTheDocument();
  });

  it('applies minHeight style to textarea', () => {
    render(<MarkdownEditor {...defaultProps} minHeight={200} />);
    const textarea = screen.getByLabelText('마크다운 입력');
    expect(textarea).toHaveStyle({ minHeight: '200px' });
  });

  it('applies default minHeight of 120px', () => {
    render(<MarkdownEditor {...defaultProps} />);
    const textarea = screen.getByLabelText('마크다운 입력');
    expect(textarea).toHaveStyle({ minHeight: '120px' });
  });

  it('has proper ARIA attributes on the root', () => {
    const { container } = render(<MarkdownEditor {...defaultProps} />);
    const editor = container.querySelector('.markdown-editor');
    expect(editor).toHaveAttribute('aria-label', '마크다운 에디터');
  });

  it('has tablist role on the tab container', () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('tabs have correct role and aria-selected', () => {
    render(<MarkdownEditor {...defaultProps} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('updates aria-selected when switching tabs', () => {
    render(<MarkdownEditor {...defaultProps} />);
    fireEvent.click(screen.getByText('미리보기'));
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('adds split-mode class to body in split mode', () => {
    const { container } = render(<MarkdownEditor {...defaultProps} />);
    fireEvent.click(screen.getByText('분할'));
    const body = container.querySelector('.markdown-editor-body');
    expect(body).toHaveClass('split-mode');
  });

  it('does not have split-mode class in write mode', () => {
    const { container } = render(<MarkdownEditor {...defaultProps} />);
    const body = container.querySelector('.markdown-editor-body');
    expect(body).not.toHaveClass('split-mode');
  });

  describe('toolbar', () => {
    it('shows toolbar in write mode by default', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('shows toolbar in split mode', () => {
      render(<MarkdownEditor {...defaultProps} />);
      fireEvent.click(screen.getByText('분할'));
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('hides toolbar in preview mode', () => {
      render(<MarkdownEditor {...defaultProps} />);
      fireEvent.click(screen.getByText('미리보기'));
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    });

    it('hides toolbar when showToolbar is false', () => {
      render(<MarkdownEditor {...defaultProps} showToolbar={false} />);
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    });

    it('renders bold button with aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByLabelText('굵게')).toBeInTheDocument();
    });

    it('renders italic button with aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByLabelText('기울임')).toBeInTheDocument();
    });

    it('renders code button with aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByLabelText('인라인 코드')).toBeInTheDocument();
    });

    it('renders link button with aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByLabelText('링크')).toBeInTheDocument();
    });

    it('renders heading button with aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });

    it('renders list button with aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByLabelText('목록')).toBeInTheDocument();
    });

    it('renders quote button with aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByLabelText('인용')).toBeInTheDocument();
    });

    it('renders code block button with aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByLabelText('코드 블록')).toBeInTheDocument();
    });

    it('renders toolbar divider', () => {
      const { container } = render(<MarkdownEditor {...defaultProps} />);
      const divider = container.querySelector('.markdown-toolbar-divider');
      expect(divider).toBeInTheDocument();
      expect(divider).toHaveAttribute('aria-hidden', 'true');
    });

    it('toolbar has correct aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', '서식 도구');
    });

    it('bold button wraps text with **', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="hello" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      // Set selection range to select "hello"
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 5, writable: true });

      fireEvent.click(screen.getByLabelText('굵게'));
      expect(onChange).toHaveBeenCalledWith('**hello**');
    });

    it('italic button wraps text with _', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="hello" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 5, writable: true });

      fireEvent.click(screen.getByLabelText('기울임'));
      expect(onChange).toHaveBeenCalledWith('_hello_');
    });

    it('code button wraps text with backtick', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="code" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 4, writable: true });

      fireEvent.click(screen.getByLabelText('인라인 코드'));
      expect(onChange).toHaveBeenCalledWith('`code`');
    });

    it('link button wraps text with markdown link syntax', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="text" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 4, writable: true });

      fireEvent.click(screen.getByLabelText('링크'));
      expect(onChange).toHaveBeenCalledWith('[text](url)');
    });

    it('heading button prepends ## at cursor when nothing selected', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(screen.getByLabelText('제목'));
      expect(onChange).toHaveBeenCalledWith('## ');
    });

    it('list button prepends - at cursor', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(screen.getByLabelText('목록'));
      expect(onChange).toHaveBeenCalledWith('- ');
    });

    it('quote button prepends > at cursor', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(screen.getByLabelText('인용'));
      expect(onChange).toHaveBeenCalledWith('> ');
    });

    it('code block button wraps with triple backticks', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="code" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 4, writable: true });

      fireEvent.click(screen.getByLabelText('코드 블록'));
      expect(onChange).toHaveBeenCalledWith('```\ncode\n```');
    });

    it('block action adds newline when not at start of line', () => {
      const onChange = vi.fn();
      render(<MarkdownEditor {...defaultProps} value="abc" onChange={onChange} />);
      const textarea = screen.getByLabelText('마크다운 입력') as HTMLTextAreaElement;

      // Cursor at end of "abc"
      Object.defineProperty(textarea, 'selectionStart', { value: 3, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 3, writable: true });

      fireEvent.click(screen.getByLabelText('제목'));
      expect(onChange).toHaveBeenCalledWith('abc\n## ');
    });
  });

  describe('preview rendering', () => {
    it('renders MarkdownRenderer with content in preview mode', () => {
      render(<MarkdownEditor {...defaultProps} value="# Title" />);
      fireEvent.click(screen.getByText('미리보기'));
      expect(screen.getByTestId('markdown-rendered')).toHaveTextContent('# Title');
    });

    it('renders MarkdownRenderer in split mode', () => {
      render(<MarkdownEditor {...defaultProps} value="## Sub" />);
      fireEvent.click(screen.getByText('분할'));
      expect(screen.getByTestId('markdown-rendered')).toHaveTextContent('## Sub');
    });

    it('preview has region role', () => {
      render(<MarkdownEditor {...defaultProps} value="content" />);
      fireEvent.click(screen.getByText('미리보기'));
      const preview = screen.getByRole('region');
      expect(preview).toHaveAttribute('aria-label', '마크다운 미리보기');
    });
  });

  describe('CSS classes', () => {
    it('root element has markdown-editor class', () => {
      const { container } = render(<MarkdownEditor {...defaultProps} />);
      expect(container.querySelector('.markdown-editor')).toBeInTheDocument();
    });

    it('header has markdown-editor-header class', () => {
      const { container } = render(<MarkdownEditor {...defaultProps} />);
      expect(container.querySelector('.markdown-editor-header')).toBeInTheDocument();
    });

    it('tabs container has markdown-editor-tabs class', () => {
      const { container } = render(<MarkdownEditor {...defaultProps} />);
      expect(container.querySelector('.markdown-editor-tabs')).toBeInTheDocument();
    });

    it('body has markdown-editor-body class', () => {
      const { container } = render(<MarkdownEditor {...defaultProps} />);
      expect(container.querySelector('.markdown-editor-body')).toBeInTheDocument();
    });

    it('textarea has markdown-editor-input class', () => {
      const { container } = render(<MarkdownEditor {...defaultProps} />);
      expect(container.querySelector('.markdown-editor-input')).toBeInTheDocument();
    });

    it('toolbar buttons have markdown-toolbar-btn class', () => {
      const { container } = render(<MarkdownEditor {...defaultProps} />);
      const buttons = container.querySelectorAll('.markdown-toolbar-btn');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
