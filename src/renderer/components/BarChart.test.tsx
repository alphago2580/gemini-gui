import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import BarChart from './BarChart';
import type { BarChartDataItem } from './BarChart';

const sampleData: BarChartDataItem[] = [
  { label: 'A', value: 10 },
  { label: 'B', value: 25 },
  { label: 'C', value: 15 },
];

describe('BarChart', () => {
  // Basic rendering
  it('renders with default props', () => {
    const { container } = render(<BarChart data={sampleData} />);
    expect(container.querySelector('.bar-chart')).toBeInTheDocument();
    expect(container.querySelector('.bar-chart-svg')).toBeInTheDocument();
  });

  it('renders empty chart when data is empty', () => {
    const { container } = render(<BarChart data={[]} />);
    expect(container.querySelector('.bar-chart')).toBeInTheDocument();
    expect(container.querySelector('.bar-chart-svg')).toBeInTheDocument();
    expect(container.querySelectorAll('.bar-chart-bar')).toHaveLength(0);
  });

  it('has role="img" with aria-label', () => {
    render(<BarChart data={sampleData} />);
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', '막대 차트');
  });

  it('uses custom ariaLabel when provided', () => {
    render(<BarChart data={sampleData} ariaLabel="매출 차트" />);
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', '매출 차트');
  });

  // Bars
  it('renders correct number of bars', () => {
    const { container } = render(<BarChart data={sampleData} />);
    expect(container.querySelectorAll('.bar-chart-bar')).toHaveLength(3);
  });

  it('renders bars for single data point', () => {
    const { container } = render(
      <BarChart data={[{ label: 'X', value: 50 }]} />,
    );
    expect(container.querySelectorAll('.bar-chart-bar')).toHaveLength(1);
  });

  // Orientation
  it('applies vertical orientation class by default', () => {
    const { container } = render(<BarChart data={sampleData} />);
    expect(container.querySelector('.bar-chart--vertical')).toBeInTheDocument();
  });

  it('applies horizontal orientation class', () => {
    const { container } = render(
      <BarChart data={sampleData} orientation="horizontal" />,
    );
    expect(
      container.querySelector('.bar-chart--horizontal'),
    ).toBeInTheDocument();
  });

  it('renders bars in horizontal mode', () => {
    const { container } = render(
      <BarChart data={sampleData} orientation="horizontal" />,
    );
    expect(container.querySelectorAll('.bar-chart-bar')).toHaveLength(3);
  });

  // Size
  it('applies small size class', () => {
    const { container } = render(<BarChart data={sampleData} size="small" />);
    expect(container.querySelector('.bar-chart--small')).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    const { container } = render(<BarChart data={sampleData} />);
    expect(container.querySelector('.bar-chart--medium')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<BarChart data={sampleData} size="large" />);
    expect(container.querySelector('.bar-chart--large')).toBeInTheDocument();
  });

  it('uses size preset dimensions for SVG', () => {
    const { container } = render(<BarChart data={sampleData} size="small" />);
    const svg = container.querySelector('.bar-chart-svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '120');
  });

  it('uses custom width and height when provided', () => {
    const { container } = render(
      <BarChart data={sampleData} width={400} height={250} />,
    );
    const svg = container.querySelector('.bar-chart-svg');
    expect(svg).toHaveAttribute('width', '400');
    expect(svg).toHaveAttribute('height', '250');
  });

  // Value labels
  it('does not show values by default', () => {
    const { container } = render(<BarChart data={sampleData} />);
    expect(container.querySelectorAll('.bar-chart-value')).toHaveLength(0);
  });

  it('shows value labels when showValues is true', () => {
    const { container } = render(
      <BarChart data={sampleData} showValues />,
    );
    const values = container.querySelectorAll('.bar-chart-value');
    expect(values.length).toBeGreaterThan(0);
    const texts = Array.from(values).map((el) => el.textContent);
    expect(texts).toContain('10');
    expect(texts).toContain('25');
    expect(texts).toContain('15');
  });

  it('shows value labels in horizontal mode', () => {
    const { container } = render(
      <BarChart data={sampleData} orientation="horizontal" showValues />,
    );
    const values = container.querySelectorAll('.bar-chart-value');
    expect(values.length).toBeGreaterThan(0);
  });

  // Axis labels
  it('shows labels by default', () => {
    const { container } = render(<BarChart data={sampleData} />);
    const labels = container.querySelectorAll('.bar-chart-label');
    expect(labels).toHaveLength(3);
    const texts = Array.from(labels).map((el) => el.textContent);
    expect(texts).toEqual(['A', 'B', 'C']);
  });

  it('hides labels when showLabels is false', () => {
    const { container } = render(
      <BarChart data={sampleData} showLabels={false} />,
    );
    expect(container.querySelectorAll('.bar-chart-label')).toHaveLength(0);
  });

  it('shows labels in horizontal mode', () => {
    const { container } = render(
      <BarChart data={sampleData} orientation="horizontal" />,
    );
    const labels = container.querySelectorAll('.bar-chart-label');
    expect(labels).toHaveLength(3);
  });

  // Grid
  it('does not show grid by default', () => {
    const { container } = render(<BarChart data={sampleData} />);
    expect(container.querySelectorAll('.bar-chart-grid')).toHaveLength(0);
  });

  it('shows gridlines when showGrid is true', () => {
    const { container } = render(<BarChart data={sampleData} showGrid />);
    const grids = container.querySelectorAll('.bar-chart-grid');
    expect(grids.length).toBeGreaterThan(0);
  });

  it('shows grid labels with grid in vertical mode', () => {
    const { container } = render(<BarChart data={sampleData} showGrid />);
    const gridLabels = container.querySelectorAll('.bar-chart-grid-label');
    expect(gridLabels.length).toBeGreaterThan(0);
  });

  it('shows grid in horizontal mode', () => {
    const { container } = render(
      <BarChart data={sampleData} orientation="horizontal" showGrid />,
    );
    const grids = container.querySelectorAll('.bar-chart-grid');
    expect(grids.length).toBeGreaterThan(0);
  });

  // Axis
  it('renders axis lines in vertical mode', () => {
    const { container } = render(<BarChart data={sampleData} />);
    const axes = container.querySelectorAll('.bar-chart-axis');
    expect(axes).toHaveLength(2); // vertical and horizontal axis
  });

  it('renders axis line in horizontal mode', () => {
    const { container } = render(
      <BarChart data={sampleData} orientation="horizontal" />,
    );
    const axes = container.querySelectorAll('.bar-chart-axis');
    expect(axes).toHaveLength(1); // only vertical axis
  });

  // Colors
  it('applies per-item color to bar', () => {
    const data: BarChartDataItem[] = [
      { label: 'Red', value: 10, color: '#ff0000' },
    ];
    const { container } = render(<BarChart data={data} />);
    const bar = container.querySelector('.bar-chart-bar');
    expect(bar).toHaveStyle({ fill: '#ff0000' });
  });

  it('applies barColor when no per-item color', () => {
    const data: BarChartDataItem[] = [{ label: 'X', value: 10 }];
    const { container } = render(<BarChart data={data} barColor="#00ff00" />);
    const bar = container.querySelector('.bar-chart-bar');
    expect(bar).toHaveStyle({ fill: '#00ff00' });
  });

  it('per-item color takes priority over barColor', () => {
    const data: BarChartDataItem[] = [
      { label: 'X', value: 10, color: '#ff0000' },
    ];
    const { container } = render(<BarChart data={data} barColor="#00ff00" />);
    const bar = container.querySelector('.bar-chart-bar');
    expect(bar).toHaveStyle({ fill: '#ff0000' });
  });

  // Animation
  it('does not apply animated class by default', () => {
    const { container } = render(<BarChart data={sampleData} />);
    expect(
      container.querySelector('.bar-chart--animated'),
    ).not.toBeInTheDocument();
  });

  it('applies animated class when animated is true', () => {
    const { container } = render(<BarChart data={sampleData} animated />);
    expect(container.querySelector('.bar-chart--animated')).toBeInTheDocument();
  });

  // Custom className
  it('applies custom className', () => {
    const { container } = render(
      <BarChart data={sampleData} className="my-chart" />,
    );
    expect(container.querySelector('.bar-chart')).toHaveClass('my-chart');
  });

  // Bar dimensions
  it('applies barRadius to rect rx/ry', () => {
    const { container } = render(
      <BarChart data={[{ label: 'A', value: 10 }]} barRadius={5} />,
    );
    const bar = container.querySelector('.bar-chart-bar');
    expect(bar).toHaveAttribute('rx', '5');
    expect(bar).toHaveAttribute('ry', '5');
  });

  // Zero values
  it('handles all-zero data gracefully', () => {
    const data: BarChartDataItem[] = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 },
    ];
    const { container } = render(<BarChart data={data} />);
    expect(container.querySelector('.bar-chart')).toBeInTheDocument();
    const bars = container.querySelectorAll('.bar-chart-bar');
    expect(bars).toHaveLength(2);
  });

  it('does not show value labels for zero-height bars when showValues', () => {
    const data: BarChartDataItem[] = [
      { label: 'A', value: 0 },
      { label: 'B', value: 10 },
    ];
    const { container } = render(<BarChart data={data} showValues />);
    const values = container.querySelectorAll('.bar-chart-value');
    // Only B should have a value label (A has barH = 0)
    expect(values).toHaveLength(1);
    expect(values[0].textContent).toBe('10');
  });

  // Combined features
  it('renders with all features simultaneously', () => {
    const data: BarChartDataItem[] = [
      { label: '1월', value: 30, color: '#4caf50' },
      { label: '2월', value: 50 },
      { label: '3월', value: 20, color: '#f44336' },
    ];
    const { container } = render(
      <BarChart
        data={data}
        size="large"
        showValues
        showLabels
        showGrid
        barColor="#2196f3"
        barGap={6}
        barRadius={4}
        animated
        ariaLabel="월별 매출"
        className="custom-chart"
      />,
    );
    expect(container.querySelector('.bar-chart--large')).toBeInTheDocument();
    expect(container.querySelector('.bar-chart--animated')).toBeInTheDocument();
    expect(container.querySelector('.custom-chart')).toBeInTheDocument();
    expect(container.querySelectorAll('.bar-chart-bar')).toHaveLength(3);
    expect(container.querySelectorAll('.bar-chart-label')).toHaveLength(3);
    expect(container.querySelectorAll('.bar-chart-value')).toHaveLength(3);
    expect(container.querySelectorAll('.bar-chart-grid').length).toBeGreaterThan(0);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '월별 매출');
  });

  it('renders horizontal mode with all features', () => {
    const data: BarChartDataItem[] = [
      { label: 'X', value: 40 },
      { label: 'Y', value: 60 },
    ];
    const { container } = render(
      <BarChart
        data={data}
        orientation="horizontal"
        showValues
        showLabels
        showGrid
        animated
      />,
    );
    expect(
      container.querySelector('.bar-chart--horizontal'),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.bar-chart-bar')).toHaveLength(2);
    expect(container.querySelectorAll('.bar-chart-label')).toHaveLength(2);
    expect(container.querySelectorAll('.bar-chart-value')).toHaveLength(2);
  });

  // Edge cases
  it('handles negative values by treating them as zero height', () => {
    const data: BarChartDataItem[] = [
      { label: 'A', value: -5 },
      { label: 'B', value: 10 },
    ];
    const { container } = render(<BarChart data={data} />);
    expect(container.querySelectorAll('.bar-chart-bar')).toHaveLength(2);
  });

  it('does not show grid when maxValue is 0', () => {
    const data: BarChartDataItem[] = [{ label: 'A', value: 0 }];
    const { container } = render(<BarChart data={data} showGrid />);
    expect(container.querySelectorAll('.bar-chart-grid')).toHaveLength(0);
  });

  it('renders many bars without error', () => {
    const data: BarChartDataItem[] = Array.from({ length: 20 }, (_, i) => ({
      label: `Item ${i}`,
      value: i * 5,
    }));
    const { container } = render(<BarChart data={data} />);
    expect(container.querySelectorAll('.bar-chart-bar')).toHaveLength(20);
  });
});
