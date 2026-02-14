import React, { useState, useCallback, useRef, useEffect } from 'react';
import './SortableList.css';

export interface SortableItem {
  id: string;
  content: React.ReactNode;
}

export interface SortableListProps {
  items: SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  disabled?: boolean;
  showHandle?: boolean;
  label?: string;
  id?: string;
}

const SortableList: React.FC<SortableListProps> = ({
  items,
  onReorder,
  disabled = false,
  showHandle = true,
  label,
  id,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (disabled) return;
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    // Small delay so the dragged element gets the class
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = undefined;
      if (dragNodeRef.current) {
        dragNodeRef.current.classList.add('sortable-list-item--dragging');
      }
    });
  }, [disabled]);

  const handleDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.classList.remove('sortable-list-item--dragging');
    }
    setDragIndex(null);
    setOverIndex(null);
    dragNodeRef.current = null;
  }, []);

  const handleDrop = useCallback((dropIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      handleDragEnd();
      return;
    }
    const newItems = [...items];
    const [moved] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, moved);
    onReorder(newItems);
    handleDragEnd();
  }, [dragIndex, items, onReorder, handleDragEnd]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (disabled) return;
    let newIndex: number | null = null;

    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      newIndex = index - 1;
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault();
      newIndex = index + 1;
    }

    if (newIndex !== null) {
      const newItems = [...items];
      const [moved] = newItems.splice(index, 1);
      newItems.splice(newIndex, 0, moved);
      onReorder(newItems);
    }
  }, [disabled, items, onReorder]);

  const classNames = [
    'sortable-list',
    disabled ? 'sortable-list--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      id={id}
      className={classNames}
      role="listbox"
      aria-label={label || '정렬 가능한 목록'}
    >
      {items.map((item, index) => {
        const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;
        return (
          <div
            key={item.id}
            className={`sortable-list-item${isOver ? ' sortable-list-item--over' : ''}`}
            role="option"
            aria-selected={false}
            aria-label={`항목 ${index + 1}`}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(index, e)}
            onDragOver={(e) => handleDragOver(index, e)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(index, e)}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => handleKeyDown(index, e)}
          >
            {showHandle && (
              <span className="sortable-list-handle" aria-hidden="true">⠿</span>
            )}
            <span className="sortable-list-content">{item.content}</span>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(SortableList);
