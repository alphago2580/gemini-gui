import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RangeSlider from './RangeSlider';

describe('RangeSlider', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<RangeSlider />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(2);
    });

    it('renders with className', () => {
      const { container } = render(<RangeSlider className="custom" />);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('renders label', () => {
      render(<RangeSlider label="가격 범위" />);
      expect(screen.getByText('가격 범위')).toBeInTheDocument();
    });

    it('renders value display when showValues is true', () => {
      render(<RangeSlider showValues defaultValue={[20, 80]} />);
      expect(screen.getByText('20 – 80')).toBeInTheDocument();
    });

    it('does not render value display by default', () => {
      render(<RangeSlider defaultValue={[20, 80]} />);
      expect(screen.queryByText('20 – 80')).not.toBeInTheDocument();
    });

    it('renders with custom formatValue', () => {
      render(<RangeSlider showValues defaultValue={[10, 90]} formatValue={v => `${v}%`} />);
      expect(screen.getByText('10% – 90%')).toBeInTheDocument();
    });

    it('renders label and values together', () => {
      render(<RangeSlider label="범위" showValues defaultValue={[25, 75]} />);
      expect(screen.getByText('범위')).toBeInTheDocument();
      expect(screen.getByText('25 – 75')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      const { container } = render(<RangeSlider size="small" />);
      expect(container.firstChild).toHaveClass('range-slider--small');
    });

    it('renders medium size', () => {
      const { container } = render(<RangeSlider size="medium" />);
      expect(container.firstChild).toHaveClass('range-slider--medium');
    });

    it('renders large size', () => {
      const { container } = render(<RangeSlider size="large" />);
      expect(container.firstChild).toHaveClass('range-slider--large');
    });
  });

  describe('keyboard interaction — start thumb', () => {
    it('increases start value with ArrowRight', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith([21, 80]);
    });

    it('decreases start value with ArrowLeft', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith([19, 80]);
    });

    it('goes to min with Home key on start thumb', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} min={5} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'Home' });
      expect(onChange).toHaveBeenCalledWith([5, 80]);
    });

    it('start thumb cannot exceed end thumb value', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[79, 80]} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith([80, 80]);
    });

    it('jumps 10 steps with PageUp on start thumb', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} step={1} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'PageUp' });
      expect(onChange).toHaveBeenCalledWith([30, 80]);
    });

    it('jumps 10 steps with PageDown on start thumb', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} step={1} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'PageDown' });
      expect(onChange).toHaveBeenCalledWith([10, 80]);
    });
  });

  describe('keyboard interaction — end thumb', () => {
    it('increases end value with ArrowRight', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[1], { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith([20, 81]);
    });

    it('decreases end value with ArrowLeft', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[1], { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith([20, 79]);
    });

    it('goes to max with End key on end thumb', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} max={200} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[1], { key: 'End' });
      expect(onChange).toHaveBeenCalledWith([20, 200]);
    });

    it('end thumb cannot go below start thumb value', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 21]} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[1], { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith([20, 20]);
    });
  });

  describe('keyboard interaction — disabled', () => {
    it('does not respond to keyboard when disabled', () => {
      const onChange = vi.fn();
      render(<RangeSlider disabled defaultValue={[20, 80]} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
      fireEvent.keyDown(sliders[1], { key: 'ArrowRight' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('mouse interaction', () => {
    const mockBoundingRect = (element: Element) => {
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200, top: 0, height: 28, right: 200, bottom: 28 }),
      });
    };

    it('clicks closer to start thumb updates start value', () => {
      const onChange = vi.fn();
      render(<RangeSlider onChange={onChange} defaultValue={[20, 80]} min={0} max={100} />);
      const container = document.querySelector('.range-slider__track-container')!;
      mockBoundingRect(container);
      fireEvent.mouseDown(container, { clientX: 20 }); // 10% -> closer to 20 (start)
      expect(onChange).toHaveBeenCalledWith([10, 80]);
    });

    it('clicks closer to end thumb updates end value', () => {
      const onChange = vi.fn();
      render(<RangeSlider onChange={onChange} defaultValue={[20, 80]} min={0} max={100} />);
      const container = document.querySelector('.range-slider__track-container')!;
      mockBoundingRect(container);
      fireEvent.mouseDown(container, { clientX: 180 }); // 90% -> closer to 80 (end)
      expect(onChange).toHaveBeenCalledWith([20, 90]);
    });

    it('does not respond to mouse when disabled', () => {
      const onChange = vi.fn();
      render(<RangeSlider disabled onChange={onChange} defaultValue={[20, 80]} />);
      const container = document.querySelector('.range-slider__track-container')!;
      fireEvent.mouseDown(container, { clientX: 100 });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('works as uncontrolled with defaultValue', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[30, 70]} onChange={onChange} showValues />);
      expect(screen.getByText('30 – 70')).toBeInTheDocument();
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith([31, 70]);
    });

    it('works as controlled with value', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <RangeSlider value={[30, 70]} onChange={onChange} showValues />,
      );
      expect(screen.getByText('30 – 70')).toBeInTheDocument();
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[1], { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith([30, 71]);
      rerender(<RangeSlider value={[30, 71]} onChange={onChange} showValues />);
      expect(screen.getByText('30 – 71')).toBeInTheDocument();
    });

    it('uses min and max as defaults when no defaultValue', () => {
      render(<RangeSlider min={10} max={90} showValues />);
      expect(screen.getByText('10 – 90')).toBeInTheDocument();
    });
  });

  describe('minDistance', () => {
    it('enforces minimum distance between thumbs', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[45, 55]} minDistance={10} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      // Try to move start past end - minDistance
      fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith([45, 55]);
    });

    it('enforces minDistance on end thumb', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[45, 55]} minDistance={10} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[1], { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith([45, 55]);
    });
  });

  describe('marks', () => {
    const marks = [
      { value: 0, label: '0원' },
      { value: 50, label: '50원' },
      { value: 100, label: '100원' },
    ];

    it('renders marks', () => {
      render(<RangeSlider marks={marks} />);
      expect(screen.getByText('0원')).toBeInTheDocument();
      expect(screen.getByText('50원')).toBeInTheDocument();
      expect(screen.getByText('100원')).toBeInTheDocument();
    });

    it('renders mark values when no label', () => {
      render(<RangeSlider marks={[{ value: 25 }, { value: 75 }]} />);
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('clicking mark updates the closest thumb', () => {
      const onChange = vi.fn();
      render(<RangeSlider marks={marks} defaultValue={[20, 80]} onChange={onChange} />);
      fireEvent.click(screen.getByText('0원'));
      expect(onChange).toHaveBeenCalledWith([0, 80]);
    });

    it('clicking mark when disabled does nothing', () => {
      const onChange = vi.fn();
      render(<RangeSlider marks={marks} onChange={onChange} disabled />);
      fireEvent.click(screen.getByText('50원'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('ticks', () => {
    it('does not show ticks by default', () => {
      const { container } = render(<RangeSlider />);
      expect(container.querySelector('.range-slider__tick')).not.toBeInTheDocument();
    });

    it('shows ticks when enabled', () => {
      const { container } = render(<RangeSlider showTicks min={0} max={10} step={5} />);
      const ticks = container.querySelectorAll('.range-slider__tick');
      expect(ticks.length).toBe(3); // 0, 5, 10
    });

    it('marks active ticks within range', () => {
      const { container } = render(
        <RangeSlider showTicks min={0} max={10} step={5} defaultValue={[0, 5]} />,
      );
      const activeTicks = container.querySelectorAll('.range-slider__tick--active');
      expect(activeTicks.length).toBe(2); // 0 and 5
    });
  });

  describe('disabled state', () => {
    it('applies disabled class', () => {
      const { container } = render(<RangeSlider disabled />);
      expect(container.firstChild).toHaveClass('range-slider--disabled');
    });

    it('sliders have aria-disabled', () => {
      render(<RangeSlider disabled />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-disabled', 'true');
      expect(sliders[1]).toHaveAttribute('aria-disabled', 'true');
    });

    it('sliders have tabIndex -1 when disabled', () => {
      render(<RangeSlider disabled />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('tabindex', '-1');
      expect(sliders[1]).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('accessibility', () => {
    it('start thumb has correct aria-valuemin', () => {
      render(<RangeSlider min={10} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-valuemin', '10');
    });

    it('start thumb has correct aria-valuemax (end value)', () => {
      render(<RangeSlider defaultValue={[20, 80]} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-valuemax', '80');
    });

    it('end thumb has correct aria-valuemin (start value)', () => {
      render(<RangeSlider defaultValue={[20, 80]} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[1]).toHaveAttribute('aria-valuemin', '20');
    });

    it('end thumb has correct aria-valuemax', () => {
      render(<RangeSlider max={200} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[1]).toHaveAttribute('aria-valuemax', '200');
    });

    it('has aria-valuenow on both thumbs', () => {
      render(<RangeSlider defaultValue={[25, 75]} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '25');
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '75');
    });

    it('has aria-valuetext on both thumbs', () => {
      render(<RangeSlider defaultValue={[25, 75]} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-valuetext', '25');
      expect(sliders[1]).toHaveAttribute('aria-valuetext', '75');
    });

    it('has custom aria-valuetext with formatValue', () => {
      render(<RangeSlider defaultValue={[25, 75]} formatValue={v => `${v}%`} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-valuetext', '25%');
      expect(sliders[1]).toHaveAttribute('aria-valuetext', '75%');
    });

    it('has aria-label from ariaLabel prop', () => {
      render(<RangeSlider ariaLabel="가격" />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-label', '가격 시작');
      expect(sliders[1]).toHaveAttribute('aria-label', '가격 끝');
    });

    it('has aria-label from label prop', () => {
      render(<RangeSlider label="가격 범위" />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-label', '가격 범위 시작');
      expect(sliders[1]).toHaveAttribute('aria-label', '가격 범위 끝');
    });

    it('has default aria-label', () => {
      render(<RangeSlider />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-label', '범위 시작');
      expect(sliders[1]).toHaveAttribute('aria-label', '범위 끝');
    });

    it('thumbs are focusable', () => {
      render(<RangeSlider />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('tabindex', '0');
      expect(sliders[1]).toHaveAttribute('tabindex', '0');
    });

    it('values display has aria-live', () => {
      render(<RangeSlider showValues defaultValue={[20, 80]} />);
      expect(screen.getByText('20 – 80')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('drag cleanup on unmount', () => {
    it('removes document event listeners when unmounted during drag', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = render(<RangeSlider defaultValue={[20, 80]} />);
      const container = document.querySelector('.range-slider__track-container')!;

      fireEvent.mouseDown(container, { clientX: 50 });
      unmount();

      expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      removeSpy.mockRestore();
    });
  });

  describe('step and range', () => {
    it('uses step for keyboard increments', () => {
      const onChange = vi.fn();
      render(<RangeSlider defaultValue={[20, 80]} step={5} onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith([25, 80]);
    });

    it('handles custom min and max', () => {
      render(<RangeSlider min={-50} max={50} defaultValue={[-20, 20]} showValues />);
      expect(screen.getByText('-20 – 20')).toBeInTheDocument();
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-valuemin', '-50');
      expect(sliders[1]).toHaveAttribute('aria-valuemax', '50');
    });
  });
});
