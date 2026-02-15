import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PieChart from './PieChart';
import type { PieChartDataItem } from './PieChart';

describe('PieChart', () => {
  const sampleData: PieChartDataItem[] = [
    { label: 'A', value: 30 },
    { label: 'B', value: 50 },
    { label: 'C', value: 20 },
  ];

  // --- Rendering ---

  it('renders empty SVG when data is empty', () => {
    const { container } = render(<PieChart data={[]} />);
    const svg = container.querySelector('.pie-chart-svg');
    expect(svg).toBeInTheDocument();
    // No slices
    expect(container.querySelector('.pie-chart-slice')).not.toBeInTheDocument();
  });

  it('renders empty SVG when all values are zero', () => {
    const data: PieChartDataItem[] = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 },
    ];
    const { container } = render(<PieChart data={data} />);
    expect(container.querySelector('.pie-chart-slice')).not.toBeInTheDocument();
  });

  it('renders slices for valid data', () => {
    const { container } = render(<PieChart data={sampleData} />);
    const slices = container.querySelectorAll('.pie-chart-slice');
    expect(slices).toHaveLength(3);
  });

  it('renders single item as a full circle', () => {
    const data: PieChartDataItem[] = [{ label: 'Only', value: 100 }];
    const { container } = render(<PieChart data={data} />);
    const circle = container.querySelector('circle.pie-chart-slice');
    expect(circle).toBeInTheDocument();
  });

  it('filters out items with value 0', () => {
    const data: PieChartDataItem[] = [
      { label: 'A', value: 10 },
      { label: 'B', value: 0 },
      { label: 'C', value: 20 },
    ];
    const { container } = render(<PieChart data={data} />);
    // Only 2 slices (B is filtered out)
    const slices = container.querySelectorAll('.pie-chart-slice');
    expect(slices).toHaveLength(2);
  });

  it('filters out items with negative values', () => {
    const data: PieChartDataItem[] = [
      { label: 'A', value: 10 },
      { label: 'B', value: -5 },
    ];
    const { container } = render(<PieChart data={data} />);
    // Negative values are treated as 0 in total but filtered in slices
    const circles = container.querySelectorAll('circle.pie-chart-slice');
    expect(circles).toHaveLength(1);
  });

  // --- Accessibility ---

  it('has role="img" for accessibility', () => {
    render(<PieChart data={sampleData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(<PieChart data={sampleData} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '파이 차트');
  });

  it('supports custom aria-label', () => {
    render(<PieChart data={sampleData} ariaLabel="토큰 사용량" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '토큰 사용량');
  });

  it('has aria-label on empty chart', () => {
    render(<PieChart data={[]} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '파이 차트');
  });

  // --- Size ---

  it('uses medium size preset by default', () => {
    const { container } = render(<PieChart data={sampleData} />);
    const svg = container.querySelector('.pie-chart-svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });

  it('applies small size preset', () => {
    const { container } = render(<PieChart data={sampleData} size="small" />);
    const svg = container.querySelector('.pie-chart-svg');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '120');
  });

  it('applies large size preset', () => {
    const { container } = render(<PieChart data={sampleData} size="large" />);
    const svg = container.querySelector('.pie-chart-svg');
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('custom diameter overrides size preset', () => {
    const { container } = render(
      <PieChart data={sampleData} size="small" diameter={250} />,
    );
    const svg = container.querySelector('.pie-chart-svg');
    expect(svg).toHaveAttribute('width', '250');
    expect(svg).toHaveAttribute('height', '250');
  });

  it('applies size CSS class', () => {
    const { container } = render(<PieChart data={sampleData} size="large" />);
    expect(container.querySelector('.pie-chart--large')).toBeInTheDocument();
  });

  // --- Donut mode ---

  it('renders donut hole when innerRadius > 0 with single item', () => {
    const data: PieChartDataItem[] = [{ label: 'Only', value: 100 }];
    const { container } = render(
      <PieChart data={data} innerRadius={0.6} />,
    );
    const hole = container.querySelector('.pie-chart-donut-hole');
    expect(hole).toBeInTheDocument();
  });

  it('does not render donut hole when innerRadius is 0', () => {
    const data: PieChartDataItem[] = [{ label: 'Only', value: 100 }];
    const { container } = render(
      <PieChart data={data} innerRadius={0} />,
    );
    expect(container.querySelector('.pie-chart-donut-hole')).not.toBeInTheDocument();
  });

  it('renders path elements for donut with multiple slices', () => {
    const { container } = render(
      <PieChart data={sampleData} innerRadius={0.5} />,
    );
    const paths = container.querySelectorAll('path.pie-chart-slice');
    expect(paths).toHaveLength(3);
  });

  // --- Values ---

  it('does not show values by default', () => {
    const { container } = render(<PieChart data={sampleData} />);
    expect(container.querySelector('.pie-chart-value')).not.toBeInTheDocument();
  });

  it('shows percentage values when showValues is true', () => {
    const { container } = render(
      <PieChart data={sampleData} showValues />,
    );
    const values = container.querySelectorAll('.pie-chart-value');
    expect(values.length).toBeGreaterThan(0);
  });

  it('shows 100% for single item when showValues is true', () => {
    const data: PieChartDataItem[] = [{ label: 'Only', value: 50 }];
    const { container } = render(
      <PieChart data={data} showValues />,
    );
    const valueEl = container.querySelector('.pie-chart-value');
    expect(valueEl).toBeInTheDocument();
    expect(valueEl!.textContent).toBe('100%');
  });

  it('hides value labels for slices under 5%', () => {
    const data: PieChartDataItem[] = [
      { label: 'Big', value: 96 },
      { label: 'Tiny', value: 4 },
    ];
    const { container } = render(
      <PieChart data={data} showValues />,
    );
    const values = container.querySelectorAll('.pie-chart-value');
    // Only the big slice gets a label (96% >= 5%), tiny (4% < 5%) is hidden
    expect(values).toHaveLength(1);
    expect(values[0].textContent).toBe('96%');
  });

  // --- Legend ---

  it('does not show legend by default', () => {
    const { container } = render(<PieChart data={sampleData} />);
    expect(container.querySelector('.pie-chart-legend')).not.toBeInTheDocument();
  });

  it('shows legend when showLegend is true', () => {
    const { container } = render(
      <PieChart data={sampleData} showLegend />,
    );
    const legend = container.querySelector('.pie-chart-legend');
    expect(legend).toBeInTheDocument();
  });

  it('legend has correct aria-label', () => {
    render(<PieChart data={sampleData} showLegend />);
    const legend = screen.getByRole('list');
    expect(legend).toHaveAttribute('aria-label', '차트 범례');
  });

  it('legend shows all data items', () => {
    const { container } = render(
      <PieChart data={sampleData} showLegend />,
    );
    const items = container.querySelectorAll('.pie-chart-legend-item');
    expect(items).toHaveLength(3);
  });

  it('legend items show label text', () => {
    render(<PieChart data={sampleData} showLegend />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('legend items show percentage values', () => {
    render(<PieChart data={sampleData} showLegend />);
    // A=30%, B=50%, C=20%
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('legend swatches have correct background color', () => {
    const data: PieChartDataItem[] = [
      { label: 'Red', value: 50, color: '#ff0000' },
      { label: 'Blue', value: 50, color: '#0000ff' },
    ];
    const { container } = render(<PieChart data={data} showLegend />);
    const swatches = container.querySelectorAll('.pie-chart-legend-swatch');
    expect(swatches[0]).toHaveStyle({ backgroundColor: '#ff0000' });
    expect(swatches[1]).toHaveStyle({ backgroundColor: '#0000ff' });
  });

  it('does not show legend for empty data', () => {
    const { container } = render(<PieChart data={[]} showLegend />);
    expect(container.querySelector('.pie-chart-legend')).not.toBeInTheDocument();
  });

  // --- Colors ---

  it('uses custom colors from data items', () => {
    const data: PieChartDataItem[] = [
      { label: 'X', value: 50, color: '#ff0000' },
      { label: 'Y', value: 50, color: '#00ff00' },
    ];
    const { container } = render(<PieChart data={data} />);
    const slices = container.querySelectorAll('.pie-chart-slice');
    expect(slices[0]).toHaveAttribute('fill', '#ff0000');
    expect(slices[1]).toHaveAttribute('fill', '#00ff00');
  });

  it('uses default colors when no custom color is specified', () => {
    const data: PieChartDataItem[] = [
      { label: 'A', value: 50 },
      { label: 'B', value: 50 },
    ];
    const { container } = render(<PieChart data={data} />);
    const slices = container.querySelectorAll('.pie-chart-slice');
    // Default colors are applied via fill attribute
    expect(slices[0]).toHaveAttribute('fill', '#4a90d9');
    expect(slices[1]).toHaveAttribute('fill', '#e74c3c');
  });

  // --- Animation ---

  it('does not apply animated class by default', () => {
    const { container } = render(<PieChart data={sampleData} />);
    expect(container.querySelector('.pie-chart--animated')).not.toBeInTheDocument();
  });

  it('applies animated class when animated is true', () => {
    const { container } = render(<PieChart data={sampleData} animated />);
    expect(container.querySelector('.pie-chart--animated')).toBeInTheDocument();
  });

  // --- Custom className ---

  it('applies custom className', () => {
    const { container } = render(
      <PieChart data={sampleData} className="my-chart" />,
    );
    expect(container.querySelector('.my-chart')).toBeInTheDocument();
  });

  // --- SVG structure ---

  it('has correct viewBox matching diameter', () => {
    const { container } = render(<PieChart data={sampleData} diameter={150} />);
    const svg = container.querySelector('.pie-chart-svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 150 150');
  });

  it('uses path elements for multi-slice charts', () => {
    const { container } = render(<PieChart data={sampleData} />);
    const paths = container.querySelectorAll('path.pie-chart-slice');
    expect(paths).toHaveLength(3);
  });

  it('uses circle element for single-slice chart', () => {
    const data: PieChartDataItem[] = [{ label: 'Solo', value: 42 }];
    const { container } = render(<PieChart data={data} />);
    expect(container.querySelector('circle.pie-chart-slice')).toBeInTheDocument();
    expect(container.querySelector('path.pie-chart-slice')).not.toBeInTheDocument();
  });

  // --- Container structure ---

  it('has pie-chart container class', () => {
    const { container } = render(<PieChart data={sampleData} />);
    expect(container.querySelector('.pie-chart')).toBeInTheDocument();
  });

  it('has pie-chart-svg class on SVG element', () => {
    const { container } = render(<PieChart data={sampleData} />);
    expect(container.querySelector('.pie-chart-svg')).toBeInTheDocument();
  });
});
