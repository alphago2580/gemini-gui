import React, { useState, useCallback, useRef } from 'react';
import './InputHistory.css';
import * as S from '../constants/strings';

export interface InputHistoryProps {
  history: string[];
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxHistorySize?: number;
  ariaLabel?: string;
}

const DEFAULT_MAX_HISTORY = 100;

const InputHistoryInner: React.FC<InputHistoryProps> = ({
  history,
  value,
  onChange,
  onSubmit,
  placeholder = S.INPUT_HISTORY_PLACEHOLDER,
  disabled = false,
  maxHistorySize = DEFAULT_MAX_HISTORY,
  ariaLabel = S.INPUT_HISTORY_ARIA_LABEL,
}) => {
  // historyIndex: -1 means "current draft", 0 = most recent history, 1 = second most recent, etc.
  const [historyIndex, setHistoryIndex] = useState(-1);
  const draftRef = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const effectiveHistory = history.slice(0, maxHistorySize);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'ArrowUp') {
      // Only navigate history when cursor is at the start of text
      const cursorAtStart = textarea.selectionStart === 0 && textarea.selectionEnd === 0;
      if (!cursorAtStart) return;

      if (effectiveHistory.length === 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= effectiveHistory.length) return;

      e.preventDefault();

      // Save current value as draft when leaving the draft position
      if (historyIndex === -1) {
        draftRef.current = value;
      }

      setHistoryIndex(nextIndex);
      onChange(effectiveHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      // Only navigate history when cursor is at the end of text
      const cursorAtEnd = textarea.selectionStart === value.length && textarea.selectionEnd === value.length;
      if (!cursorAtEnd) return;

      if (historyIndex <= -1) return;

      e.preventDefault();

      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);

      if (nextIndex === -1) {
        // Return to draft
        onChange(draftRef.current);
      } else {
        onChange(effectiveHistory[nextIndex]);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && !disabled) {
        onSubmit(trimmed);
        setHistoryIndex(-1);
        draftRef.current = '';
      }
    }
  }, [value, historyIndex, effectiveHistory, onChange, onSubmit, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // When user types, reset to draft mode
    if (historyIndex !== -1) {
      setHistoryIndex(-1);
      draftRef.current = e.target.value;
    }
  }, [onChange, historyIndex]);

  const isInHistory = historyIndex >= 0;
  const historyPosition = isInHistory
    ? `${historyIndex + 1}/${effectiveHistory.length}`
    : null;

  return (
    <div className={`input-history${disabled ? ' input-history--disabled' : ''}`}>
      <textarea
        ref={textareaRef}
        className="input-history__textarea"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        rows={1}
      />
      {isInHistory && (
        <div
          className="input-history__indicator"
          role="status"
          aria-live="polite"
          aria-label={S.INPUT_HISTORY_POSITION(historyIndex + 1, effectiveHistory.length)}
        >
          <span className="input-history__indicator-icon" aria-hidden="true">
            {S.INPUT_HISTORY_ICON}
          </span>
          <span className="input-history__indicator-text">
            {historyPosition}
          </span>
        </div>
      )}
    </div>
  );
};

const InputHistory = React.memo(InputHistoryInner);
export default InputHistory;
