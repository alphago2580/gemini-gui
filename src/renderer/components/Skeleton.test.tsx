import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Skeleton from './Skeleton';

describe('Skeleton', () => {
  it('renders with default text variant', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.skeleton--text')).toBeInTheDocument();
  });

  it('renders circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    expect(container.querySelector('.skeleton--circular')).toBeInTheDocument();
  });

  it('renders rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    expect(container.querySelector('.skeleton--rectangular')).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '로딩 중');
  });

  it('has aria-busy="true"', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('applies custom width as pixel value', () => {
    const { container } = render(<Skeleton width={200} />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('applies custom width as string value', () => {
    const { container } = render(<Skeleton width="50%" />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toHaveStyle({ width: '50%' });
  });

  it('applies custom height', () => {
    const { container } = render(<Skeleton height={40} />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toHaveStyle({ height: '40px' });
  });

  it('is animated by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.skeleton--animated')).toBeInTheDocument();
  });

  it('can disable animation', () => {
    const { container } = render(<Skeleton animated={false} />);
    expect(container.querySelector('.skeleton--animated')).not.toBeInTheDocument();
  });

  it('renders multiple lines', () => {
    const { container } = render(<Skeleton lines={3} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBe(3);
  });

  it('wraps multiple lines in skeleton-lines container', () => {
    const { container } = render(<Skeleton lines={3} />);
    expect(container.querySelector('.skeleton-lines')).toBeInTheDocument();
  });

  it('last line is shorter (80% width) by default', () => {
    const { container } = render(<Skeleton lines={3} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons[2]).toHaveStyle({ width: '80%' });
  });

  it('single line renders without wrapper', () => {
    const { container } = render(<Skeleton lines={1} />);
    expect(container.querySelector('.skeleton-lines')).not.toBeInTheDocument();
  });

  it('applies animated class to all lines', () => {
    const { container } = render(<Skeleton lines={2} />);
    const animated = container.querySelectorAll('.skeleton--animated');
    expect(animated.length).toBe(2);
  });

  it('multiple lines have aria attributes on wrapper', () => {
    render(<Skeleton lines={3} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});
