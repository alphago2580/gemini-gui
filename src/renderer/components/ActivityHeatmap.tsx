import React, { useMemo, useState, useCallback } from 'react';
import './ActivityHeatmap.css';

export interface ActivityData {
  /** Date string in YYYY-MM-DD format */
  date: string;
  /** Activity count for this date */
  count: number;
}

export interface ActivityHeatmapProps {
  /** Activity data array */
  data: ActivityData[];
  /** Number of weeks to display (default: 52) */
  weeks?: number;
  /** Cell size in pixels (default: 11) */
  cellSize?: number;
  /** Gap between cells in pixels (default: 2) */
  cellGap?: number;
  /** Whether to show month labels (default: true) */
  showMonthLabels?: boolean;
  /** Whether to show day-of-week labels (default: true) */
  showDayLabels?: boolean;
  /** Whether to show the legend (default: true) */
  showLegend?: boolean;
  /** Whether to show tooltips on hover (default: true) */
  showTooltip?: boolean;
  /** Custom color levels (array of 5 CSS colors, from empty to max) */
  colors?: [string, string, string, string, string];
  /** Accessible label */
  label?: string;
  /** Custom CSS class */
  className?: string;
  /** Element id */
  id?: string;
  /** Callback when a cell is clicked */
  onCellClick?: (date: string, count: number) => void;
}

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const DAY_LABELS = ['월', '수', '금'];
const DAY_LABEL_INDICES = [1, 3, 5]; // Mon, Wed, Fri rows

function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLevel(count: number, maxCount: number): number {
  if (count <= 0) return 0;
  if (maxCount <= 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

interface DayCell {
  date: string;
  count: number;
  level: number;
  col: number;
  row: number;
  x: number;
  y: number;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  weeks = 52,
  cellSize = 11,
  cellGap = 2,
  showMonthLabels = true,
  showDayLabels = true,
  showLegend = true,
  showTooltip = true,
  colors,
  label,
  className,
  id,
  onCellClick,
}) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data) {
      map.set(item.date, (map.get(item.date) ?? 0) + item.count);
    }
    return map;
  }, [data]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const count of dataMap.values()) {
      if (count > max) max = count;
    }
    return max;
  }, [dataMap]);

  const cells = useMemo(() => {
    const result: DayCell[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the start date: go back (weeks) weeks from end of this week
    const endDate = new Date(today);
    // Move to Saturday (end of week, Sun=0 based)
    const dayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - dayOfWeek));

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (weeks * 7 - 1));

    const step = cellSize + cellGap;
    const current = new Date(startDate);
    let col = 0;

    while (current <= endDate) {
      const row = current.getDay(); // 0=Sun, 6=Sat
      const dateKey = getDateKey(current);
      const count = dataMap.get(dateKey) ?? 0;

      result.push({
        date: dateKey,
        count,
        level: getLevel(count, maxCount),
        col,
        row,
        x: col * step,
        y: row * step,
      });

      // Advance day
      current.setDate(current.getDate() + 1);
      if (current.getDay() === 0) {
        col++;
      }
    }

    return result;
  }, [dataMap, maxCount, weeks, cellSize, cellGap]);

  const monthLabels = useMemo(() => {
    if (!showMonthLabels || cells.length === 0) return [];

    const labels: { label: string; x: number }[] = [];
    const step = cellSize + cellGap;
    let lastMonth = -1;

    for (const cell of cells) {
      if (cell.row !== 0) continue; // Only check Sunday rows for week starts
      const parts = cell.date.split('-');
      const month = parseInt(parts[1], 10) - 1;
      if (month !== lastMonth) {
        // Only add if there's enough space from last label
        const lastLabel = labels[labels.length - 1];
        if (!lastLabel || cell.x - lastLabel.x >= step * 3) {
          labels.push({ label: MONTH_LABELS[month], x: cell.x });
          lastMonth = month;
        }
      }
    }

    return labels;
  }, [cells, showMonthLabels, cellSize, cellGap]);

  const handleMouseEnter = useCallback((e: React.MouseEvent, date: string, count: number) => {
    if (!showTooltip) return;
    const rect = (e.target as SVGElement).getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      date,
      count,
    });
  }, [showTooltip]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleCellClick = useCallback((date: string, count: number) => {
    onCellClick?.(date, count);
  }, [onCellClick]);

  const step = cellSize + cellGap;
  const dayLabelWidth = showDayLabels ? 28 : 0;
  const monthLabelHeight = showMonthLabels ? 16 : 0;
  const svgWidth = dayLabelWidth + weeks * step;
  const svgHeight = monthLabelHeight + 7 * step;

  const classNames = ['activity-heatmap', className].filter(Boolean).join(' ');

  const customStyles = colors ? {
    '--heatmap-level-0': colors[0],
    '--heatmap-level-1': colors[1],
    '--heatmap-level-2': colors[2],
    '--heatmap-level-3': colors[3],
    '--heatmap-level-4': colors[4],
  } as React.CSSProperties : undefined;

  return (
    <div
      id={id}
      className={classNames}
      role="img"
      aria-label={label || '활동 히트맵'}
      style={customStyles}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="activity-heatmap-svg"
        data-testid="activity-heatmap-svg"
      >
        {showMonthLabels && monthLabels.map((m) => (
          <text
            key={`month-${m.x}`}
            x={dayLabelWidth + m.x}
            y={10}
            className="activity-heatmap-month-label"
            data-testid="month-label"
          >
            {m.label}
          </text>
        ))}
        {showDayLabels && DAY_LABELS.map((dayLabel, i) => (
          <text
            key={`day-${dayLabel}`}
            x={0}
            y={monthLabelHeight + DAY_LABEL_INDICES[i] * step + cellSize - 1}
            className="activity-heatmap-day-label"
            data-testid="day-label"
          >
            {dayLabel}
          </text>
        ))}
        {cells.map((cell) => (
          <rect
            key={cell.date}
            x={dayLabelWidth + cell.x}
            y={monthLabelHeight + cell.y}
            width={cellSize}
            height={cellSize}
            className={`activity-heatmap-cell activity-heatmap-cell--level-${cell.level}`}
            style={colors ? { fill: colors[cell.level] } : undefined}
            data-testid="heatmap-cell"
            data-date={cell.date}
            data-count={cell.count}
            data-level={cell.level}
            onMouseEnter={(e) => handleMouseEnter(e, cell.date, cell.count)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleCellClick(cell.date, cell.count)}
          />
        ))}
      </svg>

      {showLegend && (
        <div className="activity-heatmap-legend" data-testid="heatmap-legend">
          <span className="activity-heatmap-legend-label">적음</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`activity-heatmap-legend-cell activity-heatmap-legend-cell--level-${level}`}
              style={colors ? { background: colors[level] } : undefined}
              data-testid="legend-cell"
            />
          ))}
          <span className="activity-heatmap-legend-label">많음</span>
        </div>
      )}

      {tooltip && (
        <div
          className="activity-heatmap-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
          data-testid="heatmap-tooltip"
        >
          <span className="activity-heatmap-tooltip-count">{tooltip.count}건</span>
          {' — '}
          {tooltip.date}
        </div>
      )}
    </div>
  );
};

export default React.memo(ActivityHeatmap);
