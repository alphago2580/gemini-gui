import React, { useEffect, useRef } from 'react';
import './MessageContextMenu.css';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
}

interface MessageContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({ x, y, items, onSelect, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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

  return (
    <div
      ref={menuRef}
      className="message-context-menu"
      style={{ left: x, top: y }}
      role="menu"
      aria-label="메시지 작업 메뉴"
    >
      {items.map(item => (
        <button
          key={item.id}
          className={`context-menu-item${item.danger ? ' danger' : ''}`}
          role="menuitem"
          onClick={() => {
            onSelect(item.id);
            onClose();
          }}
        >
          <span className="context-menu-icon">{item.icon}</span>
          <span className="context-menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MessageContextMenu;
