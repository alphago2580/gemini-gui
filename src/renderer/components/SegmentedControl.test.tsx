import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SegmentedControl, { SegmentedControlOption } from './SegmentedControl';

const defaultOptions: SegmentedControlOption[] = [
  { id: 'day', label: '일간' },
  { id: 'week', label: '주간' },
  { id: 'month', label: '월간' },
];

function createOptionsWithIcons(): SegmentedControlOption[] {
  return [
    { id: 'list', label: '목록', icon: '📋' },
    { id: 'grid', label: '그리드', icon: '🔲' },
    { id: 'card', label: '카드', icon: '🃏' },
  ];
}

function createOptionsWithDisabled(): SegmentedControlOption[] {
  return [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B', disabled: true },
    { id: 'c', label: 'C' },
  ];
}

describe('SegmentedControl', () => {
  // --- Rendering ---

  it('renders all options', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    expect(screen.getByText('일간')).toBeInTheDocument();
    expect(screen.getByText('주간')).toBeInTheDocument();
    expect(screen.getByText('월간')).toBeInTheDocument();
  });

  it('renders with role="radiogroup"', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders options with role="radio"', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('renders icons when provided', () => {
    const onChange = vi.fn();
    const opts = createOptionsWithIcons();
    render(<SegmentedControl options={opts} value="list" onChange={onChange} />);
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('🔲')).toBeInTheDocument();
    expect(screen.getByText('🃏')).toBeInTheDocument();
  });

  // --- Selection ---

  it('marks selected option with aria-checked=true', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="week" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: '주간' })).toHaveAttribute('aria-checked', 'true');
  });

  it('marks non-selected options with aria-checked=false', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="week" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: '일간' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: '월간' })).toHaveAttribute('aria-checked', 'false');
  });

  it('applies selected class to selected option', () => {
    const onChange = vi.fn();
    const { container } = render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    const selected = container.querySelector('.segmented-control-option-selected');
    expect(selected).toBeInTheDocument();
    expect(selected?.textContent).toContain('일간');
  });

  it('selected option has tabIndex=0', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="week" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: '주간' })).toHaveAttribute('tabindex', '0');
  });

  it('non-selected options have tabIndex=-1', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="week" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: '일간' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: '월간' })).toHaveAttribute('tabindex', '-1');
  });

  // --- Click ---

  it('calls onChange when option is clicked', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '주간' }));
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('does not call onChange when disabled option is clicked', () => {
    const onChange = vi.fn();
    const opts = createOptionsWithDisabled();
    render(<SegmentedControl options={opts} value="a" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when globally disabled', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('radio', { name: '주간' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  // --- Keyboard ---

  it('navigates right with ArrowRight', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    const firstRadio = screen.getByRole('radio', { name: '일간' });
    fireEvent.keyDown(firstRadio, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('navigates left with ArrowLeft', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="week" onChange={onChange} />);
    const secondRadio = screen.getByRole('radio', { name: '주간' });
    fireEvent.keyDown(secondRadio, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('day');
  });

  it('wraps from last to first with ArrowRight', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="month" onChange={onChange} />);
    const lastRadio = screen.getByRole('radio', { name: '월간' });
    fireEvent.keyDown(lastRadio, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('day');
  });

  it('wraps from first to last with ArrowLeft', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    const firstRadio = screen.getByRole('radio', { name: '일간' });
    fireEvent.keyDown(firstRadio, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('navigates with ArrowDown (same as ArrowRight)', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    const firstRadio = screen.getByRole('radio', { name: '일간' });
    fireEvent.keyDown(firstRadio, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('navigates with ArrowUp (same as ArrowLeft)', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="week" onChange={onChange} />);
    const secondRadio = screen.getByRole('radio', { name: '주간' });
    fireEvent.keyDown(secondRadio, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith('day');
  });

  it('jumps to first with Home', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="month" onChange={onChange} />);
    const lastRadio = screen.getByRole('radio', { name: '월간' });
    fireEvent.keyDown(lastRadio, { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith('day');
  });

  it('jumps to last with End', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    const firstRadio = screen.getByRole('radio', { name: '일간' });
    fireEvent.keyDown(firstRadio, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('skips disabled options when navigating', () => {
    const onChange = vi.fn();
    const opts = createOptionsWithDisabled();
    render(<SegmentedControl options={opts} value="a" onChange={onChange} />);
    const firstRadio = screen.getByRole('radio', { name: 'A' });
    fireEvent.keyDown(firstRadio, { key: 'ArrowRight' });
    // Should skip B (disabled) and go to C
    expect(onChange).toHaveBeenCalledWith('c');
  });

  // --- Sizes ---

  it('applies small size class', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} size="small" />
    );
    expect(container.querySelector('.segmented-control-small')).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} />
    );
    expect(container.querySelector('.segmented-control-medium')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} size="large" />
    );
    expect(container.querySelector('.segmented-control-large')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies default variant class', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} />
    );
    expect(container.querySelector('.segmented-control-default')).toBeInTheDocument();
  });

  it('applies primary variant class', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} variant="primary" />
    );
    expect(container.querySelector('.segmented-control-primary')).toBeInTheDocument();
  });

  it('applies ghost variant class', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} variant="ghost" />
    );
    expect(container.querySelector('.segmented-control-ghost')).toBeInTheDocument();
  });

  // --- Full width ---

  it('applies full-width class when fullWidth=true', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} fullWidth />
    );
    expect(container.querySelector('.segmented-control-full-width')).toBeInTheDocument();
  });

  it('does not apply full-width class by default', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} />
    );
    expect(container.querySelector('.segmented-control-full-width')).not.toBeInTheDocument();
  });

  // --- Disabled ---

  it('applies disabled class when disabled', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} disabled />
    );
    expect(container.querySelector('.segmented-control-disabled')).toBeInTheDocument();
  });

  it('all buttons are disabled when globally disabled', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} disabled />
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toBeDisabled();
    });
  });

  it('individual disabled option has disabled class', () => {
    const onChange = vi.fn();
    const opts = createOptionsWithDisabled();
    const { container } = render(
      <SegmentedControl options={opts} value="a" onChange={onChange} />
    );
    const disabledOpts = container.querySelectorAll('.segmented-control-option-disabled');
    expect(disabledOpts).toHaveLength(1);
  });

  // --- Accessibility ---

  it('has aria-label on radiogroup', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={defaultOptions} value="day" onChange={onChange} />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', '세그먼트 컨트롤');
  });

  it('uses custom ariaLabel', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl options={defaultOptions} value="day" onChange={onChange} ariaLabel="기간 선택" />
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', '기간 선택');
  });

  it('disabled options have aria-disabled', () => {
    const onChange = vi.fn();
    const opts = createOptionsWithDisabled();
    render(<SegmentedControl options={opts} value="a" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-disabled', 'true');
  });
});
