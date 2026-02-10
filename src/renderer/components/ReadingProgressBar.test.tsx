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

  it('should handle fractional progress values', () => {
    const { container } = render(<ReadingProgressBar progress={33.33} isVisible={true} />);
    const fill = container.querySelector('.reading-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('33.33%');
  });

  it('should update aria-label with fractional progress', () => {
    render(<ReadingProgressBar progress={66.7} isVisible={true} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-label')).toBe('읽기 진행률 66.7%');
  });

  it('should have reading-progress-bar class on container', () => {
    const { container } = render(<ReadingProgressBar progress={50} isVisible={true} />);
    expect(container.querySelector('.reading-progress-bar')).toBeTruthy();
  });

  it('should have reading-progress-fill class on fill element', () => {
    const { container } = render(<ReadingProgressBar progress={50} isVisible={true} />);
    expect(container.querySelector('.reading-progress-fill')).toBeTruthy();
  });

  it('should handle progress value near boundary (1%)', () => {
    const { container } = render(<ReadingProgressBar progress={1} isVisible={true} />);
    const fill = container.querySelector('.reading-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('1%');
  });

  it('should handle progress value near boundary (99%)', () => {
    const { container } = render(<ReadingProgressBar progress={99} isVisible={true} />);
    const fill = container.querySelector('.reading-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('99%');
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('99');
  });

  it('should return empty DOM when not visible', () => {
    const { container } = render(<ReadingProgressBar progress={50} isVisible={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('should have fill element as child of bar container', () => {
    const { container } = render(<ReadingProgressBar progress={50} isVisible={true} />);
    const bar = container.querySelector('.reading-progress-bar');
    const fill = container.querySelector('.reading-progress-fill');
    expect(bar).toContainElement(fill as HTMLElement);
  });
});
