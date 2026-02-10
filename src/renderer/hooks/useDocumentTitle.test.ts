import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDocumentTitle } from './useDocumentTitle';

describe('useDocumentTitle', () => {
  beforeEach(() => {
    document.title = 'Default Title';
  });

  it('sets the document title', () => {
    renderHook(() => useDocumentTitle('New Title'));
    expect(document.title).toBe('New Title');
  });

  it('updates the document title when value changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'First' },
    });
    expect(document.title).toBe('First');

    rerender({ title: 'Second' });
    expect(document.title).toBe('Second');
  });

  it('restores the previous title on unmount by default', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Temporary'));
    expect(document.title).toBe('Temporary');

    unmount();
    expect(document.title).toBe('Default Title');
  });

  it('does not restore title on unmount when restoreOnUnmount is false', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Permanent', false));
    expect(document.title).toBe('Permanent');

    unmount();
    expect(document.title).toBe('Permanent');
  });

  it('captures the original title at mount time', () => {
    document.title = 'Original';
    const { unmount } = renderHook(() => useDocumentTitle('Changed'));
    expect(document.title).toBe('Changed');

    unmount();
    expect(document.title).toBe('Original');
  });

  it('handles empty string title', () => {
    renderHook(() => useDocumentTitle(''));
    expect(document.title).toBe('');
  });

  it('handles title with special characters', () => {
    renderHook(() => useDocumentTitle('Chat — Gemini 🤖 <test>'));
    expect(document.title).toBe('Chat — Gemini 🤖 <test>');
  });
});
