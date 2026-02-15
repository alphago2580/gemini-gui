import React, { useMemo } from 'react';
import './AreaChart.css';
import * as S from '../constants/strings';

export type AreaChartSize = 'small' | 'medium' | 'large';

export interface AreaChartDataPoint {
  label: string;
  value: number;
}

export interface AreaChartSeries {
  name: string;
  data: AreaChartDataPoint[];
  color?: string;
  fillOpacity?: number;
}

export interface AreaChartProps {
  /** Single data array or multiple series */
  data?: AreaChartDataPoint[];
  /** Multiple series for stacked/overlapping areas */
  series?: AreaChartSeries[];
  /** Size preset */
  size?: AreaChartSize;
  /** Custom width in px (overrides size preset) */
  width?: number;
  /** Custom height in px (overrides size preset) */
  height?: number;
  /** Whether to show data point dots */
  showDots?: boolean;
  /** Whether to show value labels at data points */
  showValues?: boolean;
  /** Whether to show axis labels */
  showLabels?: boolean;
  /** Whether to show gridlines */
  showGrid?: boolean;
  /** Whether to show the area fill (false = line chart only) */
  showFill?: boolean;
  /** Whether to use curved lines (bezier) */
  curved?: boolean;
  /** Line/fill color (for single data mode) */
  color?: string;
  /** Fill opacity 0-1 (for single data mode) */
  fillOpacity?: number;
  /** Line stroke width */
  strokeWidth?: number;
  /** Dot radius */
  dotRadius?: number;
  /** Whether to animate on render */
  animated?: boolean;
  /** Accessible label */
  ariaLabel?: string;
  /** Custom CSS class */
  className?: string;
}

const SIZE_PRESETS: Record<AreaChartSize, { width: number; height: number }> = {
  small: { width: 200, height: 120 },
  medium: { width: 320, height: 200 },
  large: { width: 480, height: 300 },
};

const PADDING = { top: 16, right: 16, bottom: 28, left: 40 };

function buildLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

function buildCurvedPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) / 3;
    const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
    path += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
  }
  return path;
}

