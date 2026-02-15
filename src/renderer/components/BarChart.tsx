import React, { useMemo } from 'react';
import './BarChart.css';
import * as S from '../constants/strings';

export type BarChartOrientation = 'vertical' | 'horizontal';
export type BarChartSize = 'small' | 'medium' | 'large';

export interface BarChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  /** Data items to display */
  data: BarChartDataItem[];
  /** Chart orientation */
  orientation?: BarChartOrientation;
  /** Size preset */
  size?: BarChartSize;
  /** Custom width in px (overrides size preset) */
  width?: number;
  /** Custom height in px (overrides size preset) */
  height?: number;
  /** Whether to show value labels on bars */
  showValues?: boolean;
  /** Whether to show axis labels */
  showLabels?: boolean;
  /** Whether to show gridlines */
  showGrid?: boolean;
  /** Default bar color (CSS color) */
  barColor?: string;
  /** Gap between bars in px */
  barGap?: number;
  /** Border radius for bar corners */
  barRadius?: number;
  /** Whether to animate bars on render */
  animated?: boolean;
  /** Accessible label */
  ariaLabel?: string;
  /** Custom CSS class */
  className?: string;
}

const SIZE_PRESETS: Record<BarChartSize, { width: number; height: number }> = {
  small: { width: 200, height: 120 },
  medium: { width: 320, height: 200 },
  large: { width: 480, height: 300 },
};

const PADDING = { top: 16, right: 16, bottom: 28, left: 40 };

const BarChart: React.FC<BarChartProps> = ({
  data,
  orientation = 'vertical',
  size = 'medium',
  width: customWidth,
  height: customHeight,
  showValues = false,
  showLabels = true,
  showGrid = false,
  barColor,
  barGap = 4,
  barRadius = 2,
  animated = false,
  ariaLabel,
  className,
}) => {
  const preset = SIZE_PRESETS[size];
  const width = customWidth ?? preset.width;
  const height = customHeight ?? preset.height;

  const maxValue = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((d) => d.value), 0);
  }, [data]);

  const gridLines = useMemo(() => {
    if (!showGrid || maxValue <= 0) return [];
    const count = 4;
    const lines: Array<{ value: number; y: number }> = [];
    const innerHeight = height - PADDING.top - PADDING.bottom;
    for (let i = 0; i <= count; i++) {
      const frac = i / count;
      const value = Math.round(maxValue * frac);
      const y = PADDING.top + innerHeight - frac * innerHeight;
      lines.push({ value, y });
    }
    return lines;
  }, [showGrid, maxValue, height]);

  const containerClass = [
    'bar-chart',
    `bar-chart--${size}`,
    `bar-chart--${orientation}`,
    animated ? 'bar-chart--animated' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;

  if (data.length === 0) {
    return (
      <div
        className={containerClass}
        role="img"
        aria-label={ariaLabel ?? S.BAR_CHART_ARIA}
      >
        <svg
          className="bar-chart-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        />
      </div>
    );
  }

  if (orientation === 'horizontal') {
    const barThickness = Math.max(
      1,
      (innerHeight - barGap * (data.length - 1)) / data.length,
    );

    return (
      <div
        className={containerClass}
        role="img"
        aria-label={ariaLabel ?? S.BAR_CHART_ARIA}
      >
        <svg
          className="bar-chart-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Grid lines (vertical for horizontal bars) */}
          {showGrid &&
            gridLines.map((line, i) => {
              const x =
                PADDING.left +
                (maxValue > 0 ? (line.value / maxValue) * innerWidth : 0);
              return (
                <line
                  key={i}
                  className="bar-chart-grid"
                  x1={x}
                  y1={PADDING.top}
                  x2={x}
                  y2={height - PADDING.bottom}
                />
              );
            })}

          {/* Bars */}
          {data.map((item, i) => {
            const barW =
              maxValue > 0 ? (item.value / maxValue) * innerWidth : 0;
            const y = PADDING.top + i * (barThickness + barGap);
            return (
              <g key={i}>
                <rect
                  className="bar-chart-bar"
                  x={PADDING.left}
                  y={y}
                  width={Math.max(0, barW)}
                  height={barThickness}
                  rx={barRadius}
                  ry={barRadius}
                  style={
                    item.color
                      ? { fill: item.color }
                      : barColor
                        ? { fill: barColor }
                        : undefined
                  }
                />
                {showValues && barW > 0 && (
                  <text
                    className="bar-chart-value"
                    x={PADDING.left + barW + 4}
                    y={y + barThickness / 2}
                    dominantBaseline="central"
                  >
                    {item.value}
                  </text>
                )}
                {showLabels && (
                  <text
                    className="bar-chart-label"
                    x={PADDING.left - 4}
                    y={y + barThickness / 2}
                    textAnchor="end"
                    dominantBaseline="central"
                  >
                    {item.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axis */}
          <line
            className="bar-chart-axis"
            x1={PADDING.left}
            y1={PADDING.top}
            x2={PADDING.left}
            y2={height - PADDING.bottom}
          />
        </svg>
      </div>
    );
  }

  // Vertical orientation (default)
  const barWidth = Math.max(
    1,
    (innerWidth - barGap * (data.length - 1)) / data.length,
  );

  return (
    <div
      className={containerClass}
      role="img"
      aria-label={ariaLabel ?? S.BAR_CHART_ARIA}
    >
      <svg
        className="bar-chart-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Grid lines */}
        {showGrid &&
          gridLines.map((line, i) => (
            <line
              key={i}
              className="bar-chart-grid"
              x1={PADDING.left}
              y1={line.y}
              x2={width - PADDING.right}
              y2={line.y}
            />
          ))}

        {/* Bars */}
        {data.map((item, i) => {
          const barH = maxValue > 0 ? (item.value / maxValue) * innerHeight : 0;
          const x = PADDING.left + i * (barWidth + barGap);
          const y = PADDING.top + innerHeight - barH;
          return (
            <g key={i}>
              <rect
                className="bar-chart-bar"
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(0, barH)}
                rx={barRadius}
                ry={barRadius}
                style={
                  item.color
                    ? { fill: item.color }
                    : barColor
                      ? { fill: barColor }
                      : undefined
                }
              />
              {showValues && barH > 0 && (
                <text
                  className="bar-chart-value"
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                >
                  {item.value}
                </text>
              )}
              {showLabels && (
                <text
                  className="bar-chart-label"
                  x={x + barWidth / 2}
                  y={height - PADDING.bottom + 14}
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Axis */}
        <line
          className="bar-chart-axis"
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={height - PADDING.bottom}
        />
        <line
          className="bar-chart-axis"
          x1={PADDING.left}
          y1={height - PADDING.bottom}
          x2={width - PADDING.right}
          y2={height - PADDING.bottom}
        />

        {/* Grid labels */}
        {showGrid &&
          gridLines.map((line, i) => (
            <text
              key={`label-${i}`}
              className="bar-chart-grid-label"
              x={PADDING.left - 4}
              y={line.y}
              textAnchor="end"
              dominantBaseline="central"
            >
              {line.value}
            </text>
          ))}
      </svg>
    </div>
  );
};

export default React.memo(BarChart);
