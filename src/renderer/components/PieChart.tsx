import React, { useMemo } from 'react';
import './PieChart.css';
import * as S from '../constants/strings';

export interface PieChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export type PieChartSize = 'small' | 'medium' | 'large';

export interface PieChartProps {
  /** Data items to display */
  data: PieChartDataItem[];
  /** Size preset */
  size?: PieChartSize;
  /** Custom width/height in px (overrides size preset) */
  diameter?: number;
  /** Donut mode — inner radius as fraction of outer radius (0 = pie, 0.6 = donut) */
  innerRadius?: number;
  /** Whether to show percentage labels on slices */
  showValues?: boolean;
  /** Whether to show the legend */
  showLegend?: boolean;
  /** Start angle in degrees (default 0 = 12 o'clock) */
  startAngle?: number;
  /** Whether to animate slices on render */
  animated?: boolean;
  /** Accessible label */
  ariaLabel?: string;
  /** Custom CSS class */
  className?: string;
}

const SIZE_PRESETS: Record<PieChartSize, number> = {
  small: 120,
  medium: 200,
  large: 300,
};

const DEFAULT_COLORS = [
  '#4a90d9',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#3498db',
  '#e91e63',
  '#00bcd4',
];

interface SliceData {
  startAngle: number;
  endAngle: number;
  percentage: number;
  color: string;
  label: string;
  value: number;
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  // Convert degrees to radians, offset by -90 so 0 degrees = 12 o'clock
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const outerStartX = cx + outerR * Math.cos(startRad);
  const outerStartY = cy + outerR * Math.sin(startRad);
  const outerEndX = cx + outerR * Math.cos(endRad);
  const outerEndY = cy + outerR * Math.sin(endRad);

  if (innerR <= 0) {
    // Full pie slice (wedge)
    return [
      `M ${cx} ${cy}`,
      `L ${outerStartX} ${outerStartY}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
      'Z',
    ].join(' ');
  }

  // Donut slice
  const innerStartX = cx + innerR * Math.cos(endRad);
  const innerStartY = cy + innerR * Math.sin(endRad);
  const innerEndX = cx + innerR * Math.cos(startRad);
  const innerEndY = cy + innerR * Math.sin(startRad);

  return [
    `M ${outerStartX} ${outerStartY}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerStartX} ${innerStartY}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEndX} ${innerEndY}`,
    'Z',
  ].join(' ');
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 'medium',
  diameter: customDiameter,
  innerRadius = 0,
  showValues = false,
  showLegend = false,
  startAngle = 0,
  animated = false,
  ariaLabel,
  className,
}) => {
  const diameter = customDiameter ?? SIZE_PRESETS[size];
  const outerR = diameter / 2;
  const innerR = outerR * Math.max(0, Math.min(innerRadius, 0.95));
  const cx = outerR;
  const cy = outerR;

  const total = useMemo(
    () => data.reduce((sum, d) => sum + Math.max(0, d.value), 0),
    [data],
  );

  const slices: SliceData[] = useMemo(() => {
    if (total <= 0) return [];
    let currentAngle = startAngle;
    return data
      .filter((d) => d.value > 0)
      .map((item, i) => {
        const percentage = (item.value / total) * 100;
        const sliceAngle = (item.value / total) * 360;
        const slice: SliceData = {
          startAngle: currentAngle,
          endAngle: currentAngle + sliceAngle,
          percentage,
          color: item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
          label: item.label,
          value: item.value,
        };
        currentAngle += sliceAngle;
        return slice;
      });
  }, [data, total, startAngle]);

  const containerClass = [
    'pie-chart',
    `pie-chart--${size}`,
    animated ? 'pie-chart--animated' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (data.length === 0 || total <= 0) {
    return (
      <div
        className={containerClass}
        role="img"
        aria-label={ariaLabel ?? S.PIE_CHART_ARIA}
      >
        <svg
          className="pie-chart-svg"
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
        />
      </div>
    );
  }

  // Single item — render as full circle
  const isSingleSlice = slices.length === 1;

  return (
    <div
      className={containerClass}
      role="img"
      aria-label={ariaLabel ?? S.PIE_CHART_ARIA}
    >
      <svg
        className="pie-chart-svg"
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
      >
        {isSingleSlice ? (
          <g>
            {innerR > 0 ? (
              <>
                <circle
                  className="pie-chart-slice"
                  cx={cx}
                  cy={cy}
                  r={outerR}
                  fill={slices[0].color}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerR}
                  fill="var(--bg-primary, #121212)"
                  className="pie-chart-donut-hole"
                />
              </>
            ) : (
              <circle
                className="pie-chart-slice"
                cx={cx}
                cy={cy}
                r={outerR}
                fill={slices[0].color}
              />
            )}
            {showValues && (
              <text
                className="pie-chart-value"
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
              >
                100%
              </text>
            )}
          </g>
        ) : (
          slices.map((slice, i) => {
            const midAngle =
              ((slice.startAngle + slice.endAngle) / 2 - 90) * (Math.PI / 180);
            const labelR = innerR > 0 ? (outerR + innerR) / 2 : outerR * 0.65;
            const labelX = cx + labelR * Math.cos(midAngle);
            const labelY = cy + labelR * Math.sin(midAngle);

            return (
              <g key={i}>
                <path
                  className="pie-chart-slice"
                  d={describeArc(
                    cx,
                    cy,
                    outerR,
                    innerR,
                    slice.startAngle,
                    slice.endAngle,
                  )}
                  fill={slice.color}
                />
                {showValues && slice.percentage >= 5 && (
                  <text
                    className="pie-chart-value"
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {Math.round(slice.percentage)}%
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>

      {showLegend && (
        <ul className="pie-chart-legend" aria-label={S.PIE_CHART_LEGEND_ARIA}>
          {slices.map((slice, i) => (
            <li key={i} className="pie-chart-legend-item">
              <span
                className="pie-chart-legend-swatch"
                style={{ backgroundColor: slice.color }}
              />
              <span className="pie-chart-legend-label">{slice.label}</span>
              <span className="pie-chart-legend-value">
                {Math.round(slice.percentage)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default React.memo(PieChart);
