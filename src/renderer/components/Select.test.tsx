import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Select, { SelectOption } from './Select';

describe('Select', () => {
  const options: SelectOption[] = [
    { value: 'apple', label: '사과' },
    { value: 'banana', label: '바나나' },
    { value: 'cherry', label: '체리' },
  ];

  const defaultProps = {
    options,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('renders with placeholder', () => {
    render(<Select {...defaultProps} />);
    expect(screen.getByText('선택하세요')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<Select {...defaultProps} placeholder="과일 선택" />);
    expect(screen.getByText('과일 선택')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select {...defaultProps} label="과일" />);
    expect(screen.getByText('과일')).toBeInTheDocument();
  });

  it('renders selected value', () => {
    render(<Select {...defaultProps} value="banana" />);
    expect(screen.getByText('바나나')).toBeInTheDocument();
  });

  it('renders dropdown when clicked', () => {
    render(<Select {...defaultProps} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('사과')).toBeInTheDocument();
    expect(screen.getByText('바나나')).toBeInTheDocument();
    expect(screen.getByText('체리')).toBeInTheDocument();
  });

  it('does not render dropdown when closed', () => {
    render(<Select {...defaultProps} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- Single select ---

  it('selects an option and closes dropdown', () => {
    render(<Select {...defaultProps} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('바나나'));
    expect(defaultProps.onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows checkmark on selected option', () => {
    const { container } = render(<Select {...defaultProps} value="apple" />);
    fireEvent.click(screen.getByRole('combobox'));
    const checks = container.querySelectorAll('.select-option-check-single');
    expect(checks.length).toBe(1);
  });

  // --- Multiple select ---

  it('renders multiple selected count', () => {
    render(<Select {...defaultProps} multiple value={['apple', 'banana']} />);
    expect(screen.getByText('2개 선택됨')).toBeInTheDocument();
  });

  it('toggles options in multiple mode', () => {
    render(<Select {...defaultProps} multiple value={['apple']} />);
    fireEvent.click(screen.getByRole('combobox'));
    // Select banana (adds to selection)
    fireEvent.click(screen.getByText('바나나'));
    expect(defaultProps.onChange).toHaveBeenCalledWith(['apple', 'banana']);
  });

  it('deselects in multiple mode', () => {
    render(<Select {...defaultProps} multiple value={['apple', 'banana']} />);
    fireEvent.click(screen.getByRole('combobox'));
    // Deselect apple
    fireEvent.click(screen.getByText('사과'));
    expect(defaultProps.onChange).toHaveBeenCalledWith(['banana']);
  });

  it('keeps dropdown open after selection in multiple mode', () => {
    render(<Select {...defaultProps} multiple value={[]} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('사과'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders checkboxes in multiple mode', () => {
    const { container } = render(<Select {...defaultProps} multiple value={['apple']} />);
    fireEvent.click(screen.getByRole('combobox'));
    const checks = container.querySelectorAll('.select-option-check');
    expect(checks.length).toBe(3);
  });

  it('marks multiselectable on listbox', () => {
    render(<Select {...defaultProps} multiple value={[]} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
  });

  // --- Searchable ---

  it('renders search input when searchable', () => {
    render(<Select {...defaultProps} searchable />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByPlaceholderText('검색...')).toBeInTheDocument();
  });

  it('filters options by search', () => {
    render(<Select {...defaultProps} searchable />);
    fireEvent.click(screen.getByRole('combobox'));
    const searchInput = screen.getByPlaceholderText('검색...');
    fireEvent.change(searchInput, { target: { value: '바나' } });
    expect(screen.getByText('바나나')).toBeInTheDocument();
    expect(screen.queryByText('사과')).not.toBeInTheDocument();
    expect(screen.queryByText('체리')).not.toBeInTheDocument();
  });

  it('shows no results message', () => {
    render(<Select {...defaultProps} searchable />);
    fireEvent.click(screen.getByRole('combobox'));
    const searchInput = screen.getByPlaceholderText('검색...');
    fireEvent.change(searchInput, { target: { value: 'xyz' } });
    expect(screen.getByText('결과가 없습니다')).toBeInTheDocument();
  });

  it('search is case-insensitive', () => {
    const opts: SelectOption[] = [
      { value: 'a', label: 'Apple' },
      { value: 'b', label: 'Banana' },
    ];
    render(<Select options={opts} searchable onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    const searchInput = screen.getByPlaceholderText('검색...');
    fireEvent.change(searchInput, { target: { value: 'apple' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  // --- Clearable ---

  it('shows clear button when clearable and has value', () => {
    render(<Select {...defaultProps} clearable value="apple" />);
    expect(screen.getByLabelText('선택 초기화')).toBeInTheDocument();
  });

  it('does not show clear button when no value', () => {
    render(<Select {...defaultProps} clearable />);
    expect(screen.queryByLabelText('선택 초기화')).not.toBeInTheDocument();
  });

  it('clears value when clear button clicked', () => {
    render(<Select {...defaultProps} clearable value="apple" />);
    fireEvent.click(screen.getByLabelText('선택 초기화'));
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('clears to empty array in multiple mode', () => {
    render(<Select {...defaultProps} clearable multiple value={['apple', 'banana']} />);
    fireEvent.click(screen.getByLabelText('선택 초기화'));
    expect(defaultProps.onChange).toHaveBeenCalledWith([]);
  });

  // --- Disabled ---

  it('renders disabled state', () => {
    const { container } = render(<Select {...defaultProps} disabled />);
    expect(container.querySelector('.select--disabled')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<Select {...defaultProps} disabled />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('disabled trigger has tabIndex -1', () => {
    render(<Select {...defaultProps} disabled />);
    expect(screen.getByRole('combobox')).toHaveAttribute('tabindex', '-1');
  });

  // --- Disabled options ---

  it('does not select disabled option', () => {
    const opts: SelectOption[] = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
    ];
    render(<Select options={opts} onChange={defaultProps.onChange} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('B'));
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('renders disabled option with disabled class', () => {
    const opts: SelectOption[] = [
      { value: 'a', label: 'A', disabled: true },
    ];
    const { container } = render(<Select options={opts} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(container.querySelector('.select-option--disabled')).toBeInTheDocument();
  });

  // --- Error ---

  it('renders error message', () => {
    render(<Select {...defaultProps} error="필수 항목입니다" />);
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies error class', () => {
    const { container } = render(<Select {...defaultProps} error="에러" />);
    expect(container.querySelector('.select--error')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies size sm', () => {
    const { container } = render(<Select {...defaultProps} size="sm" />);
    expect(container.querySelector('.select--sm')).toBeInTheDocument();
  });

  it('applies size md by default', () => {
    const { container } = render(<Select {...defaultProps} />);
    expect(container.querySelector('.select--md')).toBeInTheDocument();
  });

  it('applies size lg', () => {
    const { container } = render(<Select {...defaultProps} size="lg" />);
    expect(container.querySelector('.select--lg')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies default variant', () => {
    const { container } = render(<Select {...defaultProps} />);
    expect(container.querySelector('.select--default')).toBeInTheDocument();
  });

  it('applies outlined variant', () => {
    const { container } = render(<Select {...defaultProps} variant="outlined" />);
    expect(container.querySelector('.select--outlined')).toBeInTheDocument();
  });

  it('applies filled variant', () => {
    const { container } = render(<Select {...defaultProps} variant="filled" />);
    expect(container.querySelector('.select--filled')).toBeInTheDocument();
  });

  // --- Groups ---

  it('renders grouped options', () => {
    const groupedOpts: SelectOption[] = [
      { value: 'apple', label: '사과', group: '과일' },
      { value: 'banana', label: '바나나', group: '과일' },
      { value: 'carrot', label: '당근', group: '채소' },
    ];
    render(<Select options={groupedOpts} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('과일')).toBeInTheDocument();
    expect(screen.getByText('채소')).toBeInTheDocument();
    expect(screen.getByText('사과')).toBeInTheDocument();
    expect(screen.getByText('당근')).toBeInTheDocument();
  });

  it('group labels have presentation role', () => {
    const groupedOpts: SelectOption[] = [
      { value: 'apple', label: '사과', group: '과일' },
    ];
    const { container } = render(<Select options={groupedOpts} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    const groupLabel = container.querySelector('.select-group-label');
    expect(groupLabel).toHaveAttribute('role', 'presentation');
  });

  // --- Icons ---

  it('renders option icons', () => {
    const iconsOpts: SelectOption[] = [
      { value: 'a', label: 'A', icon: '🍎' },
    ];
    const { container } = render(<Select options={iconsOpts} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    const icon = container.querySelector('.select-option-icon');
    expect(icon).toBeInTheDocument();
    expect(icon!.textContent).toBe('🍎');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Keyboard navigation ---

  it('opens on ArrowDown key', () => {
    render(<Select {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens on ArrowUp key', () => {
    render(<Select {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowUp' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens on Enter key', () => {
    render(<Select {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens on Space key', () => {
    render(<Select {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: ' ' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with ArrowDown', () => {
    const { container } = render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const opts = container.querySelectorAll('.select-option');
    expect(opts[0]).toHaveClass('select-option--active');
  });

  it('navigates with ArrowUp', () => {
    const { container } = render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    const opts = container.querySelectorAll('.select-option');
    expect(opts[opts.length - 1]).toHaveClass('select-option--active');
  });

  it('selects with Enter key', () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(defaultProps.onChange).toHaveBeenCalledWith('apple');
  });

  it('wraps around at the end', () => {
    const { container } = render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // apple
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // banana
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // cherry
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // wraps to apple
    const opts = container.querySelectorAll('.select-option');
    expect(opts[0]).toHaveClass('select-option--active');
  });

  it('Home key goes to first option', () => {
    const { container } = render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'End' });
    fireEvent.keyDown(trigger, { key: 'Home' });
    const opts = container.querySelectorAll('.select-option');
    expect(opts[0]).toHaveClass('select-option--active');
  });

  it('End key goes to last option', () => {
    const { container } = render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'End' });
    const opts = container.querySelectorAll('.select-option');
    expect(opts[opts.length - 1]).toHaveClass('select-option--active');
  });

  it('skips disabled options during keyboard navigation', () => {
    const opts: SelectOption[] = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ];
    const { container } = render(<Select options={opts} onChange={vi.fn()} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // A
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // skip B, go to C
    const optEls = container.querySelectorAll('.select-option');
    expect(optEls[2]).toHaveClass('select-option--active');
  });

  // --- Mouse interactions ---

  it('highlights on mouse enter', () => {
    const { container } = render(<Select {...defaultProps} />);
    fireEvent.click(screen.getByRole('combobox'));
    const opts = container.querySelectorAll('.select-option');
    fireEvent.mouseEnter(opts[1]);
    expect(opts[1]).toHaveClass('select-option--active');
  });

  it('does not highlight disabled option on mouse enter', () => {
    const opts: SelectOption[] = [
      { value: 'a', label: 'A', disabled: true },
    ];
    const { container } = render(<Select options={opts} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    const optEls = container.querySelectorAll('.select-option');
    fireEvent.mouseEnter(optEls[0]);
    expect(optEls[0]).not.toHaveClass('select-option--active');
  });

  // --- Outside click ---

  it('closes on outside click', () => {
    render(
      <div>
        <div data-testid="outside">외부</div>
        <Select {...defaultProps} />
      </div>
    );
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- ARIA ---

  it('trigger has aria-expanded', () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('trigger has aria-haspopup', () => {
    render(<Select {...defaultProps} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('options have aria-selected', () => {
    const { container } = render(<Select {...defaultProps} value="banana" />);
    fireEvent.click(screen.getByRole('combobox'));
    const opts = container.querySelectorAll('[role="option"]');
    expect(opts[0]).toHaveAttribute('aria-selected', 'false');
    expect(opts[1]).toHaveAttribute('aria-selected', 'true');
    expect(opts[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('disabled option has aria-disabled', () => {
    const opts: SelectOption[] = [
      { value: 'a', label: 'A', disabled: true },
    ];
    const { container } = render(<Select options={opts} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    const optEls = container.querySelectorAll('[role="option"]');
    expect(optEls[0]).toHaveAttribute('aria-disabled', 'true');
  });

  it('search input has correct aria-label', () => {
    render(<Select {...defaultProps} searchable />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByLabelText('옵션 검색')).toBeInTheDocument();
  });

  // --- Open state class ---

  it('applies open class when open', () => {
    const { container } = render(<Select {...defaultProps} />);
    expect(container.querySelector('.select--open')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('combobox'));
    expect(container.querySelector('.select--open')).toBeInTheDocument();
  });

  // --- Toggle close ---

  it('toggles dropdown closed on second click', () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- No onChange ---

  it('does not crash if onChange is not provided', () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('사과'));
    // should not throw
  });

  // --- Value undefined ---

  it('handles undefined value gracefully', () => {
    render(<Select {...defaultProps} value={undefined} />);
    expect(screen.getByText('선택하세요')).toBeInTheDocument();
  });

  // --- Space in searchable mode ---

  it('does not select on Space when searchable', () => {
    render(<Select {...defaultProps} searchable />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: ' ' });
    // Should NOT select because searchable allows typing space
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  // --- maxHeight ---

  it('applies maxHeight to options list', () => {
    render(<Select {...defaultProps} maxHeight={100} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveStyle({ maxHeight: '100px' });
  });

  // --- Mixed grouped and ungrouped ---

  it('renders both grouped and ungrouped options', () => {
    const mixedOpts: SelectOption[] = [
      { value: 'water', label: '물' },
      { value: 'apple', label: '사과', group: '과일' },
      { value: 'carrot', label: '당근', group: '채소' },
    ];
    render(<Select options={mixedOpts} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('물')).toBeInTheDocument();
    expect(screen.getByText('과일')).toBeInTheDocument();
    expect(screen.getByText('사과')).toBeInTheDocument();
    expect(screen.getByText('채소')).toBeInTheDocument();
    expect(screen.getByText('당근')).toBeInTheDocument();
  });

  // --- Clear does not open dropdown ---

  it('clear button does not open dropdown', () => {
    render(<Select {...defaultProps} clearable value="apple" />);
    fireEvent.click(screen.getByLabelText('선택 초기화'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- Does not show clear when disabled ---

  it('does not show clear button when disabled', () => {
    render(<Select {...defaultProps} clearable disabled value="apple" />);
    expect(screen.queryByLabelText('선택 초기화')).not.toBeInTheDocument();
  });
});
