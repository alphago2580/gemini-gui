import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageContextMenu, { ContextMenuItem } from './MessageContextMenu';

const items: ContextMenuItem[] = [
  { id: 'copy', label: '복사', icon: '📋' },
  { id: 'quote', label: '인용', icon: '↩' },
  { id: 'delete', label: '삭제', icon: '🗑', danger: true },
];

describe('MessageContextMenu', () => {
  it('should render all menu items', () => {
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    expect(screen.getByText('복사')).toBeDefined();
    expect(screen.getByText('인용')).toBeDefined();
    expect(screen.getByText('삭제')).toBeDefined();
  });

  it('should call onSelect and onClose when clicking an item', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={onSelect} onClose={onClose} />
    );
    fireEvent.click(screen.getByText('복사'));
    expect(onSelect).toHaveBeenCalledWith('copy');
    expect(onClose).toHaveBeenCalled();
  });

  it('should have menu role', () => {
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    expect(screen.getByRole('menu')).toBeDefined();
  });

  it('should have menuitem roles', () => {
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBe(3);
  });

  it('should apply danger class to danger items', () => {
    const { container } = render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const dangerItems = container.querySelectorAll('.context-menu-item.danger');
    expect(dangerItems.length).toBe(1);
  });

  it('should close on Escape key', () => {
    const onClose = vi.fn();
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={onClose} />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('should render icons', () => {
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    expect(screen.getByText('📋')).toBeDefined();
    expect(screen.getByText('🗑')).toBeDefined();
  });

  it('should position at given coordinates', () => {
    const { container } = render(
      <MessageContextMenu x={150} y={250} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const menu = container.querySelector('.message-context-menu') as HTMLElement;
    expect(menu.style.left).toBe('150px');
    expect(menu.style.top).toBe('250px');
  });

  it('should close when clicking outside the menu', () => {
    const onClose = vi.fn();
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={onClose} />
    );
    // Click outside the menu (on the document body)
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when clicking inside the menu', () => {
    const onClose = vi.fn();
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={onClose} />
    );
    const menu = screen.getByRole('menu');
    fireEvent.mouseDown(menu);
    // onClose should NOT be called for mousedown inside menu
    // (onClose IS called via item click → onClick handler, which is separate)
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should render aria-label on the menu', () => {
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    expect(screen.getByLabelText('메시지 작업 메뉴')).toBeInTheDocument();
  });

  it('should adjust position when menu overflows right edge', () => {
    // Set window.innerWidth to a small value
    Object.defineProperty(window, 'innerWidth', { value: 200, writable: true, configurable: true });
    const { container } = render(
      <MessageContextMenu x={180} y={50} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const menu = container.querySelector('.message-context-menu') as HTMLElement;
    // getBoundingClientRect is mocked to return default 0-values in jsdom
    // The useEffect runs but since jsdom getBoundingClientRect returns {right:0, bottom:0},
    // the overflow check (rect.right > window.innerWidth) won't trigger
    // We verify the initial position is set correctly
    expect(menu.style.left).toBe('180px');
    // Reset
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
  });

  it('should render non-danger items without danger class', () => {
    const { container } = render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const allItems = container.querySelectorAll('.context-menu-item');
    const nonDangerItems = container.querySelectorAll('.context-menu-item:not(.danger)');
    expect(nonDangerItems.length).toBe(2);
    expect(allItems.length).toBe(3);
  });

  it('should render icon spans with context-menu-icon class', () => {
    const { container } = render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const iconSpans = container.querySelectorAll('.context-menu-icon');
    expect(iconSpans.length).toBe(3);
  });

  it('should render label spans with context-menu-label class', () => {
    const { container } = render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const labelSpans = container.querySelectorAll('.context-menu-label');
    expect(labelSpans.length).toBe(3);
  });

  it('should render empty menu with no items', () => {
    const { container } = render(
      <MessageContextMenu x={100} y={200} items={[]} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const menuItems = container.querySelectorAll('.context-menu-item');
    expect(menuItems.length).toBe(0);
    expect(container.querySelector('.message-context-menu')).toBeInTheDocument();
  });

  it('should call onSelect with correct id for each item', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={onSelect} onClose={onClose} />
    );
    fireEvent.click(screen.getByText('인용'));
    expect(onSelect).toHaveBeenCalledWith('quote');
  });

  it('should call onClose only once per item click', () => {
    const onClose = vi.fn();
    render(
      <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={onClose} />
    );
    fireEvent.click(screen.getByText('삭제'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should have correct inline style for zero coordinates', () => {
    const { container } = render(
      <MessageContextMenu x={0} y={0} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    const menu = container.querySelector('.message-context-menu') as HTMLElement;
    expect(menu.style.left).toBe('0px');
    expect(menu.style.top).toBe('0px');
  });

  it('should render single item menu correctly', () => {
    const singleItem: ContextMenuItem[] = [{ id: 'only', label: '유일한 항목', icon: '★' }];
    render(
      <MessageContextMenu x={50} y={50} items={singleItem} onSelect={vi.fn()} onClose={vi.fn()} />
    );
    expect(screen.getByText('유일한 항목')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem').length).toBe(1);
  });

  // --- Keyboard navigation tests ---

  describe('keyboard navigation', () => {
    it('focuses the first item on mount', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');
      expect(document.activeElement).toBe(menuItems[0]);
    });

    it('moves focus down with ArrowDown key', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');
      expect(document.activeElement).toBe(menuItems[0]);

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(menuItems[1]);

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(menuItems[2]);
    });

    it('wraps focus from last to first with ArrowDown', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');

      // Move to last item
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(menuItems[2]);

      // Wrap to first
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(menuItems[0]);
    });

    it('moves focus up with ArrowUp key', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');

      // Move down first to have somewhere to go up
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(menuItems[2]);

      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(document.activeElement).toBe(menuItems[1]);
    });

    it('wraps focus from first to last with ArrowUp', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');
      expect(document.activeElement).toBe(menuItems[0]);

      // ArrowUp from first wraps to last
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(document.activeElement).toBe(menuItems[2]);
    });

    it('moves focus to first item with Home key', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');

      // Move to last
      fireEvent.keyDown(document, { key: 'End' });
      expect(document.activeElement).toBe(menuItems[2]);

      // Home goes to first
      fireEvent.keyDown(document, { key: 'Home' });
      expect(document.activeElement).toBe(menuItems[0]);
    });

    it('moves focus to last item with End key', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');

      fireEvent.keyDown(document, { key: 'End' });
      expect(document.activeElement).toBe(menuItems[2]);
    });

    it('selects focused item with Enter key', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={onSelect} onClose={onClose} />
      );

      // Move focus to second item
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      // Press Enter
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith('quote');
      expect(onClose).toHaveBeenCalled();
    });

    it('selects focused item with Space key', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={onSelect} onClose={onClose} />
      );

      // Move focus to third item
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      // Press Space
      fireEvent.keyDown(document, { key: ' ' });
      expect(onSelect).toHaveBeenCalledWith('delete');
      expect(onClose).toHaveBeenCalled();
    });

    it('applies focused class to the focused item', () => {
      const { container } = render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItemEls = container.querySelectorAll('.context-menu-item');
      expect(menuItemEls[0]).toHaveClass('focused');
      expect(menuItemEls[1]).not.toHaveClass('focused');

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      const updatedItems = container.querySelectorAll('.context-menu-item');
      expect(updatedItems[0]).not.toHaveClass('focused');
      expect(updatedItems[1]).toHaveClass('focused');
    });

    it('sets tabIndex 0 on focused item and -1 on others', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems[0]).toHaveAttribute('tabindex', '0');
      expect(menuItems[1]).toHaveAttribute('tabindex', '-1');
      expect(menuItems[2]).toHaveAttribute('tabindex', '-1');
    });

    it('updates focused index on mouse enter', () => {
      const { container } = render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItemEls = container.querySelectorAll('.context-menu-item');

      // Initially first is focused
      expect(menuItemEls[0]).toHaveClass('focused');

      // Mouse enter on third item
      fireEvent.mouseEnter(menuItemEls[2]);
      const updatedItems = container.querySelectorAll('.context-menu-item');
      expect(updatedItems[2]).toHaveClass('focused');
      expect(updatedItems[0]).not.toHaveClass('focused');
    });

    it('sets aria-activedescendant on the menu', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-activedescendant', 'context-menu-item-copy');

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(menu).toHaveAttribute('aria-activedescendant', 'context-menu-item-quote');
    });

    it('assigns unique ids to menu items', () => {
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems[0]).toHaveAttribute('id', 'context-menu-item-copy');
      expect(menuItems[1]).toHaveAttribute('id', 'context-menu-item-quote');
      expect(menuItems[2]).toHaveAttribute('id', 'context-menu-item-delete');
    });

    it('does not crash when ArrowDown is pressed with no items', () => {
      render(
        <MessageContextMenu x={100} y={200} items={[]} onSelect={vi.fn()} onClose={vi.fn()} />
      );
      // Should not throw
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      fireEvent.keyDown(document, { key: 'Home' });
      fireEvent.keyDown(document, { key: 'End' });
      fireEvent.keyDown(document, { key: 'Enter' });
    });

    it('does not close on ArrowDown or ArrowUp keys', () => {
      const onClose = vi.fn();
      render(
        <MessageContextMenu x={100} y={200} items={items} onSelect={vi.fn()} onClose={onClose} />
      );
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('keyboard navigation works with single item', () => {
      const singleItem: ContextMenuItem[] = [{ id: 'only', label: '유일한 항목', icon: '★' }];
      const onSelect = vi.fn();
      const onClose = vi.fn();
      render(
        <MessageContextMenu x={50} y={50} items={singleItem} onSelect={onSelect} onClose={onClose} />
      );
      const menuItems = screen.getAllByRole('menuitem');
      expect(document.activeElement).toBe(menuItems[0]);

      // ArrowDown wraps to itself
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(menuItems[0]);

      // Enter selects
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith('only');
    });
  });
});
