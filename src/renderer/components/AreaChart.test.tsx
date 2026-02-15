import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AreaChart from './AreaChart';
import type { AreaChartDataPoint, AreaChartSeries } from './AreaChart';

const sampleData: AreaChartDataPoint[] = [
  { label: '1월', value: 10 },
  { label: '2월', value: 25 },
  { label: '3월', value: 15 },
  { label: '4월', value: 30 },
];

const sampleSeries: AreaChartSeries[] = [
  {
    name: 'Series A',
    data: [
      { label: '1월', value: 10 },
      { label: '2월', value: 20 },
      { label: '3월', value: 15 },
    ],
    color: '#ff0000',
  },
  {
    name: 'Series B',
    data: [
      { label: '1월', value: 5 },
      { label: '2월', value: 25 },
      { label: '3월', value: 10 },
    ],
    color: '#0000ff',
  },
];

describe('AreaChart', () => {
  // Basic rendering
  it('renders with default props', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    expect(container.querySelector('.area-chart')).toBeInTheDocument();
    expect(container.querySelector('.area-chart-svg')).toBeInTheDocument();
  });

  it('renders empty chart when no data provided', () => {
    const { container } = render(<AreaChart data={[]} />);
    expect(container.querySelector('.area-chart')).toBeInTheDocument();
    expect(container.querySelector('.area-chart-svg')).toBeInTheDocument();
    expect(container.querySelectorAll('.area-chart-line')).toHaveLength(0);
  });

  it('renders empty chart when neither data nor series provided', () => {
    const { container } = render(<AreaChart />);
    expect(container.querySelector('.area-chart')).toBeInTheDocument();
    expect(container.querySelectorAll('.area-chart-series')).toHaveLength(0);
  });

  // ARIA
  it('has role="img" with default aria-label', () => {
    render(<AreaChart data={sampleData} />);
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', '영역 차트');
  });

  it('uses custom ariaLabel when provided', () => {
    render(<AreaChart data={sampleData} ariaLabel="매출 추이" />);
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', '매출 추이');
  });

  // Line rendering
  it('renders a line path for single data', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    const lines = container.querySelectorAll('.area-chart-line');
    expect(lines).toHaveLength(1);
    expect(lines[0].getAttribute('d')).toBeTruthy();
  });

  it('renders area fill by default', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    const areas = container.querySelectorAll('.area-chart-area');
    expect(areas).toHaveLength(1);
    expect(areas[0].getAttribute('d')).toContain('Z');
  });

  it('hides area fill when showFill is false', () => {
    const { container } = render(<AreaChart data={sampleData} showFill={false} />);
    expect(container.querySelectorAll('.area-chart-area')).toHaveLength(0);
  });

  // Curved mode
  it('renders straight lines by default', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    const line = container.querySelector('.area-chart-line');
    const d = line?.getAttribute('d') ?? '';
    expect(d).toContain('L');
    expect(d).not.toContain('C');
  });

  it('renders curved lines when curved is true', () => {
    const { container } = render(<AreaChart data={sampleData} curved />);
    const line = container.querySelector('.area-chart-line');
    const d = line?.getAttribute('d') ?? '';
    expect(d).toContain('C');
  });

  // Dots
  it('does not show dots by default', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    expect(container.querySelectorAll('.area-chart-dot')).toHaveLength(0);
  });

  it('shows dots when showDots is true', () => {
    const { container } = render(<AreaChart data={sampleData} showDots />);
    expect(container.querySelectorAll('.area-chart-dot')).toHaveLength(4);
  });

  it('applies custom dotRadius', () => {
    const { container } = render(<AreaChart data={sampleData} showDots dotRadius={5} />);
    const dot = container.querySelector('.area-chart-dot');
    expect(dot).toHaveAttribute('r', '5');
  });

  // Values
  it('does not show values by default', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    expect(container.querySelectorAll('.area-chart-value')).toHaveLength(0);
  });

  it('shows value labels when showValues is true', () => {
    const { container } = render(<AreaChart data={sampleData} showValues />);
    const values = container.querySelectorAll('.area-chart-value');
    expect(values).toHaveLength(4);
    const texts = Array.from(values).map((el) => el.textContent);
    expect(texts).toContain('10');
    expect(texts).toContain('25');
    expect(texts).toContain('15');
    expect(texts).toContain('30');
  });

  // Labels
  it('shows x-axis labels by default', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    const labels = container.querySelectorAll('.area-chart-label');
    expect(labels).toHaveLength(4);
    const texts = Array.from(labels).map((el) => el.textContent);
    expect(texts).toEqual(['1월', '2월', '3월', '4월']);
  });

  it('hides labels when showLabels is false', () => {
    const { container } = render(<AreaChart data={sampleData} showLabels={false} />);
    expect(container.querySelectorAll('.area-chart-label')).toHaveLength(0);
  });

  // Grid
  it('does not show grid by default', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    expect(container.querySelectorAll('.area-chart-grid')).toHaveLength(0);
  });

  it('shows gridlines when showGrid is true', () => {
    const { container } = render(<AreaChart data={sampleData} showGrid />);
    const grids = container.querySelectorAll('.area-chart-grid');
    expect(grids.length).toBeGreaterThan(0);
  });

  it('shows grid labels with grid', () => {
    const { container } = render(<AreaChart data={sampleData} showGrid />);
    const gridLabels = container.querySelectorAll('.area-chart-grid-label');
    expect(gridLabels.length).toBeGreaterThan(0);
  });

  it('does not show grid when maxValue is 0', () => {
    const data: AreaChartDataPoint[] = [{ label: 'A', value: 0 }];
    const { container } = render(<AreaChart data={data} showGrid />);
    expect(container.querySelectorAll('.area-chart-grid')).toHaveLength(0);
  });

  // Axes
  it('renders two axis lines', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    const axes = container.querySelectorAll('.area-chart-axis');
    expect(axes).toHaveLength(2);
  });

  // Size
  it('applies size class', () => {
    const { container } = render(<AreaChart data={sampleData} size="small" />);
    expect(container.querySelector('.area-chart--small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    expect(container.querySelector('.area-chart--medium')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<AreaChart data={sampleData} size="large" />);
    expect(container.querySelector('.area-chart--large')).toBeInTheDocument();
  });

  it('uses size preset dimensions', () => {
    const { container } = render(<AreaChart data={sampleData} size="small" />);
    const svg = container.querySelector('.area-chart-svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '120');
  });

  it('uses custom width and height when provided', () => {
    const { container } = render(<AreaChart data={sampleData} width={400} height={250} />);
    const svg = container.querySelector('.area-chart-svg');
    expect(svg).toHaveAttribute('width', '400');
    expect(svg).toHaveAttribute('height', '250');
  });

  // Colors
  it('applies custom color to line', () => {
    const { container } = render(<AreaChart data={sampleData} color="#ff0000" />);
    const line = container.querySelector('.area-chart-line');
    expect(line).toHaveStyle({ stroke: '#ff0000' });
  });

  it('applies custom fillOpacity to area', () => {
    const { container } = render(<AreaChart data={sampleData} fillOpacity={0.5} />);
    const area = container.querySelector('.area-chart-area');
    expect(area).toHaveStyle({ opacity: '0.5' });
  });

  it('applies strokeWidth to line', () => {
    const { container } = render(<AreaChart data={sampleData} strokeWidth={3} />);
    const line = container.querySelector('.area-chart-line');
    expect(line).toHaveAttribute('stroke-width', '3');
  });

  // Animation
  it('does not apply animated class by default', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    expect(container.querySelector('.area-chart--animated')).not.toBeInTheDocument();
  });

  it('applies animated class when animated is true', () => {
    const { container } = render(<AreaChart data={sampleData} animated />);
    expect(container.querySelector('.area-chart--animated')).toBeInTheDocument();
  });

  // Custom className
  it('applies custom className', () => {
    const { container } = render(<AreaChart data={sampleData} className="my-chart" />);
    expect(container.querySelector('.area-chart')).toHaveClass('my-chart');
  });

  // Multi-series
  it('renders multiple series', () => {
    const { container } = render(<AreaChart series={sampleSeries} />);
    const seriesGroups = container.querySelectorAll('.area-chart-series');
    expect(seriesGroups).toHaveLength(2);
  });

  it('renders line and area for each series', () => {
    const { container } = render(<AreaChart series={sampleSeries} />);
    expect(container.querySelectorAll('.area-chart-line')).toHaveLength(2);
    expect(container.querySelectorAll('.area-chart-area')).toHaveLength(2);
  });

  it('applies per-series color to line', () => {
    const { container } = render(<AreaChart series={sampleSeries} />);
    const lines = container.querySelectorAll('.area-chart-line');
    expect(lines[0]).toHaveStyle({ stroke: '#ff0000' });
    expect(lines[1]).toHaveStyle({ stroke: '#0000ff' });
  });

  it('renders dots for all series when showDots', () => {
    const { container } = render(<AreaChart series={sampleSeries} showDots />);
    // 3 dots per series * 2 series = 6
    expect(container.querySelectorAll('.area-chart-dot')).toHaveLength(6);
  });

  it('renders values for all series when showValues', () => {
    const { container } = render(<AreaChart series={sampleSeries} showValues />);
    expect(container.querySelectorAll('.area-chart-value')).toHaveLength(6);
  });

  // Edge cases
  it('handles single data point', () => {
    const { container } = render(<AreaChart data={[{ label: 'X', value: 50 }]} />);
    expect(container.querySelector('.area-chart-line')).toBeInTheDocument();
    const d = container.querySelector('.area-chart-line')?.getAttribute('d') ?? '';
    expect(d).toContain('M');
  });

  it('handles all-zero data', () => {
    const data: AreaChartDataPoint[] = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 },
    ];
    const { container } = render(<AreaChart data={data} />);
    expect(container.querySelector('.area-chart')).toBeInTheDocument();
    expect(container.querySelector('.area-chart-line')).toBeInTheDocument();
  });

  it('handles many data points', () => {
    const data: AreaChartDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
      label: `P${i}`,
      value: i * 2,
    }));
    const { container } = render(<AreaChart data={data} />);
    expect(container.querySelector('.area-chart-line')).toBeInTheDocument();
  });

  it('renders per-series fillOpacity', () => {
    const seriesWithOpacity: AreaChartSeries[] = [
      {
        name: 'A',
        data: [{ label: 'X', value: 10 }],
        color: '#ff0000',
        fillOpacity: 0.8,
      },
    ];
    const { container } = render(<AreaChart series={seriesWithOpacity} />);
    const area = container.querySelector('.area-chart-area');
    expect(area).toHaveStyle({ opacity: '0.8' });
  });

  // Combined features
  it('renders with all features simultaneously', () => {
    const { container } = render(
      <AreaChart
        data={sampleData}
        size="large"
        showDots
        showValues
        showLabels
        showGrid
        showFill
        curved
        color="#2196f3"
        fillOpacity={0.4}
        strokeWidth={3}
        dotRadius={4}
        animated
        ariaLabel="매출 추이 차트"
        className="custom-area"
      />,
    );
    expect(container.querySelector('.area-chart--large')).toBeInTheDocument();
    expect(container.querySelector('.area-chart--animated')).toBeInTheDocument();
    expect(container.querySelector('.custom-area')).toBeInTheDocument();
    expect(container.querySelectorAll('.area-chart-dot')).toHaveLength(4);
    expect(container.querySelectorAll('.area-chart-value')).toHaveLength(4);
    expect(container.querySelectorAll('.area-chart-label')).toHaveLength(4);
    expect(container.querySelectorAll('.area-chart-grid').length).toBeGreaterThan(0);
    expect(container.querySelector('.area-chart-area')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '매출 추이 차트');
  });

  it('renders multi-series with all features', () => {
    const { container } = render(
      <AreaChart
        series={sampleSeries}
        showDots
        showValues
        showLabels
        showGrid
        curved
        animated
      />,
    );
    expect(container.querySelectorAll('.area-chart-series')).toHaveLength(2);
    expect(container.querySelectorAll('.area-chart-line')).toHaveLength(2);
    expect(container.querySelectorAll('.area-chart-area')).toHaveLength(2);
    expect(container.querySelectorAll('.area-chart-dot')).toHaveLength(6);
    expect(container.querySelectorAll('.area-chart-value')).toHaveLength(6);
  });
});
