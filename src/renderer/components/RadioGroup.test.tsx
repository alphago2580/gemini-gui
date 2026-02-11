import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RadioGroup, { RadioOption } from './RadioGroup';

const options: RadioOption[] = [
  { value: 'a', label: '옵션 A' },
  { value: 'b', label: '옵션 B' },
  { value: 'c', label: '옵션 C' },
];

describe('RadioGroup', () => {
  describe('rendering', () => {
    it('renders with options', () => {
      render(<RadioGroup options={options} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('renders option labels', () => {
      render(<RadioGroup options={options} />);
      expect(screen.getByText('옵션 A')).toBeInTheDocument();
      expect(screen.getByText('옵션 B')).toBeInTheDocument();
      expect(screen.getByText('옵션 C')).toBeInTheDocument();
    });

    it('renders group label', () => {
      render(<RadioGroup options={options} label="선호도" />);
      expect(screen.getByText('선호도')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<RadioGroup options={options} className="custom" />);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('renders description for options', () => {
      const opts: RadioOption[] = [
        { value: 'x', label: 'X', description: 'X 설명' },
        { value: 'y', label: 'Y', description: 'Y 설명' },
      ];
      render(<RadioGroup options={opts} />);
      expect(screen.getByText('X 설명')).toBeInTheDocument();
      expect(screen.getByText('Y 설명')).toBeInTheDocument();
    });

    it('renders error message', () => {
      render(<RadioGroup options={options} error="하나를 선택하세요" />);
      expect(screen.getByText('하나를 선택하세요')).toBeInTheDocument();
    });

    it('applies error class', () => {
      const { container } = render(<RadioGroup options={options} error="에러" />);
      expect(container.firstChild).toHaveClass('radio-group--error');
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      const { container } = render(<RadioGroup options={options} size="small" />);
      expect(container.firstChild).toHaveClass('radio-group--small');
    });

    it('renders medium size', () => {
      const { container } = render(<RadioGroup options={options} size="medium" />);
      expect(container.firstChild).toHaveClass('radio-group--medium');
    });

    it('renders large size', () => {
      const { container } = render(<RadioGroup options={options} size="large" />);
      expect(container.firstChild).toHaveClass('radio-group--large');
    });
  });

  describe('orientation', () => {
    it('renders vertical by default', () => {
      const { container } = render(<RadioGroup options={options} />);
      expect(container.firstChild).toHaveClass('radio-group--vertical');
    });

    it('renders horizontal', () => {
      const { container } = render(<RadioGroup options={options} orientation="horizontal" />);
      expect(container.firstChild).toHaveClass('radio-group--horizontal');
    });
  });

  describe('variant', () => {
    it('renders default variant', () => {
      const { container } = render(<RadioGroup options={options} />);
      expect(container.firstChild).toHaveClass('radio-group--default');
    });

    it('renders card variant', () => {
      const { container } = render(<RadioGroup options={options} variant="card" />);
      expect(container.firstChild).toHaveClass('radio-group--card');
    });
  });

  describe('selection', () => {
    it('selects option (uncontrolled)', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} onChange={onChange} />);
      fireEvent.click(screen.getByText('옵션 B'));
      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('uses defaultValue', () => {
      render(<RadioGroup options={options} defaultValue="b" />);
      const radios = screen.getAllByRole('radio');
      expect(radios[1]).toBeChecked();
    });

    it('works controlled', () => {
      const onChange = vi.fn();
      const { rerender } = render(<RadioGroup options={options} value="a" onChange={onChange} />);
      expect(screen.getAllByRole('radio')[0]).toBeChecked();
      fireEvent.click(screen.getByText('옵션 C'));
      expect(onChange).toHaveBeenCalledWith('c');
      rerender(<RadioGroup options={options} value="c" onChange={onChange} />);
      expect(screen.getAllByRole('radio')[2]).toBeChecked();
    });

    it('does not select disabled option', () => {
      const onChange = vi.fn();
      const opts: RadioOption[] = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ];
      render(<RadioGroup options={opts} onChange={onChange} />);
      fireEvent.click(screen.getByText('B'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not select when group is disabled', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} onChange={onChange} disabled />);
      fireEvent.click(screen.getByText('옵션 A'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates with ArrowDown', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} defaultValue="a" onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('navigates with ArrowRight', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} defaultValue="a" onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('navigates with ArrowUp', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} defaultValue="b" onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith('a');
    });

    it('navigates with ArrowLeft', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} defaultValue="b" onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith('a');
    });

    it('wraps around forward', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} defaultValue="c" onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('a');
    });

    it('wraps around backward', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} defaultValue="a" onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith('c');
    });

    it('skips disabled options', () => {
      const onChange = vi.fn();
      const opts: RadioOption[] = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
        { value: 'c', label: 'C' },
      ];
      render(<RadioGroup options={opts} defaultValue="a" onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('c');
    });

    it('does not respond when disabled', () => {
      const onChange = vi.fn();
      render(<RadioGroup options={options} defaultValue="a" onChange={onChange} disabled />);
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled class', () => {
      const { container } = render(<RadioGroup options={options} disabled />);
      expect(container.firstChild).toHaveClass('radio-group--disabled');
    });

    it('disables all radio inputs', () => {
      render(<RadioGroup options={options} disabled />);
      screen.getAllByRole('radio').forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    it('disables individual option', () => {
      const opts: RadioOption[] = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ];
      render(<RadioGroup options={opts} />);
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).not.toBeDisabled();
      expect(radios[1]).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has radiogroup role', () => {
      render(<RadioGroup options={options} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label from prop', () => {
      render(<RadioGroup options={options} ariaLabel="색상 선택" />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', '색상 선택');
    });

    it('has aria-label from label prop', () => {
      render(<RadioGroup options={options} label="테마" />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', '테마');
    });

    it('has default aria-label', () => {
      render(<RadioGroup options={options} />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', '라디오 그룹');
    });

    it('checked radio has tabIndex 0', () => {
      render(<RadioGroup options={options} defaultValue="b" />);
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('tabindex', '-1');
      expect(radios[1]).toHaveAttribute('tabindex', '0');
      expect(radios[2]).toHaveAttribute('tabindex', '-1');
    });

    it('description has aria-describedby link', () => {
      const opts: RadioOption[] = [
        { value: 'x', label: 'X', description: 'X에 대한 설명' },
      ];
      render(<RadioGroup options={opts} name="test" />);
      const radio = screen.getByRole('radio');
      const describedBy = radio.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const descEl = document.getElementById(describedBy!);
      expect(descEl?.textContent).toBe('X에 대한 설명');
    });
  });
});
