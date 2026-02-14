import { useCallback, useRef, useEffect } from 'react';

interface FormattingResult {
  /** New text content after formatting */
  text: string;
  /** New cursor/selection start position */
  selectionStart: number;
  /** New cursor/selection end position */
  selectionEnd: number;
}

/**
 * Apply markdown formatting around selected text.
 * If no text is selected, inserts placeholder.
 */
function applyFormatting(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  actionId: string
): FormattingResult {
  const before = text.slice(0, selectionStart);
  const selected = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);

  switch (actionId) {
    case 'bold': {
      const wrapped = `**${selected || '굵은 텍스트'}**`;
      const newText = before + wrapped + after;
      if (selected) {
        return { text: newText, selectionStart: selectionStart + 2, selectionEnd: selectionEnd + 2 };
      }
      return { text: newText, selectionStart: selectionStart + 2, selectionEnd: selectionStart + 2 + '굵은 텍스트'.length };
    }
    case 'italic': {
      const wrapped = `*${selected || '기울임 텍스트'}*`;
      const newText = before + wrapped + after;
      if (selected) {
        return { text: newText, selectionStart: selectionStart + 1, selectionEnd: selectionEnd + 1 };
      }
      return { text: newText, selectionStart: selectionStart + 1, selectionEnd: selectionStart + 1 + '기울임 텍스트'.length };
    }
    case 'code': {
      const wrapped = `\`${selected || '코드'}\``;
      const newText = before + wrapped + after;
      if (selected) {
        return { text: newText, selectionStart: selectionStart + 1, selectionEnd: selectionEnd + 1 };
      }
      return { text: newText, selectionStart: selectionStart + 1, selectionEnd: selectionStart + 1 + '코드'.length };
    }
    case 'strikethrough': {
      const wrapped = `~~${selected || '취소선 텍스트'}~~`;
      const newText = before + wrapped + after;
      if (selected) {
        return { text: newText, selectionStart: selectionStart + 2, selectionEnd: selectionEnd + 2 };
      }
      return { text: newText, selectionStart: selectionStart + 2, selectionEnd: selectionStart + 2 + '취소선 텍스트'.length };
    }
    case 'link': {
      const linkText = selected || '링크 텍스트';
      const wrapped = `[${linkText}](url)`;
      const newText = before + wrapped + after;
      if (selected) {
        // Select the "url" part
        const urlStart = selectionStart + 1 + linkText.length + 2;
        return { text: newText, selectionStart: urlStart, selectionEnd: urlStart + 3 };
      }
      return { text: newText, selectionStart: selectionStart + 1, selectionEnd: selectionStart + 1 + linkText.length };
    }
    case 'codeblock': {
      const lang = '';
      const content = selected || '코드 블록';
      const wrapped = `\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
      const newText = before + wrapped + after;
      if (selected) {
        return { text: newText, selectionStart: selectionStart + 4 + lang.length + 1, selectionEnd: selectionStart + 4 + lang.length + 1 + content.length };
      }
      return { text: newText, selectionStart: selectionStart + 4 + lang.length + 1, selectionEnd: selectionStart + 4 + lang.length + 1 + content.length };
    }
    default:
      return { text, selectionStart, selectionEnd };
  }
}

interface UseFormattingToolbarOptions {
  /** Ref to the textarea element */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Current text value */
  text: string;
  /** Setter for the text value */
  setText: (text: string) => void;
}

interface UseFormattingToolbarResult {
  /** Handle a formatting action by ID (bold, italic, code, etc.) */
  handleFormat: (actionId: string) => void;
}

/**
 * Hook to apply markdown formatting to a textarea.
 * Works with FormattingToolbar component's onFormat callback.
 */
export function useFormattingToolbar({
  textareaRef,
  text,
  setText,
}: UseFormattingToolbarOptions): UseFormattingToolbarResult {
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleFormat = useCallback((actionId: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const result = applyFormatting(text, selectionStart, selectionEnd, actionId);

    setText(result.text);

    // Cancel any pending RAF before scheduling a new one
    if (rafIdRef.current !== undefined) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Restore cursor position after React re-render
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = undefined;
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }, [textareaRef, text, setText]);

  return { handleFormat };
}

// Export for testing
export { applyFormatting };
export type { FormattingResult };
