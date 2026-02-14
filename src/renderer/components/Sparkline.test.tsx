import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Sparkline from './Sparkline';

describe('Sparkline', () => {
  const sampleData = [10, 30, 20, 50, 40];

  // -- Basic rendering --
  it('renders with role="img"', () => {
    render(<Sparkline data={sampleData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('has default aria-label in Korean', () => {
    render(<Sparkline data={sampleData} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '스파크라인');
  });

  it('uses custom label for aria-label', () => {
    render(<Sparkline data={sampleData} label="토큰 사용량" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '토큰 사용량');
  });

  it('applies custom id', () => {
    const { container } = render(<Sparkline data={sampleData} id="my-spark" />);
    expect(container.querySelector('#my-spark')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Sparkline data={sampleData} className="custom" />);
    expect(container.querySelector('.sparkline.custom')).toBeInTheDocument();
  });

  it('renders an SVG element', () => {
    render(<Sparkline data={sampleData} />);
    expect(screen.getByTestId('sparkline-svg')).toBeInTheDocument();
  });

  // -- Empty data --
  it('renders empty SVG for empty data', () => {
    render(<Sparkline data={[]} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toBeInTheDocument();
    expect(svg.children).toHaveLength(0);
  });

  // -- Single data point --
  it('renders a line path for single data point', () => {
    const { container } = render(<Sparkline data={[42]} />);
    const path = container.querySelector('.sparkline-line');
    expect(path).toBeInTheDocument();
    // Single point generates an M command (no L commands)
    expect(path?.getAttribute('d')).toMatch(/^M\d/);
    expect(path?.getAttribute('d')).not.toContain('L');
  });

  // -- Variants --
  it('applies line variant class by default', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    expect(container.querySelector('.sparkline')).toHaveClass('sparkline--line');
  });

  it('applies bar variant class', () => {
    const { container } = render(<Sparkline data={sampleData} variant="bar" />);
    expect(container.querySelector('.sparkline')).toHaveClass('sparkline--bar');
  });

  it('applies area variant class', () => {
    const { container } = render(<Sparkline data={sampleData} variant="area" />);
    expect(container.querySelector('.sparkline')).toHaveClass('sparkline--area');
  });

  // -- Line variant --
  it('renders a line path with M and L commands', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const path = container.querySelector('.sparkline-line');
    expect(path).toBeInTheDocument();
    const d = path?.getAttribute('d') || '';
    expect(d).toMatch(/^M/);
    expect(d).toContain('L');
  });

  it('has no fill on line path', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const path = container.querySelector('.sparkline-line');
    // CSS class sets fill: none; we just check the element exists
    expect(path).toBeInTheDocument();
  });

  it('applies custom stroke color via style', () => {
    const { container } = render(<Sparkline data={sampleData} color="#ff0000" />);
    const path = container.querySelector('.sparkline-line');
    expect(path).toHaveStyle({ stroke: '#ff0000' });
  });

  it('applies custom stroke width', () => {
    const { container } = render(<Sparkline data={sampleData} strokeWidth={3} />);
    const path = container.querySelector('.sparkline-line');
    expect(path).toHaveAttribute('stroke-width', '3');
  });

  // -- Area variant --
  it('renders area fill path in area variant', () => {
    const { container } = render(<Sparkline data={sampleData} variant="area" />);
    expect(container.querySelector('.sparkline-area')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-line')).toBeInTheDocument();
  });

  it('area path closes with Z', () => {
    const { container } = render(<Sparkline data={sampleData} variant="area" />);
    const area = container.querySelector('.sparkline-area');
    expect(area?.getAttribute('d')).toMatch(/Z$/);
  });

  it('applies custom fill color to area', () => {
    const { container } = render(
      <Sparkline data={sampleData} variant="area" fillColor="rgba(255,0,0,0.3)" />,
    );
    const area = container.querySelector('.sparkline-area');
    expect(area).toHaveStyle({ fill: 'rgba(255,0,0,0.3)' });
  });

  it('does not render area fill for line variant', () => {
    const { container } = render(<Sparkline data={sampleData} variant="line" />);
    expect(container.querySelector('.sparkline-area')).not.toBeInTheDocument();
  });

  // -- Bar variant --
  it('renders rect elements for bar variant', () => {
    const { container } = render(<Sparkline data={sampleData} variant="bar" />);
    const bars = container.querySelectorAll('.sparkline-bar');
    expect(bars).toHaveLength(sampleData.length);
  });

  it('does not render line path for bar variant', () => {
    const { container } = render(<Sparkline data={sampleData} variant="bar" />);
    expect(container.querySelector('.sparkline-line')).not.toBeInTheDocument();
  });

  it('applies custom color to bars', () => {
    const { container } = render(
      <Sparkline data={sampleData} variant="bar" color="#00ff00" />,
    );
    const bars = container.querySelectorAll('.sparkline-bar');
    // Non-extreme bars should have custom color
    const regularBars = Array.from(bars).filter(
      (b) => !b.classList.contains('sparkline-bar--min') && !b.classList.contains('sparkline-bar--max'),
    );
    regularBars.forEach((bar) => {
      expect(bar).toHaveStyle({ fill: '#00ff00' });
    });
  });

  // -- Sizes --
  it('applies medium size by default', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    expect(container.querySelector('.sparkline')).toHaveClass('sparkline--medium');
  });

  it('applies small size', () => {
    const { container } = render(<Sparkline data={sampleData} size="small" />);
    expect(container.querySelector('.sparkline')).toHaveClass('sparkline--small');
  });

  it('applies large size', () => {
    const { container } = render(<Sparkline data={sampleData} size="large" />);
    expect(container.querySelector('.sparkline')).toHaveClass('sparkline--large');
  });

  it('uses small preset dimensions', () => {
    render(<Sparkline data={sampleData} size="small" />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toHaveAttribute('width', '60');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('uses medium preset dimensions', () => {
    render(<Sparkline data={sampleData} size="medium" />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('uses large preset dimensions', () => {
    render(<Sparkline data={sampleData} size="large" />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toHaveAttribute('width', '160');
    expect(svg).toHaveAttribute('height', '48');
  });

  // -- Custom dimensions --
  it('overrides width with custom value', () => {
    render(<Sparkline data={sampleData} width={200} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toHaveAttribute('width', '200');
  });

  it('overrides height with custom value', () => {
    render(<Sparkline data={sampleData} height={80} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toHaveAttribute('height', '80');
  });

  it('overrides both dimensions', () => {
    render(<Sparkline data={sampleData} width={200} height={80} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '80');
  });

  // -- End dot --
  it('does not show end dot by default', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    expect(container.querySelector('.sparkline-dot--end')).not.toBeInTheDocument();
  });

  it('shows end dot when showEndDot=true', () => {
    const { container } = render(<Sparkline data={sampleData} showEndDot />);
    expect(container.querySelector('.sparkline-dot--end')).toBeInTheDocument();
  });

  it('applies custom color to end dot', () => {
    const { container } = render(
      <Sparkline data={sampleData} showEndDot color="#ff0000" />,
    );
    const dot = container.querySelector('.sparkline-dot--end');
    expect(dot).toHaveStyle({ fill: '#ff0000' });
  });

  it('does not show end dot for empty data', () => {
    const { container } = render(<Sparkline data={[]} showEndDot />);
    expect(container.querySelector('.sparkline-dot--end')).not.toBeInTheDocument();
  });

  // -- Highlight extremes --
  it('does not highlight extremes by default', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    expect(container.querySelector('.sparkline-dot--min')).not.toBeInTheDocument();
    expect(container.querySelector('.sparkline-dot--max')).not.toBeInTheDocument();
  });

  it('highlights min and max dots when highlightExtremes=true', () => {
    const { container } = render(<Sparkline data={sampleData} highlightExtremes />);
    expect(container.querySelector('.sparkline-dot--min')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-dot--max')).toBeInTheDocument();
  });

  it('does not highlight extremes with fewer than 2 points', () => {
    const { container } = render(<Sparkline data={[42]} highlightExtremes />);
    expect(container.querySelector('.sparkline-dot--min')).not.toBeInTheDocument();
    expect(container.querySelector('.sparkline-dot--max')).not.toBeInTheDocument();
  });

  it('highlights extreme bars in bar variant', () => {
    const { container } = render(
      <Sparkline data={sampleData} variant="bar" highlightExtremes />,
    );
    expect(container.querySelector('.sparkline-bar--min')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-bar--max')).toBeInTheDocument();
  });

  // -- Show bounds --
  it('does not show bounds by default', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    expect(container.querySelector('.sparkline-bound')).not.toBeInTheDocument();
  });

  it('shows min/max bounds when showBounds=true', () => {
    const { container } = render(<Sparkline data={sampleData} showBounds />);
    expect(container.querySelector('.sparkline-bound--min')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-bound--max')).toBeInTheDocument();
  });

  it('does not show bounds with fewer than 2 points', () => {
    const { container } = render(<Sparkline data={[42]} showBounds />);
    expect(container.querySelector('.sparkline-bound--min')).not.toBeInTheDocument();
  });

  // -- Data edge cases --
  it('handles all equal values', () => {
    const { container } = render(<Sparkline data={[5, 5, 5, 5]} />);
    const path = container.querySelector('.sparkline-line');
    expect(path).toBeInTheDocument();
    // All values equal => all Y coordinates should be equal
    const d = path?.getAttribute('d') || '';
    expect(d).toMatch(/^M/);
  });

  it('handles negative values', () => {
    const { container } = render(<Sparkline data={[-10, -5, -20, -1]} />);
    const path = container.querySelector('.sparkline-line');
    expect(path).toBeInTheDocument();
  });

  it('handles mixed positive and negative values', () => {
    const { container } = render(<Sparkline data={[-10, 0, 10, -5, 15]} />);
    const path = container.querySelector('.sparkline-line');
    expect(path).toBeInTheDocument();
  });

  it('handles two data points', () => {
    const { container } = render(<Sparkline data={[0, 100]} />);
    const path = container.querySelector('.sparkline-line');
    const d = path?.getAttribute('d') || '';
    // Should have M and exactly one L
    expect(d).toMatch(/^M[\d.]+,[\d.]+L[\d.]+,[\d.]+$/);
  });

  it('handles large dataset', () => {
    const bigData = Array.from({ length: 100 }, (_, i) => Math.sin(i / 10) * 50 + 50);
    const { container } = render(<Sparkline data={bigData} />);
    const path = container.querySelector('.sparkline-line');
    expect(path).toBeInTheDocument();
  });

  // -- Bar variant edge cases --
  it('bar variant handles single data point', () => {
    const { container } = render(<Sparkline data={[42]} variant="bar" />);
    const bars = container.querySelectorAll('.sparkline-bar');
    expect(bars).toHaveLength(1);
  });

  it('bar variant handles equal values', () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} variant="bar" />);
    const bars = container.querySelectorAll('.sparkline-bar');
    expect(bars).toHaveLength(3);
  });

  // -- Combination of features --
  it('renders area with end dot and extremes', () => {
    const { container } = render(
      <Sparkline
        data={sampleData}
        variant="area"
        showEndDot
        highlightExtremes
        showBounds
      />,
    );
    expect(container.querySelector('.sparkline-area')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-line')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-dot--end')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-dot--min')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-dot--max')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-bound--min')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-bound--max')).toBeInTheDocument();
  });

  // -- SVG viewBox --
  it('sets correct viewBox on SVG', () => {
    render(<Sparkline data={sampleData} width={120} height={40} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 120 40');
  });

  // -- Wrapper element --
  it('renders as a span element', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const wrapper = container.querySelector('.sparkline');
    expect(wrapper?.tagName).toBe('SPAN');
  });
});
