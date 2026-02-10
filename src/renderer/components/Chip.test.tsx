import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Chip from './Chip';

describe('Chip', () => {
  it('renders label text', () => {
    render(<Chip label="태그" />);
    expect(screen.getByText('태그')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    render(<Chip label="태그" />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveClass('chip--default');
  });

  it('applies primary variant class', () => {
    render(<Chip label="태그" variant="primary" />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveClass('chip--primary');
  });

  it('applies success variant class', () => {
    render(<Chip label="태그" variant="success" />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveClass('chip--success');
  });

  it('applies warning variant class', () => {
    render(<Chip label="태그" variant="warning" />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveClass('chip--warning');
  });

  it('applies error variant class', () => {
    render(<Chip label="태그" variant="error" />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveClass('chip--error');
  });

  it('renders icon when provided', () => {
    render(<Chip label="태그" icon="🏷" />);
    expect(screen.getByText('🏷')).toBeInTheDocument();
  });

  it('hides icon from screen readers', () => {
    render(<Chip label="태그" icon="🏷" />);
    expect(screen.getByText('🏷')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows remove button when removable', () => {
    render(<Chip label="태그" removable onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: '태그 삭제' })).toBeInTheDocument();
  });

  it('does not show remove button when not removable', () => {
    render(<Chip label="태그" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn();
    render(<Chip label="태그" removable onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: '태그 삭제' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('stops propagation on remove click', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(<Chip label="태그" removable onRemove={onRemove} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: '태그 삭제' }));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Chip label="태그" onClick={onClick} />);
    fireEvent.click(screen.getByText('태그').closest('.chip')!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('has role="button" when clickable', () => {
    render(<Chip label="태그" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: '태그' })).toBeInTheDocument();
  });

  it('does not have role="button" when not clickable', () => {
    render(<Chip label="태그" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has tabIndex=0 when clickable', () => {
    render(<Chip label="태그" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: '태그' })).toHaveAttribute('tabindex', '0');
  });

  it('triggers onClick on Enter key', () => {
    const onClick = vi.fn();
    render(<Chip label="태그" onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button', { name: '태그' }), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('triggers onClick on Space key', () => {
    const onClick = vi.fn();
    render(<Chip label="태그" onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button', { name: '태그' }), { key: ' ' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies selected CSS class', () => {
    render(<Chip label="태그" selected />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveClass('chip--selected');
  });

  it('applies disabled CSS class', () => {
    render(<Chip label="태그" disabled />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveClass('chip--disabled');
  });

  it('applies clickable CSS class when onClick provided', () => {
    render(<Chip label="태그" onClick={() => {}} />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveClass('chip--clickable');
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Chip label="태그" onClick={onClick} disabled />);
    // When disabled, no role="button" is applied
    fireEvent.click(screen.getByText('태그').closest('.chip')!);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onRemove when disabled', () => {
    const onRemove = vi.fn();
    render(<Chip label="태그" removable onRemove={onRemove} disabled />);
    const removeBtn = screen.getByRole('button', { name: '태그 삭제' });
    fireEvent.click(removeBtn);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('has aria-pressed when clickable', () => {
    render(<Chip label="태그" onClick={() => {}} selected />);
    expect(screen.getByRole('button', { name: '태그' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('has aria-disabled when disabled', () => {
    render(<Chip label="태그" disabled />);
    const chip = screen.getByText('태그').closest('.chip')!;
    expect(chip).toHaveAttribute('aria-disabled', 'true');
  });
});
