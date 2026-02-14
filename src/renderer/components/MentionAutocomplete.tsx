import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import './MentionAutocomplete.css';

export interface MentionCommand {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  commands: MentionCommand[];
  placeholder?: string;
  disabled?: boolean;
  onSubmit?: (value: string) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  triggerChar?: string;
  maxSuggestions?: number;
  ariaLabel?: string;
  inputId?: string;
  inputClassName?: string;
}

interface MentionState {
  isActive: boolean;
  startIndex: number;
  query: string;
}

const INITIAL_MENTION_STATE: MentionState = {
  isActive: false,
  startIndex: -1,
  query: '',
};

const MentionAutocomplete = forwardRef<HTMLTextAreaElement, MentionAutocompleteProps>(({
  value,
  onChange,
  commands,
  placeholder = '메시지를 입력하세요... (@로 명령어 검색)',
  disabled = false,
  onSubmit,
  onPaste,
  triggerChar = '@',
  maxSuggestions = 8,
  ariaLabel = '멘션 자동완성 입력',
  inputId,
  inputClassName,
}, ref) => {
  const [mentionState, setMentionState] = useState<MentionState>(INITIAL_MENTION_STATE);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  const filteredCommands = useMemo(() => {
    if (!mentionState.isActive) return [];
    const q = mentionState.query.toLowerCase();
    const filtered = commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.id.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q))
    );
    return filtered.slice(0, maxSuggestions);
  }, [mentionState.isActive, mentionState.query, commands, maxSuggestions]);

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!dropdownRef.current || selectedIndex < 0) return;
    const items = dropdownRef.current.querySelectorAll('[role="option"]');
    const activeEl = items[selectedIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Close mention dropdown on outside click
  useEffect(() => {
    if (!mentionState.isActive) return;

    const handleClickOutside = (e: MouseEvent) => {
      const textarea = textareaRef.current;
      const dropdown = dropdownRef.current;
      if (
        textarea && !textarea.contains(e.target as Node) &&
        dropdown && !dropdown.contains(e.target as Node)
      ) {
        setMentionState(INITIAL_MENTION_STATE);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mentionState.isActive]);

  const detectMention = useCallback((text: string, cursorPos: number) => {
    // Search backwards from cursor for the trigger character
    for (let i = cursorPos - 1; i >= 0; i--) {
      const ch = text[i];
      // Found trigger char — check if at start or preceded by whitespace
      if (ch === triggerChar) {
        if (i === 0 || /\s/.test(text[i - 1])) {
          const query = text.slice(i + 1, cursorPos);
          // Don't activate if query contains whitespace (user moved past the mention)
          if (/\s/.test(query)) break;
          return { isActive: true, startIndex: i, query };
        }
        break;
      }
      // Hit whitespace before finding trigger — no mention
      if (/\s/.test(ch)) break;
    }
    return INITIAL_MENTION_STATE;
  }, [triggerChar]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(newValue);
    setMentionState(detectMention(newValue, cursorPos));
  }, [onChange, detectMention]);

  const insertMention = useCallback((command: MentionCommand) => {
    const { startIndex } = mentionState;
    if (startIndex < 0) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea?.selectionStart ?? value.length;
    const before = value.slice(0, startIndex);
    const after = value.slice(cursorPos);
    const mention = `${triggerChar}${command.id} `;
    const newValue = before + mention + after;

    onChange(newValue);
    setMentionState(INITIAL_MENTION_STATE);

    // Restore cursor position after the inserted mention
    requestAnimationFrame(() => {
      if (textarea) {
        const newCursorPos = startIndex + mention.length;
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
        textarea.focus();
      }
    });
  }, [mentionState, value, triggerChar, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionState.isActive && filteredCommands.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          return;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            insertMention(filteredCommands[selectedIndex]);
          }
          return;
        case 'Escape':
          e.preventDefault();
          setMentionState(INITIAL_MENTION_STATE);
          return;
        case 'Tab':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            insertMention(filteredCommands[selectedIndex]);
          }
          return;
      }
    }

    // Submit on Enter (without Shift) when no mention is active
    if (e.key === 'Enter' && !e.shiftKey && !mentionState.isActive) {
      e.preventDefault();
      if (onSubmit && value.trim()) {
        onSubmit(value);
      }
    }
  }, [mentionState.isActive, filteredCommands, selectedIndex, insertMention, onSubmit, value]);

  const handleSelect = useCallback((command: MentionCommand) => {
    insertMention(command);
  }, [insertMention]);

  const listId = useMemo(() => `mention-list-${Math.random().toString(36).slice(2, 9)}`, []);

  const showDropdown = mentionState.isActive && filteredCommands.length > 0;

  return (
    <div className={`mention-autocomplete ${disabled ? 'mention-autocomplete--disabled' : ''}`}>
      <textarea
        ref={textareaRef}
        id={inputId}
        className={inputClassName ? `mention-autocomplete-input ${inputClassName}` : 'mention-autocomplete-input'}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? listId : undefined}
        aria-activedescendant={
          showDropdown && selectedIndex >= 0
            ? `${listId}-option-${selectedIndex}`
            : undefined
        }
        aria-autocomplete="list"
        aria-haspopup="listbox"
        rows={1}
      />

      {showDropdown && (
        <ul
          ref={dropdownRef}
          id={listId}
          className="mention-autocomplete-dropdown"
          role="listbox"
          aria-label="명령어 추천"
        >
          {filteredCommands.map((cmd, index) => (
            <li
              key={cmd.id}
              id={`${listId}-option-${index}`}
              className={`mention-autocomplete-option ${
                index === selectedIndex ? 'mention-autocomplete-option--active' : ''
              }`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(cmd)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {cmd.icon && (
                <span className="mention-autocomplete-option-icon" aria-hidden="true">
                  {cmd.icon}
                </span>
              )}
              <div className="mention-autocomplete-option-content">
                <span className="mention-autocomplete-option-label">
                  {triggerChar}{cmd.id}
                </span>
                {cmd.description && (
                  <span className="mention-autocomplete-option-description">
                    {cmd.description}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

MentionAutocomplete.displayName = 'MentionAutocomplete';

export default React.memo(MentionAutocomplete);
