import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Slider from './Slider';

describe('Slider', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders with className', () => {
      const { container } = render(<Slider className="custom" />);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('renders label', () => {
      render(<Slider label="볼륨" />);
      expect(screen.getByText('볼륨')).toBeInTheDocument();
    });

    it('renders value display when showValue is true', () => {
      render(<Slider showValue defaultValue={50} />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('does not render value display by default', () => {
      render(<Slider defaultValue={50} />);
      expect(screen.queryByText('50')).not.toBeInTheDocument();
    });

    it('renders with custom formatValue', () => {
      render(<Slider showValue defaultValue={75} formatValue={v => `${v}%`} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders label and value together', () => {
      render(<Slider label="밝기" showValue defaultValue={60} />);
      expect(screen.getByText('밝기')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Slider size="small" />);
      expect(container.firstChild).toHaveClass('slider--small');
    });

    it('renders medium size', () => {
      const { container } = render(<Slider size="medium" />);
      expect(container.firstChild).toHaveClass('slider--medium');
    });

    it('renders large size', () => {
      const { container } = render(<Slider size="large" />);
      expect(container.firstChild).toHaveClass('slider--large');
    });
  });

  describe('keyboard interaction', () => {
    it('increases value with ArrowRight', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(51);
    });

    it('increases value with ArrowUp', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith(51);
    });

    it('decreases value with ArrowLeft', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(49);
    });

    it('decreases value with ArrowDown', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith(49);
    });

    it('goes to min with Home key', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} min={10} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' });
      expect(onChange).toHaveBeenCalledWith(10);
    });

    it('goes to max with End key', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} max={200} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
      expect(onChange).toHaveBeenCalledWith(200);
    });

    it('jumps 10 steps with PageUp', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} step={1} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'PageUp' });
      expect(onChange).toHaveBeenCalledWith(60);
    });

    it('jumps 10 steps with PageDown', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} step={1} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'PageDown' });
      expect(onChange).toHaveBeenCalledWith(40);
    });

    it('clamps value at min', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={0} min={0} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(0);
    });

    it('clamps value at max', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={100} max={100} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(100);
    });

    it('uses step for keyboard increments', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={50} step={5} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(55);
    });

    it('does not respond to keyboard when disabled', () => {
      const onChange = vi.fn();
      render(<Slider disabled defaultValue={50} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('mouse interaction', () => {
    it('updates value on mouse down on track', () => {
      const onChange = vi.fn();
      render(<Slider onChange={onChange} min={0} max={100} />);
      const slider = screen.getByRole('slider');
      // Mock getBoundingClientRect
      Object.defineProperty(slider, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200, top: 0, height: 28, right: 200, bottom: 28 }),
      });
      fireEvent.mouseDown(slider, { clientX: 100 });
      expect(onChange).toHaveBeenCalledWith(50);
    });

    it('does not respond to mouse when disabled', () => {
      const onChange = vi.fn();
      render(<Slider disabled onChange={onChange} />);
      fireEvent.mouseDown(screen.getByRole('slider'), { clientX: 100 });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('works as uncontrolled with defaultValue', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={30} onChange={onChange} showValue />);
      expect(screen.getByText('30')).toBeInTheDocument();
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(31);
    });

    it('works as controlled with value', () => {
      const onChange = vi.fn();
      const { rerender } = render(<Slider value={40} onChange={onChange} showValue />);
      expect(screen.getByText('40')).toBeInTheDocument();
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(41);
      // Value doesn't change until parent re-renders
      rerender(<Slider value={41} onChange={onChange} showValue />);
      expect(screen.getByText('41')).toBeInTheDocument();
    });

    it('uses min as default when no defaultValue', () => {
      render(<Slider min={10} showValue />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('marks', () => {
    const marks = [
      { value: 0, label: '0°' },
      { value: 50, label: '50°' },
      { value: 100, label: '100°' },
    ];

    it('renders marks', () => {
      render(<Slider marks={marks} />);
      expect(screen.getByText('0°')).toBeInTheDocument();
      expect(screen.getByText('50°')).toBeInTheDocument();
      expect(screen.getByText('100°')).toBeInTheDocument();
    });

    it('renders mark values when no label', () => {
      render(<Slider marks={[{ value: 25 }, { value: 75 }]} />);
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('clicking mark updates value', () => {
      const onChange = vi.fn();
      render(<Slider marks={marks} onChange={onChange} />);
      fireEvent.click(screen.getByText('50°'));
      expect(onChange).toHaveBeenCalledWith(50);
    });

    it('clicking mark when disabled does nothing', () => {
      const onChange = vi.fn();
      render(<Slider marks={marks} onChange={onChange} disabled />);
      fireEvent.click(screen.getByText('50°'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('ticks', () => {
    it('does not show ticks by default', () => {
      const { container } = render(<Slider />);
      expect(container.querySelector('.slider__tick')).not.toBeInTheDocument();
    });

    it('shows ticks when enabled', () => {
      const { container } = render(<Slider showTicks min={0} max={10} step={5} />);
      const ticks = container.querySelectorAll('.slider__tick');
      expect(ticks.length).toBe(3); // 0, 5, 10
    });
  });

  describe('disabled state', () => {
    it('applies disabled class', () => {
      const { container } = render(<Slider disabled />);
      expect(container.firstChild).toHaveClass('slider--disabled');
    });

    it('slider has aria-disabled', () => {
      render(<Slider disabled />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true');
    });

    it('slider has tabIndex -1 when disabled', () => {
      render(<Slider disabled />);
      expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('accessibility', () => {
    it('has aria-valuemin', () => {
      render(<Slider min={10} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemin', '10');
    });

    it('has aria-valuemax', () => {
      render(<Slider max={200} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax', '200');
    });

    it('has aria-valuenow', () => {
      render(<Slider value={42} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42');
    });

    it('has aria-valuetext', () => {
      render(<Slider value={42} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '42');
    });

    it('has custom aria-valuetext with formatValue', () => {
      render(<Slider value={42} formatValue={v => `${v}%`} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '42%');
    });

    it('has aria-label from prop', () => {
      render(<Slider ariaLabel="음량 조절" />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-label', '음량 조절');
    });

    it('has aria-label from label prop', () => {
      render(<Slider label="볼륨" />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-label', '볼륨');
    });

    it('has default aria-label', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-label', '슬라이더');
    });

    it('slider is focusable', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '0');
    });

    it('value display has aria-live', () => {
      render(<Slider showValue defaultValue={50} />);
      expect(screen.getByText('50')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('drag cleanup on unmount', () => {
    it('removes document event listeners when unmounted during drag', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = render(<Slider defaultValue={50} />);
      const slider = screen.getByRole('slider');

      // Start drag
      fireEvent.mouseDown(slider, { clientX: 50 });

      // Unmount while dragging
      unmount();

      expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      removeSpy.mockRestore();
    });
  });

  describe('step and range', () => {
    it('snaps to step values', () => {
      const onChange = vi.fn();
      render(<Slider defaultValue={0} step={10} onChange={onChange} />);
      const slider = screen.getByRole('slider');
      Object.defineProperty(slider, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 100, top: 0, height: 28, right: 100, bottom: 28 }),
      });
      fireEvent.mouseDown(slider, { clientX: 33 });
      expect(onChange).toHaveBeenCalledWith(30);
    });

    it('handles custom min and max', () => {
      render(<Slider min={-50} max={50} value={0} showValue />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemin', '-50');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax', '50');
    });
  });
});
