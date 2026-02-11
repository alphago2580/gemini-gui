import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormattingToolbar, applyFormatting } from './useFormattingToolbar';

describe('applyFormatting', () => {
  it('wraps selected text with bold markers', () => {
    const result = applyFormatting('hello world', 6, 11, 'bold');
    expect(result.text).toBe('hello **world**');
    expect(result.selectionStart).toBe(8);
    expect(result.selectionEnd).toBe(13);
  });

  it('inserts bold placeholder when no selection', () => {
    const result = applyFormatting('hello ', 6, 6, 'bold');
    expect(result.text).toBe('hello **굵은 텍스트**');
    expect(result.selectionStart).toBe(8);
    expect(result.selectionEnd).toBe(8 + '굵은 텍스트'.length);
  });

  it('wraps selected text with italic markers', () => {
    const result = applyFormatting('hello world', 6, 11, 'italic');
    expect(result.text).toBe('hello *world*');
    expect(result.selectionStart).toBe(7);
    expect(result.selectionEnd).toBe(12);
  });

  it('inserts italic placeholder when no selection', () => {
    const result = applyFormatting('', 0, 0, 'italic');
    expect(result.text).toBe('*기울임 텍스트*');
    expect(result.selectionStart).toBe(1);
  });

  it('wraps selected text with inline code markers', () => {
    const result = applyFormatting('hello world', 6, 11, 'code');
    expect(result.text).toBe('hello `world`');
    expect(result.selectionStart).toBe(7);
    expect(result.selectionEnd).toBe(12);
  });

  it('inserts code placeholder when no selection', () => {
    const result = applyFormatting('', 0, 0, 'code');
    expect(result.text).toBe('`코드`');
    expect(result.selectionStart).toBe(1);
    expect(result.selectionEnd).toBe(1 + '코드'.length);
  });

  it('wraps selected text with strikethrough markers', () => {
    const result = applyFormatting('remove this', 7, 11, 'strikethrough');
    expect(result.text).toBe('remove ~~this~~');
    expect(result.selectionStart).toBe(9);
    expect(result.selectionEnd).toBe(13);
  });

  it('inserts strikethrough placeholder when no selection', () => {
    const result = applyFormatting('', 0, 0, 'strikethrough');
    expect(result.text).toBe('~~취소선 텍스트~~');
    expect(result.selectionStart).toBe(2);
  });

  it('wraps selected text as link', () => {
    const result = applyFormatting('click here', 6, 10, 'link');
    expect(result.text).toBe('click [here](url)');
    // selects the "url" part
    expect(result.selectionStart).toBe(13);
    expect(result.selectionEnd).toBe(16);
  });

  it('inserts link placeholder when no selection', () => {
    const result = applyFormatting('', 0, 0, 'link');
    expect(result.text).toBe('[링크 텍스트](url)');
    expect(result.selectionStart).toBe(1);
    expect(result.selectionEnd).toBe(1 + '링크 텍스트'.length);
  });

  it('wraps selected text as code block', () => {
    const result = applyFormatting('const x = 1;', 0, 12, 'codeblock');
    expect(result.text).toContain('```');
    expect(result.text).toContain('const x = 1;');
  });

  it('inserts code block placeholder when no selection', () => {
    const result = applyFormatting('', 0, 0, 'codeblock');
    expect(result.text).toContain('```');
    expect(result.text).toContain('코드 블록');
  });

  it('returns unchanged text for unknown action', () => {
    const result = applyFormatting('hello', 0, 5, 'unknown');
    expect(result.text).toBe('hello');
    expect(result.selectionStart).toBe(0);
    expect(result.selectionEnd).toBe(5);
  });

  it('preserves text before and after selection', () => {
    const result = applyFormatting('aaa bbb ccc', 4, 7, 'bold');
    expect(result.text).toBe('aaa **bbb** ccc');
  });
});

describe('useFormattingToolbar', () => {
  it('returns handleFormat function', () => {
    const ref: React.RefObject<HTMLTextAreaElement | null> = { current: null };
    const setText = vi.fn();
    const { result } = renderHook(() =>
      useFormattingToolbar({ textareaRef: ref, text: '', setText })
    );
    expect(typeof result.current.handleFormat).toBe('function');
  });

  it('does nothing when textarea ref is null', () => {
    const ref: React.RefObject<HTMLTextAreaElement | null> = { current: null };
    const setText = vi.fn();
    const { result } = renderHook(() =>
      useFormattingToolbar({ textareaRef: ref, text: 'hello', setText })
    );

    act(() => {
      result.current.handleFormat('bold');
    });

    expect(setText).not.toHaveBeenCalled();
  });

  it('calls setText with formatted text when textarea exists', () => {
    const textarea = document.createElement('textarea');
    textarea.value = 'hello world';
    Object.defineProperty(textarea, 'selectionStart', { value: 6, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 11, writable: true });
    const ref = { current: textarea };
    const setText = vi.fn();

    const { result } = renderHook(() =>
      useFormattingToolbar({ textareaRef: ref, text: 'hello world', setText })
    );

    act(() => {
      result.current.handleFormat('bold');
    });

    expect(setText).toHaveBeenCalledWith('hello **world**');
  });

  it('handles italic formatting through the hook', () => {
    const textarea = document.createElement('textarea');
    textarea.value = 'test';
    Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(textarea, 'selectionEnd', { value: 4, writable: true });
    const ref = { current: textarea };
    const setText = vi.fn();

    const { result } = renderHook(() =>
      useFormattingToolbar({ textareaRef: ref, text: 'test', setText })
    );

    act(() => {
      result.current.handleFormat('italic');
    });

    expect(setText).toHaveBeenCalledWith('*test*');
  });
});

describe('applyFormatting — additional edge cases', () => {
  it('bold in the middle of text preserves surrounding text', () => {
    const result = applyFormatting('foo bar baz', 4, 7, 'bold');
    expect(result.text).toBe('foo **bar** baz');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(9);
  });

  it('italic placeholder end position is correct', () => {
    const result = applyFormatting('', 0, 0, 'italic');
    expect(result.selectionEnd).toBe(1 + '기울임 텍스트'.length);
  });

  it('code placeholder end position is correct', () => {
    const result = applyFormatting('pre', 3, 3, 'code');
    expect(result.text).toBe('pre`코드`');
    expect(result.selectionStart).toBe(4);
    expect(result.selectionEnd).toBe(4 + '코드'.length);
  });

  it('strikethrough placeholder end position is correct', () => {
    const result = applyFormatting('', 0, 0, 'strikethrough');
    expect(result.selectionEnd).toBe(2 + '취소선 텍스트'.length);
  });

  it('link with selection selects the url part', () => {
    const result = applyFormatting('see this link', 4, 8, 'link');
    expect(result.text).toBe('see [this](url) link');
    expect(result.selectionStart).toBe(11);
    expect(result.selectionEnd).toBe(14);
  });

  it('codeblock with selection wraps in fenced block', () => {
    const result = applyFormatting('let x = 1', 0, 9, 'codeblock');
    expect(result.text).toContain('```\nlet x = 1\n```');
    expect(result.selectionStart).toBe(5);
    expect(result.selectionEnd).toBe(5 + 9);
  });

  it('unknown action preserves original cursor positions', () => {
    const result = applyFormatting('hello', 2, 3, 'nonexistent');
    expect(result.text).toBe('hello');
    expect(result.selectionStart).toBe(2);
    expect(result.selectionEnd).toBe(3);
  });

  it('bold at the end of text', () => {
    const result = applyFormatting('end', 3, 3, 'bold');
    expect(result.text).toBe('end**굵은 텍스트**');
  });
});
