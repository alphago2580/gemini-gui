import React, { useState, useCallback, useRef, useMemo } from 'react';
import './TagInput.css';

export type TagInputSize = 'small' | 'medium' | 'large';
export type TagInputVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface TagInputProps {
  tags?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
  allowDuplicates?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: TagInputSize;
  variant?: TagInputVariant;
  separator?: string[];
  validateTag?: (tag: string) => boolean;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  label?: string;
  id?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  onChange,
  placeholder = '태그 입력...',
  maxTags,
  maxLength,
  allowDuplicates = false,
  disabled = false,
  readOnly = false,
  size = 'medium',
  variant = 'default',
  separator = ['Enter', ','],
  validateTag,
  onTagAdd,
  onTagRemove,
  label,
  id,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [focusedTagIndex, setFocusedTagIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMaxReached = useMemo(
    () => maxTags !== undefined && tags.length >= maxTags,
    [maxTags, tags.length]
  );

  const addTag = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (maxLength && trimmed.length > maxLength) return false;
    if (!allowDuplicates && tags.includes(trimmed)) return false;
    if (isMaxReached) return false;
    if (validateTag && !validateTag(trimmed)) return false;

    const newTags = [...tags, trimmed];
    onChange?.(newTags);
    onTagAdd?.(trimmed);
    return true;
  }, [tags, onChange, onTagAdd, allowDuplicates, isMaxReached, maxLength, validateTag]);

  const removeTag = useCallback((index: number) => {
    if (readOnly || disabled) return;
    const removed = tags[index];
    const newTags = tags.filter((_, i) => i !== index);
    onChange?.(newTags);
    onTagRemove?.(removed);
    setFocusedTagIndex(-1);
    inputRef.current?.focus();
  }, [tags, onChange, onTagRemove, readOnly, disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Check if the last character is a separator (comma)
    if (separator.includes(',') && value.endsWith(',')) {
      const tagValue = value.slice(0, -1);
      if (tagValue.trim()) {
        addTag(tagValue);
        setInputValue('');
      }
      return;
    }
    setInputValue(value);
  }, [separator, addTag]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (separator.includes(e.key) && e.key !== ',') {
      if (inputValue.trim()) {
        e.preventDefault();
        if (addTag(inputValue)) {
          setInputValue('');
        }
      }
      return;
    }

    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      e.preventDefault();
      if (focusedTagIndex >= 0) {
        removeTag(focusedTagIndex);
      } else {
        setFocusedTagIndex(tags.length - 1);
      }
      return;
    }

    if (e.key === 'ArrowLeft' && inputValue === '' && tags.length > 0) {
      e.preventDefault();
      setFocusedTagIndex(prev =>
        prev <= 0 ? 0 : prev - 1
      );
      return;
    }

    if (e.key === 'ArrowRight' && inputValue === '') {
      e.preventDefault();
      if (focusedTagIndex >= 0) {
        if (focusedTagIndex >= tags.length - 1) {
          setFocusedTagIndex(-1);
        } else {
          setFocusedTagIndex(prev => prev + 1);
        }
      }
      return;
    }

    if (e.key === 'Delete' && focusedTagIndex >= 0) {
      e.preventDefault();
      removeTag(focusedTagIndex);
      return;
    }

    // Typing a character resets tag focus
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setFocusedTagIndex(-1);
    }
  }, [inputValue, tags.length, focusedTagIndex, separator, addTag, removeTag]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text');
    // Check if paste data contains separators (commas)
    if (separator.includes(',') && pasteData.includes(',')) {
      e.preventDefault();
      const pastedTags = pasteData.split(',');
      for (const tag of pastedTags) {
        addTag(tag);
      }
    }
  }, [separator, addTag]);

  const handleContainerClick = useCallback(() => {
    if (!disabled && !readOnly) {
      inputRef.current?.focus();
      setFocusedTagIndex(-1);
    }
  }, [disabled, readOnly]);

  const handleTagClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (!disabled && !readOnly) {
      setFocusedTagIndex(index);
      inputRef.current?.focus();
    }
  }, [disabled, readOnly]);

  const className = [
    'tag-input',
    `tag-input--${size}`,
    `tag-input--${variant}`,
    disabled ? 'tag-input--disabled' : '',
    readOnly ? 'tag-input--readonly' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="tag-input-wrapper">
      {label && (
        <label className="tag-input-label" htmlFor={id || 'tag-input-field'}>
          {label}
        </label>
      )}
      <div
        className={className}
        onClick={handleContainerClick}
        role="group"
        aria-label={label || '태그 입력'}
      >
        <div className="tag-input-tags" role="list">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={`tag-input-tag${focusedTagIndex === index ? ' tag-input-tag--focused' : ''}`}
              role="listitem"
              onClick={e => handleTagClick(e, index)}
              aria-label={tag}
            >
              <span className="tag-input-tag-text">{tag}</span>
              {!readOnly && !disabled && (
                <button
                  className="tag-input-tag-remove"
                  onClick={e => {
                    e.stopPropagation();
                    removeTag(index);
                  }}
                  aria-label={`${tag} 삭제`}
                  type="button"
                  tabIndex={-1}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        {!readOnly && (
          <input
            ref={inputRef}
            id={id || 'tag-input-field'}
            className="tag-input-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled || isMaxReached}
            aria-label="새 태그 추가"
          />
        )}
      </div>
      {maxTags !== undefined && (
        <span className="tag-input-count" aria-live="polite">
          {tags.length}/{maxTags}
        </span>
      )}
    </div>
  );
};

export default React.memo(TagInput);
