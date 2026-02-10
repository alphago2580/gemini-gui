import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './CommandPalette.css';
import * as S from '../constants/strings';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => cmd.label.toLowerCase().includes(lowerQuery));
  }, [query, commands]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after render
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Keep selectedIndex in bounds
  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1));
    }
  }, [filteredCommands.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const executeCommand = useCallback((cmd: Command) => {
    onClose();
    cmd.action();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, executeCommand, onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={S.COMMAND_PALETTE_LABEL}>
      <div className="command-palette" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <input
          ref={inputRef}
          className="command-palette-input"
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder={S.COMMAND_SEARCH_PLACEHOLDER}
          aria-label={S.ARIA_COMMAND_SEARCH}
          aria-activedescendant={filteredCommands[selectedIndex] ? `cmd-${filteredCommands[selectedIndex].id}` : undefined}
          role="combobox"
          aria-expanded="true"
          aria-controls="command-list"
          aria-autocomplete="list"
        />
        {filteredCommands.length === 0 ? (
          <div className="command-palette-empty">{S.COMMAND_EMPTY}</div>
        ) : (
          <ul ref={listRef} className="command-palette-list" id="command-list" role="listbox">
            {filteredCommands.map((cmd, index) => (
              <li
                key={cmd.id}
                id={`cmd-${cmd.id}`}
                className={`command-palette-item${index === selectedIndex ? ' selected' : ''}`}
                onClick={() => executeCommand(cmd)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <span className="command-label">{cmd.label}</span>
                {cmd.shortcut && <span className="command-shortcut">{cmd.shortcut}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default React.memo(CommandPalette);
