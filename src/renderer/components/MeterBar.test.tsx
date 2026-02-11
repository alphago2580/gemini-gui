import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MeterBar from './MeterBar';

describe('MeterBar', () => {
  // -- Rendering --
  it('renders with role="meter"', () => {
    render(<MeterBar value={50} />);
    expect(screen.getByRole('meter')).toBeInTheDocument();
  });

  it('has aria-valuenow', () => {
    render(<MeterBar value={75} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '75');
  });

  it('has aria-valuemin and aria-valuemax', () => {
    render(<MeterBar value={50} min={10} max={200} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuemin', '10');
    expect(meter).toHaveAttribute('aria-valuemax', '200');
  });

  it('defaults to min=0 max=100', () => {
    render(<MeterBar value={50} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('has default aria-label', () => {
    render(<MeterBar value={50} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-label', '미터');
  });

  it('uses custom label for aria-label', () => {
    render(<MeterBar value={50} label="CPU 사용량" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-label', 'CPU 사용량');
  });

  it('renders label text', () => {
    render(<MeterBar value={50} label="CPU 사용량" />);
    expect(screen.getByText('CPU 사용량')).toBeInTheDocument();
  });

  it('applies custom id', () => {
    const { container } = render(<MeterBar value={50} id="my-meter" />);
    expect(container.querySelector('#my-meter')).toBeInTheDocument();
  });

  // -- Fill width --
  it('sets fill width percentage', () => {
    const { container } = render(<MeterBar value={50} />);
    const fill = container.querySelector('.meter-bar-fill');
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('sets fill width for custom range', () => {
    const { container } = render(<MeterBar value={50} min={0} max={200} />);
    const fill = container.querySelector('.meter-bar-fill');
    expect(fill).toHaveStyle({ width: '25%' });
  });

  it('clamps value to min', () => {
    render(<MeterBar value={-10} min={0} max={100} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value to max', () => {
    render(<MeterBar value={150} min={0} max={100} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });

  it('handles min equal to max', () => {
    const { container } = render(<MeterBar value={50} min={50} max={50} />);
    const fill = container.querySelector('.meter-bar-fill');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  // -- Sizes --
  it('applies medium size by default', () => {
    const { container } = render(<MeterBar value={50} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--medium');
  });

  it('applies small size', () => {
    const { container } = render(<MeterBar value={50} size="small" />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--small');
  });

  it('applies large size', () => {
    const { container } = render(<MeterBar value={50} size="large" />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--large');
  });

  // -- Show value --
  it('does not show value by default', () => {
    render(<MeterBar value={50} />);
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('shows value when showValue=true', () => {
    render(<MeterBar value={50} showValue />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('uses custom formatValue', () => {
    render(<MeterBar value={50} showValue formatValue={(v) => `${v}%`} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('rounds displayed value', () => {
    render(<MeterBar value={33.7} showValue />);
    expect(screen.getByText('34')).toBeInTheDocument();
  });

  // -- Variants (no thresholds) --
  it('uses default variant without thresholds', () => {
    const { container } = render(<MeterBar value={50} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--default');
  });

  // -- Variants with thresholds (no optimum) --
  it('shows danger below low threshold', () => {
    const { container } = render(<MeterBar value={10} low={30} high={70} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--danger');
  });

  it('shows success between low and high', () => {
    const { container } = render(<MeterBar value={50} low={30} high={70} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--success');
  });

  it('shows warning above high threshold', () => {
    const { container } = render(<MeterBar value={80} low={30} high={70} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--warning');
  });

  // -- Variants with optimum in middle --
  it('shows success when value in range with optimum in middle', () => {
    const { container } = render(<MeterBar value={50} low={30} high={70} optimum={50} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--success');
  });

  it('shows danger when value outside range with optimum in middle', () => {
    const { container } = render(<MeterBar value={10} low={30} high={70} optimum={50} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--danger');
  });

  it('shows danger when value above high with optimum in middle', () => {
    const { container } = render(<MeterBar value={80} low={30} high={70} optimum={50} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--danger');
  });

  // -- Variants with optimum low --
  it('shows success when value low with optimum low', () => {
    const { container } = render(<MeterBar value={10} low={30} high={70} optimum={10} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--success');
  });

  it('shows warning when value middle with optimum low', () => {
    const { container } = render(<MeterBar value={50} low={30} high={70} optimum={10} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--warning');
  });

  it('shows danger when value high with optimum low', () => {
    const { container } = render(<MeterBar value={80} low={30} high={70} optimum={10} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--danger');
  });

  // -- Variants with optimum high --
  it('shows success when value high with optimum high', () => {
    const { container } = render(<MeterBar value={80} low={30} high={70} optimum={90} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--success');
  });

  it('shows warning when value middle with optimum high', () => {
    const { container } = render(<MeterBar value={50} low={30} high={70} optimum={90} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--warning');
  });

  it('shows danger when value low with optimum high', () => {
    const { container } = render(<MeterBar value={10} low={30} high={70} optimum={90} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--danger');
  });

  // -- Edge: value at boundary --
  it('shows success at exactly low threshold (no optimum)', () => {
    const { container } = render(<MeterBar value={30} low={30} high={70} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--success');
  });

  it('shows success at exactly high threshold (no optimum)', () => {
    const { container } = render(<MeterBar value={70} low={30} high={70} />);
    expect(container.querySelector('.meter-bar')).toHaveClass('meter-bar--success');
  });

  // -- Full width at 100% --
  it('shows full width at max value', () => {
    const { container } = render(<MeterBar value={100} />);
    const fill = container.querySelector('.meter-bar-fill');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('shows 0% width at min value', () => {
    const { container } = render(<MeterBar value={0} />);
    const fill = container.querySelector('.meter-bar-fill');
    expect(fill).toHaveStyle({ width: '0%' });
  });
});
