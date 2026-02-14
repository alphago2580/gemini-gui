import React, { useState, useCallback, useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import './MarkdownEditor.css';
import * as S from '../constants/strings';

export type MarkdownEditorMode = 'write' | 'preview' | 'split';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  defaultMode?: MarkdownEditorMode;
  showToolbar?: boolean;
}

interface ToolbarAction {
  id: string;
  label: string;
  icon: string;
  wrap: [string, string];
  block?: boolean;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { id: 'bold', label: S.MARKDOWN_TOOLBAR_BOLD, icon: 'B', wrap: ['**', '**'] },
  { id: 'italic', label: S.MARKDOWN_TOOLBAR_ITALIC, icon: 'I', wrap: ['_', '_'] },
  { id: 'code', label: S.MARKDOWN_TOOLBAR_CODE, icon: '`', wrap: ['`', '`'] },
  { id: 'link', label: S.MARKDOWN_TOOLBAR_LINK, icon: '🔗', wrap: ['[', '](url)'] },
];

const TOOLBAR_BLOCK_ACTIONS: ToolbarAction[] = [
  { id: 'heading', label: S.MARKDOWN_TOOLBAR_HEADING, icon: 'H', wrap: ['## ', ''], block: true },
  { id: 'list', label: S.MARKDOWN_TOOLBAR_LIST, icon: '•', wrap: ['- ', ''], block: true },
  { id: 'quote', label: S.MARKDOWN_TOOLBAR_QUOTE, icon: '>', wrap: ['> ', ''], block: true },
  { id: 'code-block', label: S.MARKDOWN_TOOLBAR_CODE_BLOCK, icon: '{ }', wrap: ['```\n', '\n```'], block: true },
];

interface ApplyWrapResult {
  newValue: string;
  cursorStart: number;
  cursorEnd: number;
}

function applyWrap(
  textarea: HTMLTextAreaElement,
  value: string,
  wrap: [string, string],
  block: boolean,
): ApplyWrapResult {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  const [prefix, suffix] = wrap;

  let insertion: string;
  let newCursorStart: number;
  let newCursorEnd: number;

  if (block && start > 0 && value[start - 1] !== '\n') {
    // For block-level actions, ensure we start on a new line
    insertion = '\n' + prefix + selected + suffix;
    newCursorStart = start + 1 + prefix.length;
    newCursorEnd = newCursorStart + selected.length;
  } else {
    insertion = prefix + selected + suffix;
    newCursorStart = start + prefix.length;
    newCursorEnd = newCursorStart + selected.length;
  }

  const newValue = value.slice(0, start) + insertion + value.slice(end);

  return { newValue, cursorStart: newCursorStart, cursorEnd: newCursorEnd };
}

const MarkdownEditorInner: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  minHeight = 120,
  defaultMode = 'write',
  showToolbar = true,
}) => {
  const [mode, setMode] = useState<MarkdownEditorMode>(defaultMode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleToolbarAction = useCallback((action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const result = applyWrap(textarea, value, action.wrap, !!action.block);
    onChange(result.newValue);

    // Cancel any pending RAF before scheduling a new one
    if (rafIdRef.current !== undefined) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Restore selection after React re-renders
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = undefined;
      textarea.focus();
      textarea.setSelectionRange(result.cursorStart, result.cursorEnd);
    });
  }, [value, onChange]);

  const showInput = mode === 'write' || mode === 'split';
  const showPreview = mode === 'preview' || mode === 'split';

  return (
    <div className="markdown-editor" aria-label={S.ARIA_MARKDOWN_EDITOR}>
      <div className="markdown-editor-header">
        <div className="markdown-editor-tabs" role="tablist" aria-label={S.ARIA_MARKDOWN_EDITOR}>
          <button
            className={`markdown-editor-tab${mode === 'write' ? ' active' : ''}`}
            onClick={() => setMode('write')}
            role="tab"
            aria-selected={mode === 'write'}
            type="button"
          >
            {S.MARKDOWN_EDITOR_WRITE}
          </button>
          <button
            className={`markdown-editor-tab${mode === 'preview' ? ' active' : ''}`}
            onClick={() => setMode('preview')}
            role="tab"
            aria-selected={mode === 'preview'}
            type="button"
          >
            {S.MARKDOWN_EDITOR_PREVIEW}
          </button>
          <button
            className={`markdown-editor-tab${mode === 'split' ? ' active' : ''}`}
            onClick={() => setMode('split')}
            role="tab"
            aria-selected={mode === 'split'}
            type="button"
          >
            {S.MARKDOWN_EDITOR_SPLIT}
          </button>
        </div>

        {showToolbar && showInput && (
          <div className="markdown-editor-toolbar" role="toolbar" aria-label={S.ARIA_MARKDOWN_TOOLBAR}>
            {TOOLBAR_ACTIONS.map(action => (
              <button
                key={action.id}
                className="markdown-toolbar-btn"
                onClick={() => handleToolbarAction(action)}
                aria-label={action.label}
                title={action.label}
                type="button"
              >
                {action.icon}
              </button>
            ))}
            <div className="markdown-toolbar-divider" aria-hidden="true" />
            {TOOLBAR_BLOCK_ACTIONS.map(action => (
              <button
                key={action.id}
                className="markdown-toolbar-btn"
                onClick={() => handleToolbarAction(action)}
                aria-label={action.label}
                title={action.label}
                type="button"
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`markdown-editor-body${mode === 'split' ? ' split-mode' : ''}`}>
        {showInput && (
          <textarea
            ref={textareaRef}
            className="markdown-editor-input"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight: `${minHeight}px` }}
            aria-label={S.ARIA_MARKDOWN_EDITOR_INPUT}
          />
        )}
        {showPreview && (
          <div
            className="markdown-editor-preview"
            style={{ minHeight: `${minHeight}px` }}
            aria-label={S.ARIA_MARKDOWN_EDITOR_PREVIEW}
            role="region"
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <span className="markdown-editor-preview-empty">{placeholder}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MarkdownEditor = React.memo(MarkdownEditorInner);

export default MarkdownEditor;
