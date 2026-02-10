import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Switch from './Switch';

describe('Switch', () => {
  it('renders with role="switch"', () => {
    render(<Switch checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('shows unchecked state', () => {
    render(<Switch checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('shows checked state', () => {
    render(<Switch checked={true} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checked switch is clicked', () => {
    const onChange = vi.fn();
    render(<Switch checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has aria-disabled when disabled', () => {
    render(<Switch checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });

  it('has tabIndex=-1 when disabled', () => {
    render(<Switch checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('switch')).toHaveAttribute('tabindex', '-1');
  });

  it('has tabIndex=0 when enabled', () => {
    render(<Switch checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('tabindex', '0');
  });

  it('toggles via Space key', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles via Enter key', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle via other keys', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: 'a' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not toggle via keyboard when disabled', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} disabled />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders label text', () => {
    render(<Switch checked={false} onChange={() => {}} label="알림 설정" />);
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
  });

  it('wraps in label element when label is provided', () => {
    render(<Switch checked={false} onChange={() => {}} label="알림 설정" />);
    const labelElement = screen.getByText('알림 설정').closest('label');
    expect(labelElement).toBeInTheDocument();
  });

  it('has default aria-label when no label text', () => {
    render(<Switch checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', '토글');
  });

  it('does not have aria-label when label text is provided', () => {
    render(<Switch checked={false} onChange={() => {}} label="알림" />);
    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-label');
  });

  it('applies small size class', () => {
    render(<Switch checked={false} onChange={() => {}} size="small" />);
    expect(screen.getByRole('switch')).toHaveClass('switch--small');
  });

  it('applies medium size class by default', () => {
    render(<Switch checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveClass('switch--medium');
  });

  it('applies large size class', () => {
    render(<Switch checked={false} onChange={() => {}} size="large" />);
    expect(screen.getByRole('switch')).toHaveClass('switch--large');
  });

  it('applies checked CSS class when checked', () => {
    render(<Switch checked={true} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveClass('switch--checked');
  });

  it('does not apply checked CSS class when unchecked', () => {
    render(<Switch checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).not.toHaveClass('switch--checked');
  });

  it('applies disabled CSS class when disabled', () => {
    render(<Switch checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('switch')).toHaveClass('switch--disabled');
  });

  it('applies custom id', () => {
    render(<Switch checked={false} onChange={() => {}} id="my-switch" />);
    expect(screen.getByRole('switch')).toHaveAttribute('id', 'my-switch');
  });
});
