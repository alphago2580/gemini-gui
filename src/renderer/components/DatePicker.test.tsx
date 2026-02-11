import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DatePicker from './DatePicker';

describe('DatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15)); // June 15, 2025
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders with default props', () => {
      render(<DatePicker />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders placeholder in Korean by default', () => {
      render(<DatePicker />);
      expect(screen.getByPlaceholderText('날짜를 선택하세요')).toBeInTheDocument();
    });

    it('renders placeholder in English', () => {
      render(<DatePicker locale="en" />);
      expect(screen.getByPlaceholderText('Select a date')).toBeInTheDocument();
    });

    it('renders custom placeholder', () => {
      render(<DatePicker placeholder="기간 선택" />);
      expect(screen.getByPlaceholderText('기간 선택')).toBeInTheDocument();
    });

    it('renders label', () => {
      render(<DatePicker label="시작일" />);
      expect(screen.getByText('시작일')).toBeInTheDocument();
    });

    it('renders with className', () => {
      const { container } = render(<DatePicker className="custom" />);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('renders calendar icon', () => {
      render(<DatePicker />);
      expect(screen.getByText('📅')).toBeInTheDocument();
    });

    it('renders error message', () => {
      render(<DatePicker error="필수 입력입니다" />);
      expect(screen.getByText('필수 입력입니다')).toBeInTheDocument();
    });

    it('applies error class', () => {
      const { container } = render(<DatePicker error="에러" />);
      expect(container.firstChild).toHaveClass('datepicker--error');
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      const { container } = render(<DatePicker size="small" />);
      expect(container.firstChild).toHaveClass('datepicker--small');
    });

    it('renders medium size', () => {
      const { container } = render(<DatePicker size="medium" />);
      expect(container.firstChild).toHaveClass('datepicker--medium');
    });

    it('renders large size', () => {
      const { container } = render(<DatePicker size="large" />);
      expect(container.firstChild).toHaveClass('datepicker--large');
    });
  });

  describe('opening and closing', () => {
    it('opens calendar on click', () => {
      render(<DatePicker />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes calendar on second click', () => {
      render(<DatePicker />);
      const combobox = screen.getByRole('combobox');
      fireEvent.click(combobox);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(combobox);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens on Enter key', () => {
      render(<DatePicker />);
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('opens on Space key', () => {
      render(<DatePicker />);
      fireEvent.keyDown(screen.getByRole('combobox'), { key: ' ' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes on Escape key', () => {
      render(<DatePicker />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes on outside click', () => {
      render(<DatePicker />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not open when disabled', () => {
      render(<DatePicker disabled />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not open on key when disabled', () => {
      render(<DatePicker disabled />);
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('date selection', () => {
    it('selects a date (uncontrolled)', () => {
      const onChange = vi.fn();
      render(<DatePicker onChange={onChange} />);
      fireEvent.click(screen.getByRole('combobox'));
      // Find day 20 in the calendar
      const day20 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '20' && !c.classList.contains('calendar__day--outside')
      );
      fireEvent.click(day20!);
      expect(onChange).toHaveBeenCalledTimes(1);
      const selectedDate = onChange.mock.calls[0][0] as Date;
      expect(selectedDate.getDate()).toBe(20);
      // Calendar should close after selection
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays selected date in input', () => {
      render(<DatePicker defaultValue={new Date(2025, 5, 20)} />);
      expect(screen.getByDisplayValue('2025-06-20')).toBeInTheDocument();
    });

    it('displays controlled value', () => {
      render(<DatePicker value={new Date(2025, 0, 1)} />);
      expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
    });

    it('updates display when value changes (controlled)', () => {
      const { rerender } = render(<DatePicker value={new Date(2025, 0, 1)} />);
      expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
      rerender(<DatePicker value={new Date(2025, 5, 15)} />);
      expect(screen.getByDisplayValue('2025-06-15')).toBeInTheDocument();
    });

    it('handles null value', () => {
      render(<DatePicker value={null} />);
      expect(screen.getByPlaceholderText('날짜를 선택하세요')).toHaveValue('');
    });
  });

  describe('clearable', () => {
    it('shows clear button when clearable and has value', () => {
      render(<DatePicker clearable defaultValue={new Date(2025, 5, 15)} />);
      expect(screen.getByLabelText('날짜 지우기')).toBeInTheDocument();
    });

    it('does not show clear button when no value', () => {
      render(<DatePicker clearable />);
      expect(screen.queryByLabelText('날짜 지우기')).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(<DatePicker clearable disabled defaultValue={new Date(2025, 5, 15)} />);
      expect(screen.queryByLabelText('날짜 지우기')).not.toBeInTheDocument();
    });

    it('clears value on clear button click', () => {
      const onChange = vi.fn();
      render(<DatePicker clearable onChange={onChange} defaultValue={new Date(2025, 5, 15)} />);
      fireEvent.click(screen.getByLabelText('날짜 지우기'));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('clear button has English label', () => {
      render(<DatePicker clearable locale="en" defaultValue={new Date(2025, 5, 15)} />);
      expect(screen.getByLabelText('Clear date')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('applies disabled class', () => {
      const { container } = render(<DatePicker disabled />);
      expect(container.firstChild).toHaveClass('datepicker--disabled');
    });

    it('input is disabled', () => {
      render(<DatePicker disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('combobox has tabIndex -1 when disabled', () => {
      render(<DatePicker disabled />);
      expect(screen.getByRole('combobox')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('format', () => {
    it('uses default YYYY-MM-DD format', () => {
      render(<DatePicker defaultValue={new Date(2025, 5, 15)} />);
      expect(screen.getByDisplayValue('2025-06-15')).toBeInTheDocument();
    });

    it('uses custom format', () => {
      render(<DatePicker defaultValue={new Date(2025, 5, 15)} format="MM/DD/YYYY" />);
      expect(screen.getByDisplayValue('06/15/2025')).toBeInTheDocument();
    });

    it('pads single-digit months and days', () => {
      render(<DatePicker defaultValue={new Date(2025, 0, 5)} />);
      expect(screen.getByDisplayValue('2025-01-05')).toBeInTheDocument();
    });
  });

  describe('calendar props passthrough', () => {
    it('passes minDate to Calendar', () => {
      const minDate = new Date(2025, 5, 10);
      render(<DatePicker minDate={minDate} />);
      fireEvent.click(screen.getByRole('combobox'));
      const day5 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '5' && !c.classList.contains('calendar__day--outside')
      );
      expect(day5).toHaveAttribute('aria-disabled', 'true');
    });

    it('passes maxDate to Calendar', () => {
      const maxDate = new Date(2025, 5, 20);
      render(<DatePicker maxDate={maxDate} />);
      fireEvent.click(screen.getByRole('combobox'));
      const day25 = screen.getAllByRole('gridcell').find(
        c => c.textContent === '25' && !c.classList.contains('calendar__day--outside')
      );
      expect(day25).toHaveAttribute('aria-disabled', 'true');
    });

    it('passes locale to Calendar', () => {
      render(<DatePicker locale="en" />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });

    it('passes firstDayOfWeek to Calendar', () => {
      render(<DatePicker firstDayOfWeek={1} />);
      fireEvent.click(screen.getByRole('combobox'));
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0].textContent).toBe('월');
    });
  });

  describe('accessibility', () => {
    it('combobox has aria-expanded', () => {
      render(<DatePicker />);
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(combobox);
      expect(combobox).toHaveAttribute('aria-expanded', 'true');
    });

    it('combobox has aria-haspopup', () => {
      render(<DatePicker />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('dropdown has dialog role', () => {
      render(<DatePicker />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('dialog has proper aria-label (Korean)', () => {
      render(<DatePicker />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '달력');
    });

    it('dialog has proper aria-label (English)', () => {
      render(<DatePicker locale="en" />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Calendar');
    });

    it('input has aria-label', () => {
      render(<DatePicker ariaLabel="생년월일" />);
      const inputs = screen.getAllByLabelText('생년월일');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it('input has label-based aria-label', () => {
      render(<DatePicker label="시작일" />);
      expect(screen.getByLabelText('시작일')).toBeInTheDocument();
    });

    it('input has default aria-label in Korean', () => {
      render(<DatePicker />);
      expect(screen.getByLabelText('날짜 선택')).toBeInTheDocument();
    });

    it('combobox is focusable', () => {
      render(<DatePicker />);
      expect(screen.getByRole('combobox')).toHaveAttribute('tabindex', '0');
    });
  });
});
