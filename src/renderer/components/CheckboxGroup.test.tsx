import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CheckboxGroup, { CheckboxOption } from './CheckboxGroup';

const options: CheckboxOption[] = [
  { value: 'a', label: '사과' },
  { value: 'b', label: '바나나' },
  { value: 'c', label: '체리' },
];

describe('CheckboxGroup', () => {
  describe('rendering', () => {
    it('renders with options', () => {
      render(<CheckboxGroup options={options} />);
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });

    it('renders option labels', () => {
      render(<CheckboxGroup options={options} />);
      expect(screen.getByText('사과')).toBeInTheDocument();
      expect(screen.getByText('바나나')).toBeInTheDocument();
      expect(screen.getByText('체리')).toBeInTheDocument();
    });

    it('renders group label', () => {
      render(<CheckboxGroup options={options} label="과일 선택" />);
      expect(screen.getByText('과일 선택')).toBeInTheDocument();
    });

    it('renders with className', () => {
      const { container } = render(<CheckboxGroup options={options} className="custom" />);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('renders descriptions', () => {
      const opts: CheckboxOption[] = [
        { value: 'x', label: 'X', description: 'X 설명' },
      ];
      render(<CheckboxGroup options={opts} />);
      expect(screen.getByText('X 설명')).toBeInTheDocument();
    });

    it('renders error message', () => {
      render(<CheckboxGroup options={options} error="하나 이상 선택하세요" />);
      expect(screen.getByText('하나 이상 선택하세요')).toBeInTheDocument();
    });

    it('applies error class', () => {
      const { container } = render(<CheckboxGroup options={options} error="에러" />);
      expect(container.firstChild).toHaveClass('checkbox-group--error');
    });
  });

  describe('sizes', () => {
    it('renders small', () => {
      const { container } = render(<CheckboxGroup options={options} size="small" />);
      expect(container.firstChild).toHaveClass('checkbox-group--small');
    });

    it('renders medium', () => {
      const { container } = render(<CheckboxGroup options={options} size="medium" />);
      expect(container.firstChild).toHaveClass('checkbox-group--medium');
    });

    it('renders large', () => {
      const { container } = render(<CheckboxGroup options={options} size="large" />);
      expect(container.firstChild).toHaveClass('checkbox-group--large');
    });
  });

  describe('orientation', () => {
    it('renders vertical by default', () => {
      const { container } = render(<CheckboxGroup options={options} />);
      expect(container.firstChild).toHaveClass('checkbox-group--vertical');
    });

    it('renders horizontal', () => {
      const { container } = render(<CheckboxGroup options={options} orientation="horizontal" />);
      expect(container.firstChild).toHaveClass('checkbox-group--horizontal');
    });
  });

  describe('selection', () => {
    it('toggles checkbox (uncontrolled)', () => {
      const onChange = vi.fn();
      render(<CheckboxGroup options={options} onChange={onChange} />);
      fireEvent.click(screen.getByText('바나나'));
      expect(onChange).toHaveBeenCalledWith(['b']);
    });

    it('unchecks when clicking again', () => {
      const onChange = vi.fn();
      render(<CheckboxGroup options={options} defaultValue={['b']} onChange={onChange} />);
      fireEvent.click(screen.getByText('바나나'));
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('selects multiple', () => {
      const onChange = vi.fn();
      render(<CheckboxGroup options={options} defaultValue={['a']} onChange={onChange} />);
      fireEvent.click(screen.getByText('체리'));
      expect(onChange).toHaveBeenCalledWith(['a', 'c']);
    });

    it('uses defaultValue', () => {
      render(<CheckboxGroup options={options} defaultValue={['a', 'c']} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });

    it('works controlled', () => {
      const onChange = vi.fn();
      const { rerender } = render(<CheckboxGroup options={options} value={['a']} onChange={onChange} />);
      fireEvent.click(screen.getByText('바나나'));
      expect(onChange).toHaveBeenCalledWith(['a', 'b']);
      rerender(<CheckboxGroup options={options} value={['a', 'b']} onChange={onChange} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });

    it('does not toggle disabled option', () => {
      const onChange = vi.fn();
      const opts: CheckboxOption[] = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ];
      render(<CheckboxGroup options={opts} onChange={onChange} />);
      fireEvent.click(screen.getByText('B'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not toggle when group disabled', () => {
      const onChange = vi.fn();
      render(<CheckboxGroup options={options} onChange={onChange} disabled />);
      fireEvent.click(screen.getByText('사과'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('max selection', () => {
    it('prevents selection beyond max', () => {
      const onChange = vi.fn();
      render(<CheckboxGroup options={options} defaultValue={['a', 'b']} max={2} onChange={onChange} />);
      fireEvent.click(screen.getByText('체리'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('allows deselection when at max', () => {
      const onChange = vi.fn();
      render(<CheckboxGroup options={options} defaultValue={['a', 'b']} max={2} onChange={onChange} />);
      fireEvent.click(screen.getByText('바나나'));
      expect(onChange).toHaveBeenCalledWith(['a']);
    });

    it('disables unchecked options at max', () => {
      render(<CheckboxGroup options={options} defaultValue={['a', 'b']} max={2} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[2]).toBeDisabled();
    });
  });

  describe('select all', () => {
    it('renders select all when enabled', () => {
      render(<CheckboxGroup options={options} selectAll />);
      expect(screen.getByText('전체 선택')).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(4); // 3 + select all
    });

    it('renders custom select all label', () => {
      render(<CheckboxGroup options={options} selectAll selectAllLabel="모두 체크" />);
      expect(screen.getByText('모두 체크')).toBeInTheDocument();
    });

    it('selects all on click', () => {
      const onChange = vi.fn();
      render(<CheckboxGroup options={options} selectAll onChange={onChange} />);
      fireEvent.click(screen.getByText('전체 선택'));
      expect(onChange).toHaveBeenCalledWith(['a', 'b', 'c']);
    });

    it('deselects all when all selected', () => {
      const onChange = vi.fn();
      render(<CheckboxGroup options={options} defaultValue={['a', 'b', 'c']} selectAll onChange={onChange} />);
      fireEvent.click(screen.getByText('전체 선택'));
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('select all is checked when all selected', () => {
      render(<CheckboxGroup options={options} defaultValue={['a', 'b', 'c']} selectAll />);
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      expect(selectAllCheckbox).toBeChecked();
    });
  });

  describe('disabled state', () => {
    it('applies disabled class', () => {
      const { container } = render(<CheckboxGroup options={options} disabled />);
      expect(container.firstChild).toHaveClass('checkbox-group--disabled');
    });

    it('disables all checkboxes', () => {
      render(<CheckboxGroup options={options} disabled />);
      screen.getAllByRole('checkbox').forEach(cb => {
        expect(cb).toBeDisabled();
      });
    });
  });

  describe('accessibility', () => {
    it('has group role', () => {
      render(<CheckboxGroup options={options} />);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('has aria-label from prop', () => {
      render(<CheckboxGroup options={options} ariaLabel="과일 선택" />);
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', '과일 선택');
    });

    it('has aria-label from label', () => {
      render(<CheckboxGroup options={options} label="채소" />);
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', '채소');
    });

    it('has default aria-label', () => {
      render(<CheckboxGroup options={options} />);
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', '체크박스 그룹');
    });

    it('select all has aria-label', () => {
      render(<CheckboxGroup options={options} selectAll />);
      expect(screen.getByLabelText('전체 선택')).toBeInTheDocument();
    });
  });
});
