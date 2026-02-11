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

  it('handles very long title', () => {
    const longTitle = 'A'.repeat(500);
    renderHook(() => useDocumentTitle(longTitle));
    expect(document.title).toBe(longTitle);
  });

  it('handles Korean characters', () => {
    renderHook(() => useDocumentTitle('대화 — 제미나이'));
    expect(document.title).toBe('대화 — 제미나이');
  });

  it('does not restore when same title is set multiple times', () => {
    document.title = 'Original';
    const { rerender, unmount } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'Same' } }
    );
    expect(document.title).toBe('Same');

    rerender({ title: 'Same' });
    expect(document.title).toBe('Same');

    unmount();
    expect(document.title).toBe('Original');
  });

  it('restores correct original when multiple updates happen before unmount', () => {
    document.title = 'Start';
    const { rerender, unmount } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'First' } }
    );

    rerender({ title: 'Second' });
    rerender({ title: 'Third' });
    expect(document.title).toBe('Third');

    unmount();
    expect(document.title).toBe('Start');
  });

  it('handles title with HTML entities', () => {
    renderHook(() => useDocumentTitle('Test &amp; Title'));
    expect(document.title).toBe('Test &amp; Title');
  });

  it('handles title with newlines (collapsed to space by browser)', () => {
    renderHook(() => useDocumentTitle('Line1\nLine2'));
    // Browsers collapse newlines to spaces in document.title
    expect(document.title).toBe('Line1 Line2');
  });

  it('captures original title only at initial mount', () => {
    document.title = 'Init';
    const { rerender, unmount } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'Changed' } }
    );

    document.title = 'External Change';
    rerender({ title: 'Rerendered' });

    unmount();
    expect(document.title).toBe('Init');
  });
});
