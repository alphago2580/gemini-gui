import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar, { ToolbarGroup } from './Toolbar';

// Mock ResizeObserver for tests
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

function createGroups(): ToolbarGroup[] {
  return [
    {
      id: 'format',
      items: [
        { id: 'bold', label: '굵게', icon: 'B', onClick: vi.fn() },
        { id: 'italic', label: '기울임', icon: 'I', onClick: vi.fn() },
        { id: 'underline', label: '밑줄', icon: 'U', onClick: vi.fn() },
      ],
    },
    {
      id: 'align',
      items: [
        { id: 'left', label: '왼쪽', onClick: vi.fn() },
        { id: 'center', label: '가운데', onClick: vi.fn() },
        { id: 'right', label: '오른쪽', onClick: vi.fn() },
      ],
    },
  ];
}

function createGroupsWithDisabled(): ToolbarGroup[] {
  return [
    {
      id: 'actions',
      items: [
        { id: 'save', label: '저장', onClick: vi.fn() },
        { id: 'delete', label: '삭제', onClick: vi.fn(), disabled: true },
        { id: 'share', label: '공유', onClick: vi.fn() },
      ],
    },
  ];
}

function createGroupsWithActive(): ToolbarGroup[] {
  return [
    {
      id: 'format',
      items: [
        { id: 'bold', label: '굵게', onClick: vi.fn(), active: true },
        { id: 'italic', label: '기울임', onClick: vi.fn() },
      ],
    },
  ];
}

