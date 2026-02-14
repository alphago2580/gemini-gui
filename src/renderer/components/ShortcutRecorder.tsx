import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ShortcutRecorder.css';
import * as S from '../constants/strings';

export interface ShortcutRecorderProps {
  value: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta']);

const DISPLAY_NAMES: Record<string, string> = {
  Control: 'Ctrl',
  Shift: '⇧',
  Alt: 'Alt',
  Meta: 'Cmd',
  ' ': 'Space',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Escape: 'Esc',
  Backspace: '⌫',
  Delete: '⌦',
  Enter: '↵',
  Tab: '⇥',
};

function getDisplayName(key: string): string {
  return DISPLAY_NAMES[key] ?? key;
}

/** Normalize a keyboard event into an ordered list of keys. */
function keysFromEvent(e: KeyboardEvent): string[] {
  const keys: string[] = [];
  if (e.ctrlKey) keys.push('Control');
  if (e.shiftKey) keys.push('Shift');
  if (e.altKey) keys.push('Alt');
  if (e.metaKey) keys.push('Meta');

  if (!MODIFIER_KEYS.has(e.key)) {
    keys.push(e.key);
  }

  return keys;
}

const ShortcutRecorder: React.FC<ShortcutRecorderProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder,
}) => {
  const [recording, setRecording] = useState(false);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const recorderRef = useRef<HTMLDivElement>(null);

  const startRecording = useCallback(() => {
    if (disabled) return;
    setRecording(true);
    setPendingKeys([]);
  }, [disabled]);

  const stopRecording = useCallback(() => {
    setRecording(false);
    if (pendingKeys.length > 0) {
      onChange(pendingKeys);
    }
    setPendingKeys([]);
  }, [pendingKeys, onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setRecording(false);
    setPendingKeys([]);
  }, [onChange]);

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape' && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
        setRecording(false);
        setPendingKeys([]);
        return;
      }

      const keys = keysFromEvent(e);
      setPendingKeys(keys);

      // Auto-confirm when a non-modifier key is pressed with at least one modifier
      const hasModifier = keys.some(k => MODIFIER_KEYS.has(k));
      const hasNonModifier = keys.some(k => !MODIFIER_KEYS.has(k));
      if (hasModifier && hasNonModifier) {
        onChange(keys);
        setRecording(false);
        setPendingKeys([]);
      }
    };

    const handleKeyUp = () => {
      // If only modifier keys were held and released, keep recording
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [recording, onChange]);

  // Stop recording on outside click
  useEffect(() => {
    if (!recording) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (recorderRef.current && !recorderRef.current.contains(e.target as Node)) {
        stopRecording();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [recording, stopRecording]);

  const displayKeys = recording ? pendingKeys : value;
  const isEmpty = displayKeys.length === 0;

  const containerClass = [
    'shortcut-recorder',
    recording ? 'shortcut-recorder--recording' : '',
    disabled ? 'shortcut-recorder--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={recorderRef}
      className={containerClass}
      onClick={startRecording}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={S.ARIA_SHORTCUT_RECORDER}
      aria-disabled={disabled}
      aria-live="polite"
      onKeyDown={(e) => {
        if (!recording && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          startRecording();
        }
      }}
    >
      <div className="shortcut-recorder-display">
        {recording && isEmpty && (
          <span className="shortcut-recorder-hint">
            {S.SHORTCUT_RECORDER_RECORDING}
          </span>
        )}
        {!recording && isEmpty && (
          <span className="shortcut-recorder-placeholder">
            {placeholder ?? S.SHORTCUT_RECORDER_PLACEHOLDER}
          </span>
        )}
        {!isEmpty && (
          <span className="shortcut-recorder-keys">
            {displayKeys.map((key, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="shortcut-recorder-separator">+</span>}
                <kbd className="shortcut-recorder-key">{getDisplayName(key)}</kbd>
              </React.Fragment>
            ))}
          </span>
        )}
      </div>
      {value.length > 0 && !disabled && (
        <button
          className="shortcut-recorder-clear"
          onClick={handleClear}
          aria-label={S.ARIA_SHORTCUT_RECORDER_CLEAR}
          type="button"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default React.memo(ShortcutRecorder);
