import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReadingProgressBar from './ReadingProgressBar';

describe('ReadingProgressBar', () => {
  it('should render progress bar when visible', () => {
    render(<ReadingProgressBar progress={50} isVisible={true} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
  });

  it('should not render when not visible', () => {
    render(<ReadingProgressBar progress={0} isVisible={false} />);
    const bar = screen.queryByRole('progressbar');
    expect(bar).toBeNull();
  });

  it('should display correct aria label', () => {
    render(<ReadingProgressBar progress={75} isVisible={true} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-label')).toBe('읽기 진행률 75%');
  });

  it('should set fill width from progress', () => {
    const { container } = render(<ReadingProgressBar progress={30} isVisible={true} />);
    const fill = container.querySelector('.reading-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('30%');
  });

  it('should handle 0% progress', () => {
    const { container } = render(<ReadingProgressBar progress={0} isVisible={true} />);
    const fill = container.querySelector('.reading-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('should handle 100% progress', () => {
    const { container } = render(<ReadingProgressBar progress={100} isVisible={true} />);
    const fill = container.querySelector('.reading-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('should have correct aria attributes', () => {
    render(<ReadingProgressBar progress={42} isVisible={true} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
  });
});
