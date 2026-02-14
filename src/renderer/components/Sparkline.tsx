import React, { useMemo } from 'react';
import './Sparkline.css';

export type SparklineVariant = 'line' | 'bar' | 'area';
export type SparklineSize = 'small' | 'medium' | 'large';

export interface SparklineProps {
  /** Data points to display */
  data: number[];
  /** Chart variant */
  variant?: SparklineVariant;
  /** Size preset */
  size?: SparklineSize;
  /** Custom width in px (overrides size preset) */
  width?: number;
  /** Custom height in px (overrides size preset) */
  height?: number;
  /** Stroke color (CSS color value) */
  color?: string;
  /** Fill color for area variant (CSS color value) */
  fillColor?: string;
  /** Stroke width in px */
  strokeWidth?: number;
  /** Whether to show a dot on the last data point */
  showEndDot?: boolean;
  /** Whether to show min/max reference lines */
  showBounds?: boolean;
  /** Whether to highlight the min and max points */
  highlightExtremes?: boolean;
  /** Accessible label */
  label?: string;
  /** Custom CSS class */
  className?: string;
  /** Element id */
  id?: string;
}

const SIZE_PRESETS: Record<SparklineSize, { width: number; height: number }> = {
  small: { width: 60, height: 20 },
  medium: { width: 100, height: 32 },
  large: { width: 160, height: 48 },
};

