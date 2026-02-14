import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './FloatingToolbar.css';
import * as S from '../constants/strings';

export interface FloatingToolbarAction {
  id: string;
  label: string;
  icon?: string;
  onClick: (selectedText: string) => void;
  disabled?: boolean;
}

export interface FloatingToolbarProps {
  /** The container element to monitor for text selection */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Actions to display in the toolbar */
  actions: FloatingToolbarAction[];
  /** Minimum selection length to show toolbar (default: 1) */
  minSelectionLength?: number;
  /** Offset from selection in pixels (default: 8) */
  offset?: number;
  /** Position preference: above or below selection (default: 'above') */
  preferPosition?: 'above' | 'below';
  /** Whether the toolbar is disabled */
  disabled?: boolean;
  /** Accessible label for the toolbar */
  ariaLabel?: string;
}

interface Position {
  top: number;
  left: number;
  visible: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  containerRef,
  actions,
  minSelectionLength = 1,
  offset = 8,
  preferPosition = 'above',
  disabled = false,
  ariaLabel = S.ARIA_FLOATING_TOOLBAR,
}) => {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, visible: false });
  const [selectedText, setSelectedText] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (disabled) {
      setPosition(prev => prev.visible ? { top: 0, left: 0, visible: false } : prev);
      return;
    }

    const selection = window.getSelection();
    if (
      !selection ||
      selection.isCollapsed ||
      !selection.toString().trim() ||
      selection.toString().trim().length < minSelectionLength
    ) {
      setPosition(prev => prev.visible ? { top: 0, left: 0, visible: false } : prev);
      setSelectedText('');
      return;
    }

    const container = containerRef.current;
    if (!container) {
      setPosition(prev => prev.visible ? { top: 0, left: 0, visible: false } : prev);
      setSelectedText('');
      return;
    }

    // Check that selection is within the container
    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (!anchorNode || !focusNode || !container.contains(anchorNode) || !container.contains(focusNode)) {
      setPosition(prev => prev.visible ? { top: 0, left: 0, visible: false } : prev);
      setSelectedText('');
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setPosition(prev => prev.visible ? { top: 0, left: 0, visible: false } : prev);
      setSelectedText('');
      return;
    }

    const toolbarHeight = toolbarRef.current?.offsetHeight ?? 36;

    let top: number;
    if (preferPosition === 'above') {
      top = rect.top - toolbarHeight - offset;
      // If toolbar would go above viewport, show below
      if (top < 0) {
        top = rect.bottom + offset;
      }
    } else {
      top = rect.bottom + offset;
      // If toolbar would go below viewport, show above
      if (top + toolbarHeight > window.innerHeight) {
        top = rect.top - toolbarHeight - offset;
      }
    }

    const left = rect.left + rect.width / 2;

    setSelectedText(selection.toString());
    setPosition({ top, left, visible: true });
  }, [containerRef, disabled, minSelectionLength, offset, preferPosition]);

  useEffect(() => {
    document.addEventListener('selectionchange', updatePosition);
    return () => {
      document.removeEventListener('selectionchange', updatePosition);
    };
  }, [updatePosition]);

  // Hide on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !position.visible) return;

    const handleScroll = () => {
      setPosition({ top: 0, left: 0, visible: false });
      setSelectedText('');
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, position.visible]);

  // Hide on Escape
  useEffect(() => {
    if (!position.visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPosition({ top: 0, left: 0, visible: false });
        setSelectedText('');
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [position.visible]);

  const handleActionClick = useCallback((action: FloatingToolbarAction) => {
    if (action.disabled) return;
    action.onClick(selectedText);
  }, [selectedText]);

  const enabledActions = useMemo(
    () => actions.filter(a => !a.disabled),
    [actions]
  );

  if (!position.visible || enabledActions.length === 0) return null;

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar"
      role="toolbar"
      aria-label={ariaLabel}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {actions.map(action => (
        <button
          key={action.id}
          className={`floating-toolbar-btn${action.disabled ? ' floating-toolbar-btn--disabled' : ''}`}
          onClick={() => handleActionClick(action)}
          disabled={action.disabled}
          aria-label={action.label}
          title={action.label}
          type="button"
        >
          {action.icon && <span className="floating-toolbar-icon">{action.icon}</span>}
          <span className="floating-toolbar-label">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default React.memo(FloatingToolbar);
