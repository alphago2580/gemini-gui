import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './CommandPalette.css';
import * as S from '../constants/strings';
import { fuzzySearchBy } from '../utils/fuzzySearch';
import type { FuzzyMatch } from '../utils/fuzzySearch';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

interface MatchedCommand {
  command: Command;
  matchedIndices: number[];
}

/**
 * Render a label with matched characters highlighted.
 * Characters at matchedIndices are wrapped in <mark> tags.
 */
function HighlightedLabel({ label, matchedIndices }: { label: string; matchedIndices: number[] }): React.ReactElement {
  if (matchedIndices.length === 0) {
    return <>{label}</>;
  }

  const indexSet = new Set(matchedIndices);
  const chars = Array.from(label);
  const parts: React.ReactNode[] = [];
  let currentRun = '';
  let currentIsHighlight = false;

  for (let i = 0; i < chars.length; i++) {
    const isHighlight = indexSet.has(i);
    if (i === 0) {
      currentIsHighlight = isHighlight;
      currentRun = chars[i];
    } else if (isHighlight === currentIsHighlight) {
      currentRun += chars[i];
    } else {
      if (currentIsHighlight) {
        parts.push(<mark key={parts.length} className="command-match">{currentRun}</mark>);
      } else {
        parts.push(currentRun);
      }
      currentRun = chars[i];
      currentIsHighlight = isHighlight;
    }
  }

  // Flush remaining run
  if (currentRun) {
    if (currentIsHighlight) {
      parts.push(<mark key={parts.length} className="command-match">{currentRun}</mark>);
    } else {
      parts.push(currentRun);
    }
  }

  return <>{parts}</>;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const matchedCommands = useMemo((): MatchedCommand[] => {
    if (!query.trim()) {
      return commands.map(cmd => ({ command: cmd, matchedIndices: [] }));
    }
    const results: FuzzyMatch<Command>[] = fuzzySearchBy(commands, query.trim(), cmd => cmd.label);
    return results.map(r => ({ command: r.item, matchedIndices: r.matchedIndices }));
  }, [query, commands]);

  const filteredCommands = useMemo(
    () => matchedCommands.map(m => m.command),
    [matchedCommands]
  );

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after render
      const rafId = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(rafId);
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
            {matchedCommands.map(({ command: cmd, matchedIndices }, index) => (
              <li
                key={cmd.id}
                id={`cmd-${cmd.id}`}
                className={`command-palette-item${index === selectedIndex ? ' selected' : ''}`}
                onClick={() => executeCommand(cmd)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <span className="command-label">
                  <HighlightedLabel label={cmd.label} matchedIndices={matchedIndices} />
                </span>
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
