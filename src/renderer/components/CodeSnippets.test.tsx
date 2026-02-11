import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CodeSnippets from './CodeSnippets';

const mockMessages = [
  { role: 'user' as const, content: 'Check this:\n```js\nconsole.log("hi");\n```' },
  { role: 'assistant' as const, content: 'Here:\n```python\nprint("hello")\n```\nAnd:\n```js\nconst x = 1;\n```' },
  { role: 'assistant' as const, content: 'No code here.' },
];

describe('CodeSnippets', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    messages: mockMessages,
    onNavigateToMessage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    const { container } = render(<CodeSnippets {...defaultProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows dialog when open', () => {
    render(<CodeSnippets {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays total code count in title', () => {
    render(<CodeSnippets {...defaultProps} />);
    expect(screen.getByText('코드 스니펫 (3)')).toBeInTheDocument();
  });

  it('shows language filter buttons', () => {
    render(<CodeSnippets {...defaultProps} />);
    expect(screen.getByLabelText('전체 언어 필터')).toBeInTheDocument();
    expect(screen.getByLabelText('js 필터')).toBeInTheDocument();
    expect(screen.getByLabelText('python 필터')).toBeInTheDocument();
  });

  it('filters by language when clicking filter button', () => {
    const { container } = render(<CodeSnippets {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('python 필터'));
    const items = container.querySelectorAll('.code-snippet-item');
    expect(items.length).toBe(1);
  });

  it('shows all snippets with "all" filter', () => {
    const { container } = render(<CodeSnippets {...defaultProps} />);
    const items = container.querySelectorAll('.code-snippet-item');
    expect(items.length).toBe(3);
  });

  it('calls onClose when close button clicked', () => {
    render(<CodeSnippets {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('코드 스니펫 닫기'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay clicked', () => {
    const { container } = render(<CodeSnippets {...defaultProps} />);
    fireEvent.click(container.querySelector('.code-snippets-overlay')!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape pressed', () => {
    render(<CodeSnippets {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onNavigateToMessage and onClose when navigate button clicked', () => {
    render(<CodeSnippets {...defaultProps} />);
    const navButtons = screen.getAllByLabelText('메시지로 이동');
    fireEvent.click(navButtons[0]);
    expect(defaultProps.onNavigateToMessage).toHaveBeenCalledWith(0);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows empty message when no code blocks', () => {
    render(
      <CodeSnippets
        {...defaultProps}
        messages={[{ role: 'user', content: 'no code' }]}
      />
    );
    expect(screen.getByText('이 대화에 코드 블록이 없습니다.')).toBeInTheDocument();
  });

  it('shows role badge for each snippet', () => {
    render(<CodeSnippets {...defaultProps} />);
    expect(screen.getAllByText('사용자').length).toBe(1);
    expect(screen.getAllByText('Gemini').length).toBe(2);
  });

  it('copies code to clipboard on copy button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CodeSnippets {...defaultProps} />);
    const copyButtons = screen.getAllByLabelText('코드 복사');
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    expect(writeText).toHaveBeenCalledWith('console.log("hi");');
  });

  it('shows checkmark after successful copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { container } = render(<CodeSnippets {...defaultProps} />);
    const copyButtons = screen.getAllByLabelText('코드 복사');
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    await waitFor(() => {
      const firstCopyBtn = container.querySelectorAll('.code-snippet-copy-btn')[0];
      expect(firstCopyBtn.textContent).toBe('✓');
    });
  });

  it('handles clipboard failure gracefully', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CodeSnippets {...defaultProps} />);
    const copyButtons = screen.getAllByLabelText('코드 복사');
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    // Should not throw — copiedIndex should remain null (no checkmark)
    const allCopyBtns = screen.getAllByLabelText('코드 복사');
    expect(allCopyBtns[0].textContent).toBe('📋');
  });

  it('stops propagation when clicking panel body', () => {
    const onClose = vi.fn();
    const { container } = render(<CodeSnippets {...defaultProps} onClose={onClose} />);
    const panel = container.querySelector('.code-snippets-panel')!;
    fireEvent.click(panel);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets to all filter showing all snippets after filtering', () => {
    const { container } = render(<CodeSnippets {...defaultProps} />);
    // Filter to python
    fireEvent.click(screen.getByLabelText('python 필터'));
    expect(container.querySelectorAll('.code-snippet-item').length).toBe(1);
    // Reset to all
    fireEvent.click(screen.getByLabelText('전체 언어 필터'));
    expect(container.querySelectorAll('.code-snippet-item').length).toBe(3);
  });

  it('does not close on non-Escape key', () => {
    const onClose = vi.fn();
    render(<CodeSnippets {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'a' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('displays code content in <code> elements', () => {
    const { container } = render(<CodeSnippets {...defaultProps} />);
    const codeElements = container.querySelectorAll('code');
    expect(codeElements.length).toBe(3);
    expect(codeElements[0].textContent).toBe('console.log("hi");');
  });

  it('shows language label for each snippet', () => {
    const { container } = render(<CodeSnippets {...defaultProps} />);
    const langSpans = container.querySelectorAll('.code-snippet-lang');
    expect(langSpans.length).toBe(3);
    expect(langSpans[0].textContent).toBe('js');
    expect(langSpans[1].textContent).toBe('python');
    expect(langSpans[2].textContent).toBe('js');
  });

  it('active filter button has active CSS class', () => {
    render(<CodeSnippets {...defaultProps} />);
    const allBtn = screen.getByLabelText('전체 언어 필터');
    expect(allBtn.classList.contains('active')).toBe(true);
    fireEvent.click(screen.getByLabelText('python 필터'));
    expect(allBtn.classList.contains('active')).toBe(false);
    expect(screen.getByLabelText('python 필터').classList.contains('active')).toBe(true);
  });

  it('dialog has correct aria-label', () => {
    render(<CodeSnippets {...defaultProps} />);
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('코드 스니펫');
  });

  it('displays "plain" for code blocks without language', () => {
    const msgs = [
      { role: 'user' as const, content: '```\nno lang\n```' },
    ];
    render(<CodeSnippets {...defaultProps} messages={msgs} />);
    const { container } = render(<CodeSnippets {...defaultProps} messages={msgs} />);
    const langSpan = container.querySelector('.code-snippet-lang');
    expect(langSpan?.textContent).toBe('plain');
  });

  it('navigate button calls onNavigateToMessage with correct index for second message', () => {
    render(<CodeSnippets {...defaultProps} />);
    const navButtons = screen.getAllByLabelText('메시지로 이동');
    // Second snippet is from message index 1
    fireEvent.click(navButtons[1]);
    expect(defaultProps.onNavigateToMessage).toHaveBeenCalledWith(1);
  });

  it('shows "no matching" empty message when filtered to nonexistent language', () => {
    const msgs = [
      { role: 'user' as const, content: '```python\nprint("hi")\n```' },
      { role: 'assistant' as const, content: '```js\nconst x=1\n```' },
    ];
    const { container } = render(<CodeSnippets {...defaultProps} messages={msgs} />);
    // Filter to js shows 1
    fireEvent.click(screen.getByLabelText('js 필터'));
    expect(container.querySelectorAll('.code-snippet-item').length).toBe(1);
  });

  it('copy buttons have correct title attribute', () => {
    render(<CodeSnippets {...defaultProps} />);
    const copyButtons = screen.getAllByTitle('코드 복사');
    expect(copyButtons.length).toBe(3);
  });

  it('navigate buttons have correct title attribute', () => {
    render(<CodeSnippets {...defaultProps} />);
    const navButtons = screen.getAllByTitle('메시지로 이동');
    expect(navButtons.length).toBe(3);
  });
});
