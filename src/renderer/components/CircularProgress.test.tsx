import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CircularProgress from './CircularProgress';

describe('CircularProgress', () => {
  it('renders with default props', () => {
    const { container } = render(<CircularProgress value={50} />);
    const el = container.querySelector('.circular-progress');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('role', 'progressbar');
  });

  it('sets correct aria attributes', () => {
    render(<CircularProgress value={30} max={200} />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-valuenow', '30');
    expect(el).toHaveAttribute('aria-valuemin', '0');
    expect(el).toHaveAttribute('aria-valuemax', '200');
  });

  it('uses label for aria-label when provided', () => {
    render(<CircularProgress value={50} label="업로드 진행률" />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-label', '업로드 진행률');
  });

  it('falls back to percentage for aria-label when no label', () => {
    render(<CircularProgress value={75} />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-label', '75%');
  });

  it('clamps value to min 0', () => {
    render(<CircularProgress value={-10} />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-valuenow', '0');
    expect(el).toHaveAttribute('aria-label', '0%');
  });

  it('clamps value to max', () => {
    render(<CircularProgress value={150} max={100} />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-valuenow', '100');
    expect(el).toHaveAttribute('aria-label', '100%');
  });

  it('shows percentage text when showPercentage is true', () => {
    render(<CircularProgress value={42} showPercentage />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('does not show percentage text when showPercentage is false', () => {
    const { container } = render(<CircularProgress value={42} />);
    expect(container.querySelector('.circular-progress-percentage')).not.toBeInTheDocument();
  });

  it('renders children instead of percentage when provided', () => {
    render(
      <CircularProgress value={50} showPercentage>
        <span data-testid="custom">Custom</span>
      </CircularProgress>
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  // Size variants
  it('applies small size class and correct SVG dimensions', () => {
    const { container } = render(<CircularProgress value={50} size="small" />);
    expect(container.querySelector('.circular-progress--small')).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('applies medium size class by default', () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container.querySelector('.circular-progress--medium')).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('applies large size class and correct SVG dimensions', () => {
    const { container } = render(<CircularProgress value={50} size="large" />);
    expect(container.querySelector('.circular-progress--large')).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '96');
    expect(svg).toHaveAttribute('height', '96');
  });

  // Variant classes
  it('applies default variant class by default', () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container.querySelector('.circular-progress--default')).toBeInTheDocument();
  });

  it('applies success variant class', () => {
    const { container } = render(<CircularProgress value={50} variant="success" />);
    expect(container.querySelector('.circular-progress--success')).toBeInTheDocument();
  });

  it('applies warning variant class', () => {
    const { container } = render(<CircularProgress value={50} variant="warning" />);
    expect(container.querySelector('.circular-progress--warning')).toBeInTheDocument();
  });

  it('applies error variant class', () => {
    const { container } = render(<CircularProgress value={50} variant="error" />);
    expect(container.querySelector('.circular-progress--error')).toBeInTheDocument();
  });

  // SVG structure
  it('renders track and fill circles', () => {
    const { container } = render(<CircularProgress value={50} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    expect(circles[0]).toHaveClass('circular-progress-track');
    expect(circles[1]).toHaveClass('circular-progress-fill');
  });

  it('renders fill circle with correct stroke-dasharray', () => {
    const { container } = render(<CircularProgress value={50} />);
    const fill = container.querySelector('.circular-progress-fill');
    // Medium: diameter=64, default stroke=5, radius=(64-5)/2=29.5
    // circumference = 2 * PI * 29.5 ≈ 185.354
    const expectedCircumference = 2 * Math.PI * 29.5;
    expect(fill).toHaveAttribute('stroke-dasharray', String(expectedCircumference));
  });

  it('fill circle offset is 0 at 100%', () => {
    const { container } = render(<CircularProgress value={100} />);
    const fill = container.querySelector('.circular-progress-fill');
    expect(fill).toHaveAttribute('stroke-dashoffset', '0');
  });

  it('fill circle offset equals circumference at 0%', () => {
    const { container } = render(<CircularProgress value={0} />);
    const fill = container.querySelector('.circular-progress-fill');
    const expectedCircumference = 2 * Math.PI * 29.5;
    expect(fill).toHaveAttribute('stroke-dashoffset', String(expectedCircumference));
  });

  it('fill circle has rotation transform', () => {
    const { container } = render(<CircularProgress value={50} />);
    const fill = container.querySelector('.circular-progress-fill');
    expect(fill).toHaveAttribute('transform', 'rotate(-90 32 32)');
  });

  // Custom strokeWidth
  it('uses custom strokeWidth', () => {
    const { container } = render(<CircularProgress value={50} strokeWidth={8} />);
    const track = container.querySelector('.circular-progress-track');
    const fill = container.querySelector('.circular-progress-fill');
    expect(track).toHaveAttribute('stroke-width', '8');
    expect(fill).toHaveAttribute('stroke-width', '8');
  });

  // Animated
  it('applies animated class when animated is true', () => {
    const { container } = render(<CircularProgress value={50} animated />);
    expect(container.querySelector('.circular-progress--animated')).toBeInTheDocument();
  });

  it('does not apply animated class when animated is false', () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container.querySelector('.circular-progress--animated')).not.toBeInTheDocument();
  });

  // Percentage calculations with custom max
  it('calculates percentage correctly with custom max', () => {
    render(<CircularProgress value={25} max={50} showPercentage />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('handles max of 0 gracefully', () => {
    render(<CircularProgress value={0} max={0} showPercentage />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('rounds percentage to nearest integer', () => {
    render(<CircularProgress value={33} max={100} showPercentage />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  // Content area
  it('renders content area', () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container.querySelector('.circular-progress-content')).toBeInTheDocument();
  });

  it('renders SVG inside component', () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container.querySelector('.circular-progress-svg')).toBeInTheDocument();
  });

  // Stroke-linecap
  it('fill circle has round stroke-linecap via CSS class', () => {
    const { container } = render(<CircularProgress value={50} />);
    const fill = container.querySelector('.circular-progress-fill');
    expect(fill).toBeInTheDocument();
  });
});
