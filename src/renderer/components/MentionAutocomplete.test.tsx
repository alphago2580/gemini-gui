import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MentionAutocomplete, { MentionCommand } from './MentionAutocomplete';

describe('MentionAutocomplete', () => {
  const commands: MentionCommand[] = [
    { id: 'translate', label: '번역', description: '텍스트를 번역합니다', icon: '🌐' },
    { id: 'summarize', label: '요약', description: '내용을 요약합니다', icon: '📝' },
    { id: 'review', label: '코드 리뷰', description: '코드를 리뷰합니다', icon: '🔍' },
    { id: 'help', label: '도움말', description: '사용 가능한 명령어를 보여줍니다' },
  ];

  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    commands,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('renders textarea with placeholder', () => {
    render(<MentionAutocomplete {...defaultProps} />);
    expect(screen.getByPlaceholderText('메시지를 입력하세요... (@로 명령어 검색)')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<MentionAutocomplete {...defaultProps} placeholder="입력..." />);
    expect(screen.getByPlaceholderText('입력...')).toBeInTheDocument();
  });

  it('renders with combobox role', () => {
    render(<MentionAutocomplete {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders textarea with given value', () => {
    render(<MentionAutocomplete {...defaultProps} value="hello" />);
    expect(screen.getByRole('combobox')).toHaveValue('hello');
  });

  it('renders with aria-label', () => {
    render(<MentionAutocomplete {...defaultProps} ariaLabel="메시지 입력" />);
    expect(screen.getByLabelText('메시지 입력')).toBeInTheDocument();
  });

  it('does not show dropdown when no @ is typed', () => {
    render(<MentionAutocomplete {...defaultProps} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<MentionAutocomplete {...defaultProps} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  // --- Mention trigger ---

  it('shows dropdown when @ is typed at start', () => {
    render(<MentionAutocomplete {...defaultProps} value="" />);
    const textarea = screen.getByRole('combobox');

    // Simulate typing '@'
    fireEvent.change(textarea, { target: { value: '@', selectionStart: 1 } });

    expect(defaultProps.onChange).toHaveBeenCalledWith('@');
  });

  it('shows suggestions matching query after @', () => {
    // Render with value already containing @tr and a cursor position at end
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    // Simulate the user typing "@tr"
    const textarea = screen.getByRole('combobox');
    fireEvent.change(textarea, { target: { value: '@tr', selectionStart: 3 } });

    // Now rerender with updated value to trigger suggestion display
    rerender(
      <MentionAutocomplete {...defaultProps} value="@tr" onChange={onChange} />
    );
    // After rerender with the value, simulate another change to trigger mention detection
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@tr', selectionStart: 3 } });

    // The dropdown should now show the translate command
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('@translate')).toBeInTheDocument();
  });

  it('shows all commands when @ is typed with no query', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    const textarea = screen.getByRole('combobox');
    fireEvent.change(textarea, { target: { value: '@', selectionStart: 1 } });

    rerender(
      <MentionAutocomplete {...defaultProps} value="@" onChange={onChange} />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('@translate')).toBeInTheDocument();
    expect(screen.getByText('@summarize')).toBeInTheDocument();
    expect(screen.getByText('@review')).toBeInTheDocument();
    expect(screen.getByText('@help')).toBeInTheDocument();
  });

  it('filters commands based on query', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@sum', selectionStart: 4 } });

    rerender(
      <MentionAutocomplete {...defaultProps} value="@sum" onChange={onChange} />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@sum', selectionStart: 4 } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('@summarize')).toBeInTheDocument();
    expect(screen.queryByText('@translate')).not.toBeInTheDocument();
  });

  it('shows no dropdown when query matches nothing', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@xyz', selectionStart: 4 } });

    rerender(
      <MentionAutocomplete {...defaultProps} value="@xyz" onChange={onChange} />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@xyz', selectionStart: 4 } });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- @ in middle of text ---

  it('activates mention after whitespace before @', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'hello @he', selectionStart: 9 },
    });

    rerender(
      <MentionAutocomplete {...defaultProps} value="hello @he" onChange={onChange} />
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'hello @he', selectionStart: 9 },
    });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('@help')).toBeInTheDocument();
  });

  it('does not activate mention when @ is part of a word', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    // @ preceded by non-whitespace character
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'abc@tr', selectionStart: 6 },
    });

    rerender(
      <MentionAutocomplete {...defaultProps} value="abc@tr" onChange={onChange} />
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'abc@tr', selectionStart: 6 },
    });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- Keyboard navigation ---

  it('navigates down through suggestions with ArrowDown', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    const textarea = screen.getByRole('combobox');

    // First item should be selected by default
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    // Press ArrowDown
    fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    const updatedOptions = screen.getAllByRole('option');
    expect(updatedOptions[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates up through suggestions with ArrowUp', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    const textarea = screen.getByRole('combobox');

    // Press ArrowUp from first item — should wrap to last
    fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    const options = screen.getAllByRole('option');
    expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps from last to first with ArrowDown', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    const textarea = screen.getByRole('combobox');
    const count = screen.getAllByRole('option').length;

    // Navigate to last
    for (let i = 0; i < count - 1; i++) {
      fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    }
    // Now wrap
    fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('closes dropdown on Escape', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- Selection ---

  it('selects command with Enter key', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@tr', selectionStart: 3 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@tr" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@tr', selectionStart: 3 } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

    // onChange should be called with the inserted mention
    expect(onChange).toHaveBeenCalledWith('@translate ');
  });

  it('selects command with Tab key', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@su', selectionStart: 3 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@su" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@su', selectionStart: 3 } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Tab' });

    expect(onChange).toHaveBeenCalledWith('@summarize ');
  });

  it('selects command with mouse click', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(screen.getByText('@review'));

    expect(onChange).toHaveBeenCalledWith('@review ');
  });

  it('inserts mention in middle of text', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    const textWithMention = 'hello @tr world';
    // cursor at position 9 (right after "@tr")
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: textWithMention, selectionStart: 9 },
    });
    rerender(<MentionAutocomplete {...defaultProps} value={textWithMention} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: textWithMention, selectionStart: 9 },
    });

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

    // Should replace "@tr" with "@translate " while preserving surrounding text
    expect(onChange).toHaveBeenCalledWith('hello @translate  world');
  });

  // --- Submit ---

  it('calls onSubmit on Enter when no mention is active', () => {
    const onSubmit = vi.fn();
    render(
      <MentionAutocomplete
        {...defaultProps}
        value="hello world"
        onSubmit={onSubmit}
      />
    );

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('hello world');
  });

  it('does not call onSubmit when value is empty', () => {
    const onSubmit = vi.fn();
    render(
      <MentionAutocomplete
        {...defaultProps}
        value=""
        onSubmit={onSubmit}
      />
    );

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit on Shift+Enter', () => {
    const onSubmit = vi.fn();
    render(
      <MentionAutocomplete
        {...defaultProps}
        value="hello"
        onSubmit={onSubmit}
      />
    );

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // --- Custom trigger ---

  it('uses custom trigger character', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} triggerChar="/" />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '/tr', selectionStart: 3 } });
    rerender(<MentionAutocomplete {...defaultProps} value="/tr" onChange={onChange} triggerChar="/" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '/tr', selectionStart: 3 } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('/translate')).toBeInTheDocument();
  });

  // --- Max suggestions ---

  it('limits suggestions to maxSuggestions', () => {
    const manyCommands: MentionCommand[] = Array.from({ length: 20 }, (_, i) => ({
      id: `cmd${i}`,
      label: `명령어 ${i}`,
    }));

    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete
        {...defaultProps}
        commands={manyCommands}
        value=""
        onChange={onChange}
        maxSuggestions={5}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });
    rerender(
      <MentionAutocomplete
        {...defaultProps}
        commands={manyCommands}
        value="@"
        onChange={onChange}
        maxSuggestions={5}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  // --- Descriptions ---

  it('displays command descriptions', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@tr', selectionStart: 3 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@tr" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@tr', selectionStart: 3 } });

    expect(screen.getByText('텍스트를 번역합니다')).toBeInTheDocument();
  });

  it('displays command icons', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@tr', selectionStart: 3 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@tr" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@tr', selectionStart: 3 } });

    expect(screen.getByText('🌐')).toBeInTheDocument();
  });

  // --- Filters by description ---

  it('matches commands by description text', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    // Search by description keyword "번역" (translate)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@번역', selectionStart: 4 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@번역" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@번역', selectionStart: 4 } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('@translate')).toBeInTheDocument();
  });

  // --- ARIA attributes ---

  it('sets aria-expanded to false when dropdown is hidden', () => {
    render(<MentionAutocomplete {...defaultProps} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded to true when dropdown is visible', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('highlights option on mouse enter', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MentionAutocomplete {...defaultProps} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });
    rerender(<MentionAutocomplete {...defaultProps} value="@" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '@', selectionStart: 1 } });

    const options = screen.getAllByRole('option');
    fireEvent.mouseEnter(options[2]);
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  // --- onChange passthrough ---

  it('calls onChange on regular typing', () => {
    const onChange = vi.fn();
    render(<MentionAutocomplete {...defaultProps} value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'hello', selectionStart: 5 } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });
});
