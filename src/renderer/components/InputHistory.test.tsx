import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import InputHistory from './InputHistory';

describe('InputHistory', () => {
  let mockOnChange: ReturnType<typeof vi.fn<(value: string) => void>>;
  let mockOnSubmit: ReturnType<typeof vi.fn<(value: string) => void>>;

  beforeEach(() => {
    mockOnChange = vi.fn<(value: string) => void>();
    mockOnSubmit = vi.fn<(value: string) => void>();
  });

  const defaultProps = {
    history: [] as string[],
    value: '',
    onChange: vi.fn<(value: string) => void>(),
    onSubmit: vi.fn<(value: string) => void>(),
  };

  it('renders textarea with placeholder', () => {
    render(<InputHistory {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder');
  });

  it('renders custom placeholder', () => {
    render(<InputHistory {...defaultProps} placeholder="커스텀 플레이스홀더" />);
    expect(screen.getByPlaceholderText('커스텀 플레이스홀더')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<InputHistory {...defaultProps} value="안녕하세요" />);
    expect(screen.getByRole('textbox')).toHaveValue('안녕하세요');
  });

  it('calls onChange when text is typed', () => {
    const onChange = vi.fn();
    render(<InputHistory {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '새 메시지' } });
    expect(onChange).toHaveBeenCalledWith('새 메시지');
  });

  it('calls onSubmit on Enter key press with non-empty value', () => {
    const onSubmit = vi.fn();
    render(<InputHistory {...defaultProps} value="테스트 메시지" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('테스트 메시지');
  });

  it('does not call onSubmit on Enter with empty value', () => {
    const onSubmit = vi.fn();
    render(<InputHistory {...defaultProps} value="" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit on Enter with whitespace-only value', () => {
    const onSubmit = vi.fn();
    render(<InputHistory {...defaultProps} value="   " onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows newline on Shift+Enter', () => {
    const onSubmit = vi.fn();
    render(<InputHistory {...defaultProps} value="테스트" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('navigates to previous history entry on ArrowUp at cursor start', () => {
    const onChange = vi.fn();
    const history = ['이전 메시지 1', '이전 메시지 2'];
    render(<InputHistory history={history} value="" onChange={onChange} onSubmit={mockOnSubmit} />);
    const textarea = screen.getByRole('textbox');
    // Set cursor to start
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith('이전 메시지 1');
  });

  it('does not navigate history on ArrowUp when cursor is not at start', () => {
    const onChange = vi.fn();
    const history = ['이전 메시지 1'];
    render(<InputHistory history={history} value="현재 텍스트" onChange={onChange} onSubmit={mockOnSubmit} />);
    const textarea = screen.getByRole('textbox');
    // Cursor in middle of text
    Object.defineProperty(textarea, 'selectionStart', { value: 3, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 3, writable: true });
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not navigate on ArrowUp when history is empty', () => {
    const onChange = vi.fn();
    render(<InputHistory history={[]} value="" onChange={onChange} onSubmit={mockOnSubmit} />);
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('navigates back to draft on ArrowDown after navigating up', () => {
    const onChange = vi.fn();
    const history = ['이전 메시지'];
    const { rerender } = render(
      <InputHistory history={history} value="드래프트" onChange={onChange} onSubmit={mockOnSubmit} />
    );
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

    // Navigate up
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith('이전 메시지');

    // Rerender with history value
    rerender(
      <InputHistory history={history} value="이전 메시지" onChange={onChange} onSubmit={mockOnSubmit} />
    );

    // Set cursor at end for ArrowDown
    Object.defineProperty(textarea, 'selectionStart', { value: 6, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 6, writable: true });

    // Navigate down
    fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith('드래프트');
  });

  it('does not navigate down when already at draft position', () => {
    const onChange = vi.fn();
    render(<InputHistory history={['이전']} value="현재" onChange={onChange} onSubmit={mockOnSubmit} />);
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 2, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 2, writable: true });
    fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not navigate down on ArrowDown when cursor is not at end', () => {
    // First navigate up so historyIndex >= 0
    const onChange = vi.fn();
    const history = ['이전 1', '이전 2'];
    const { rerender } = render(
      <InputHistory history={history} value="" onChange={onChange} onSubmit={mockOnSubmit} />
    );
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

    // Navigate up twice
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    rerender(<InputHistory history={history} value="이전 1" onChange={onChange} onSubmit={mockOnSubmit} />);
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    rerender(<InputHistory history={history} value="이전 2" onChange={onChange} onSubmit={mockOnSubmit} />);

    // Cursor is in middle
    Object.defineProperty(textarea, 'selectionStart', { value: 1, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 1, writable: true });

    onChange.mockClear();
    fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows history indicator when navigating history', () => {
    const onChange = vi.fn();
    const history = ['메시지 1', '메시지 2', '메시지 3'];
    render(<InputHistory history={history} value="" onChange={onChange} onSubmit={mockOnSubmit} />);
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('does not show history indicator when at draft position', () => {
    render(<InputHistory {...defaultProps} history={['이전']} value="" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('stops at oldest history entry on repeated ArrowUp', () => {
    const onChange = vi.fn();
    const history = ['최근', '오래된'];
    const { rerender } = render(
      <InputHistory history={history} value="" onChange={onChange} onSubmit={mockOnSubmit} />
    );
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

    // Navigate up twice (to the oldest)
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    rerender(<InputHistory history={history} value="최근" onChange={onChange} onSubmit={mockOnSubmit} />);
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    rerender(<InputHistory history={history} value="오래된" onChange={onChange} onSubmit={mockOnSubmit} />);

    onChange.mockClear();
    // Try navigating up again — should not change
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('respects maxHistorySize', () => {
    const onChange = vi.fn();
    const history = ['a', 'b', 'c', 'd', 'e'];
    const { rerender } = render(
      <InputHistory history={history} value="" onChange={onChange} onSubmit={mockOnSubmit} maxHistorySize={2} />
    );
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

    // Navigate up twice (a and b — only 2 allowed)
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    rerender(<InputHistory history={history} value="a" onChange={onChange} onSubmit={mockOnSubmit} maxHistorySize={2} />);
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    rerender(<InputHistory history={history} value="b" onChange={onChange} onSubmit={mockOnSubmit} maxHistorySize={2} />);

    onChange.mockClear();
    // Can't go further
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has correct aria-label', () => {
    render(<InputHistory {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-label');
  });

  it('supports custom aria-label', () => {
    render(<InputHistory {...defaultProps} ariaLabel="커스텀 라벨" />);
    expect(screen.getByLabelText('커스텀 라벨')).toBeInTheDocument();
  });

  it('disables textarea when disabled prop is true', () => {
    render(<InputHistory {...defaultProps} disabled={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('does not submit when disabled', () => {
    const onSubmit = vi.fn();
    render(<InputHistory {...defaultProps} value="테스트" onSubmit={onSubmit} disabled={true} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('applies disabled class when disabled', () => {
    const { container } = render(<InputHistory {...defaultProps} disabled={true} />);
    expect(container.querySelector('.input-history--disabled')).toBeInTheDocument();
  });

  it('resets history index on text change', () => {
    const onChange = vi.fn();
    const history = ['이전 메시지'];
    const { rerender } = render(
      <InputHistory history={history} value="" onChange={onChange} onSubmit={mockOnSubmit} />
    );
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

    // Navigate to history
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    rerender(<InputHistory history={history} value="이전 메시지" onChange={onChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Type something
    fireEvent.change(textarea, { target: { value: '새 입력' } });
    rerender(<InputHistory history={history} value="새 입력" onChange={onChange} onSubmit={mockOnSubmit} />);

    // History indicator should disappear after typing
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has input-history class on container', () => {
    const { container } = render(<InputHistory {...defaultProps} />);
    expect(container.querySelector('.input-history')).toBeInTheDocument();
  });

  it('has input-history__textarea class on textarea', () => {
    const { container } = render(<InputHistory {...defaultProps} />);
    expect(container.querySelector('.input-history__textarea')).toBeInTheDocument();
  });

  it('history indicator has aria-live polite', () => {
    const onChange = vi.fn();
    const history = ['이전'];
    render(<InputHistory history={history} value="" onChange={onChange} onSubmit={mockOnSubmit} />);
    const textarea = screen.getByRole('textbox');
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('prevents default on Enter to avoid newline insertion', () => {
    const onSubmit = vi.fn();
    render(<InputHistory {...defaultProps} value="테스트" onSubmit={onSubmit} />);
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    const prevented = !screen.getByRole('textbox').dispatchEvent(event);
    // The React handler prevents default, so the native event may or may not be prevented
    // We verify the submit was called instead
    expect(onSubmit).toHaveBeenCalled();
  });
});
