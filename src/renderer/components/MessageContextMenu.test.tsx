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
});
