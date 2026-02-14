import React, { useEffect, useRef, useState, useCallback } from 'react';
import './MessageContextMenu.css';
import * as S from '../constants/strings';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
}

export interface MessageContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({ x, y, items, onSelect, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  // Focus the first item when the menu opens
  useEffect(() => {
    if (items.length > 0 && itemRefs.current[0]) {
      itemRefs.current[0].focus();
    }
  }, [items.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = (focusedIndex + 1) % items.length;
        setFocusedIndex(next);
        itemRefs.current[next]?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = (focusedIndex - 1 + items.length) % items.length;
        setFocusedIndex(prev);
        itemRefs.current[prev]?.focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        setFocusedIndex(0);
        itemRefs.current[0]?.focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        const last = items.length - 1;
        setFocusedIndex(last);
        itemRefs.current[last]?.focus();
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onSelect(items[focusedIndex].id);
          onClose();
        }
        break;
      }
    }
  }, [focusedIndex, items, onClose, onSelect]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, handleKeyDown]);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const setItemRef = useCallback((index: number) => (el: HTMLButtonElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  return (
    <div
      ref={menuRef}
      className="message-context-menu"
      style={{ left: x, top: y }}
      role="menu"
      aria-label={S.CTX_MENU_LABEL}
      aria-activedescendant={items.length > 0 ? `context-menu-item-${items[focusedIndex]?.id}` : undefined}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          id={`context-menu-item-${item.id}`}
          ref={setItemRef(index)}
          className={`context-menu-item${item.danger ? ' danger' : ''}${index === focusedIndex ? ' focused' : ''}`}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
          onClick={() => {
            onSelect(item.id);
            onClose();
          }}
          onMouseEnter={() => {
            setFocusedIndex(index);
          }}
        >
          <span className="context-menu-icon">{item.icon}</span>
          <span className="context-menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default React.memo(MessageContextMenu);
