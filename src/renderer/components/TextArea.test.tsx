import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TextArea from './TextArea';

describe('TextArea', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('renders textarea element', () => {
    render(<TextArea {...defaultProps} />);
    expect(document.querySelector('textarea')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TextArea {...defaultProps} placeholder="메모 입력" />);
    expect(screen.getByPlaceholderText('메모 입력')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<TextArea {...defaultProps} label="설명" />);
    expect(screen.getByText('설명')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(<TextArea {...defaultProps} value="안녕하세요" />);
    expect(document.querySelector('textarea')).toHaveValue('안녕하세요');
  });

  it('renders with default 3 rows', () => {
    render(<TextArea {...defaultProps} />);
    expect(document.querySelector('textarea')).toHaveAttribute('rows', '3');
  });

  it('renders with custom rows', () => {
    render(<TextArea {...defaultProps} rows={5} />);
    expect(document.querySelector('textarea')).toHaveAttribute('rows', '5');
  });

  // --- onChange ---

  it('calls onChange when typing', () => {
    render(<TextArea {...defaultProps} />);
    fireEvent.change(document.querySelector('textarea')!, { target: { value: 'test' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('test');
  });

  it('does not call onChange when exceeding maxLength', () => {
    render(<TextArea {...defaultProps} maxLength={5} />);
    fireEvent.change(document.querySelector('textarea')!, { target: { value: '123456' } });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('allows typing within maxLength', () => {
    render(<TextArea {...defaultProps} maxLength={5} />);
    fireEvent.change(document.querySelector('textarea')!, { target: { value: '12345' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('12345');
  });

  // --- Disabled ---

  it('disables textarea when disabled', () => {
    render(<TextArea {...defaultProps} disabled />);
    expect(document.querySelector('textarea')).toBeDisabled();
  });

  it('applies disabled class', () => {
    const { container } = render(<TextArea {...defaultProps} disabled />);
    expect(container.querySelector('.textarea--disabled')).toBeInTheDocument();
  });

  // --- Read-only ---

  it('sets readOnly on textarea', () => {
    render(<TextArea {...defaultProps} readOnly />);
    expect(document.querySelector('textarea')).toHaveAttribute('readonly');
  });

  it('applies readonly class', () => {
    const { container } = render(<TextArea {...defaultProps} readOnly />);
    expect(container.querySelector('.textarea--readonly')).toBeInTheDocument();
  });

  // --- Error ---

  it('renders error message', () => {
    render(<TextArea {...defaultProps} error="필수 항목입니다" />);
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('sets aria-invalid when error', () => {
    render(<TextArea {...defaultProps} error="에러" />);
    expect(document.querySelector('textarea')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies error class', () => {
    const { container } = render(<TextArea {...defaultProps} error="에러" />);
    expect(container.querySelector('.textarea--error')).toBeInTheDocument();
  });

  // --- Helper text ---

  it('renders helper text', () => {
    render(<TextArea {...defaultProps} helperText="설명을 입력하세요" />);
    expect(screen.getByText('설명을 입력하세요')).toBeInTheDocument();
  });

  it('shows error instead of helper text when both present', () => {
    render(<TextArea {...defaultProps} error="에러" helperText="도움말" />);
    expect(screen.getByText('에러')).toBeInTheDocument();
    expect(screen.queryByText('도움말')).not.toBeInTheDocument();
  });

  // --- Character count ---

  it('does not show count when showCount is false', () => {
    const { container } = render(<TextArea {...defaultProps} value="abc" />);
    expect(container.querySelector('.textarea-count')).not.toBeInTheDocument();
  });

  it('shows character count when showCount is true', () => {
    const { container } = render(<TextArea {...defaultProps} showCount value="abc" />);
    expect(container.querySelector('.textarea-count')).toHaveTextContent('3');
  });

  it('shows count with maxLength format', () => {
    const { container } = render(
      <TextArea {...defaultProps} showCount maxLength={100} value="hello" />
    );
    expect(container.querySelector('.textarea-count')).toHaveTextContent('5/100');
  });

  it('shows zero count when empty', () => {
    const { container } = render(
      <TextArea {...defaultProps} showCount maxLength={50} />
    );
    expect(container.querySelector('.textarea-count')).toHaveTextContent('0/50');
  });

  // --- Sizes ---

  it('applies sm size class', () => {
    const { container } = render(<TextArea {...defaultProps} size="sm" />);
    expect(container.querySelector('.textarea--sm')).toBeInTheDocument();
  });

  it('applies md size class by default', () => {
    const { container } = render(<TextArea {...defaultProps} />);
    expect(container.querySelector('.textarea--md')).toBeInTheDocument();
  });

  it('applies lg size class', () => {
    const { container } = render(<TextArea {...defaultProps} size="lg" />);
    expect(container.querySelector('.textarea--lg')).toBeInTheDocument();
  });

  // --- Resize ---

  it('sets resize to vertical by default', () => {
    render(<TextArea {...defaultProps} />);
    expect(document.querySelector('textarea')).toHaveStyle({ resize: 'vertical' });
  });

  it('sets resize to none', () => {
    render(<TextArea {...defaultProps} resize="none" />);
    expect(document.querySelector('textarea')).toHaveStyle({ resize: 'none' });
  });

  it('sets resize to both', () => {
    render(<TextArea {...defaultProps} resize="both" />);
    expect(document.querySelector('textarea')).toHaveStyle({ resize: 'both' });
  });

  it('disables manual resize when auto', () => {
    render(<TextArea {...defaultProps} resize="auto" />);
    expect(document.querySelector('textarea')).toHaveStyle({ resize: 'none' });
  });

  // --- Accessibility ---

  it('sets aria-label from label prop', () => {
    render(<TextArea {...defaultProps} label="설명" />);
    expect(document.querySelector('textarea')).toHaveAttribute('aria-label', '설명');
  });

  it('sets aria-label from placeholder when no label', () => {
    render(<TextArea {...defaultProps} placeholder="내용 입력" />);
    expect(document.querySelector('textarea')).toHaveAttribute('aria-label', '내용 입력');
  });

  it('sets aria-describedby for error', () => {
    render(<TextArea {...defaultProps} error="에러" />);
    expect(document.querySelector('textarea')).toHaveAttribute('aria-describedby', 'textarea-error');
  });

  it('sets aria-describedby for helper text', () => {
    render(<TextArea {...defaultProps} helperText="도움말" />);
    expect(document.querySelector('textarea')).toHaveAttribute('aria-describedby', 'textarea-helper');
  });

  // --- Focus ---

  it('applies focused class on focus', () => {
    const { container } = render(<TextArea {...defaultProps} />);
    fireEvent.focus(document.querySelector('textarea')!);
    expect(container.querySelector('.textarea--focused')).toBeInTheDocument();
  });

  it('removes focused class on blur', () => {
    const { container } = render(<TextArea {...defaultProps} />);
    const textarea = document.querySelector('textarea')!;
    fireEvent.focus(textarea);
    fireEvent.blur(textarea);
    expect(container.querySelector('.textarea--focused')).not.toBeInTheDocument();
  });

  // --- Auto resize ---

  it('uses minRows for auto resize', () => {
    render(<TextArea {...defaultProps} resize="auto" minRows={2} />);
    expect(document.querySelector('textarea')).toHaveAttribute('rows', '2');
  });

  it('uses rows as default minRows for auto resize', () => {
    render(<TextArea {...defaultProps} resize="auto" rows={4} />);
    expect(document.querySelector('textarea')).toHaveAttribute('rows', '4');
  });
});