function buildAreaPath(
  points: Array<{ x: number; y: number }>,
  baselineY: number,
  curved: boolean,
): string {
  if (points.length === 0) return '';
  const linePath = curved ? buildCurvedPath(points) : buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath} L${last.x},${baselineY} L${first.x},${baselineY} Z`;
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  series,
  size = 'medium',
  width: customWidth,
  height: customHeight,
  showDots = false,
  showValues = false,
  showLabels = true,
  showGrid = false,
  showFill = true,
  curved = false,
  color,
  fillOpacity = 0.3,
  strokeWidth = 2,
  dotRadius = 3,
  animated = false,
  ariaLabel,
  className,
}) => {
  const preset = SIZE_PRESETS[size];
  const width = customWidth ?? preset.width;
  const height = customHeight ?? preset.height;

  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;

  // Normalize to series format
  const normalizedSeries: AreaChartSeries[] = useMemo(() => {
    if (series && series.length > 0) return series;
    if (data && data.length > 0) {
      return [{ name: 'default', data, color, fillOpacity }];
    }
    return [];
  }, [series, data, color, fillOpacity]);

  // Compute global max value across all series
  const maxValue = useMemo(() => {
    let max = 0;
    for (const s of normalizedSeries) {
      for (const d of s.data) {
        if (d.value > max) max = d.value;
      }
    }
    return max;
  }, [normalizedSeries]);

  // Compute global labels (from first series or longest)
  const labels = useMemo(() => {
    if (normalizedSeries.length === 0) return [];
    let longest = normalizedSeries[0].data;
    for (const s of normalizedSeries) {
      if (s.data.length > longest.length) longest = s.data;
    }
    return longest.map((d) => d.label);
  }, [normalizedSeries]);

  // Grid lines
  const gridLines = useMemo(() => {
    if (!showGrid || maxValue <= 0) return [];
    const count = 4;
    const lines: Array<{ value: number; y: number }> = [];
    for (let i = 0; i <= count; i++) {
      const frac = i / count;
      const value = Math.round(maxValue * frac);
      const y = PADDING.top + innerHeight - frac * innerHeight;
      lines.push({ value, y });
    }
    return lines;
  }, [showGrid, maxValue, innerHeight]);

  // Compute points for each series
  const seriesPoints = useMemo(() => {
    return normalizedSeries.map((s) => {
      const len = s.data.length;
      return s.data.map((d, i) => ({
        x: PADDING.left + (len > 1 ? (i / (len - 1)) * innerWidth : innerWidth / 2),
        y: PADDING.top + innerHeight - (maxValue > 0 ? (d.value / maxValue) * innerHeight : 0),
        value: d.value,
        label: d.label,
      }));
    });
  }, [normalizedSeries, innerWidth, innerHeight, maxValue]);

  const containerClass = [
    'area-chart',
    `area-chart--${size}`,
    animated ? 'area-chart--animated' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const baselineY = PADDING.top + innerHeight;

  return (
    <div
      className={containerClass}
      role="img"
      aria-label={ariaLabel ?? S.AREA_CHART_ARIA}
    >
      <svg
        className="area-chart-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Grid lines */}
        {showGrid &&
          gridLines.map((line, i) => (
            <line
              key={`grid-${i}`}
              className="area-chart-grid"
              x1={PADDING.left}
              y1={line.y}
              x2={width - PADDING.right}
              y2={line.y}
            />
          ))}

        {/* Grid labels */}
        {showGrid &&
          gridLines.map((line, i) => (
            <text
              key={`grid-label-${i}`}
              className="area-chart-grid-label"
              x={PADDING.left - 4}
              y={line.y}
              textAnchor="end"
              dominantBaseline="central"
            >
              {line.value}
            </text>
          ))}

        {/* Areas and lines for each series */}
        {normalizedSeries.map((s, si) => {
          const points = seriesPoints[si];
          if (points.length === 0) return null;

          const seriesColor = s.color ?? color ?? undefined;
          const seriesFillOpacity = s.fillOpacity ?? fillOpacity;

          return (
            <g key={si} className="area-chart-series">
              {/* Filled area */}
              {showFill && (
                <path
                  className="area-chart-area"
                  d={buildAreaPath(points, baselineY, curved)}
                  style={{
                    fill: seriesColor,
                    opacity: seriesFillOpacity,
                  }}
                />
              )}

              {/* Line */}
              <path
                className="area-chart-line"
                d={curved ? buildCurvedPath(points) : buildLinePath(points)}
                style={seriesColor ? { stroke: seriesColor } : undefined}
                strokeWidth={strokeWidth}
              />

              {/* Dots */}
              {showDots &&
                points.map((p, pi) => (
                  <circle
                    key={`dot-${pi}`}
                    className="area-chart-dot"
                    cx={p.x}
                    cy={p.y}
                    r={dotRadius}
                    style={seriesColor ? { fill: seriesColor } : undefined}
                  />
                ))}

              {/* Value labels */}
              {showValues &&
                points.map((p, pi) => (
                  <text
                    key={`val-${pi}`}
                    className="area-chart-value"
                    x={p.x}
                    y={p.y - dotRadius - 4}
                    textAnchor="middle"
                  >
                    {p.value}
                  </text>
                ))}
            </g>
          );
        })}

        {/* X-axis labels */}
        {showLabels &&
          labels.map((label, i) => {
            const x =
              PADDING.left +
              (labels.length > 1 ? (i / (labels.length - 1)) * innerWidth : innerWidth / 2);
            return (
              <text
                key={`label-${i}`}
                className="area-chart-label"
                x={x}
                y={height - PADDING.bottom + 14}
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}

        {/* Axes */}
        <line
          className="area-chart-axis"
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={baselineY}
        />
        <line
          className="area-chart-axis"
          x1={PADDING.left}
          y1={baselineY}
          x2={width - PADDING.right}
          y2={baselineY}
        />
      </svg>
    </div>
  );
};

export default React.memo(AreaChart);
