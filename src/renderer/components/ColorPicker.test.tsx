import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  const defaultProps = {
    value: '#2196f3',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('renders trigger button with swatch', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    const swatch = container.querySelector('.color-picker__swatch');
    expect(swatch).toBeTruthy();
    expect(swatch).toHaveStyle({ backgroundColor: '#2196f3' });
  });

  it('renders hex input by default', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByLabelText('색상 코드')).toBeInTheDocument();
    expect(screen.getByLabelText('색상 코드')).toHaveValue('#2196f3');
  });

  it('hides hex input when showInput is false', () => {
    render(<ColorPicker {...defaultProps} showInput={false} />);
    expect(screen.queryByLabelText('색상 코드')).not.toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<ColorPicker {...defaultProps} label="배경 색상" />);
    expect(screen.getByText('배경 색상')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    expect(container.querySelector('.color-picker__label')).toBeNull();
  });

  // --- Dropdown ---

  it('does not show dropdown initially', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    expect(container.querySelector('.color-picker__dropdown')).toBeNull();
  });

  it('shows dropdown when trigger is clicked', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(container.querySelector('.color-picker__dropdown')).toBeTruthy();
  });

  it('hides dropdown on second trigger click', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    const trigger = screen.getByLabelText('색상 선택');
    fireEvent.click(trigger);
    expect(container.querySelector('.color-picker__dropdown')).toBeTruthy();
    fireEvent.click(trigger);
    expect(container.querySelector('.color-picker__dropdown')).toBeNull();
  });

  it('renders preset colors in dropdown', () => {
    render(<ColorPicker {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    const presets = screen.getAllByRole('option');
    expect(presets.length).toBe(20); // default 20 presets
  });

  it('renders custom preset colors', () => {
    const presets = ['#ff0000', '#00ff00', '#0000ff'];
    render(<ColorPicker {...defaultProps} presetColors={presets} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  // --- Preset selection ---

  it('calls onChange when a preset is clicked', () => {
    render(<ColorPicker {...defaultProps} presetColors={['#ff0000', '#00ff00']} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    fireEvent.click(screen.getByLabelText('#ff0000'));
    expect(defaultProps.onChange).toHaveBeenCalledWith('#ff0000');
  });

  it('closes dropdown after selecting a preset', () => {
    const { container } = render(
      <ColorPicker {...defaultProps} presetColors={['#ff0000']} />
    );
    fireEvent.click(screen.getByLabelText('색상 선택'));
    fireEvent.click(screen.getByLabelText('#ff0000'));
    expect(container.querySelector('.color-picker__dropdown')).toBeNull();
  });

  it('marks selected preset with selected class', () => {
    const { container } = render(
      <ColorPicker {...defaultProps} value="#ff0000" presetColors={['#ff0000', '#00ff00']} />
    );
    fireEvent.click(screen.getByLabelText('색상 선택'));
    const selected = container.querySelector('.color-picker__preset--selected');
    expect(selected).toBeTruthy();
    expect(selected).toHaveAttribute('aria-selected', 'true');
  });

  // --- Input ---

  it('calls onChange when valid hex is typed', () => {
    render(<ColorPicker {...defaultProps} />);
    const input = screen.getByLabelText('색상 코드');
    fireEvent.change(input, { target: { value: '#ff5722' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('#ff5722');
  });

  it('does not call onChange for invalid hex', () => {
    render(<ColorPicker {...defaultProps} />);
    const input = screen.getByLabelText('색상 코드');
    fireEvent.change(input, { target: { value: '#xyz' } });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('reverts input on blur with invalid hex', () => {
    render(<ColorPicker {...defaultProps} />);
    const input = screen.getByLabelText('색상 코드');
    fireEvent.change(input, { target: { value: '#xyz' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('#2196f3');
  });

  // --- Escape key ---

  it('closes dropdown on Escape key', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(container.querySelector('.color-picker__dropdown')).toBeTruthy();
    fireEvent.keyDown(container.querySelector('.color-picker')!, { key: 'Escape' });
    expect(container.querySelector('.color-picker__dropdown')).toBeNull();
  });

  // --- Click outside ---

  it('closes dropdown on outside click', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(container.querySelector('.color-picker__dropdown')).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(container.querySelector('.color-picker__dropdown')).toBeNull();
  });

  // --- Disabled ---

  it('applies disabled class when disabled', () => {
    const { container } = render(<ColorPicker {...defaultProps} disabled={true} />);
    expect(container.querySelector('.color-picker--disabled')).toBeTruthy();
  });

  it('disables trigger button when disabled', () => {
    render(<ColorPicker {...defaultProps} disabled={true} />);
    expect(screen.getByLabelText('색상 선택')).toBeDisabled();
  });

  it('disables input when disabled', () => {
    render(<ColorPicker {...defaultProps} disabled={true} />);
    expect(screen.getByLabelText('색상 코드')).toBeDisabled();
  });

  // --- Accessibility ---

  it('trigger has aria-expanded', () => {
    render(<ColorPicker {...defaultProps} />);
    const trigger = screen.getByLabelText('색상 선택');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('trigger has aria-haspopup', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByLabelText('색상 선택')).toHaveAttribute('aria-haspopup', 'true');
  });

  it('dropdown has role="listbox"', () => {
    render(<ColorPicker {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('preset buttons have role="option"', () => {
    render(<ColorPicker {...defaultProps} presetColors={['#ff0000']} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(screen.getByRole('option')).toBeInTheDocument();
  });

  it('swatch is aria-hidden', () => {
    const { container } = render(<ColorPicker {...defaultProps} />);
    const swatch = container.querySelector('.color-picker__swatch');
    expect(swatch).toHaveAttribute('aria-hidden', 'true');
  });

  it('syncs input value when value prop changes', () => {
    const { rerender } = render(<ColorPicker {...defaultProps} />);
    expect(screen.getByLabelText('색상 코드')).toHaveValue('#2196f3');
    rerender(<ColorPicker {...defaultProps} value="#ff0000" />);
    expect(screen.getByLabelText('색상 코드')).toHaveValue('#ff0000');
  });

  it('trigger button has title showing current value', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByLabelText('색상 선택')).toHaveAttribute('title', '#2196f3');
  });

  it('does not open dropdown when disabled', () => {
    const { container } = render(<ColorPicker {...defaultProps} disabled={true} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(container.querySelector('.color-picker__dropdown')).toBeNull();
  });

  it('input maxLength is 7', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByLabelText('색상 코드')).toHaveAttribute('maxlength', '7');
  });

  it('input placeholder is #000000', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByLabelText('색상 코드')).toHaveAttribute('placeholder', '#000000');
  });

  it('preset aria-label matches color code', () => {
    render(<ColorPicker {...defaultProps} presetColors={['#ff0000']} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(screen.getByLabelText('#ff0000')).toBeInTheDocument();
  });

  it('dropdown aria-label is 프리셋 색상', () => {
    render(<ColorPicker {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('색상 선택'));
    expect(screen.getByLabelText('프리셋 색상')).toBeInTheDocument();
  });

  it('non-selected preset does not have --selected class', () => {
    const { container } = render(
      <ColorPicker {...defaultProps} value="#ff0000" presetColors={['#ff0000', '#00ff00']} />
    );
    fireEvent.click(screen.getByLabelText('색상 선택'));
    const presets = container.querySelectorAll('.color-picker__preset');
    expect(presets[1]).not.toHaveClass('color-picker__preset--selected');
  });
});
