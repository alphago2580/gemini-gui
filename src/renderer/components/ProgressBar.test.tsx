import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
  });

  it('sets correct aria-valuenow', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('sets correct aria-valuemin and aria-valuemax', () => {
    render(<ProgressBar value={50} max={200} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '200');
  });

  it('has default aria-label with percentage', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', '진행률 50%');
  });

  it('uses custom label as aria-label', () => {
    render(<ProgressBar value={30} label="토큰 사용량" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', '토큰 사용량');
  });

  it('displays label text', () => {
    render(<ProgressBar value={40} label="업로드" />);
    expect(screen.getByText('업로드')).toBeInTheDocument();
  });

  it('shows percentage when showPercentage is true', () => {
    render(<ProgressBar value={65} showPercentage />);
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('hides percentage by default', () => {
    render(<ProgressBar value={65} />);
    expect(screen.queryByText('65%')).not.toBeInTheDocument();
  });

  it('calculates percentage with custom max', () => {
    render(<ProgressBar value={50} max={200} showPercentage />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('clamps value to max', () => {
    render(<ProgressBar value={150} max={100} showPercentage />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps value to 0 for negative values', () => {
    render(<ProgressBar value={-10} showPercentage />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies correct width style to fill', () => {
    const { container } = render(<ProgressBar value={75} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '75%' });
  });

  it('applies default variant class', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.querySelector('.progress-fill--default')).toBeInTheDocument();
  });

  it('applies success variant class', () => {
    const { container } = render(<ProgressBar value={50} variant="success" />);
    expect(container.querySelector('.progress-fill--success')).toBeInTheDocument();
  });

  it('applies warning variant class', () => {
    const { container } = render(<ProgressBar value={50} variant="warning" />);
    expect(container.querySelector('.progress-fill--warning')).toBeInTheDocument();
  });

  it('applies error variant class', () => {
    const { container } = render(<ProgressBar value={50} variant="error" />);
    expect(container.querySelector('.progress-fill--error')).toBeInTheDocument();
  });

  it('applies animated class when animated prop is true', () => {
    const { container } = render(<ProgressBar value={50} animated />);
    expect(container.querySelector('.progress-fill--animated')).toBeInTheDocument();
  });

  it('does not apply animated class by default', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.querySelector('.progress-fill--animated')).not.toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(<ProgressBar value={50} size="small" />);
    expect(container.querySelector('.progress-bar--small')).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.querySelector('.progress-bar--medium')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<ProgressBar value={50} size="large" />);
    expect(container.querySelector('.progress-bar--large')).toBeInTheDocument();
  });

  it('handles zero max gracefully', () => {
    render(<ProgressBar value={50} max={0} showPercentage />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles value of 0', () => {
    const { container } = render(<ProgressBar value={0} showPercentage />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('rounds percentage to nearest integer', () => {
    render(<ProgressBar value={1} max={3} showPercentage />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });
});
