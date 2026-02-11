import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ColorSwatch from './ColorSwatch';

const palette = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

describe('ColorSwatch', () => {
  // -- Rendering --
  it('renders with role="radiogroup"', () => {
    render(<ColorSwatch colors={palette} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders color buttons', () => {
    render(<ColorSwatch colors={palette} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
  });

  it('each button has background color', () => {
    render(<ColorSwatch colors={palette} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveStyle({ backgroundColor: '#ff0000' });
    expect(radios[1]).toHaveStyle({ backgroundColor: '#00ff00' });
  });

  it('each button has aria-label with color value', () => {
    render(<ColorSwatch colors={palette} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-label', '#ff0000');
  });

  it('each button has title with color value', () => {
    render(<ColorSwatch colors={palette} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('title', '#ff0000');
  });

  it('renders empty with no colors', () => {
    render(<ColorSwatch colors={[]} />);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('has default aria-label', () => {
    render(<ColorSwatch colors={palette} />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', '색상 선택');
  });

  it('uses custom label', () => {
    render(<ColorSwatch colors={palette} label="테마 색상" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', '테마 색상');
  });

  it('renders label text', () => {
    render(<ColorSwatch colors={palette} label="테마 색상" />);
    expect(screen.getByText('테마 색상')).toBeInTheDocument();
  });

  it('applies custom id', () => {
    render(<ColorSwatch colors={palette} id="my-swatch" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('id', 'my-swatch');
  });

  // -- Selection --
  it('marks selected color with aria-checked', () => {
    render(<ColorSwatch colors={palette} value="#00ff00" />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('applies selected CSS class', () => {
    render(<ColorSwatch colors={palette} value="#0000ff" />);
    const radios = screen.getAllByRole('radio');
    expect(radios[2]).toHaveClass('color-swatch-item--selected');
    expect(radios[0]).not.toHaveClass('color-swatch-item--selected');
  });

  it('calls onChange when color is clicked', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('radio')[2]);
    expect(onChange).toHaveBeenCalledWith('#0000ff');
  });

  it('calls onChange on Enter key', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} onChange={onChange} />);
    fireEvent.keyDown(screen.getAllByRole('radio')[1], { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });

  it('calls onChange on Space key', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} onChange={onChange} />);
    fireEvent.keyDown(screen.getAllByRole('radio')[0], { key: ' ' });
    expect(onChange).toHaveBeenCalledWith('#ff0000');
  });

  // -- Sizes --
  it('applies medium size by default', () => {
    render(<ColorSwatch colors={palette} />);
    expect(screen.getByRole('radiogroup')).toHaveClass('color-swatch--medium');
  });

  it('applies small size', () => {
    render(<ColorSwatch colors={palette} size="small" />);
    expect(screen.getByRole('radiogroup')).toHaveClass('color-swatch--small');
  });

  it('applies large size', () => {
    render(<ColorSwatch colors={palette} size="large" />);
    expect(screen.getByRole('radiogroup')).toHaveClass('color-swatch--large');
  });

  // -- Columns --
  it('applies grid columns style', () => {
    const { container } = render(<ColorSwatch colors={palette} columns={5} />);
    const grid = container.querySelector('.color-swatch-grid');
    expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(5, 1fr)' });
  });

  it('defaults to 8 columns', () => {
    const { container } = render(<ColorSwatch colors={palette} />);
    const grid = container.querySelector('.color-swatch-grid');
    expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(8, 1fr)' });
  });

  // -- Disabled --
  it('disables all buttons when disabled', () => {
    render(<ColorSwatch colors={palette} disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => expect(radio).toBeDisabled());
  });

  it('applies disabled CSS class', () => {
    render(<ColorSwatch colors={palette} disabled />);
    expect(screen.getByRole('radiogroup')).toHaveClass('color-swatch--disabled');
  });

  it('has aria-disabled when disabled', () => {
    render(<ColorSwatch colors={palette} disabled />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
  });

  // -- Custom color input --
  it('does not show custom input by default', () => {
    render(<ColorSwatch colors={palette} />);
    expect(screen.queryByLabelText('커스텀 색상 입력')).not.toBeInTheDocument();
  });

  it('shows custom trigger when allowCustom=true', () => {
    render(<ColorSwatch colors={palette} allowCustom />);
    expect(screen.getByLabelText('커스텀 색상 입력')).toBeInTheDocument();
  });

  it('shows input field on trigger click', () => {
    render(<ColorSwatch colors={palette} allowCustom />);
    fireEvent.click(screen.getByLabelText('커스텀 색상 입력'));
    expect(screen.getByLabelText('색상 코드 입력')).toBeInTheDocument();
  });

  it('applies custom color via apply button', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} allowCustom onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('커스텀 색상 입력'));
    const input = screen.getByLabelText('색상 코드 입력');
    fireEvent.change(input, { target: { value: '#abc123' } });
    fireEvent.click(screen.getByLabelText('색상 적용'));
    expect(onChange).toHaveBeenCalledWith('#abc123');
  });

  it('applies custom color via Enter key', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} allowCustom onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('커스텀 색상 입력'));
    const input = screen.getByLabelText('색상 코드 입력');
    fireEvent.change(input, { target: { value: 'ff0' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('#ff0');
  });

  it('rejects invalid hex color', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} allowCustom onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('커스텀 색상 입력'));
    const input = screen.getByLabelText('색상 코드 입력');
    fireEvent.change(input, { target: { value: 'xyz' } });
    fireEvent.click(screen.getByLabelText('색상 적용'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes custom input on Escape', () => {
    render(<ColorSwatch colors={palette} allowCustom />);
    fireEvent.click(screen.getByLabelText('커스텀 색상 입력'));
    const input = screen.getByLabelText('색상 코드 입력');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByLabelText('색상 코드 입력')).not.toBeInTheDocument();
  });

  it('clears input after successful custom color', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} allowCustom onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('커스텀 색상 입력'));
    const input = screen.getByLabelText('색상 코드 입력');
    fireEvent.change(input, { target: { value: '#aabbcc' } });
    fireEvent.click(screen.getByLabelText('색상 적용'));
    // Custom input row should be hidden after apply
    expect(screen.queryByLabelText('색상 코드 입력')).not.toBeInTheDocument();
  });

  it('does not apply empty custom color', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} allowCustom onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('커스텀 색상 입력'));
    fireEvent.click(screen.getByLabelText('색상 적용'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports 3-digit hex', () => {
    const onChange = vi.fn();
    render(<ColorSwatch colors={palette} allowCustom onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('커스텀 색상 입력'));
    const input = screen.getByLabelText('색상 코드 입력');
    fireEvent.change(input, { target: { value: '#f0f' } });
    fireEvent.click(screen.getByLabelText('색상 적용'));
    expect(onChange).toHaveBeenCalledWith('#f0f');
  });
});
