import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Rating from './Rating';

describe('Rating', () => {
  // -- Rendering --
  it('renders with role="slider"', () => {
    render(<Rating value={3} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders 5 stars by default', () => {
    const { container } = render(<Rating value={0} />);
    const stars = container.querySelectorAll('.rating-star');
    expect(stars).toHaveLength(5);
  });

  it('renders custom max stars', () => {
    const { container } = render(<Rating value={0} max={10} />);
    const stars = container.querySelectorAll('.rating-star');
    expect(stars).toHaveLength(10);
  });

  it('fills stars up to value', () => {
    const { container } = render(<Rating value={3} />);
    const filled = container.querySelectorAll('.rating-star--filled');
    expect(filled).toHaveLength(3);
  });

  it('renders empty stars for remaining', () => {
    const { container } = render(<Rating value={2} max={5} />);
    const stars = container.querySelectorAll('.rating-star');
    const filled = container.querySelectorAll('.rating-star--filled');
    expect(stars).toHaveLength(5);
    expect(filled).toHaveLength(2);
  });

  it('uses custom icons', () => {
    const { container } = render(<Rating value={1} max={3} icon="❤" emptyIcon="♡" />);
    const stars = container.querySelectorAll('.rating-star');
    expect(stars[0].textContent).toBe('❤');
    expect(stars[1].textContent).toBe('♡');
    expect(stars[2].textContent).toBe('♡');
  });

  // -- Sizes --
  it('applies medium size by default', () => {
    render(<Rating value={0} />);
    expect(screen.getByRole('slider')).toHaveClass('rating--medium');
  });

  it('applies small size class', () => {
    render(<Rating value={0} size="small" />);
    expect(screen.getByRole('slider')).toHaveClass('rating--small');
  });

  it('applies large size class', () => {
    render(<Rating value={0} size="large" />);
    expect(screen.getByRole('slider')).toHaveClass('rating--large');
  });

  // -- ARIA --
  it('has aria-valuenow matching value', () => {
    render(<Rating value={3} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '3');
  });

  it('has aria-valuemin=0 and aria-valuemax matching max', () => {
    render(<Rating value={0} max={7} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '7');
  });

  it('has default aria-label', () => {
    render(<Rating value={0} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-label', '평점');
  });

  it('uses custom label for aria-label', () => {
    render(<Rating value={0} label="만족도" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-label', '만족도');
  });

  it('renders label text', () => {
    render(<Rating value={0} label="만족도" />);
    expect(screen.getByText('만족도')).toBeInTheDocument();
  });

  it('applies custom id', () => {
    render(<Rating value={0} id="my-rating" />);
    expect(screen.getByRole('slider')).toHaveAttribute('id', 'my-rating');
  });

  // -- Interactive clicks --
  it('calls onChange when star is clicked', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={0} onChange={onChange} />);
    const stars = container.querySelectorAll('.rating-star');
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onChange with correct value for different stars', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={0} onChange={onChange} />);
    const stars = container.querySelectorAll('.rating-star');
    fireEvent.click(stars[0]);
    expect(onChange).toHaveBeenCalledWith(1);
    fireEvent.click(stars[4]);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  // -- readOnly --
  it('does not call onChange when readOnly', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={3} onChange={onChange} readOnly />);
    const stars = container.querySelectorAll('.rating-star');
    fireEvent.click(stars[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has aria-readonly when readOnly', () => {
    render(<Rating value={3} readOnly />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-readonly', 'true');
  });

  it('applies readonly CSS class', () => {
    render(<Rating value={0} readOnly />);
    expect(screen.getByRole('slider')).toHaveClass('rating--readonly');
  });

  it('has tabIndex=-1 when readOnly', () => {
    render(<Rating value={0} readOnly />);
    expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '-1');
  });

  // -- Disabled --
  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={3} onChange={onChange} disabled />);
    const stars = container.querySelectorAll('.rating-star');
    fireEvent.click(stars[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has aria-disabled when disabled', () => {
    render(<Rating value={0} onChange={() => {}} disabled />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies disabled CSS class', () => {
    render(<Rating value={0} disabled />);
    expect(screen.getByRole('slider')).toHaveClass('rating--disabled');
  });

  it('has tabIndex=-1 when disabled', () => {
    render(<Rating value={0} onChange={() => {}} disabled />);
    expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '-1');
  });

  // -- Interactive (tabIndex) --
  it('has tabIndex=0 when interactive', () => {
    render(<Rating value={0} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '0');
  });

  it('has tabIndex=-1 when no onChange', () => {
    render(<Rating value={0} />);
    expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '-1');
  });

  // -- Keyboard navigation --
  it('increases value with ArrowRight', () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('increases value with ArrowUp', () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('decreases value with ArrowLeft', () => {
    const onChange = vi.fn();
    render(<Rating value={3} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('decreases value with ArrowDown', () => {
    const onChange = vi.fn();
    render(<Rating value={3} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('does not exceed max with ArrowRight', () => {
    const onChange = vi.fn();
    render(<Rating value={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not go below 0 with ArrowLeft', () => {
    const onChange = vi.fn();
    render(<Rating value={0} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets max value with End key', () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} max={5} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('sets 0 with Home key', () => {
    const onChange = vi.fn();
    render(<Rating value={3} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('does not respond to keyboard when disabled', () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} disabled />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not respond to keyboard when readOnly', () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} readOnly />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores unrelated keys', () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'a' });
    expect(onChange).not.toHaveBeenCalled();
  });

  // -- allowHalf --
  it('supports half step with keyboard when allowHalf', () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} allowHalf />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it('renders half star when value is x.5', () => {
    const { container } = render(<Rating value={2.5} allowHalf />);
    const halfStars = container.querySelectorAll('.rating-star--half');
    expect(halfStars).toHaveLength(1);
  });

  it('renders correct filled + half combo', () => {
    const { container } = render(<Rating value={3.5} allowHalf />);
    const filled = container.querySelectorAll('.rating-star--filled');
    const half = container.querySelectorAll('.rating-star--half');
    expect(filled).toHaveLength(3);
    expect(half).toHaveLength(1);
  });

  // -- allowClear --
  it('clears to 0 when clicking same value with allowClear', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={3} onChange={onChange} allowClear />);
    const stars = container.querySelectorAll('.rating-star');
    fireEvent.click(stars[2]); // clicking star index 2 = value 3
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('does not clear when clicking different value', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={3} onChange={onChange} allowClear />);
    const stars = container.querySelectorAll('.rating-star');
    fireEvent.click(stars[0]); // clicking star index 0 = value 1
    expect(onChange).toHaveBeenCalledWith(1);
  });

  // -- Hover --
  it('shows hover effect on mouse move (interactive stars)', () => {
    const { container } = render(<Rating value={0} onChange={() => {}} />);
    const stars = container.querySelectorAll('.rating-star');
    expect(stars[0]).toHaveClass('rating-star--interactive');
  });

  it('does not show interactive class when readOnly', () => {
    const { container } = render(<Rating value={0} readOnly />);
    const stars = container.querySelectorAll('.rating-star');
    expect(stars[0]).not.toHaveClass('rating-star--interactive');
  });

  it('resets hover on mouse leave', () => {
    const { container } = render(<Rating value={2} onChange={() => {}} />);
    const slider = screen.getByRole('slider');
    const stars = container.querySelectorAll('.rating-star');
    // Hover over star 4
    fireEvent.mouseMove(stars[3], { clientX: 100 });
    // Then leave
    fireEvent.mouseLeave(slider);
    // Value should still show 2 filled
    const filled = container.querySelectorAll('.rating-star--filled');
    expect(filled).toHaveLength(2);
  });

  // -- Half hover --
  it('detects half hover with allowHalf on left side of star', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={0} onChange={onChange} allowHalf />);
    const stars = container.querySelectorAll('.rating-star');
    // Mock getBoundingClientRect
    const mockRect = { left: 0, width: 20, top: 0, right: 20, bottom: 20, height: 20 };
    vi.spyOn(stars[2], 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);
    // Click left half (clientX < left + width/2 = 10)
    fireEvent.mouseMove(stars[2], { clientX: 5 });
    // The hover value should be 2.5 (star index 2 + 0.5)
    // Verify by checking that half star class appears
    const half = container.querySelectorAll('.rating-star--half');
    expect(half).toHaveLength(1);
  });

  // -- Edge cases --
  it('renders with value=0', () => {
    const { container } = render(<Rating value={0} />);
    const filled = container.querySelectorAll('.rating-star--filled');
    expect(filled).toHaveLength(0);
  });

  it('renders with value=max', () => {
    const { container } = render(<Rating value={5} />);
    const filled = container.querySelectorAll('.rating-star--filled');
    expect(filled).toHaveLength(5);
  });

  it('stars have aria-hidden', () => {
    const { container } = render(<Rating value={0} />);
    const stars = container.querySelectorAll('.rating-star');
    stars.forEach(star => {
      expect(star).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('stars have data-star-index attributes', () => {
    const { container } = render(<Rating value={0} max={3} />);
    const stars = container.querySelectorAll('.rating-star');
    expect(stars[0]).toHaveAttribute('data-star-index', '0');
    expect(stars[1]).toHaveAttribute('data-star-index', '1');
    expect(stars[2]).toHaveAttribute('data-star-index', '2');
  });

  it('Home does not call onChange when already at 0', () => {
    const onChange = vi.fn();
    render(<Rating value={0} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('End does not call onChange when already at max', () => {
    const onChange = vi.fn();
    render(<Rating value={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
    expect(onChange).not.toHaveBeenCalled();
  });

  // -- Additional round 17 tests --
  it('does not have aria-disabled when not disabled', () => {
    render(<Rating value={0} onChange={() => {}} />);
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-disabled');
  });

  it('does not have aria-readonly when not readonly', () => {
    render(<Rating value={0} onChange={() => {}} />);
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-readonly');
  });

  it('does not show label text when label is not provided', () => {
    const { container } = render(<Rating value={0} />);
    expect(container.querySelector('.rating-label')).not.toBeInTheDocument();
  });

  it('half filled star renders half container', () => {
    const { container } = render(<Rating value={1.5} allowHalf />);
    expect(container.querySelector('.rating-star-half-container')).toBeInTheDocument();
  });

  it('half filled star contains both filled and empty icons', () => {
    const { container } = render(<Rating value={0.5} allowHalf icon="❤" emptyIcon="♡" />);
    const halfFilled = container.querySelector('.rating-star-half-filled');
    const halfEmpty = container.querySelector('.rating-star-half-empty');
    expect(halfFilled?.textContent).toBe('❤');
    expect(halfEmpty?.textContent).toBe('♡');
  });

  it('ArrowDown decreases by half step with allowHalf', () => {
    const onChange = vi.fn();
    render(<Rating value={3} onChange={onChange} allowHalf />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it('max=3 renders only 3 stars', () => {
    const { container } = render(<Rating value={2} max={3} />);
    const stars = container.querySelectorAll('.rating-star');
    expect(stars).toHaveLength(3);
    const filled = container.querySelectorAll('.rating-star--filled');
    expect(filled).toHaveLength(2);
  });

  it('does not clear when allowClear is false and clicking same value', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={3} onChange={onChange} />);
    const stars = container.querySelectorAll('.rating-star');
    fireEvent.click(stars[2]);
    // Without allowClear, clicking same value still sets the same value
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
