import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Kbd from './Kbd';

describe('Kbd', () => {
  // --- Rendering ---

  it('renders single key', () => {
    render(<Kbd keys="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders string with + separator', () => {
    render(<Kbd keys="Ctrl+S" />);
    expect(screen.getByText('⌃')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders array of keys', () => {
    render(<Kbd keys={['Ctrl', 'Shift', 'P']} />);
    expect(screen.getByText('⌃')).toBeInTheDocument();
    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('renders separator between keys', () => {
    const { container } = render(<Kbd keys={['A', 'B']} />);
    const separators = container.querySelectorAll('.kbd-separator');
    expect(separators).toHaveLength(1);
    expect(separators[0].textContent).toBe('+');
  });

  it('renders custom separator', () => {
    const { container } = render(<Kbd keys={['A', 'B']} separator="→" />);
    const sep = container.querySelector('.kbd-separator');
    expect(sep?.textContent).toBe('→');
  });

  it('does not render separator for single key', () => {
    const { container } = render(<Kbd keys="A" />);
    expect(container.querySelector('.kbd-separator')).not.toBeInTheDocument();
  });

  // --- Key symbol mapping ---

  it('maps ctrl to ⌃', () => {
    render(<Kbd keys="Ctrl" />);
    expect(screen.getByText('⌃')).toBeInTheDocument();
  });

  it('maps cmd to ⌘', () => {
    render(<Kbd keys="Cmd" />);
    expect(screen.getByText('⌘')).toBeInTheDocument();
  });

  it('maps command to ⌘', () => {
    render(<Kbd keys="Command" />);
    expect(screen.getByText('⌘')).toBeInTheDocument();
  });

  it('maps alt to ⌥', () => {
    render(<Kbd keys="Alt" />);
    expect(screen.getByText('⌥')).toBeInTheDocument();
  });

  it('maps option to ⌥', () => {
    render(<Kbd keys="Option" />);
    expect(screen.getByText('⌥')).toBeInTheDocument();
  });

  it('maps shift to ⇧', () => {
    render(<Kbd keys="Shift" />);
    expect(screen.getByText('⇧')).toBeInTheDocument();
  });

  it('maps enter to ↵', () => {
    render(<Kbd keys="Enter" />);
    expect(screen.getByText('↵')).toBeInTheDocument();
  });

  it('maps escape to Esc', () => {
    render(<Kbd keys="Escape" />);
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it('maps arrow keys', () => {
    render(<Kbd keys={['Up', 'Down', 'Left', 'Right']} />);
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('maps backspace to ⌫', () => {
    render(<Kbd keys="Backspace" />);
    expect(screen.getByText('⌫')).toBeInTheDocument();
  });

  it('maps tab to ⇥', () => {
    render(<Kbd keys="Tab" />);
    expect(screen.getByText('⇥')).toBeInTheDocument();
  });

  it('maps space to ␣', () => {
    render(<Kbd keys="Space" />);
    expect(screen.getByText('␣')).toBeInTheDocument();
  });

  it('keeps unknown keys as-is', () => {
    render(<Kbd keys="F12" />);
    expect(screen.getByText('F12')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size', () => {
    const { container } = render(<Kbd keys="A" size="small" />);
    expect(container.querySelector('.kbd-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<Kbd keys="A" />);
    expect(container.querySelector('.kbd-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = render(<Kbd keys="A" size="large" />);
    expect(container.querySelector('.kbd-large')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies default variant by default', () => {
    const { container } = render(<Kbd keys="A" />);
    expect(container.querySelector('.kbd-default')).toBeInTheDocument();
  });

  it('applies outline variant', () => {
    const { container } = render(<Kbd keys="A" variant="outline" />);
    expect(container.querySelector('.kbd-outline')).toBeInTheDocument();
  });

  it('applies flat variant', () => {
    const { container } = render(<Kbd keys="A" variant="flat" />);
    expect(container.querySelector('.kbd-flat')).toBeInTheDocument();
  });

  // --- Accessibility ---

  it('has role="text"', () => {
    render(<Kbd keys="Ctrl+S" />);
    expect(screen.getByRole('text')).toBeInTheDocument();
  });

  it('has aria-label with key names', () => {
    render(<Kbd keys={['Ctrl', 'S']} />);
    expect(screen.getByRole('text')).toHaveAttribute('aria-label', 'Ctrl + S');
  });

  it('separator is aria-hidden', () => {
    const { container } = render(<Kbd keys={['A', 'B']} />);
    const sep = container.querySelector('.kbd-separator');
    expect(sep).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Uses kbd element ---

  it('renders kbd HTML elements', () => {
    const { container } = render(<Kbd keys={['Ctrl', 'C']} />);
    const kbdElements = container.querySelectorAll('kbd');
    expect(kbdElements).toHaveLength(2);
  });
});
