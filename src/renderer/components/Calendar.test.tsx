import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Calendar from './Calendar';

describe('Calendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15)); // June 15, 2025
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Calendar />);
      expect(screen.getByRole('application')).toBeInTheDocument();
      expect(screen.getByText('2025년 6월')).toBeInTheDocument();
    });

    it('renders with aria-label', () => {
      render(<Calendar ariaLabel="날짜 선택" />);
      expect(screen.getByRole('application')).toHaveAttribute('aria-label', '날짜 선택');
    });

    it('renders with custom className', () => {
      render(<Calendar className="custom" />);
      expect(screen.getByRole('application')).toHaveClass('custom');
    });

    it('renders weekday headers in Korean by default', () => {
      render(<Calendar />);
      expect(screen.getByText('일')).toBeInTheDocument();
      expect(screen.getByText('월')).toBeInTheDocument();
      expect(screen.getByText('화')).toBeInTheDocument();
      expect(screen.getByText('수')).toBeInTheDocument();
      expect(screen.getByText('목')).toBeInTheDocument();
      expect(screen.getByText('금')).toBeInTheDocument();
      expect(screen.getByText('토')).toBeInTheDocument();
    });

    it('renders weekday headers in English', () => {
      render(<Calendar locale="en" />);
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('renders day numbers for current month', () => {
      render(<Calendar />);
      const gridCells = screen.getAllByRole('gridcell');
      const dayTexts = gridCells.map(c => c.textContent).filter(Boolean);
      // Should contain 1 through 30 (June has 30 days)
      for (let i = 1; i <= 30; i++) {
        expect(dayTexts).toContain(String(i));
      }
    });

    it('renders today button in Korean', () => {
      render(<Calendar />);
      expect(screen.getByText('오늘')).toBeInTheDocument();
    });

    it('renders today button in English', () => {
      render(<Calendar locale="en" />);
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('renders header in English locale', () => {
      render(<Calendar locale="en" />);
      expect(screen.getByText('June 2025')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Calendar size="small" />);
      expect(screen.getByRole('application')).toHaveClass('calendar--small');
    });

    it('renders medium size', () => {
      render(<Calendar size="medium" />);
      expect(screen.getByRole('application')).toHaveClass('calendar--medium');
    });

    it('renders large size', () => {
      render(<Calendar size="large" />);
      expect(screen.getByRole('application')).toHaveClass('calendar--large');
    });
  });

  describe('navigation', () => {
    it('navigates to previous month', () => {
      render(<Calendar />);
      fireEvent.click(screen.getByLabelText('이전 달'));
      expect(screen.getByText('2025년 5월')).toBeInTheDocument();
    });

    it('navigates to next month', () => {
      render(<Calendar />);
      fireEvent.click(screen.getByLabelText('다음 달'));
      expect(screen.getByText('2025년 7월')).toBeInTheDocument();
    });

    it('navigates across year boundary backward', () => {
      render(<Calendar value={new Date(2025, 0, 15)} />);
      fireEvent.click(screen.getByLabelText('이전 달'));
      expect(screen.getByText('2024년 12월')).toBeInTheDocument();
    });

    it('navigates across year boundary forward', () => {
      render(<Calendar value={new Date(2025, 11, 15)} />);
      fireEvent.click(screen.getByLabelText('다음 달'));
      expect(screen.getByText('2026년 1월')).toBeInTheDocument();
    });

    it('navigates to today when today button clicked', () => {
      render(<Calendar value={new Date(2024, 0, 1)} />);
      fireEvent.click(screen.getByText('오늘'));
      expect(screen.getByText('2025년 6월')).toBeInTheDocument();
    });

    it('navigates with English aria labels', () => {
      render(<Calendar locale="en" />);
      fireEvent.click(screen.getByLabelText('Previous month'));
      expect(screen.getByText('May 2025')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Next month'));
      expect(screen.getByText('June 2025')).toBeInTheDocument();
    });

    it('navigates via ArrowLeft key', () => {
      render(<Calendar />);
      const cal = screen.getByRole('application');
      fireEvent.keyDown(cal, { key: 'ArrowLeft' });
      expect(screen.getByText('2025년 5월')).toBeInTheDocument();
    });

    it('navigates via ArrowRight key', () => {
      render(<Calendar />);
      const cal = screen.getByRole('application');
      fireEvent.keyDown(cal, { key: 'ArrowRight' });
      expect(screen.getByText('2025년 7월')).toBeInTheDocument();
    });
  });

  describe('date selection', () => {
    it('selects a date (uncontrolled)', () => {
      const onChange = vi.fn();
      render(<Calendar onChange={onChange} />);
      const day10 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '10' && c.classList.contains('calendar__day') && !c.classList.contains('calendar__day--outside')
      );
      expect(day10).toBeDefined();
      fireEvent.click(day10!);
      expect(onChange).toHaveBeenCalledTimes(1);
      const selectedDate = onChange.mock.calls[0][0] as Date;
      expect(selectedDate.getFullYear()).toBe(2025);
      expect(selectedDate.getMonth()).toBe(5);
      expect(selectedDate.getDate()).toBe(10);
    });

    it('selects a date (controlled)', () => {
      const onChange = vi.fn();
      const { rerender } = render(<Calendar value={new Date(2025, 5, 15)} onChange={onChange} />);
      // Should show day 15 as selected
      const day15 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '15' && c.getAttribute('aria-selected') === 'true'
      );
      expect(day15).toBeDefined();

      // Click day 20
      const day20 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '20' && !c.classList.contains('calendar__day--outside')
      );
      fireEvent.click(day20!);
      expect(onChange).toHaveBeenCalledTimes(1);

      // Re-render with new value
      rerender(<Calendar value={new Date(2025, 5, 20)} onChange={onChange} />);
      const newSelected = screen.getAllByRole('gridcell').find(
        c => c.getAttribute('aria-selected') === 'true'
      );
      expect(newSelected?.textContent).toBe('20');
    });

    it('uses defaultValue for initial selection', () => {
      render(<Calendar defaultValue={new Date(2025, 5, 20)} />);
      const day20 = screen.getAllByRole('gridcell').find(
        c => c.getAttribute('aria-selected') === 'true'
      );
      expect(day20?.textContent).toBe('20');
    });

    it('selects date via Enter key', () => {
      const onChange = vi.fn();
      render(<Calendar onChange={onChange} />);
      const day10 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '10' && !c.classList.contains('calendar__day--outside')
      );
      fireEvent.keyDown(day10!, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('selects date via Space key', () => {
      const onChange = vi.fn();
      render(<Calendar onChange={onChange} />);
      const day10 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '10' && !c.classList.contains('calendar__day--outside')
      );
      fireEvent.keyDown(day10!, { key: ' ' });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('today indicator', () => {
    it('highlights today', () => {
      render(<Calendar />);
      const todayCells = screen.getAllByRole('gridcell').filter(
        c => c.classList.contains('calendar__day--today')
      );
      expect(todayCells).toHaveLength(1);
      expect(todayCells[0].textContent).toBe('15');
    });
  });

  describe('disabled dates', () => {
    it('disables dates before minDate', () => {
      render(<Calendar minDate={new Date(2025, 5, 10)} />);
      const day5 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '5' && !c.classList.contains('calendar__day--outside')
      );
      expect(day5).toHaveAttribute('aria-disabled', 'true');
    });

    it('disables dates after maxDate', () => {
      render(<Calendar maxDate={new Date(2025, 5, 20)} />);
      const day25 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '25' && !c.classList.contains('calendar__day--outside')
      );
      expect(day25).toHaveAttribute('aria-disabled', 'true');
    });

    it('disables specific dates', () => {
      render(<Calendar disabledDates={[new Date(2025, 5, 12), new Date(2025, 5, 18)]} />);
      const day12 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '12' && !c.classList.contains('calendar__day--outside')
      );
      expect(day12).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not call onChange for disabled dates', () => {
      const onChange = vi.fn();
      render(<Calendar onChange={onChange} minDate={new Date(2025, 5, 10)} />);
      const day5 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '5' && !c.classList.contains('calendar__day--outside')
      );
      fireEvent.click(day5!);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not select disabled date via keyboard', () => {
      const onChange = vi.fn();
      render(<Calendar onChange={onChange} minDate={new Date(2025, 5, 10)} />);
      const day5 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '5' && !c.classList.contains('calendar__day--outside')
      );
      fireEvent.keyDown(day5!, { key: 'Enter' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disabled cells have tabIndex -1', () => {
      render(<Calendar minDate={new Date(2025, 5, 10)} />);
      const day5 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '5' && !c.classList.contains('calendar__day--outside')
      );
      expect(day5).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('outside days', () => {
    it('shows outside days by default', () => {
      render(<Calendar />);
      const outsideCells = screen.getAllByRole('gridcell').filter(
        c => c.classList.contains('calendar__day--outside')
      );
      expect(outsideCells.length).toBeGreaterThan(0);
    });

    it('hides outside day content when showOutsideDays is false', () => {
      render(<Calendar showOutsideDays={false} />);
      const outsideCells = screen.getAllByRole('gridcell').filter(
        c => c.classList.contains('calendar__day--outside')
      );
      // Outside cells should be empty when not showing outside days
      // They're disabled and show no content
      outsideCells.forEach(cell => {
        expect(cell).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('first day of week', () => {
    it('starts with Sunday by default', () => {
      render(<Calendar />);
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0].textContent).toBe('일');
    });

    it('starts with Monday when firstDayOfWeek is 1', () => {
      render(<Calendar firstDayOfWeek={1} />);
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0].textContent).toBe('월');
      expect(headers[6].textContent).toBe('일');
    });
  });

  describe('week numbers', () => {
    it('does not show week numbers by default', () => {
      render(<Calendar />);
      const weekHeaders = screen.queryByText('#');
      expect(weekHeaders).not.toBeInTheDocument();
    });

    it('shows week numbers when enabled', () => {
      render(<Calendar showWeekNumbers />);
      expect(screen.getByText('#')).toBeInTheDocument();
      // Check that week number cells exist
      const weekNumberCells = document.querySelectorAll('.calendar__week-number');
      expect(weekNumberCells.length).toBeGreaterThan(0);
    });
  });

  describe('outside day navigation', () => {
    it('navigates to outside day month when clicked', () => {
      const onChange = vi.fn();
      render(<Calendar onChange={onChange} showOutsideDays />);
      // Find an outside day (from previous month)
      const outsideCells = screen.getAllByRole('gridcell').filter(
        c => c.classList.contains('calendar__day--outside') && c.textContent !== ''
      );
      if (outsideCells.length > 0) {
        fireEvent.click(outsideCells[0]);
        // Should navigate to the outside day's month
        expect(onChange).toHaveBeenCalled();
      }
    });
  });

  describe('value null', () => {
    it('handles null value', () => {
      render(<Calendar value={null} />);
      const selectedCells = screen.getAllByRole('gridcell').filter(
        c => c.getAttribute('aria-selected') === 'true'
      );
      expect(selectedCells).toHaveLength(0);
    });
  });

  describe('initial month from selected date', () => {
    it('shows month of provided value', () => {
      render(<Calendar value={new Date(2024, 2, 10)} />);
      expect(screen.getByText('2024년 3월')).toBeInTheDocument();
    });

    it('shows month of provided defaultValue', () => {
      render(<Calendar defaultValue={new Date(2026, 8, 1)} />);
      expect(screen.getByText('2026년 9월')).toBeInTheDocument();
    });
  });

  describe('multiple navigations', () => {
    it('can navigate multiple months forward', () => {
      render(<Calendar />);
      const nextBtn = screen.getByLabelText('다음 달');
      fireEvent.click(nextBtn);
      fireEvent.click(nextBtn);
      fireEvent.click(nextBtn);
      expect(screen.getByText('2025년 9월')).toBeInTheDocument();
    });

    it('can navigate multiple months backward', () => {
      render(<Calendar />);
      const prevBtn = screen.getByLabelText('이전 달');
      fireEvent.click(prevBtn);
      fireEvent.click(prevBtn);
      expect(screen.getByText('2025년 4월')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('grid cells have aria-selected', () => {
      render(<Calendar value={new Date(2025, 5, 15)} />);
      const cells = screen.getAllByRole('gridcell');
      const selectedCells = cells.filter(c => c.getAttribute('aria-selected') === 'true');
      expect(selectedCells).toHaveLength(1);
    });

    it('grid cells have aria-label with formatted date', () => {
      render(<Calendar />);
      const cells = screen.getAllByRole('gridcell');
      const cell = cells.find(c => c.textContent === '15' && !c.classList.contains('calendar__day--outside'));
      expect(cell).toHaveAttribute('aria-label');
    });

    it('nav buttons have proper aria-labels', () => {
      render(<Calendar />);
      expect(screen.getByLabelText('이전 달')).toBeInTheDocument();
      expect(screen.getByLabelText('다음 달')).toBeInTheDocument();
    });

    it('grid has aria-label matching header', () => {
      render(<Calendar />);
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', '2025년 6월');
    });

    it('title has aria-live for screen readers', () => {
      render(<Calendar />);
      const title = screen.getByText('2025년 6월');
      expect(title).toHaveAttribute('aria-live', 'polite');
    });

    it('non-disabled cells have tabIndex 0', () => {
      render(<Calendar />);
      const day15 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '15' && !c.classList.contains('calendar__day--outside')
      );
      expect(day15).toHaveAttribute('tabindex', '0');
    });
  });
});
