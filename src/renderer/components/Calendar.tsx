import React, { useState, useCallback, useMemo } from 'react';
import './Calendar.css';

export interface CalendarProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  size?: 'small' | 'medium' | 'large';
  firstDayOfWeek?: 0 | 1;
  showOutsideDays?: boolean;
  showWeekNumbers?: boolean;
  locale?: 'ko' | 'en';
  className?: string;
  ariaLabel?: string;
}

const MONTH_NAMES_KO = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_LABELS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[],
): boolean {
  if (minDate) {
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    if (date < min) return true;
  }
  if (maxDate) {
    const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    if (date > max) return true;
  }
  if (disabledDates) {
    return disabledDates.some(d => isSameDay(d, date));
  }
  return false;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  weekNumber?: number;
}

function buildCalendarGrid(
  year: number,
  month: number,
  selectedDate: Date | null,
  firstDayOfWeek: 0 | 1,
  showOutsideDays: boolean,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[],
): DayCell[][] {
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const offset = (startDay - firstDayOfWeek + 7) % 7;
  const gridStart = new Date(year, month, 1 - offset);

  const weeks: DayCell[][] = [];
  let current = new Date(gridStart);

  for (let w = 0; w < 6; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(current);
      const isCurrentMonth = date.getMonth() === month;
      week.push({
        date,
        isCurrentMonth,
        isToday: isSameDay(date, today),
        isSelected: selectedDate !== null && isSameDay(date, selectedDate),
        isDisabled:
          (!showOutsideDays && !isCurrentMonth) ||
          isDateDisabled(date, minDate, maxDate, disabledDates),
      });
      current.setDate(current.getDate() + 1);
    }
    // Skip empty trailing weeks (all outside days)
    if (week.some(d => d.isCurrentMonth) || showOutsideDays) {
      weeks.push(week);
    }
  }

  return weeks;
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  disabledDates,
  size = 'medium',
  firstDayOfWeek = 0,
  showOutsideDays = true,
  showWeekNumbers = false,
  locale = 'ko',
  className,
  ariaLabel = '달력',
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null);
  const selectedDate = isControlled ? (value ?? null) : internalValue;

  const initialMonth = selectedDate ?? new Date();
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  const monthNames = locale === 'ko' ? MONTH_NAMES_KO : MONTH_NAMES_EN;
  const weekdayLabels = locale === 'ko' ? WEEKDAY_LABELS_KO : WEEKDAY_LABELS_EN;

  const orderedWeekdays = useMemo(() => {
    if (firstDayOfWeek === 0) return weekdayLabels;
    return [...weekdayLabels.slice(firstDayOfWeek), ...weekdayLabels.slice(0, firstDayOfWeek)];
  }, [weekdayLabels, firstDayOfWeek]);

  const weeks = useMemo(
    () =>
      buildCalendarGrid(
        viewYear,
        viewMonth,
        selectedDate,
        firstDayOfWeek,
        showOutsideDays,
        minDate,
        maxDate,
        disabledDates,
      ),
    [viewYear, viewMonth, selectedDate, firstDayOfWeek, showOutsideDays, minDate, maxDate, disabledDates],
  );

  const goToPrevMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 0) {
        setViewYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 11) {
        setViewYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }, []);

  const handleSelect = useCallback(
    (day: DayCell) => {
      if (day.isDisabled) return;
      const newDate = day.date;
      if (!isControlled) {
        setInternalValue(newDate);
      }
      onChange?.(newDate);
      // Navigate to selected month if outside current month
      if (!day.isCurrentMonth) {
        setViewYear(newDate.getFullYear());
        setViewMonth(newDate.getMonth());
      }
    },
    [isControlled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevMonth();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextMonth();
      }
    },
    [goToPrevMonth, goToNextMonth],
  );

  const headerLabel =
    locale === 'ko'
      ? `${viewYear}년 ${monthNames[viewMonth]}`
      : `${monthNames[viewMonth]} ${viewYear}`;

  return (
    <div
      className={`calendar calendar--${size} ${className ?? ''}`}
      role="application"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      <div className="calendar__header">
        <button
          type="button"
          className="calendar__nav-btn"
          onClick={goToPrevMonth}
          aria-label={locale === 'ko' ? '이전 달' : 'Previous month'}
        >
          ‹
        </button>
        <span className="calendar__title" aria-live="polite">
          {headerLabel}
        </span>
        <button
          type="button"
          className="calendar__nav-btn"
          onClick={goToNextMonth}
          aria-label={locale === 'ko' ? '다음 달' : 'Next month'}
        >
          ›
        </button>
      </div>

      <button
        type="button"
        className="calendar__today-btn"
        onClick={goToToday}
        aria-label={locale === 'ko' ? '오늘' : 'Today'}
      >
        {locale === 'ko' ? '오늘' : 'Today'}
      </button>

      <table className="calendar__grid" role="grid" aria-label={headerLabel}>
        <thead>
          <tr>
            {showWeekNumbers && <th className="calendar__week-header">#</th>}
            {orderedWeekdays.map(day => (
              <th key={day} className="calendar__weekday" scope="col" aria-label={day}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {showWeekNumbers && (
                <td className="calendar__week-number">{getWeekNumber(week[0].date)}</td>
              )}
              {week.map((day, di) => {
                const cellClasses = [
                  'calendar__day',
                  day.isToday ? 'calendar__day--today' : '',
                  day.isSelected ? 'calendar__day--selected' : '',
                  !day.isCurrentMonth ? 'calendar__day--outside' : '',
                  day.isDisabled ? 'calendar__day--disabled' : '',
                ].filter(Boolean).join(' ');

                return (
                  <td
                    key={di}
                    className={cellClasses}
                    role="gridcell"
                    aria-selected={day.isSelected}
                    aria-disabled={day.isDisabled}
                    aria-label={day.date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                    tabIndex={day.isDisabled ? -1 : 0}
                    onClick={() => handleSelect(day)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(day);
                      }
                    }}
                  >
                    {(!day.isCurrentMonth && !showOutsideDays) ? '' : day.date.getDate()}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(Calendar);
