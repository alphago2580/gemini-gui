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

  it('has aria-label on toolbar', () => {
    render(<FormattingToolbar onFormat={vi.fn()} />);
    expect(screen.getByLabelText('텍스트 포맷팅 도구')).toBeInTheDocument();
  });
});
