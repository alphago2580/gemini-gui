export interface FormatResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export function wrapSelection(
  fullText: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string,
): FormatResult {
  const before = fullText.substring(0, selectionStart);
  const selected = fullText.substring(selectionStart, selectionEnd);
  const after = fullText.substring(selectionEnd);

  if (selected.length > 0) {
    const newText = before + prefix + selected + suffix + after;
    return {
      text: newText,
      selectionStart: selectionStart + prefix.length,
      selectionEnd: selectionEnd + prefix.length,
    };
  }

  const placeholder = 'text';
  const newText = before + prefix + placeholder + suffix + after;
  return {
    text: newText,
    selectionStart: selectionStart + prefix.length,
    selectionEnd: selectionStart + prefix.length + placeholder.length,
  };
}

export function insertBold(text: string, start: number, end: number): FormatResult {
  return wrapSelection(text, start, end, '**', '**');
}

export function insertItalic(text: string, start: number, end: number): FormatResult {
  return wrapSelection(text, start, end, '*', '*');
}

export function insertInlineCode(text: string, start: number, end: number): FormatResult {
  return wrapSelection(text, start, end, '`', '`');
}

export function insertStrikethrough(text: string, start: number, end: number): FormatResult {
  return wrapSelection(text, start, end, '~~', '~~');
}

export function insertLink(text: string, start: number, end: number): FormatResult {
  const selected = text.substring(start, end);
  const before = text.substring(0, start);
  const after = text.substring(end);

  if (selected.length > 0) {
    const newText = before + '[' + selected + '](url)' + after;
    return {
      text: newText,
      selectionStart: start + selected.length + 3,
      selectionEnd: start + selected.length + 6,
    };
  }

  const newText = before + '[text](url)' + after;
  return {
    text: newText,
    selectionStart: start + 1,
    selectionEnd: start + 5,
  };
}

export function insertCodeBlock(text: string, start: number, end: number): FormatResult {
  const selected = text.substring(start, end);
  const before = text.substring(0, start);
  const after = text.substring(end);

  const content = selected.length > 0 ? selected : 'code';
  const newText = before + '```\n' + content + '\n```' + after;
  return {
    text: newText,
    selectionStart: start + 4,
    selectionEnd: start + 4 + content.length,
  };
}