describe('Toolbar', () => {
  // --- Rendering ---

  it('renders with role="toolbar"', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders all items from all groups', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    expect(screen.getByText('굵게')).toBeInTheDocument();
    expect(screen.getByText('기울임')).toBeInTheDocument();
    expect(screen.getByText('밑줄')).toBeInTheDocument();
    expect(screen.getByText('왼쪽')).toBeInTheDocument();
    expect(screen.getByText('가운데')).toBeInTheDocument();
    expect(screen.getByText('오른쪽')).toBeInTheDocument();
  });

  it('renders icons when provided', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders separators between groups', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} />);
    const separators = container.querySelectorAll('[role="separator"]');
    // One separator between the two groups
    expect(separators).toHaveLength(1);
  });

  it('renders group containers with role="group"', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const groupEls = screen.getAllByRole('group');
    expect(groupEls).toHaveLength(2);
  });

  // --- Accessibility ---

  it('has default aria-label', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', '도구 모음');
  });

  it('uses custom ariaLabel', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} ariaLabel="편집 도구" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', '편집 도구');
  });

  it('has aria-orientation set to horizontal by default', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('has aria-orientation set to vertical when vertical', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} orientation="vertical" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('active items have aria-pressed=true', () => {
    const groups = createGroupsWithActive();
    render(<Toolbar groups={groups} />);
    const boldBtn = screen.getByRole('button', { name: '굵게' });
    expect(boldBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('non-active items have aria-pressed=false', () => {
    const groups = createGroupsWithActive();
    render(<Toolbar groups={groups} />);
    const italicBtn = screen.getByRole('button', { name: '기울임' });
    expect(italicBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('disabled items have aria-label from tooltip', () => {
    const groups: ToolbarGroup[] = [
      {
        id: 'test',
        items: [
          { id: 'a', label: '라벨', tooltip: '도움말', onClick: vi.fn() },
        ],
      },
    ];
    render(<Toolbar groups={groups} />);
    expect(screen.getByRole('button', { name: '도움말' })).toBeInTheDocument();
  });

  // --- Click handling ---

  it('calls onClick when item is clicked', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    fireEvent.click(screen.getByText('굵게'));
    expect(groups[0].items[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick on disabled item', () => {
    const groups = createGroupsWithDisabled();
    render(<Toolbar groups={groups} />);
    fireEvent.click(screen.getByText('삭제'));
    expect(groups[0].items[1].onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when toolbar is disabled', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} disabled />);
    fireEvent.click(screen.getByText('굵게'));
    expect(groups[0].items[0].onClick).not.toHaveBeenCalled();
  });

  // --- Disabled state ---

  it('applies disabled class when disabled', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} disabled />);
    expect(container.querySelector('.toolbar-disabled')).toBeInTheDocument();
  });

  it('has aria-disabled when disabled', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} disabled />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-disabled', 'true');
  });

  it('all buttons are disabled when toolbar is disabled', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} disabled />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('individual disabled item has disabled class', () => {
    const groups = createGroupsWithDisabled();
    const { container } = render(<Toolbar groups={groups} />);
    const disabledItems = container.querySelectorAll('.toolbar-item-disabled');
    expect(disabledItems).toHaveLength(1);
  });

  // --- Active state ---

  it('applies active class to active items', () => {
    const groups = createGroupsWithActive();
    const { container } = render(<Toolbar groups={groups} />);
    const activeItems = container.querySelectorAll('.toolbar-item-active');
    expect(activeItems).toHaveLength(1);
    expect(activeItems[0].textContent).toContain('굵게');
  });

  // --- Sizes ---

  it('applies small size class', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} size="small" />);
    expect(container.querySelector('.toolbar-small')).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} />);
    expect(container.querySelector('.toolbar-medium')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} size="large" />);
    expect(container.querySelector('.toolbar-large')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies default variant class', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} />);
    expect(container.querySelector('.toolbar-default')).toBeInTheDocument();
  });

  it('applies outline variant class', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} variant="outline" />);
    expect(container.querySelector('.toolbar-outline')).toBeInTheDocument();
  });

  it('applies ghost variant class', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} variant="ghost" />);
    expect(container.querySelector('.toolbar-ghost')).toBeInTheDocument();
  });

  // --- Orientation ---

  it('applies horizontal class by default', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} />);
    expect(container.querySelector('.toolbar-horizontal')).toBeInTheDocument();
  });

  it('applies vertical class when vertical', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} orientation="vertical" />);
    expect(container.querySelector('.toolbar-vertical')).toBeInTheDocument();
  });

  // --- Overflow behavior ---

  it('applies wrap class when overflowBehavior is wrap', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} overflowBehavior="wrap" />);
    expect(container.querySelector('.toolbar-wrap')).toBeInTheDocument();
  });

  it('does not apply wrap class when overflowBehavior is collapse', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} overflowBehavior="collapse" />);
    expect(container.querySelector('.toolbar-wrap')).not.toBeInTheDocument();
  });

  // --- Keyboard navigation ---

  it('first item has tabIndex=0', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('tabindex', '0');
  });

  it('non-first items have tabIndex=-1', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const buttons = screen.getAllByRole('button');
    for (let i = 1; i < buttons.length; i++) {
      expect(buttons[i]).toHaveAttribute('tabindex', '-1');
    }
  });

  it('ArrowRight navigates to next button in horizontal mode', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('ArrowLeft navigates to previous button in horizontal mode', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const buttons = screen.getAllByRole('button');
    buttons[1].focus();
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('ArrowDown navigates in vertical mode', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} orientation="vertical" />);
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('ArrowUp navigates in vertical mode', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} orientation="vertical" />);
    const buttons = screen.getAllByRole('button');
    buttons[1].focus();
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('Home jumps to first button', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const buttons = screen.getAllByRole('button');
    buttons[3].focus();
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'Home' });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('End jumps to last button', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'End' });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });

  it('ArrowRight wraps from last to first', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const buttons = screen.getAllByRole('button');
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('ArrowLeft wraps from first to last', () => {
    const groups = createGroups();
    render(<Toolbar groups={groups} />);
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });

  // --- Single group (no separator) ---

  it('renders no separator with single group', () => {
    const groups: ToolbarGroup[] = [
      {
        id: 'single',
        items: [
          { id: 'a', label: 'A', onClick: vi.fn() },
          { id: 'b', label: 'B', onClick: vi.fn() },
        ],
      },
    ];
    const { container } = render(<Toolbar groups={groups} />);
    const separators = container.querySelectorAll('[role="separator"]');
    expect(separators).toHaveLength(0);
  });

  // --- Three groups ---

  it('renders two separators with three groups', () => {
    const groups: ToolbarGroup[] = [
      { id: 'g1', items: [{ id: 'a', label: 'A', onClick: vi.fn() }] },
      { id: 'g2', items: [{ id: 'b', label: 'B', onClick: vi.fn() }] },
      { id: 'g3', items: [{ id: 'c', label: 'C', onClick: vi.fn() }] },
    ];
    const { container } = render(<Toolbar groups={groups} />);
    const separators = container.querySelectorAll('[role="separator"]');
    expect(separators).toHaveLength(2);
  });

  // --- Separator orientation ---

  it('horizontal toolbar separators have aria-orientation=vertical', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} />);
    const sep = container.querySelector('[role="separator"]');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('vertical toolbar separators have aria-orientation=horizontal', () => {
    const groups = createGroups();
    const { container } = render(<Toolbar groups={groups} orientation="vertical" />);
    const sep = container.querySelector('[role="separator"]');
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal');
  });

  // --- Empty groups ---

  it('renders nothing for empty groups', () => {
    const groups: ToolbarGroup[] = [];
    const { container } = render(<Toolbar groups={groups} />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    const buttons = container.querySelectorAll('.toolbar-item');
    expect(buttons).toHaveLength(0);
  });
});
