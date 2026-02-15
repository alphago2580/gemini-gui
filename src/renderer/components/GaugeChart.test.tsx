import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import GaugeChart from './GaugeChart';

describe('GaugeChart', () => {
  it('renders with default props', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelector('.gauge-chart')).toBeInTheDocument();
    expect(container.querySelector('.gauge-chart-svg')).toBeInTheDocument();
  });

  it('has role="meter" with correct ARIA attributes', () => {
    render(<GaugeChart value={30} min={0} max={100} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '30');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('uses custom ariaLabel when provided', () => {
    render(<GaugeChart value={50} ariaLabel="속도 게이지" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-label', '속도 게이지');
  });

  it('uses label as aria-label when ariaLabel is not provided', () => {
    render(<GaugeChart value={50} label="CPU 사용량" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-label', 'CPU 사용량');
  });

  it('falls back to value as aria-label when no label or ariaLabel', () => {
    render(<GaugeChart value={75} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-label', '75');
  });

  it('clamps value to min when value is below min', () => {
    render(<GaugeChart value={-10} min={0} max={100} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value to max when value is above max', () => {
    render(<GaugeChart value={150} min={0} max={100} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows value by default', () => {
    render(<GaugeChart value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('hides value when showValue is false', () => {
    const { container } = render(<GaugeChart value={42} showValue={false} />);
    expect(container.querySelector('.gauge-chart-value')).not.toBeInTheDocument();
  });

  it('shows unit when provided', () => {
    render(<GaugeChart value={75} unit="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('%')).toHaveClass('gauge-chart-value-unit');
  });

  it('does not render unit span when unit is not provided', () => {
    const { container } = render(<GaugeChart value={75} />);
    expect(container.querySelector('.gauge-chart-value-unit')).not.toBeInTheDocument();
  });

  it('shows label when provided', () => {
    render(<GaugeChart value={50} label="온도" />);
    expect(screen.getByText('온도')).toBeInTheDocument();
    expect(screen.getByText('온도')).toHaveClass('gauge-chart-label');
  });

  it('does not render label when not provided', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelector('.gauge-chart-label')).not.toBeInTheDocument();
  });

  // Size variants
  it('applies small size class', () => {
    const { container } = render(<GaugeChart value={50} size="small" />);
    expect(container.querySelector('.gauge-chart--small')).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelector('.gauge-chart--medium')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<GaugeChart value={50} size="large" />);
    expect(container.querySelector('.gauge-chart--large')).toBeInTheDocument();
  });

  it('renders SVG with correct dimensions for small size', () => {
    const { container } = render(<GaugeChart value={50} size="small" />);
    const svg = container.querySelector('.gauge-chart-svg');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '64'); // 120/2 + 4
  });

  it('renders SVG with correct dimensions for medium size', () => {
    const { container } = render(<GaugeChart value={50} size="medium" />);
    const svg = container.querySelector('.gauge-chart-svg');
    expect(svg).toHaveAttribute('width', '180');
    expect(svg).toHaveAttribute('height', '94'); // 180/2 + 4
  });

  it('renders SVG with correct dimensions for large size', () => {
    const { container } = render(<GaugeChart value={50} size="large" />);
    const svg = container.querySelector('.gauge-chart-svg');
    expect(svg).toHaveAttribute('width', '260');
    expect(svg).toHaveAttribute('height', '134'); // 260/2 + 4
  });

  // Track
  it('renders the track arc path', () => {
    const { container } = render(<GaugeChart value={50} />);
    const track = container.querySelector('.gauge-chart-track');
    expect(track).toBeInTheDocument();
    expect(track).toHaveAttribute('d');
    expect(track!.getAttribute('d')).toContain('A');
  });

  // Needle
  it('renders the needle polygon', () => {
    const { container } = render(<GaugeChart value={50} />);
    const needle = container.querySelector('.gauge-chart-needle');
    expect(needle).toBeInTheDocument();
    expect(needle).toHaveAttribute('points');
  });

  it('renders the needle center circle', () => {
    const { container } = render(<GaugeChart value={50} />);
    const center = container.querySelector('.gauge-chart-needle-center');
    expect(center).toBeInTheDocument();
    expect(center!.tagName).toBe('circle');
  });

  // Animation
  it('applies animated class when animated is true', () => {
    const { container } = render(<GaugeChart value={50} animated />);
    expect(container.querySelector('.gauge-chart--animated')).toBeInTheDocument();
  });

  it('does not apply animated class by default', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelector('.gauge-chart--animated')).not.toBeInTheDocument();
  });

  // Zones
  it('renders zone arcs when zones are provided', () => {
    const zones = [
      { from: 0, to: 30, color: '#4caf50' },
      { from: 30, to: 70, color: '#ff9800' },
      { from: 70, to: 100, color: '#f44336' },
    ];
    const { container } = render(<GaugeChart value={50} zones={zones} />);
    const zoneElements = container.querySelectorAll('.gauge-chart-zone');
    expect(zoneElements).toHaveLength(3);
  });

  it('applies correct color to zone arcs', () => {
    const zones = [
      { from: 0, to: 50, color: '#00ff00' },
      { from: 50, to: 100, color: '#ff0000' },
    ];
    const { container } = render(<GaugeChart value={25} zones={zones} />);
    const zoneElements = container.querySelectorAll('.gauge-chart-zone');
    expect(zoneElements[0]).toHaveAttribute('stroke', '#00ff00');
    expect(zoneElements[1]).toHaveAttribute('stroke', '#ff0000');
  });

  it('does not render zones when zones array is empty', () => {
    const { container } = render(<GaugeChart value={50} zones={[]} />);
    expect(container.querySelectorAll('.gauge-chart-zone')).toHaveLength(0);
  });

  it('does not render zones when zones prop is not provided', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelectorAll('.gauge-chart-zone')).toHaveLength(0);
  });

  it('filters out zones where from >= to', () => {
    const zones = [
      { from: 50, to: 50, color: '#ff0000' },
      { from: 60, to: 40, color: '#00ff00' },
      { from: 0, to: 30, color: '#0000ff' },
    ];
    const { container } = render(<GaugeChart value={25} zones={zones} />);
    // Only the third zone (0-30) should render
    expect(container.querySelectorAll('.gauge-chart-zone')).toHaveLength(1);
  });

  // Ticks
  it('renders tick marks when ticks > 0', () => {
    const { container } = render(<GaugeChart value={50} ticks={5} />);
    const tickLines = container.querySelectorAll('.gauge-chart-tick');
    // 5 ticks = 6 marks (0 through 5)
    expect(tickLines).toHaveLength(6);
  });

  it('renders tick labels with correct values', () => {
    const { container } = render(<GaugeChart value={50} min={0} max={100} ticks={4} />);
    const tickLabels = container.querySelectorAll('.gauge-chart-tick-label');
    expect(tickLabels).toHaveLength(5);
    const values = Array.from(tickLabels).map((el) => el.textContent);
    expect(values).toEqual(['0', '25', '50', '75', '100']);
  });

  it('does not render ticks when ticks is 0', () => {
    const { container } = render(<GaugeChart value={50} ticks={0} />);
    expect(container.querySelectorAll('.gauge-chart-tick')).toHaveLength(0);
  });

  it('does not render ticks by default', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelectorAll('.gauge-chart-tick')).toHaveLength(0);
  });

  // Custom className
  it('applies custom className', () => {
    const { container } = render(<GaugeChart value={50} className="my-gauge" />);
    expect(container.querySelector('.gauge-chart')).toHaveClass('my-gauge');
  });

  // Custom min/max
  it('handles custom min/max range', () => {
    const { container } = render(<GaugeChart value={200} min={100} max={300} ticks={2} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '200');
    expect(meter).toHaveAttribute('aria-valuemin', '100');
    expect(meter).toHaveAttribute('aria-valuemax', '300');
    // Value 200 appears in both tick label and value display; check value display specifically
    const valueNumber = container.querySelector('.gauge-chart-value-number');
    expect(valueNumber).toBeInTheDocument();
    expect(valueNumber!.textContent).toBe('200');
  });

  it('handles min === max gracefully', () => {
    const { container } = render(<GaugeChart value={50} min={50} max={50} />);
    expect(container.querySelector('.gauge-chart')).toBeInTheDocument();
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '50');
  });

  // Value display details
  it('displays clamped value not original when out of range', () => {
    render(<GaugeChart value={-5} min={0} max={100} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows both value and unit together', () => {
    render(<GaugeChart value={88} unit="rpm" />);
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('rpm')).toBeInTheDocument();
  });

  // SVG structure
  it('contains exactly one track path', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelectorAll('.gauge-chart-track')).toHaveLength(1);
  });

  it('contains exactly one needle', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelectorAll('.gauge-chart-needle')).toHaveLength(1);
  });

  it('contains exactly one needle center', () => {
    const { container } = render(<GaugeChart value={50} />);
    expect(container.querySelectorAll('.gauge-chart-needle-center')).toHaveLength(1);
  });

  // Combined features
  it('renders with all features simultaneously', () => {
    const zones = [
      { from: 0, to: 50, color: 'green' },
      { from: 50, to: 100, color: 'red' },
    ];
    const { container } = render(
      <GaugeChart
        value={65}
        min={0}
        max={100}
        size="large"
        label="속도"
        unit="km/h"
        zones={zones}
        ticks={4}
        animated
        className="custom"
      />
    );
    expect(container.querySelector('.gauge-chart--large')).toBeInTheDocument();
    expect(container.querySelector('.gauge-chart--animated')).toBeInTheDocument();
    expect(container.querySelector('.custom')).toBeInTheDocument();
    expect(container.querySelectorAll('.gauge-chart-zone')).toHaveLength(2);
    expect(container.querySelectorAll('.gauge-chart-tick')).toHaveLength(5);
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('km/h')).toBeInTheDocument();
    expect(screen.getByText('속도')).toBeInTheDocument();
  });

  it('clamps zones to the min/max range', () => {
    const zones = [
      { from: -10, to: 150, color: '#ff0000' },
    ];
    const { container } = render(<GaugeChart value={50} min={0} max={100} zones={zones} />);
    // Zone should still render (clamped internally)
    expect(container.querySelectorAll('.gauge-chart-zone')).toHaveLength(1);
  });

  it('handles negative min and max range', () => {
    render(<GaugeChart value={-5} min={-20} max={20} ticks={4} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '-5');
    expect(meter).toHaveAttribute('aria-valuemin', '-20');
    expect(meter).toHaveAttribute('aria-valuemax', '20');
    expect(screen.getByText('-5')).toBeInTheDocument();
  });
});
