import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Combobox, { ComboboxOption } from './Combobox';

describe('Combobox', () => {
  const options: ComboboxOption[] = [
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
    render(<Combobox {...defaultProps} />);
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<Combobox {...defaultProps} placeholder="과일 검색" />);
    expect(screen.getByPlaceholderText('과일 검색')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Combobox {...defaultProps} label="과일" />);
    expect(screen.getByText('과일')).toBeInTheDocument();
  });

  it('renders input with combobox role', () => {
    render(<Combobox {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders selected value label in input', () => {
    render(<Combobox {...defaultProps} value="banana" />);
    expect(screen.getByRole('combobox')).toHaveValue('바나나');
  });

  it('does not render dropdown when closed', () => {
    render(<Combobox {...defaultProps} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- Opening/closing ---

  it('opens dropdown on input focus', () => {
    render(<Combobox {...defaultProps} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows all options when dropdown opens', () => {
    render(<Combobox {...defaultProps} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByText('사과')).toBeInTheDocument();
    expect(screen.getByText('바나나')).toBeInTheDocument();
    expect(screen.getByText('체리')).toBeInTheDocument();
  });

  it('closes dropdown on Escape key', () => {
    render(<Combobox {...defaultProps} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown on outside click', () => {
    render(
      <div>
        <Combobox {...defaultProps} />
        <button>외부 버튼</button>
      </div>
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('외부 버튼'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- Selection ---

  it('selects an option and closes dropdown', () => {
    render(<Combobox {...defaultProps} />);
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('바나나'));
    expect(defaultProps.onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('updates input value on selection', () => {
    render(<Combobox {...defaultProps} value="cherry" />);
    expect(screen.getByRole('combobox')).toHaveValue('체리');
  });

  it('shows checkmark on selected option', () => {
    const { container } = render(<Combobox {...defaultProps} value="apple" />);
    fireEvent.focus(screen.getByRole('combobox'));
    const checks = container.querySelectorAll('.combobox-option-check');
    expect(checks.length).toBe(1);
  });

  // --- Filtering ---

  it('filters options based on input', () => {
    render(<Combobox {...defaultProps} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '바' } });
    expect(screen.getByText('바나나')).toBeInTheDocument();
    expect(screen.queryByText('사과')).not.toBeInTheDocument();
    expect(screen.queryByText('체리')).not.toBeInTheDocument();
  });

  it('shows empty message when no options match', () => {
    render(<Combobox {...defaultProps} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '없는과일' } });
    expect(screen.getByText('결과가 없습니다')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(<Combobox {...defaultProps} emptyMessage="검색 결과 없음" />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
  });

  it('filters by description too', () => {
    const optionsWithDesc: ComboboxOption[] = [
      { value: 'apple', label: '사과', description: '빨간 과일' },
      { value: 'banana', label: '바나나', description: '노란 과일' },
    ];
    render(<Combobox options={optionsWithDesc} onChange={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '빨간' } });
    expect(screen.getByText('사과')).toBeInTheDocument();
    expect(screen.queryByText('바나나')).not.toBeInTheDocument();
  });

  // --- Keyboard navigation ---

  it('navigates options with ArrowDown', () => {
    const { container } = render(<Combobox {...defaultProps} autoHighlight={false} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const activeOption = container.querySelector('.combobox-option--active');
    expect(activeOption).toBeTruthy();
    expect(activeOption?.textContent).toContain('사과');
  });

  it('navigates options with ArrowUp', () => {
    const { container } = render(<Combobox {...defaultProps} autoHighlight={false} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const activeOption = container.querySelector('.combobox-option--active');
    expect(activeOption).toBeTruthy();
    expect(activeOption?.textContent).toContain('체리');
  });

  it('selects active option with Enter', () => {
    render(<Combobox {...defaultProps} autoHighlight={false} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onChange).toHaveBeenCalledWith('apple');
  });

  it('opens dropdown with ArrowDown when closed', () => {
    render(<Combobox {...defaultProps} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('wraps navigation from last to first', () => {
    const { container } = render(<Combobox {...defaultProps} autoHighlight={false} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    // Navigate to last item then past it
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // 사과
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // 바나나
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // 체리
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // wraps to 사과
    const active = container.querySelector('.combobox-option--active');
    expect(active?.textContent).toContain('사과');
  });

  it('navigates to first with Home key', () => {
    const { container } = render(<Combobox {...defaultProps} autoHighlight={false} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Home' });
    const active = container.querySelector('.combobox-option--active');
    expect(active?.textContent).toContain('사과');
  });

  it('navigates to last with End key', () => {
    const { container } = render(<Combobox {...defaultProps} autoHighlight={false} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'End' });
    const active = container.querySelector('.combobox-option--active');
    expect(active?.textContent).toContain('체리');
  });

  // --- Disabled ---

  it('does not open when disabled', () => {
    render(<Combobox {...defaultProps} disabled />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('skips disabled options in navigation', () => {
    const optionsWithDisabled: ComboboxOption[] = [
      { value: 'apple', label: '사과' },
      { value: 'banana', label: '바나나', disabled: true },
      { value: 'cherry', label: '체리' },
    ];
    const { container } = render(
      <Combobox options={optionsWithDisabled} onChange={vi.fn()} autoHighlight={false} />
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // 사과
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // skips 바나나 → 체리
    const active = container.querySelector('.combobox-option--active');
    expect(active?.textContent).toContain('체리');
  });

  it('does not select disabled options on click', () => {
    const onChangeMock = vi.fn();
    const optionsWithDisabled: ComboboxOption[] = [
      { value: 'apple', label: '사과' },
      { value: 'banana', label: '바나나', disabled: true },
    ];
    render(<Combobox options={optionsWithDisabled} onChange={onChangeMock} />);
    fireEvent.focus(screen.getByRole('combobox'));
    // The disabled option has pointer-events: none in CSS, but we still test click handler
    fireEvent.click(screen.getByText('바나나'));
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  // --- Free input ---

  it('allows free text input when allowFreeInput is true', () => {
    render(<Combobox {...defaultProps} allowFreeInput />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '커스텀' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('커스텀');
  });

  it('does not call onChange on typing when allowFreeInput is false', () => {
    render(<Combobox {...defaultProps} allowFreeInput={false} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('confirms free input with Enter when no active option', () => {
    render(<Combobox {...defaultProps} allowFreeInput autoHighlight={false} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '새 과일' } });
    defaultProps.onChange.mockClear();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onChange).toHaveBeenCalledWith('새 과일');
  });

  // --- Clear ---

  it('shows clear button when input has value', () => {
    render(<Combobox {...defaultProps} value="apple" />);
    expect(screen.getByLabelText('입력 초기화')).toBeInTheDocument();
  });

  it('clears input on clear button click', () => {
    render(<Combobox {...defaultProps} value="apple" />);
    fireEvent.click(screen.getByLabelText('입력 초기화'));
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('does not show clear button when input is empty', () => {
    render(<Combobox {...defaultProps} />);
    expect(screen.queryByLabelText('입력 초기화')).not.toBeInTheDocument();
  });

  // --- Error ---

  it('renders error message', () => {
    render(<Combobox {...defaultProps} error="필수 항목입니다" />);
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Combobox {...defaultProps} error="에러" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  // --- Loading ---

  it('shows loading state', () => {
    render(<Combobox {...defaultProps} loading />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('does not show options when loading', () => {
    render(<Combobox {...defaultProps} loading />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies sm size class', () => {
    const { container } = render(<Combobox {...defaultProps} size="sm" />);
    expect(container.querySelector('.combobox--sm')).toBeInTheDocument();
  });

  it('applies md size class by default', () => {
    const { container } = render(<Combobox {...defaultProps} />);
    expect(container.querySelector('.combobox--md')).toBeInTheDocument();
  });

  it('applies lg size class', () => {
    const { container } = render(<Combobox {...defaultProps} size="lg" />);
    expect(container.querySelector('.combobox--lg')).toBeInTheDocument();
  });

  // --- Options with icons and descriptions ---

  it('renders option with icon', () => {
    const optionsWithIcon: ComboboxOption[] = [
      { value: 'apple', label: '사과', icon: '🍎' },
    ];
    render(<Combobox options={optionsWithIcon} onChange={vi.fn()} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByText('🍎')).toBeInTheDocument();
  });

  it('renders option with description', () => {
    const optionsWithDesc: ComboboxOption[] = [
      { value: 'apple', label: '사과', description: '빨간 과일' },
    ];
    render(<Combobox options={optionsWithDesc} onChange={vi.fn()} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByText('빨간 과일')).toBeInTheDocument();
  });

  // --- Callbacks ---

  it('calls onInputChange when input changes', () => {
    const onInputChange = vi.fn();
    render(<Combobox {...defaultProps} onInputChange={onInputChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '사' } });
    expect(onInputChange).toHaveBeenCalledWith('사');
  });

  // --- Accessibility ---

  it('has aria-expanded false when closed', () => {
    render(<Combobox {...defaultProps} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('has aria-expanded true when open', () => {
    render(<Combobox {...defaultProps} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('has aria-autocomplete=list', () => {
    render(<Combobox {...defaultProps} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('has aria-haspopup=listbox', () => {
    render(<Combobox {...defaultProps} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('sets aria-label from label prop', () => {
    render(<Combobox {...defaultProps} label="과일 선택" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', '과일 선택');
  });

  it('sets aria-label from placeholder when no label', () => {
    render(<Combobox {...defaultProps} placeholder="과일 검색" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', '과일 검색');
  });

  // --- Auto highlight ---

  it('auto highlights first option when autoHighlight is true', () => {
    const { container } = render(<Combobox {...defaultProps} autoHighlight />);
    fireEvent.focus(screen.getByRole('combobox'));
    const active = container.querySelector('.combobox-option--active');
    expect(active?.textContent).toContain('사과');
  });

  it('does not auto highlight when autoHighlight is false', () => {
    const { container } = render(<Combobox {...defaultProps} autoHighlight={false} />);
    fireEvent.focus(screen.getByRole('combobox'));
    const active = container.querySelector('.combobox-option--active');
    expect(active).toBeNull();
  });

  // --- Arrow toggle ---

  it('toggles dropdown on arrow click', () => {
    const { container } = render(<Combobox {...defaultProps} />);
    const arrow = container.querySelector('.combobox-arrow')!;
    fireEvent.click(arrow);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(arrow);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // --- Escape reverts input ---

  it('reverts input to selected value on Escape when not allowFreeInput', () => {
    render(<Combobox {...defaultProps} value="apple" />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '바' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('사과');
  });
});
