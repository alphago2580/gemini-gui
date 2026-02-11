import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NumberInput from './NumberInput';

describe('NumberInput', () => {
  // --- Rendering ---

  it('renders spinbutton', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders increment and decrement buttons', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    expect(screen.getByLabelText('증가')).toBeInTheDocument();
    expect(screen.getByLabelText('감소')).toBeInTheDocument();
  });

  it('displays value in input', () => {
    const onChange = vi.fn();
    render(<NumberInput value={42} onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('42');
  });

  it('displays prefix', () => {
    const onChange = vi.fn();
    render(<NumberInput value={100} onChange={onChange} prefix="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('displays suffix', () => {
    const onChange = vi.fn();
    render(<NumberInput value={50} onChange={onChange} suffix="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('displays placeholder', () => {
    const onChange = vi.fn();
    render(<NumberInput value={0} onChange={onChange} placeholder="수량" />);
    expect(screen.getByPlaceholderText('수량')).toBeInTheDocument();
  });

  // --- Increment / Decrement ---

  it('increments on + button click', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('증가'));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrements on - button click', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('감소'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('increments by custom step', () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} step={5} />);
    fireEvent.click(screen.getByLabelText('증가'));
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('decrements by custom step', () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} step={3} />);
    fireEvent.click(screen.getByLabelText('감소'));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  // --- Min / Max ---

  it('clamps value to max', () => {
    const onChange = vi.fn();
    render(<NumberInput value={9} onChange={onChange} max={10} />);
    fireEvent.click(screen.getByLabelText('증가'));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('clamps value to min', () => {
    const onChange = vi.fn();
    render(<NumberInput value={1} onChange={onChange} min={0} />);
    fireEvent.click(screen.getByLabelText('감소'));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('disables increment button at max', () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} max={10} />);
    expect(screen.getByLabelText('증가')).toBeDisabled();
  });

  it('disables decrement button at min', () => {
    const onChange = vi.fn();
    render(<NumberInput value={0} onChange={onChange} min={0} />);
    expect(screen.getByLabelText('감소')).toBeDisabled();
  });

  // --- Keyboard ---

  it('increments on ArrowUp', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrements on ArrowDown', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('jumps to min on Home', () => {
    const onChange = vi.fn();
    render(<NumberInput value={50} onChange={onChange} min={0} />);
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('jumps to max on End', () => {
    const onChange = vi.fn();
    render(<NumberInput value={50} onChange={onChange} max={100} />);
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'End' });
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('commits value on Enter', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(25);
  });

  // --- Manual input ---

  it('accepts typed value and commits on blur', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('reverts to previous value on invalid input blur', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);
    // Should not call onChange with NaN
    expect(input).toHaveValue('5');
  });

  it('clamps manual input to range on blur', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} min={0} max={10} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(10);
  });

  // --- Precision ---

  it('formats value with precision', () => {
    const onChange = vi.fn();
    render(<NumberInput value={3.14159} onChange={onChange} precision={2} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('3.14');
  });

  it('increments with precision', () => {
    const onChange = vi.fn();
    render(<NumberInput value={1.5} onChange={onChange} step={0.1} precision={1} />);
    fireEvent.click(screen.getByLabelText('증가'));
    expect(onChange).toHaveBeenCalledWith(1.6);
  });

  // --- Disabled / ReadOnly ---

  it('does not increment when disabled', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} disabled />);
    fireEvent.click(screen.getByLabelText('증가'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not decrement when disabled', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} disabled />);
    fireEvent.click(screen.getByLabelText('감소'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not increment when readOnly', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} readOnly />);
    fireEvent.click(screen.getByLabelText('증가'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('input is disabled when disabled', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('input is readOnly when readOnly', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} readOnly />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('readonly');
  });

  it('applies disabled class', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput value={5} onChange={onChange} disabled />);
    expect(container.querySelector('.number-input-disabled')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput value={5} onChange={onChange} size="small" />);
    expect(container.querySelector('.number-input-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput value={5} onChange={onChange} />);
    expect(container.querySelector('.number-input-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput value={5} onChange={onChange} size="large" />);
    expect(container.querySelector('.number-input-large')).toBeInTheDocument();
  });

  // --- Accessibility ---

  it('has aria-label', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-label', '숫자 입력');
  });

  it('uses custom ariaLabel', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} ariaLabel="수량 입력" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-label', '수량 입력');
  });

  it('has aria-valuemin', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} min={0} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuemin', '0');
  });

  it('has aria-valuemax', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} max={100} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuemax', '100');
  });

  it('has aria-valuenow', () => {
    const onChange = vi.fn();
    render(<NumberInput value={42} onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '42');
  });

  // --- Focus ---

  it('applies focused class on focus', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.focus(screen.getByRole('spinbutton'));
    expect(container.querySelector('.number-input-focused')).toBeInTheDocument();
  });

  it('removes focused class on blur', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput value={5} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(container.querySelector('.number-input-focused')).not.toBeInTheDocument();
  });

  it('calls onFocus callback', () => {
    const onChange = vi.fn();
    const onFocus = vi.fn();
    render(<NumberInput value={5} onChange={onChange} onFocus={onFocus} />);
    fireEvent.focus(screen.getByRole('spinbutton'));
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur callback', () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(<NumberInput value={5} onChange={onChange} onBlur={onBlur} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  // --- Edge cases ---

  it('handles negative values', () => {
    const onChange = vi.fn();
    render(<NumberInput value={-5} onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('-5');
  });

  it('handles decimal values', () => {
    const onChange = vi.fn();
    render(<NumberInput value={3.14} onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('3.14');
  });

  it('handles zero', () => {
    const onChange = vi.fn();
    render(<NumberInput value={0} onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('0');
  });
});
