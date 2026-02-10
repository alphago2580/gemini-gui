import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormattingToolbar, { ACTIONS } from './FormattingToolbar';

describe('FormattingToolbar', () => {
  it('renders all formatting buttons', () => {
    render(<FormattingToolbar onFormat={vi.fn()} />);
    for (const action of ACTIONS) {
      expect(screen.getByLabelText(action.title)).toBeInTheDocument();
    }
  });

  it('calls onFormat with action id when button clicked', () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByLabelText('굵게'));
    expect(onFormat).toHaveBeenCalledWith('bold');
  });

  it('calls onFormat for italic', () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByLabelText('기울임'));
    expect(onFormat).toHaveBeenCalledWith('italic');
  });

  it('calls onFormat for code', () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByLabelText('인라인 코드'));
    expect(onFormat).toHaveBeenCalledWith('code');
  });

  it('calls onFormat for link', () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByLabelText('링크 삽입'));
    expect(onFormat).toHaveBeenCalledWith('link');
  });

  it('calls onFormat for strikethrough', () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByLabelText('취소선'));
    expect(onFormat).toHaveBeenCalledWith('strikethrough');
  });

  it('calls onFormat for codeblock', () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByLabelText('코드 블록'));
    expect(onFormat).toHaveBeenCalledWith('codeblock');
  });

  it('has aria-label on toolbar', () => {
    render(<FormattingToolbar onFormat={vi.fn()} />);
    expect(screen.getByLabelText('텍스트 포맷팅 도구')).toBeInTheDocument();
  });

  it('renders correct number of buttons matching ACTIONS', () => {
    const { container } = render(<FormattingToolbar onFormat={vi.fn()} />);
    const buttons = container.querySelectorAll('.formatting-btn');
    expect(buttons.length).toBe(ACTIONS.length);
  });

  it('each button has correct CSS class based on action id', () => {
    const { container } = render(<FormattingToolbar onFormat={vi.fn()} />);
    for (const action of ACTIONS) {
      expect(container.querySelector(`.formatting-btn-${action.id}`)).toBeInTheDocument();
    }
  });

  it('buttons have tabIndex -1 to avoid tab-focus', () => {
    render(<FormattingToolbar onFormat={vi.fn()} />);
    for (const action of ACTIONS) {
      const btn = screen.getByLabelText(action.title);
      expect(btn).toHaveAttribute('tabindex', '-1');
    }
  });
});