function buildLinePath(
  data: number[],
  width: number,
  height: number,
  padding: number,
): string {
  if (data.length === 0) return '';
  if (data.length === 1) {
    const x = width / 2;
    const y = height / 2;
    return `M${x},${y}`;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const innerHeight = height - padding * 2;
  const stepX = (width - padding * 2) / (data.length - 1);

  return data
    .map((value, i) => {
      const x = padding + i * stepX;
      const y = padding + innerHeight - ((value - min) / range) * innerHeight;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join('');
}

function buildAreaPath(
  data: number[],
  width: number,
  height: number,
  padding: number,
): string {
  const linePath = buildLinePath(data, width, height, padding);
  if (!linePath || data.length <= 1) return linePath;

  const stepX = (width - padding * 2) / (data.length - 1);
  const lastX = padding + (data.length - 1) * stepX;
  const firstX = padding;
  const bottomY = height - padding;

  return `${linePath}L${lastX.toFixed(2)},${bottomY.toFixed(2)}L${firstX.toFixed(2)},${bottomY.toFixed(2)}Z`;
}

function getPointCoordinates(
  data: number[],
  index: number,
  width: number,
  height: number,
  padding: number,
): { x: number; y: number } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const innerHeight = height - padding * 2;
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  return {
    x: data.length > 1 ? padding + index * stepX : width / 2,
    y: data.length > 1
      ? padding + innerHeight - ((data[index] - min) / range) * innerHeight
      : height / 2,
  };
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  variant = 'line',
  size = 'medium',
  width: customWidth,
  height: customHeight,
  color,
  fillColor,
  strokeWidth = 1.5,
  showEndDot = false,
  showBounds = false,
  highlightExtremes = false,
  label,
  className,
  id,
}) => {
  const preset = SIZE_PRESETS[size];
  const width = customWidth ?? preset.width;
  const height = customHeight ?? preset.height;
  const padding = 2;

  const minIndex = useMemo(() => {
    if (data.length === 0) return -1;
    let idx = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i] < data[idx]) idx = i;
    }
    return idx;
  }, [data]);

  const maxIndex = useMemo(() => {
    if (data.length === 0) return -1;
    let idx = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i] > data[idx]) idx = i;
    }
    return idx;
  }, [data]);

  const linePath = useMemo(
    () => buildLinePath(data, width, height, padding),
    [data, width, height],
  );

  const areaPath = useMemo(
    () => (variant === 'area' ? buildAreaPath(data, width, height, padding) : ''),
    [data, width, height, variant],
  );

  const endDot = useMemo(() => {
    if (!showEndDot || data.length === 0) return null;
    return getPointCoordinates(data, data.length - 1, width, height, padding);
  }, [data, width, height, showEndDot]);

  const extremePoints = useMemo(() => {
    if (!highlightExtremes || data.length < 2) return null;
    return {
      min: getPointCoordinates(data, minIndex, width, height, padding),
      max: getPointCoordinates(data, maxIndex, width, height, padding),
    };
  }, [data, width, height, highlightExtremes, minIndex, maxIndex]);

  const boundsY = useMemo(() => {
    if (!showBounds || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const innerHeight = height - padding * 2;
    return {
      minY: padding + innerHeight - ((min - min) / range) * innerHeight,
      maxY: padding + innerHeight - ((max - min) / range) * innerHeight,
    };
  }, [data, height, showBounds]);

  const classNames = [
    'sparkline',
    `sparkline--${variant}`,
    `sparkline--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (data.length === 0) {
    return (
      <span
        id={id}
        className={classNames}
        role="img"
        aria-label={label || '스파크라인'}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="sparkline-svg"
          data-testid="sparkline-svg"
        />
      </span>
    );
  }

  if (variant === 'bar') {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const barGap = 1;
    const barWidth = Math.max(1, (width - padding * 2 - barGap * (data.length - 1)) / data.length);
    const innerHeight = height - padding * 2;

    return (
      <span
        id={id}
        className={classNames}
        role="img"
        aria-label={label || '스파크라인'}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="sparkline-svg"
          data-testid="sparkline-svg"
        >
          {data.map((value, i) => {
            const barHeight = Math.max(1, ((value - min) / range) * innerHeight);
            const x = padding + i * (barWidth + barGap);
            const y = height - padding - barHeight;
            const isMin = highlightExtremes && i === minIndex;
            const isMax = highlightExtremes && i === maxIndex;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                className={[
                  'sparkline-bar',
                  isMin ? 'sparkline-bar--min' : '',
                  isMax ? 'sparkline-bar--max' : '',
                ].filter(Boolean).join(' ')}
                style={!isMin && !isMax && color ? { fill: color } : undefined}
              />
            );
          })}
        </svg>
      </span>
    );
  }

  return (
    <span
      id={id}
      className={classNames}
      role="img"
      aria-label={label || '스파크라인'}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="sparkline-svg"
        data-testid="sparkline-svg"
      >
        {showBounds && boundsY && (
          <>
            <line
              x1={padding}
              y1={boundsY.minY}
              x2={width - padding}
              y2={boundsY.minY}
              className="sparkline-bound sparkline-bound--min"
            />
            <line
              x1={padding}
              y1={boundsY.maxY}
              x2={width - padding}
              y2={boundsY.maxY}
              className="sparkline-bound sparkline-bound--max"
            />
          </>
        )}
        {variant === 'area' && areaPath && (
          <path
            d={areaPath}
            className="sparkline-area"
            style={fillColor ? { fill: fillColor } : undefined}
          />
        )}
        <path
          d={linePath}
          className="sparkline-line"
          style={color ? { stroke: color } : undefined}
          strokeWidth={strokeWidth}
        />
        {endDot && (
          <circle
            cx={endDot.x}
            cy={endDot.y}
            r={strokeWidth + 1}
            className="sparkline-dot sparkline-dot--end"
            style={color ? { fill: color } : undefined}
          />
        )}
        {extremePoints && (
          <>
            <circle
              cx={extremePoints.min.x}
              cy={extremePoints.min.y}
              r={strokeWidth + 0.5}
              className="sparkline-dot sparkline-dot--min"
            />
            <circle
              cx={extremePoints.max.x}
              cy={extremePoints.max.y}
              r={strokeWidth + 0.5}
              className="sparkline-dot sparkline-dot--max"
            />
          </>
        )}
      </svg>
    </span>
  );
};

export default React.memo(Sparkline);
