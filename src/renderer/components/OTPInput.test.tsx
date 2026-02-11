import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OTPInput from './OTPInput';

describe('OTPInput', () => {
  // -- Rendering --
  it('renders with role="group"', () => {
    render(<OTPInput />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders 6 input fields by default', () => {
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('renders custom number of fields', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('has default aria-label', () => {
    render(<OTPInput />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '인증 코드 입력');
  });

  it('uses custom label for aria-label', () => {
    render(<OTPInput label="인증번호" />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '인증번호');
  });

  it('renders label text', () => {
    render(<OTPInput label="인증번호" />);
    expect(screen.getByText('인증번호')).toBeInTheDocument();
  });

  it('applies custom id', () => {
    render(<OTPInput id="otp" />);
    expect(screen.getByRole('group')).toHaveAttribute('id', 'otp');
  });

  it('each input has aria-label with position', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('aria-label', '1번째 자리');
    expect(inputs[3]).toHaveAttribute('aria-label', '4번째 자리');
  });

  it('inputs have inputMode="numeric"', () => {
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('inputmode', 'numeric');
    });
  });

  // -- Sizes --
  it('applies medium size by default', () => {
    render(<OTPInput />);
    expect(screen.getByRole('group')).toHaveClass('otp-input--medium');
  });

  it('applies small size class', () => {
    render(<OTPInput size="small" />);
    expect(screen.getByRole('group')).toHaveClass('otp-input--small');
  });

  it('applies large size class', () => {
    render(<OTPInput size="large" />);
    expect(screen.getByRole('group')).toHaveClass('otp-input--large');
  });

  // -- Initial value --
  it('populates initial value', () => {
    render(<OTPInput length={4} value="1234" />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
  });

  it('handles partial initial value', () => {
    render(<OTPInput length={4} value="12" />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('');
    expect(inputs[3]).toHaveValue('');
  });

  // -- Input behavior --
  it('accepts single digit input', () => {
    const onChange = vi.fn();
    render(<OTPInput length={4} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('rejects non-digit input', () => {
    const onChange = vi.fn();
    render(<OTPInput length={4} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'a' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('moves focus to next field on digit input', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('does not move focus past last field', () => {
    render(<OTPInput length={4} value="123" />);
    const inputs = screen.getAllByRole('textbox');
    inputs[3].focus();
    fireEvent.change(inputs[3], { target: { value: '4' } });
    expect(document.activeElement).toBe(inputs[3]);
  });

  // -- Backspace --
  it('clears current digit on Backspace', () => {
    const onChange = vi.fn();
    render(<OTPInput length={4} value="1234" onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    inputs[2].focus();
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith('124');
  });

  it('moves to previous field on Backspace when current is empty', () => {
    render(<OTPInput length={4} value="12" />);
    const inputs = screen.getAllByRole('textbox');
    inputs[2].focus();
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('does not move before first field on Backspace', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    inputs[0].focus();
    fireEvent.keyDown(inputs[0], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[0]);
  });

  // -- Arrow keys --
  it('moves focus left on ArrowLeft', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    inputs[2].focus();
    fireEvent.keyDown(inputs[2], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('moves focus right on ArrowRight', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    inputs[1].focus();
    fireEvent.keyDown(inputs[1], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(inputs[2]);
  });

  it('does not move left past first field', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    inputs[0].focus();
    fireEvent.keyDown(inputs[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('does not move right past last field', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    inputs[3].focus();
    fireEvent.keyDown(inputs[3], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(inputs[3]);
  });

  // -- Paste --
  it('fills fields from pasted value', () => {
    const onChange = vi.fn();
    render(<OTPInput length={4} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '1234' },
    });
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('ignores non-digit characters in paste', () => {
    const onChange = vi.fn();
    render(<OTPInput length={4} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => 'a1b2c3d4' },
    });
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('truncates paste to field length', () => {
    const onChange = vi.fn();
    render(<OTPInput length={4} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123456' },
    });
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  // -- onComplete --
  it('calls onComplete when all digits filled', () => {
    const onComplete = vi.fn();
    render(<OTPInput length={4} value="123" onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[3], { target: { value: '4' } });
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('calls onComplete on full paste', () => {
    const onComplete = vi.fn();
    render(<OTPInput length={4} onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '1234' },
    });
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('does not call onComplete on partial input', () => {
    const onComplete = vi.fn();
    render(<OTPInput length={4} onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(onComplete).not.toHaveBeenCalled();
  });

  // -- Disabled --
  it('disables all fields when disabled', () => {
    render(<OTPInput disabled />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('applies disabled CSS class', () => {
    render(<OTPInput disabled />);
    expect(screen.getByRole('group')).toHaveClass('otp-input--disabled');
  });

  // -- Error --
  it('applies error CSS class', () => {
    render(<OTPInput error />);
    expect(screen.getByRole('group')).toHaveClass('otp-input--error');
  });

  // -- Mask --
  it('uses type="password" when mask=true', () => {
    const { container } = render(<OTPInput mask />);
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  it('uses type="text" by default', () => {
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  // -- Filled class --
  it('applies filled class on filled digits', () => {
    const { container } = render(<OTPInput length={4} value="12" />);
    const fields = container.querySelectorAll('.otp-input-field');
    expect(fields[0]).toHaveClass('otp-input-field--filled');
    expect(fields[1]).toHaveClass('otp-input-field--filled');
    expect(fields[2]).not.toHaveClass('otp-input-field--filled');
  });

  // -- autoComplete --
  it('has autoComplete="one-time-code"', () => {
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    });
  });
});
