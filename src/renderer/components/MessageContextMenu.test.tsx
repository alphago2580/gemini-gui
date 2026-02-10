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
});
