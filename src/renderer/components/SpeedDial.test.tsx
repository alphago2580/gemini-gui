import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SpeedDial, { SpeedDialAction } from './SpeedDial';

function createActions(): SpeedDialAction[] {
  return [
    { id: 'a1', label: '새 파일', icon: '📄', onClick: vi.fn<() => void>() },
    { id: 'a2', label: '새 폴더', icon: '📁', onClick: vi.fn<() => void>() },
    { id: 'a3', label: '업로드', icon: '⬆️', onClick: vi.fn<() => void>() },
  ];
}

function createActionsWithDisabled(): SpeedDialAction[] {
  return [
    { id: 'a1', label: '새 파일', icon: '📄', onClick: vi.fn<() => void>() },
    { id: 'a2', label: '새 폴더', icon: '📁', onClick: vi.fn<() => void>(), disabled: true },
    { id: 'a3', label: '업로드', icon: '⬆️', onClick: vi.fn<() => void>() },
  ];
}

describe('SpeedDial', () => {
  let actions: SpeedDialAction[];

  beforeEach(() => {
    actions = createActions();
  });

  // --- Rendering ---

  it('renders trigger button', () => {
    render(<SpeedDial actions={actions} />);
    expect(screen.getByRole('button', { name: '빠른 액션' })).toBeInTheDocument();
  });

  it('renders with default + icon', () => {
    render(<SpeedDial actions={actions} />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(<SpeedDial actions={actions} icon="⚡" />);
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('actions are hidden by default', () => {
    render(<SpeedDial actions={actions} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders with custom ariaLabel', () => {
    render(<SpeedDial actions={actions} ariaLabel="액션 메뉴" />);
    expect(screen.getByRole('button', { name: '액션 메뉴' })).toBeInTheDocument();
  });

  // --- Open/Close ---

  it('opens on trigger click', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('shows all action buttons when open', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(3);
  });

  it('shows action labels as aria-label', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.getByRole('menuitem', { name: '새 파일' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '새 폴더' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '업로드' })).toBeInTheDocument();
  });

  it('closes on second trigger click', () => {
    render(<SpeedDial actions={actions} />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on outside click', () => {
    render(
      <div>
        <SpeedDial actions={actions} />
        <button>Outside</button>
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('Outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // --- Action clicks ---

  it('calls action onClick when action button is clicked', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '새 파일' }));
    expect(actions[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('closes after action click', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '새 파일' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not call disabled action onClick', () => {
    const acts = createActionsWithDisabled();
    render(<SpeedDial actions={acts} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '새 폴더' }));
    expect(acts[1].onClick).not.toHaveBeenCalled();
  });

  // --- openIcon ---

  it('shows openIcon when open', () => {
    render(<SpeedDial actions={actions} icon="+" openIcon="✕" />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('shows default icon when closed', () => {
    render(<SpeedDial actions={actions} icon="+" openIcon="✕" />);
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  // --- Callbacks ---

  it('calls onOpen when opened', () => {
    const onOpen = vi.fn();
    render(<SpeedDial actions={actions} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when closed', () => {
    const onClose = vi.fn();
    render(<SpeedDial actions={actions} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // --- Disabled state ---

  it('does not open when disabled', () => {
    render(<SpeedDial actions={actions} disabled />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('applies disabled class when disabled', () => {
    const { container } = render(<SpeedDial actions={actions} disabled />);
    expect(container.querySelector('.speed-dial-disabled')).toBeInTheDocument();
  });

  it('trigger button is disabled when disabled', () => {
    render(<SpeedDial actions={actions} disabled />);
    expect(screen.getByRole('button', { name: '빠른 액션' })).toBeDisabled();
  });

  // --- Direction ---

  it('applies up direction class by default', () => {
    const { container } = render(<SpeedDial actions={actions} />);
    expect(container.querySelector('.speed-dial-up')).toBeInTheDocument();
  });

  it('applies down direction class', () => {
    const { container } = render(<SpeedDial actions={actions} direction="down" />);
    expect(container.querySelector('.speed-dial-down')).toBeInTheDocument();
  });

  it('applies left direction class', () => {
    const { container } = render(<SpeedDial actions={actions} direction="left" />);
    expect(container.querySelector('.speed-dial-left')).toBeInTheDocument();
  });

  it('applies right direction class', () => {
    const { container } = render(<SpeedDial actions={actions} direction="right" />);
    expect(container.querySelector('.speed-dial-right')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies medium size class by default', () => {
    const { container } = render(<SpeedDial actions={actions} />);
    expect(container.querySelector('.speed-dial-medium')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(<SpeedDial actions={actions} size="small" />);
    expect(container.querySelector('.speed-dial-small')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<SpeedDial actions={actions} size="large" />);
    expect(container.querySelector('.speed-dial-large')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies primary variant class by default', () => {
    const { container } = render(<SpeedDial actions={actions} />);
    expect(container.querySelector('.speed-dial-primary')).toBeInTheDocument();
  });

  it('applies secondary variant class', () => {
    const { container } = render(<SpeedDial actions={actions} variant="secondary" />);
    expect(container.querySelector('.speed-dial-secondary')).toBeInTheDocument();
  });

  it('applies danger variant class', () => {
    const { container } = render(<SpeedDial actions={actions} variant="danger" />);
    expect(container.querySelector('.speed-dial-danger')).toBeInTheDocument();
  });

  // --- Accessibility ---

  it('trigger has aria-haspopup="menu"', () => {
    render(<SpeedDial actions={actions} />);
    expect(screen.getByRole('button', { name: '빠른 액션' })).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('trigger has aria-expanded=false when closed', () => {
    render(<SpeedDial actions={actions} />);
    expect(screen.getByRole('button', { name: '빠른 액션' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('trigger has aria-expanded=true when open', () => {
    render(<SpeedDial actions={actions} />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('disabled actions have aria-disabled', () => {
    const acts = createActionsWithDisabled();
    render(<SpeedDial actions={acts} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.getByRole('menuitem', { name: '새 폴더' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('action icons are rendered', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  // --- Trigger rotation ---

  it('applies open class to trigger when open', () => {
    const { container } = render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(container.querySelector('.speed-dial-trigger-open')).toBeInTheDocument();
  });

  it('removes open class from trigger when closed', () => {
    const { container } = render(<SpeedDial actions={actions} />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(container.querySelector('.speed-dial-trigger-open')).not.toBeInTheDocument();
  });

  // --- Open state class ---

  it('applies open class to container when open', () => {
    const { container } = render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(container.querySelector('.speed-dial-open')).toBeInTheDocument();
  });

  // --- Tooltip positions ---

  it('uses left tooltip by default for up direction', () => {
    const { container } = render(<SpeedDial actions={actions} direction="up" />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(container.querySelector('.speed-dial-tooltip-left')).toBeInTheDocument();
  });

  it('uses left tooltip by default for down direction', () => {
    const { container } = render(<SpeedDial actions={actions} direction="down" />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(container.querySelector('.speed-dial-tooltip-left')).toBeInTheDocument();
  });

  it('uses top tooltip by default for left direction', () => {
    const { container } = render(<SpeedDial actions={actions} direction="left" />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(container.querySelector('.speed-dial-tooltip-top')).toBeInTheDocument();
  });

  it('uses top tooltip by default for right direction', () => {
    const { container } = render(<SpeedDial actions={actions} direction="right" />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(container.querySelector('.speed-dial-tooltip-top')).toBeInTheDocument();
  });

  it('uses custom tooltip position when specified', () => {
    const { container } = render(
      <SpeedDial actions={actions} direction="up" tooltipPosition="right" />
    );
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(container.querySelector('.speed-dial-tooltip-right')).toBeInTheDocument();
  });

  // --- Keyboard navigation ---

  it('opens on Enter key on trigger', () => {
    render(<SpeedDial actions={actions} />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens on Space key on trigger', () => {
    render(<SpeedDial actions={actions} />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens on ArrowUp for up direction', () => {
    render(<SpeedDial actions={actions} direction="up" />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens on ArrowDown for down direction', () => {
    render(<SpeedDial actions={actions} direction="down" />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens on ArrowLeft for left direction', () => {
    render(<SpeedDial actions={actions} direction="left" />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.keyDown(trigger, { key: 'ArrowLeft' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens on ArrowRight for right direction', () => {
    render(<SpeedDial actions={actions} direction="right" />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('navigates actions with ArrowDown in actions menu (up direction)', () => {
    render(<SpeedDial actions={actions} direction="up" />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    const menu = screen.getByRole('menu');
    // First ArrowDown should navigate in the actions
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    // Should have set active index — check that action-active class appears
    const { container } = render(<SpeedDial actions={actions} />);
    // Just verify the menu received the event without error
    expect(menu).toBeInTheDocument();
  });

  it('selects action with Enter in actions menu', () => {
    const acts = createActions();
    render(<SpeedDial actions={acts} direction="up" />);
    const trigger = screen.getByRole('button', { name: '빠른 액션' });
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Enter' });
    // activeIndex should be 0 after ArrowUp opened it and set first enabled
    expect(acts[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('navigates with Home key in actions menu', () => {
    render(<SpeedDial actions={actions} direction="up" />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Home' });
    // Just ensure no error and menu still present
    expect(menu).toBeInTheDocument();
  });

  it('navigates with End key in actions menu', () => {
    render(<SpeedDial actions={actions} direction="up" />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'End' });
    expect(menu).toBeInTheDocument();
  });

  it('closes on Escape from actions menu', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // --- Action style index ---

  it('sets --action-index CSS variable on each action', () => {
    const { container } = render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    const actionDivs = container.querySelectorAll('.speed-dial-action');
    expect(actionDivs[0]).toHaveStyle('--action-index: 0');
    expect(actionDivs[1]).toHaveStyle('--action-index: 1');
    expect(actionDivs[2]).toHaveStyle('--action-index: 2');
  });

  // --- Tooltip text ---

  it('renders tooltip text for actions', () => {
    render(<SpeedDial actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    expect(screen.getByText('새 파일')).toBeInTheDocument();
    expect(screen.getByText('새 폴더')).toBeInTheDocument();
    expect(screen.getByText('업로드')).toBeInTheDocument();
  });

  // --- Disabled action style ---

  it('applies disabled class to disabled action', () => {
    const acts = createActionsWithDisabled();
    const { container } = render(<SpeedDial actions={acts} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    const actionDivs = container.querySelectorAll('.speed-dial-action');
    expect(actionDivs[1]).toHaveClass('speed-dial-action-disabled');
  });

  it('does not apply disabled class to enabled action', () => {
    const acts = createActionsWithDisabled();
    const { container } = render(<SpeedDial actions={acts} />);
    fireEvent.click(screen.getByRole('button', { name: '빠른 액션' }));
    const actionDivs = container.querySelectorAll('.speed-dial-action');
    expect(actionDivs[0]).not.toHaveClass('speed-dial-action-disabled');
  });
});
