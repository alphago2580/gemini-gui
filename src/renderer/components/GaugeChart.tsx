import React, { useMemo } from 'react';
import './GaugeChart.css';

export type GaugeChartSize = 'small' | 'medium' | 'large';

export interface GaugeZone {
  from: number;
  to: number;
  color: string;
  label?: string;
}

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  size?: GaugeChartSize;
  label?: string;
  unit?: string;
  showValue?: boolean;
  zones?: GaugeZone[];
  ticks?: number;
  animated?: boolean;
  className?: string;
  ariaLabel?: string;
}

const SIZE_MAP: Record<GaugeChartSize, number> = {
  small: 120,
  medium: 180,
  large: 260,
};

const STROKE_MAP: Record<GaugeChartSize, number> = {
  small: 10,
  medium: 14,
  large: 18,
};

const START_ANGLE = -180;
const END_ANGLE = 0;
const SWEEP = END_ANGLE - START_ANGLE; // 180 degrees

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const sweep = endAngle - startAngle;
  const largeArcFlag = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  size = 'medium',
  label,
  unit,
  showValue = true,
  zones,
  ticks = 0,
  animated = false,
  className,
  ariaLabel,
}) => {
  const diameter = SIZE_MAP[size];
  const stroke = STROKE_MAP[size];
  const radius = (diameter - stroke) / 2;
  const cx = diameter / 2;
  const cy = diameter / 2;
  const padding = 4;
  const svgWidth = diameter;
  const svgHeight = diameter / 2 + padding;

  const range = max - min;
  const clampedValue = Math.max(min, Math.min(value, max));
  const fraction = range > 0 ? (clampedValue - min) / range : 0;
  const needleAngle = START_ANGLE + fraction * SWEEP;

  const trackPath = useMemo(
    () => describeArc(cx, cy, radius, START_ANGLE, END_ANGLE),
    [cx, cy, radius],
  );

  const zonePaths = useMemo(() => {
    if (!zones || zones.length === 0) return [];
    return zones.map((zone) => {
      const fromFrac = range > 0 ? Math.max(0, Math.min(1, (zone.from - min) / range)) : 0;
      const toFrac = range > 0 ? Math.max(0, Math.min(1, (zone.to - min) / range)) : 0;
      const zoneStart = START_ANGLE + fromFrac * SWEEP;
      const zoneEnd = START_ANGLE + toFrac * SWEEP;
      if (zoneEnd <= zoneStart) return null;
      return {
        path: describeArc(cx, cy, radius, zoneStart, zoneEnd),
        color: zone.color,
        label: zone.label,
      };
    }).filter((z): z is NonNullable<typeof z> => z !== null);
  }, [zones, cx, cy, radius, min, range]);

  const tickMarks = useMemo(() => {
    if (ticks <= 0) return [];
    const marks: Array<{ x1: number; y1: number; x2: number; y2: number; labelX: number; labelY: number; value: number }> = [];
    const tickCount = ticks;
    for (let i = 0; i <= tickCount; i++) {
      const frac = i / tickCount;
      const angle = START_ANGLE + frac * SWEEP;
      const outerR = radius + stroke / 2 + 2;
      const innerR = radius - stroke / 2 - 2;
      const labelR = radius + stroke / 2 + 12;
      const outer = polarToCartesian(cx, cy, outerR, angle);
      const inner = polarToCartesian(cx, cy, innerR, angle);
      const labelPos = polarToCartesian(cx, cy, labelR, angle);
      marks.push({
        x1: outer.x,
        y1: outer.y,
        x2: inner.x,
        y2: inner.y,
        labelX: labelPos.x,
        labelY: labelPos.y,
        value: Math.round(min + frac * range),
      });
    }
    return marks;
  }, [ticks, cx, cy, radius, stroke, min, range]);

  const needleLength = radius - stroke / 2 - 4;
  const needleTip = polarToCartesian(cx, cy, needleLength, needleAngle);
  const needleBaseLeft = polarToCartesian(cx, cy, 4, needleAngle - 90);
  const needleBaseRight = polarToCartesian(cx, cy, 4, needleAngle + 90);

  const containerClass = [
    'gauge-chart',
    `gauge-chart--${size}`,
    animated ? 'gauge-chart--animated' : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  const displayLabel = ariaLabel ?? label ?? `${clampedValue}`;

  return (
    <div
      className={containerClass}
      role="meter"
      aria-valuenow={clampedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={displayLabel}
    >
      <svg
        className="gauge-chart-svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {/* Track */}
        <path
          className="gauge-chart-track"
          d={trackPath}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* Zone arcs */}
        {zonePaths.map((zone, i) => (
          <path
            key={i}
            className="gauge-chart-zone"
            d={zone.path}
            fill="none"
            stroke={zone.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
          />
        ))}

        {/* Tick marks */}
        {tickMarks.map((tick, i) => (
          <g key={i}>
            <line
              className="gauge-chart-tick"
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
            />
            <text
              className="gauge-chart-tick-label"
              x={tick.labelX}
              y={tick.labelY}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* Needle */}
        <polygon
          className="gauge-chart-needle"
          points={`${needleTip.x},${needleTip.y} ${needleBaseLeft.x},${needleBaseLeft.y} ${needleBaseRight.x},${needleBaseRight.y}`}
          style={animated ? { transform: `rotate(0deg)`, transformOrigin: `${cx}px ${cy}px` } : undefined}
        />
        <circle
          className="gauge-chart-needle-center"
          cx={cx}
          cy={cy}
          r={6}
        />
      </svg>

      {/* Value display below gauge */}
      {showValue && (
        <div className="gauge-chart-value">
          <span className="gauge-chart-value-number">{clampedValue}</span>
          {unit && <span className="gauge-chart-value-unit">{unit}</span>}
        </div>
      )}

      {label && (
        <div className="gauge-chart-label">{label}</div>
      )}
    </div>
  );
};

export default React.memo(GaugeChart);
