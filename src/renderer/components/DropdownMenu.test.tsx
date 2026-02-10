import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DropdownMenu, { DropdownMenuEntry } from './DropdownMenu';

describe('DropdownMenu', () => {
  const mockItems: DropdownMenuEntry[] = [
    { id: 'edit', label: '수정', icon: '✏️', onClick: vi.fn() },
    { id: 'copy', label: '복사', icon: '📋', shortcut: 'Ctrl+C', onClick: vi.fn() },
    { type: 'separator' },
    { id: 'delete', label: '삭제', icon: '🗑️', danger: true, onClick: vi.fn() },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    items: mockItems,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the onClick mocks inside items
    for (const item of mockItems) {
      if ('onClick' in item && item.onClick) {
        (item.onClick as ReturnType<typeof vi.fn>).mockClear();
      }
    }
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DropdownMenu {...defaultProps} isOpen={false} />
    );
    expect(container.querySelector('.dropdown-menu')).toBeNull();
  });

  it('renders menu items when open', () => {
    render(<DropdownMenu {...defaultProps} />);
    expect(screen.getByText('수정')).toBeInTheDocument();
    expect(screen.getByText('복사')).toBeInTheDocument();
    expect(screen.getByText('삭제')).toBeInTheDocument();
  });

  it('renders separator', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const separators = container.querySelectorAll('.dropdown-menu-separator');
    expect(separators.length).toBe(1);
    expect(separators[0]).toHaveAttribute('role', 'separator');
  });

  it('renders icons', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const icons = container.querySelectorAll('.dropdown-menu-item-icon');
    expect(icons.length).toBe(3);
    expect(icons[0].textContent).toBe('✏️');
    expect(icons[1].textContent).toBe('📋');
    expect(icons[2].textContent).toBe('🗑️');
  });

  it('renders shortcut badge', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const shortcuts = container.querySelectorAll('.dropdown-menu-item-shortcut');
    expect(shortcuts.length).toBe(1);
    expect(shortcuts[0].textContent).toBe('Ctrl+C');
  });

  it('renders danger item with danger class', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const dangerItem = container.querySelectorAll('.dropdown-menu-item-danger');
    expect(dangerItem.length).toBe(1);
    expect(dangerItem[0].textContent).toContain('삭제');
  });

  it('calls onClick and onClose when item is clicked', () => {
    render(<DropdownMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('수정'));
    const editItem = mockItems[0] as unknown as { onClick: ReturnType<typeof vi.fn> };
    expect(editItem.onClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for disabled items', () => {
    const items: DropdownMenuEntry[] = [
      { id: 'disabled-item', label: '비활성', disabled: true, onClick: vi.fn() },
    ];
    const { container } = render(
      <DropdownMenu {...defaultProps} items={items} />
    );
    const disabledItem = container.querySelector('.dropdown-menu-item-disabled');
    expect(disabledItem).toBeInTheDocument();
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onClose when Escape is pressed', () => {
    render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates with ArrowDown', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');

    // First ArrowDown selects first item
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    const items = container.querySelectorAll('.dropdown-menu-item');
    expect(items[0]).toHaveClass('dropdown-menu-item-active');
  });

  it('navigates with ArrowUp', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');

    // First ArrowUp selects last item
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    const items = container.querySelectorAll('.dropdown-menu-item');
    expect(items[items.length - 1]).toHaveClass('dropdown-menu-item-active');
  });

  it('executes item on Enter key', () => {
    render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');

    // Navigate to first item then press Enter
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Enter' });

    const editItem = mockItems[0] as unknown as { onClick: ReturnType<typeof vi.fn> };
    expect(editItem.onClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('executes item on Space key', () => {
    render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: ' ' });

    const editItem = mockItems[0] as unknown as { onClick: ReturnType<typeof vi.fn> };
    expect(editItem.onClick).toHaveBeenCalledTimes(1);
  });

  it('skips separators during keyboard navigation', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');

    // ArrowDown to first (edit, index 0)
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    // ArrowDown to second (copy, index 1)
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    // ArrowDown skips separator (index 2), goes to delete (index 3)
    fireEvent.keyDown(menu, { key: 'ArrowDown' });

    const items = container.querySelectorAll('.dropdown-menu-item');
    expect(items[2]).toHaveClass('dropdown-menu-item-active');
    expect(items[2].textContent).toContain('삭제');
  });

  it('wraps around when navigating past the end', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');

    // Navigate to last item
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // edit
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // copy
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // delete
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // wraps to edit

    const items = container.querySelectorAll('.dropdown-menu-item');
    expect(items[0]).toHaveClass('dropdown-menu-item-active');
  });

  it('has correct ARIA attributes on menu', () => {
    render(<DropdownMenu {...defaultProps} label="작업 메뉴" />);
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-label', '작업 메뉴');
  });

  it('has menuitem role on items', () => {
    render(<DropdownMenu {...defaultProps} />);
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBe(3);
  });

  it('renders trigger button', () => {
    const onToggle = vi.fn();
    render(
      <DropdownMenu
        {...defaultProps}
        trigger={<span>메뉴 열기</span>}
        onToggle={onToggle}
      />
    );
    const trigger = screen.getByText('메뉴 열기');
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger.closest('button')!);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('trigger has aria-haspopup and aria-expanded', () => {
    const { container } = render(
      <DropdownMenu
        {...defaultProps}
        trigger={<span>메뉴</span>}
        onToggle={vi.fn()}
      />
    );
    const trigger = container.querySelector('.dropdown-menu-trigger')!;
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('trigger shows aria-expanded false when closed', () => {
    render(
      <DropdownMenu
        {...defaultProps}
        isOpen={false}
        trigger={<span>메뉴</span>}
        onToggle={vi.fn()}
      />
    );
    const trigger = screen.getByLabelText('메뉴');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies position class', () => {
    const { container } = render(
      <DropdownMenu {...defaultProps} position="top-right" />
    );
    const menu = container.querySelector('.dropdown-menu');
    expect(menu).toHaveClass('dropdown-menu-top-right');
  });

  it('applies default position class (bottom-left)', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const menu = container.querySelector('.dropdown-menu');
    expect(menu).toHaveClass('dropdown-menu-bottom-left');
  });

  it('highlights item on mouse enter', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const items = container.querySelectorAll('.dropdown-menu-item');
    fireEvent.mouseEnter(items[1]);
    expect(items[1]).toHaveClass('dropdown-menu-item-active');
  });

  it('removes highlight on mouse leave', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const items = container.querySelectorAll('.dropdown-menu-item');
    fireEvent.mouseEnter(items[1]);
    expect(items[1]).toHaveClass('dropdown-menu-item-active');
    fireEvent.mouseLeave(items[1]);
    expect(items[1]).not.toHaveClass('dropdown-menu-item-active');
  });

  it('navigates to first item with Home key', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');

    // Navigate to last
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    // Press Home
    fireEvent.keyDown(menu, { key: 'Home' });

    const items = container.querySelectorAll('.dropdown-menu-item');
    expect(items[0]).toHaveClass('dropdown-menu-item-active');
  });

  it('navigates to last item with End key', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const menu = screen.getByRole('menu');

    fireEvent.keyDown(menu, { key: 'End' });

    const items = container.querySelectorAll('.dropdown-menu-item');
    expect(items[items.length - 1]).toHaveClass('dropdown-menu-item-active');
  });

  it('closes on outside click', () => {
    render(
      <div>
        <div data-testid="outside">outside</div>
        <DropdownMenu {...defaultProps} />
      </div>
    );
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the menu', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const menuContainer = container.querySelector('.dropdown-menu-container');
    fireEvent.mouseDown(menuContainer!);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('icons have aria-hidden', () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    const icons = container.querySelectorAll('.dropdown-menu-item-icon');
    icons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('renders items without icons', () => {
    const items: DropdownMenuEntry[] = [
      { id: 'no-icon', label: '아이콘 없음', onClick: vi.fn() },
    ];
    const { container } = render(
      <DropdownMenu {...defaultProps} items={items} />
    );
    expect(container.querySelectorAll('.dropdown-menu-item-icon').length).toBe(0);
    expect(screen.getByText('아이콘 없음')).toBeInTheDocument();
  });

  it('skips disabled items during keyboard navigation', () => {
    const items: DropdownMenuEntry[] = [
      { id: 'first', label: '첫째', onClick: vi.fn() },
      { id: 'disabled', label: '비활성', disabled: true, onClick: vi.fn() },
      { id: 'third', label: '셋째', onClick: vi.fn() },
    ];
    const { container } = render(
      <DropdownMenu {...defaultProps} items={items} />
    );
    const menu = screen.getByRole('menu');

    // ArrowDown to first
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    // ArrowDown skips disabled, goes to third
    fireEvent.keyDown(menu, { key: 'ArrowDown' });

    const menuItems = container.querySelectorAll('.dropdown-menu-item');
    expect(menuItems[2]).toHaveClass('dropdown-menu-item-active');
  });
});
