import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SplitButton, { SplitButtonOption } from './SplitButton';

const defaultOptions: SplitButtonOption[] = [
  { id: 'opt-1', label: 'Option A', onClick: vi.fn<() => void>() },
  { id: 'opt-2', label: 'Option B', icon: '📋', onClick: vi.fn<() => void>() },
  { id: 'opt-3', label: 'Option C', disabled: true, onClick: vi.fn<() => void>() },
];

function createOptions(): SplitButtonOption[] {
  return [
    { id: 'opt-1', label: 'Option A', onClick: vi.fn<() => void>() },
    { id: 'opt-2', label: 'Option B', icon: '📋', onClick: vi.fn<() => void>() },
    { id: 'opt-3', label: 'Option C', disabled: true, onClick: vi.fn<() => void>() },
  ];
}

describe('SplitButton', () => {
  let onClickMain: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onClickMain = vi.fn<() => void>();
  });

  // --- Rendering ---

  it('renders main button with label', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders main button with icon', () => {
    render(<SplitButton label="Save" icon="💾" onClick={onClickMain} options={defaultOptions} />);
    expect(screen.getByText('💾')).toBeInTheDocument();
  });

  it('renders toggle button with arrow', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    expect(screen.getByText('▾')).toBeInTheDocument();
  });

  it('renders with role="group"', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  // --- Main button click ---

  it('calls onClick when main button is clicked', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onClickMain).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} disabled />);
    fireEvent.click(screen.getByText('Save'));
    expect(onClickMain).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} loading />);
    fireEvent.click(screen.getByText('Save'));
    expect(onClickMain).not.toHaveBeenCalled();
  });

  // --- Loading state ---

  it('shows spinner when loading', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} loading />
    );
    expect(container.querySelector('.split-button-spinner')).toBeInTheDocument();
  });

  it('hides icon when loading', () => {
    render(
      <SplitButton label="Save" icon="💾" onClick={onClickMain} options={defaultOptions} loading />
    );
    expect(screen.queryByText('💾')).not.toBeInTheDocument();
  });

  // --- Dropdown toggle ---

  it('dropdown is closed by default', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens dropdown when toggle is clicked', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes dropdown when toggle is clicked again', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    const toggle = screen.getByRole('button', { name: 'Save 옵션' });
    fireEvent.click(toggle);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders all options in dropdown', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders option icons', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  // --- Option click ---

  it('calls option onClick when clicked', () => {
    const opts = createOptions();
    render(<SplitButton label="Save" onClick={onClickMain} options={opts} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    fireEvent.click(screen.getByText('Option A'));
    expect(opts[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('closes dropdown after option click', () => {
    const opts = createOptions();
    render(<SplitButton label="Save" onClick={onClickMain} options={opts} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    fireEvent.click(screen.getByText('Option A'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not call disabled option onClick', () => {
    const opts = createOptions();
    render(<SplitButton label="Save" onClick={onClickMain} options={opts} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    fireEvent.click(screen.getByText('Option C'));
    expect(opts[2].onClick).not.toHaveBeenCalled();
  });

  // --- Keyboard navigation ---

  it('closes dropdown on Escape', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('navigates down with ArrowDown', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveClass('split-button-menu-item-active');
  });

  it('navigates up with ArrowUp', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const menu = screen.getByRole('menu');
    // ArrowUp from -1 goes to last enabled item
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    const items = screen.getAllByRole('menuitem');
    // Last enabled is index 1 (index 2 is disabled)
    expect(items[1]).toHaveClass('split-button-menu-item-active');
  });

  it('wraps around when navigating past end', () => {
    const opts: SplitButtonOption[] = [
      { id: '1', label: 'A', onClick: vi.fn<() => void>() },
      { id: '2', label: 'B', onClick: vi.fn<() => void>() },
    ];
    render(<SplitButton label="Save" onClick={onClickMain} options={opts} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // index 0
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // index 1
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // wraps to 0
    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveClass('split-button-menu-item-active');
  });

  it('selects option with Enter', () => {
    const opts = createOptions();
    render(<SplitButton label="Save" onClick={onClickMain} options={opts} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // select first
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(opts[0].onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('selects option with Space', () => {
    const opts = createOptions();
    render(<SplitButton label="Save" onClick={onClickMain} options={opts} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // select first
    fireEvent.keyDown(menu, { key: ' ' });
    expect(opts[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('jumps to first with Home', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Home' });
    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveClass('split-button-menu-item-active');
  });

  it('jumps to last enabled with End', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'End' });
    const items = screen.getAllByRole('menuitem');
    // Last enabled is index 1 (index 2 is disabled)
    expect(items[1]).toHaveClass('split-button-menu-item-active');
  });

  // --- Outside click ---

  it('closes dropdown on outside click', () => {
    render(
      <div>
        <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />
        <button>Outside</button>
      </div>
    );
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('Outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // --- Variants ---

  it('applies primary variant class by default', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />
    );
    expect(container.querySelector('.split-button-primary')).toBeInTheDocument();
  });

  it('applies secondary variant class', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} variant="secondary" />
    );
    expect(container.querySelector('.split-button-secondary')).toBeInTheDocument();
  });

  it('applies danger variant class', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} variant="danger" />
    );
    expect(container.querySelector('.split-button-danger')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size class', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} size="small" />
    );
    expect(container.querySelector('.split-button-small')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} size="large" />
    );
    expect(container.querySelector('.split-button-large')).toBeInTheDocument();
  });

  it('does not apply size class for medium (default)', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />
    );
    expect(container.querySelector('.split-button-medium')).not.toBeInTheDocument();
  });

  // --- Menu position ---

  it('renders menu at bottom by default', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />
    );
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    expect(container.querySelector('.split-button-menu-bottom')).toBeInTheDocument();
  });

  it('renders menu at top when specified', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} menuPosition="top" />
    );
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    expect(container.querySelector('.split-button-menu-top')).toBeInTheDocument();
  });

  // --- Disabled state ---

  it('applies disabled class when disabled', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} disabled />
    );
    expect(container.querySelector('.split-button-disabled')).toBeInTheDocument();
  });

  it('does not open dropdown when disabled', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} disabled />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // --- Accessibility ---

  it('toggle has aria-haspopup="menu"', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    expect(screen.getByLabelText('Save 옵션')).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('toggle has aria-expanded=false when closed', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    expect(screen.getByLabelText('Save 옵션')).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggle has aria-expanded=true when open', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    const toggle = screen.getByRole('button', { name: 'Save 옵션' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('disabled options have aria-disabled', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const items = screen.getAllByRole('menuitem');
    expect(items[2]).toHaveAttribute('aria-disabled', 'true');
  });

  it('uses custom ariaLabel when provided', () => {
    render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} ariaLabel="Save document" />
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Save document');
  });

  // --- Mouse hover ---

  it('highlights item on mouse enter', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const items = screen.getAllByRole('menuitem');
    fireEvent.mouseEnter(items[1]);
    expect(items[1]).toHaveClass('split-button-menu-item-active');
  });

  it('removes highlight on mouse leave', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const items = screen.getAllByRole('menuitem');
    fireEvent.mouseEnter(items[1]);
    fireEvent.mouseLeave(items[1]);
    expect(items[1]).not.toHaveClass('split-button-menu-item-active');
  });

  it('does not highlight disabled items on hover', () => {
    render(<SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />);
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    const items = screen.getAllByRole('menuitem');
    fireEvent.mouseEnter(items[2]); // disabled item
    expect(items[2]).not.toHaveClass('split-button-menu-item-active');
  });

  // --- Arrow rotation ---

  it('rotates arrow when menu is open', () => {
    const { container } = render(
      <SplitButton label="Save" onClick={onClickMain} options={defaultOptions} />
    );
    fireEvent.click(screen.getByLabelText('Save 옵션'));
    expect(container.querySelector('.split-button-arrow-open')).toBeInTheDocument();
  });
});
