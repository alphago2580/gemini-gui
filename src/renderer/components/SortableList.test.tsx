import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SortableList, { SortableItem } from './SortableList';

const items: SortableItem[] = [
  { id: '1', content: 'Item A' },
  { id: '2', content: 'Item B' },
  { id: '3', content: 'Item C' },
];

describe('SortableList', () => {
  // -- Rendering --
  it('renders with role="listbox"', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders all items', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByText('Item C')).toBeInTheDocument();
  });

  it('renders options with role="option"', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('has default aria-label', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', '정렬 가능한 목록');
  });

  it('uses custom label', () => {
    render(<SortableList items={items} onReorder={() => {}} label="할일 목록" />);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', '할일 목록');
  });

  it('applies custom id', () => {
    render(<SortableList items={items} onReorder={() => {}} id="my-list" />);
    expect(screen.getByRole('listbox')).toHaveAttribute('id', 'my-list');
  });

  it('renders empty list', () => {
    render(<SortableList items={[]} onReorder={() => {}} />);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  // -- Handle --
  it('shows drag handles by default', () => {
    const { container } = render(<SortableList items={items} onReorder={() => {}} />);
    const handles = container.querySelectorAll('.sortable-list-handle');
    expect(handles).toHaveLength(3);
  });

  it('hides handles when showHandle=false', () => {
    const { container } = render(<SortableList items={items} onReorder={() => {}} showHandle={false} />);
    const handles = container.querySelectorAll('.sortable-list-handle');
    expect(handles).toHaveLength(0);
  });

  it('handle has aria-hidden', () => {
    const { container } = render(<SortableList items={items} onReorder={() => {}} />);
    const handle = container.querySelector('.sortable-list-handle');
    expect(handle).toHaveAttribute('aria-hidden', 'true');
  });

  // -- Items draggable --
  it('items are draggable', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    const options = screen.getAllByRole('option');
    options.forEach(opt => expect(opt).toHaveAttribute('draggable', 'true'));
  });

  it('items not draggable when disabled', () => {
    render(<SortableList items={items} onReorder={() => {}} disabled />);
    const options = screen.getAllByRole('option');
    options.forEach(opt => expect(opt).toHaveAttribute('draggable', 'false'));
  });

  // -- Keyboard navigation --
  it('moves item down on ArrowDown', () => {
    const onReorder = vi.fn();
    render(<SortableList items={items} onReorder={onReorder} />);
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[0], { key: 'ArrowDown' });
    expect(onReorder).toHaveBeenCalledTimes(1);
    const reordered = onReorder.mock.calls[0][0];
    expect(reordered[0].id).toBe('2');
    expect(reordered[1].id).toBe('1');
    expect(reordered[2].id).toBe('3');
  });

  it('moves item up on ArrowUp', () => {
    const onReorder = vi.fn();
    render(<SortableList items={items} onReorder={onReorder} />);
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[2], { key: 'ArrowUp' });
    expect(onReorder).toHaveBeenCalledTimes(1);
    const reordered = onReorder.mock.calls[0][0];
    expect(reordered[0].id).toBe('1');
    expect(reordered[1].id).toBe('3');
    expect(reordered[2].id).toBe('2');
  });

  it('does not move first item up', () => {
    const onReorder = vi.fn();
    render(<SortableList items={items} onReorder={onReorder} />);
    fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'ArrowUp' });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not move last item down', () => {
    const onReorder = vi.fn();
    render(<SortableList items={items} onReorder={onReorder} />);
    fireEvent.keyDown(screen.getAllByRole('option')[2], { key: 'ArrowDown' });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not respond to keyboard when disabled', () => {
    const onReorder = vi.fn();
    render(<SortableList items={items} onReorder={onReorder} disabled />);
    fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'ArrowDown' });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('ignores unrelated keys', () => {
    const onReorder = vi.fn();
    render(<SortableList items={items} onReorder={onReorder} />);
    fireEvent.keyDown(screen.getAllByRole('option')[1], { key: 'a' });
    expect(onReorder).not.toHaveBeenCalled();
  });

  // -- Disabled --
  it('applies disabled CSS class', () => {
    render(<SortableList items={items} onReorder={() => {}} disabled />);
    expect(screen.getByRole('listbox')).toHaveClass('sortable-list--disabled');
  });

  it('has tabIndex=-1 when disabled', () => {
    render(<SortableList items={items} onReorder={() => {}} disabled />);
    const options = screen.getAllByRole('option');
    options.forEach(opt => expect(opt).toHaveAttribute('tabindex', '-1'));
  });

  it('has tabIndex=0 when enabled', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    const options = screen.getAllByRole('option');
    options.forEach(opt => expect(opt).toHaveAttribute('tabindex', '0'));
  });

  // -- Aria labels --
  it('each item has position aria-label', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-label', '항목 1');
    expect(options[1]).toHaveAttribute('aria-label', '항목 2');
    expect(options[2]).toHaveAttribute('aria-label', '항목 3');
  });

  // -- CSS class --
  it('applies sortable-list class', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    expect(screen.getByRole('listbox')).toHaveClass('sortable-list');
  });

  it('items have sortable-list-item class', () => {
    const { container } = render(<SortableList items={items} onReorder={() => {}} />);
    const listItems = container.querySelectorAll('.sortable-list-item');
    expect(listItems).toHaveLength(3);
  });

  it('content wrapped in sortable-list-content', () => {
    const { container } = render(<SortableList items={items} onReorder={() => {}} />);
    const contents = container.querySelectorAll('.sortable-list-content');
    expect(contents).toHaveLength(3);
    expect(contents[0].textContent).toBe('Item A');
  });

  // -- Drag events --
  it('sets dataTransfer on drag start', () => {
    render(<SortableList items={items} onReorder={() => {}} />);
    const options = screen.getAllByRole('option');
    const dataTransfer = { effectAllowed: '', setData: vi.fn() };
    fireEvent.dragStart(options[0], { dataTransfer });
    expect(dataTransfer.effectAllowed).toBe('move');
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '0');
  });

  it('reorders on drop', () => {
    const onReorder = vi.fn();
    render(<SortableList items={items} onReorder={onReorder} />);
    const options = screen.getAllByRole('option');
    // Simulate drag item 0 to position 2
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData: vi.fn(), getData: vi.fn(() => '0') };
    fireEvent.dragStart(options[0], { dataTransfer });
    fireEvent.dragOver(options[2], { dataTransfer });
    fireEvent.drop(options[2], { dataTransfer });
    expect(onReorder).toHaveBeenCalledTimes(1);
    const reordered = onReorder.mock.calls[0][0];
    expect(reordered[0].id).toBe('2');
    expect(reordered[1].id).toBe('3');
    expect(reordered[2].id).toBe('1');
  });

  it('does not reorder when dropping on same position', () => {
    const onReorder = vi.fn();
    render(<SortableList items={items} onReorder={onReorder} />);
    const options = screen.getAllByRole('option');
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData: vi.fn(), getData: vi.fn(() => '1') };
    fireEvent.dragStart(options[1], { dataTransfer });
    fireEvent.drop(options[1], { dataTransfer });
    expect(onReorder).not.toHaveBeenCalled();
  });
});
