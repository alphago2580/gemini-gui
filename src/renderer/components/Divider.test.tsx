import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Divider from './Divider';

describe('Divider', () => {
  it('renders with role="separator"', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('defaults to horizontal orientation', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('supports vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('applies horizontal CSS class by default', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toHaveClass('divider--horizontal');
  });

  it('applies vertical CSS class', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveClass('divider--vertical');
  });

  it('applies solid variant by default', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toHaveClass('divider--solid');
  });

  it('applies dashed variant', () => {
    render(<Divider variant="dashed" />);
    expect(screen.getByRole('separator')).toHaveClass('divider--dashed');
  });

  it('applies dotted variant', () => {
    render(<Divider variant="dotted" />);
    expect(screen.getByRole('separator')).toHaveClass('divider--dotted');
  });

  it('applies medium spacing by default', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toHaveClass('divider--spacing-medium');
  });

  it('applies small spacing', () => {
    render(<Divider spacing="small" />);
    expect(screen.getByRole('separator')).toHaveClass('divider--spacing-small');
  });

  it('applies large spacing', () => {
    render(<Divider spacing="large" />);
    expect(screen.getByRole('separator')).toHaveClass('divider--spacing-large');
  });

  it('renders label text', () => {
    render(<Divider label="또는" />);
    expect(screen.getByText('또는')).toBeInTheDocument();
  });

  it('applies with-label class when label is provided', () => {
    render(<Divider label="또는" />);
    expect(screen.getByRole('separator')).toHaveClass('divider--with-label');
  });

  it('has aria-label when label text is provided', () => {
    render(<Divider label="또는" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-label', '또는');
  });

  it('renders two divider lines with label', () => {
    const { container } = render(<Divider label="또는" />);
    const lines = container.querySelectorAll('.divider-line');
    expect(lines).toHaveLength(2);
  });

  it('does not render label for vertical orientation', () => {
    render(<Divider orientation="vertical" label="무시됨" />);
    expect(screen.queryByText('무시됨')).not.toBeInTheDocument();
  });
});
