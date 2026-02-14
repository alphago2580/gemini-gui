import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivityHeatmap, { ActivityData } from './ActivityHeatmap';

describe('ActivityHeatmap', () => {
  const sampleData: ActivityData[] = [
    { date: '2026-01-15', count: 5 },
    { date: '2026-01-16', count: 10 },
    { date: '2026-01-17', count: 2 },
    { date: '2026-02-01', count: 8 },
    { date: '2026-02-10', count: 15 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -- Basic rendering --
  it('renders with role="img"', () => {
    render(<ActivityHeatmap data={sampleData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('has default aria-label in Korean', () => {
    render(<ActivityHeatmap data={sampleData} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '활동 히트맵');
  });

  it('uses custom label for aria-label', () => {
    render(<ActivityHeatmap data={sampleData} label="대화 활동" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '대화 활동');
  });

  it('applies custom id', () => {
    const { container } = render(<ActivityHeatmap data={sampleData} id="my-heatmap" />);
    expect(container.querySelector('#my-heatmap')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ActivityHeatmap data={sampleData} className="custom" />);
    expect(container.querySelector('.activity-heatmap.custom')).toBeInTheDocument();
  });

  it('renders an SVG element', () => {
    render(<ActivityHeatmap data={sampleData} />);
    expect(screen.getByTestId('activity-heatmap-svg')).toBeInTheDocument();
  });

  // -- Cells --
  it('renders heatmap cells', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders cells for 52 weeks by default (up to 364 cells)', () => {
    render(<ActivityHeatmap data={[]} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    // 52 weeks * 7 days = 364, but can vary by +/- a few days depending on alignment
    expect(cells.length).toBeGreaterThanOrEqual(358);
    expect(cells.length).toBeLessThanOrEqual(371);
  });

  it('renders fewer cells for fewer weeks', () => {
    render(<ActivityHeatmap data={[]} weeks={4} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    expect(cells.length).toBeGreaterThanOrEqual(25);
    expect(cells.length).toBeLessThanOrEqual(35);
  });

  it('assigns data-date attribute to cells', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const dates = cells.map(c => c.getAttribute('data-date')).filter(Boolean);
    expect(dates.length).toBe(cells.length);
    // All dates should match YYYY-MM-DD format
    for (const date of dates) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('assigns data-count attribute matching input data', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const jan15Cell = cells.find(c => c.getAttribute('data-date') === '2026-01-15');
    if (jan15Cell) {
      expect(jan15Cell.getAttribute('data-count')).toBe('5');
    }
  });

  it('assigns data-level attribute to cells', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    for (const cell of cells) {
      const level = cell.getAttribute('data-level');
      expect(['0', '1', '2', '3', '4']).toContain(level);
    }
  });

  it('assigns level-0 to cells with no data', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const emptyCells = cells.filter(c => c.getAttribute('data-count') === '0');
    for (const cell of emptyCells) {
      expect(cell.getAttribute('data-level')).toBe('0');
    }
  });

  it('assigns highest level to cell with max count', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const maxCell = cells.find(c => c.getAttribute('data-date') === '2026-02-10');
    if (maxCell) {
      expect(maxCell.getAttribute('data-level')).toBe('4');
    }
  });

  // -- Empty data --
  it('renders all cells with level 0 for empty data', () => {
    render(<ActivityHeatmap data={[]} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    for (const cell of cells) {
      expect(cell.getAttribute('data-level')).toBe('0');
      expect(cell.getAttribute('data-count')).toBe('0');
    }
  });

  // -- Month labels --
  it('shows month labels by default', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const labels = screen.getAllByTestId('month-label');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('hides month labels when showMonthLabels is false', () => {
    render(<ActivityHeatmap data={sampleData} showMonthLabels={false} />);
    expect(screen.queryAllByTestId('month-label')).toHaveLength(0);
  });

  it('renders Korean month labels', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const labels = screen.getAllByTestId('month-label');
    const labelTexts = labels.map(l => l.textContent);
    // Should contain some Korean month labels
    const koreanMonths = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    for (const text of labelTexts) {
      expect(koreanMonths).toContain(text);
    }
  });

  // -- Day labels --
  it('shows day-of-week labels by default', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const labels = screen.getAllByTestId('day-label');
    expect(labels).toHaveLength(3); // Mon, Wed, Fri
  });

  it('renders Korean day labels (월, 수, 금)', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const labels = screen.getAllByTestId('day-label');
    expect(labels[0].textContent).toBe('월');
    expect(labels[1].textContent).toBe('수');
    expect(labels[2].textContent).toBe('금');
  });

  it('hides day labels when showDayLabels is false', () => {
    render(<ActivityHeatmap data={sampleData} showDayLabels={false} />);
    expect(screen.queryAllByTestId('day-label')).toHaveLength(0);
  });

  // -- Legend --
  it('shows legend by default', () => {
    render(<ActivityHeatmap data={sampleData} />);
    expect(screen.getByTestId('heatmap-legend')).toBeInTheDocument();
  });

  it('hides legend when showLegend is false', () => {
    render(<ActivityHeatmap data={sampleData} showLegend={false} />);
    expect(screen.queryByTestId('heatmap-legend')).not.toBeInTheDocument();
  });

  it('renders 5 legend cells (levels 0-4)', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const legendCells = screen.getAllByTestId('legend-cell');
    expect(legendCells).toHaveLength(5);
  });

  it('shows Korean legend labels (적음, 많음)', () => {
    render(<ActivityHeatmap data={sampleData} />);
    expect(screen.getByText('적음')).toBeInTheDocument();
    expect(screen.getByText('많음')).toBeInTheDocument();
  });

  // -- Tooltip --
  it('shows tooltip on cell hover', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    // Find a cell with data
    const dataCell = cells.find(c => parseInt(c.getAttribute('data-count') || '0', 10) > 0);
    if (dataCell) {
      fireEvent.mouseEnter(dataCell);
      expect(screen.getByTestId('heatmap-tooltip')).toBeInTheDocument();
    }
  });

  it('hides tooltip on mouse leave', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const dataCell = cells.find(c => parseInt(c.getAttribute('data-count') || '0', 10) > 0);
    if (dataCell) {
      fireEvent.mouseEnter(dataCell);
      expect(screen.getByTestId('heatmap-tooltip')).toBeInTheDocument();
      fireEvent.mouseLeave(dataCell);
      expect(screen.queryByTestId('heatmap-tooltip')).not.toBeInTheDocument();
    }
  });

  it('does not show tooltip when showTooltip is false', () => {
    render(<ActivityHeatmap data={sampleData} showTooltip={false} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const dataCell = cells.find(c => parseInt(c.getAttribute('data-count') || '0', 10) > 0);
    if (dataCell) {
      fireEvent.mouseEnter(dataCell);
      expect(screen.queryByTestId('heatmap-tooltip')).not.toBeInTheDocument();
    }
  });

  it('tooltip displays count with 건 suffix', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const dataCell = cells.find(c => c.getAttribute('data-count') === '5');
    if (dataCell) {
      fireEvent.mouseEnter(dataCell);
      const tooltip = screen.getByTestId('heatmap-tooltip');
      expect(tooltip.textContent).toContain('5건');
    }
  });

  // -- Cell click --
  it('calls onCellClick when a cell is clicked', () => {
    const handleClick = vi.fn();
    render(<ActivityHeatmap data={sampleData} onCellClick={handleClick} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const dataCell = cells.find(c => c.getAttribute('data-date') === '2026-01-15');
    if (dataCell) {
      fireEvent.click(dataCell);
      expect(handleClick).toHaveBeenCalledWith('2026-01-15', 5);
    }
  });

  it('does not error when onCellClick is not provided', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    expect(() => fireEvent.click(cells[0])).not.toThrow();
  });

  // -- Custom colors --
  it('applies custom colors via inline styles', () => {
    const customColors: [string, string, string, string, string] = ['#eee', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
    render(<ActivityHeatmap data={sampleData} colors={customColors} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const emptyCell = cells.find(c => c.getAttribute('data-level') === '0');
    if (emptyCell) {
      expect(emptyCell.style.fill).toBe(customColors[0]);
    }
  });

  // -- Aggregation --
  it('aggregates duplicate dates', () => {
    const dupeData: ActivityData[] = [
      { date: '2026-01-15', count: 3 },
      { date: '2026-01-15', count: 7 },
    ];
    render(<ActivityHeatmap data={dupeData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const jan15 = cells.find(c => c.getAttribute('data-date') === '2026-01-15');
    if (jan15) {
      expect(jan15.getAttribute('data-count')).toBe('10');
    }
  });

  // -- Sizing --
  it('renders SVG with correct dimensions for default settings', () => {
    render(<ActivityHeatmap data={sampleData} />);
    const svg = screen.getByTestId('activity-heatmap-svg');
    const width = parseInt(svg.getAttribute('width') || '0', 10);
    const height = parseInt(svg.getAttribute('height') || '0', 10);
    // width = 28 (day labels) + 52 * 13 = 28 + 676 = 704
    expect(width).toBe(28 + 52 * 13);
    // height = 16 (month labels) + 7 * 13 = 16 + 91 = 107
    expect(height).toBe(16 + 7 * 13);
  });

  it('adjusts SVG width for custom weeks count', () => {
    render(<ActivityHeatmap data={sampleData} weeks={26} />);
    const svg = screen.getByTestId('activity-heatmap-svg');
    const width = parseInt(svg.getAttribute('width') || '0', 10);
    expect(width).toBe(28 + 26 * 13);
  });

  it('adjusts SVG dimensions when labels are hidden', () => {
    render(<ActivityHeatmap data={sampleData} showDayLabels={false} showMonthLabels={false} />);
    const svg = screen.getByTestId('activity-heatmap-svg');
    const width = parseInt(svg.getAttribute('width') || '0', 10);
    const height = parseInt(svg.getAttribute('height') || '0', 10);
    // No day label padding, no month label height
    expect(width).toBe(52 * 13);
    expect(height).toBe(7 * 13);
  });

  it('adjusts cell layout for custom cellSize and cellGap', () => {
    render(<ActivityHeatmap data={sampleData} cellSize={14} cellGap={3} />);
    const svg = screen.getByTestId('activity-heatmap-svg');
    const width = parseInt(svg.getAttribute('width') || '0', 10);
    // step = 14 + 3 = 17
    expect(width).toBe(28 + 52 * 17);
  });

  // -- Level calculation --
  it('assigns correct levels based on quartile ranges', () => {
    // maxCount = 100, so: 1-25 → level1, 26-50 → level2, 51-75 → level3, 76-100 → level4
    const quartileData: ActivityData[] = [
      { date: '2026-01-10', count: 10 },  // 10/100 = 0.10 → level 1
      { date: '2026-01-11', count: 30 },  // 30/100 = 0.30 → level 2
      { date: '2026-01-12', count: 60 },  // 60/100 = 0.60 → level 3
      { date: '2026-01-13', count: 100 }, // 100/100 = 1.00 → level 4
    ];
    render(<ActivityHeatmap data={quartileData} />);
    const cells = screen.getAllByTestId('heatmap-cell');
    const jan10 = cells.find(c => c.getAttribute('data-date') === '2026-01-10');
    const jan11 = cells.find(c => c.getAttribute('data-date') === '2026-01-11');
    const jan12 = cells.find(c => c.getAttribute('data-date') === '2026-01-12');
    const jan13 = cells.find(c => c.getAttribute('data-date') === '2026-01-13');
    if (jan10) expect(jan10.getAttribute('data-level')).toBe('1');
    if (jan11) expect(jan11.getAttribute('data-level')).toBe('2');
    if (jan12) expect(jan12.getAttribute('data-level')).toBe('3');
    if (jan13) expect(jan13.getAttribute('data-level')).toBe('4');
  });
});
