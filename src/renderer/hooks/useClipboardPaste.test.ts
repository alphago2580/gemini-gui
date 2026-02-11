import { renderHook } from '@testing-library/react';
import { useClipboardPaste, type PasteData } from './useClipboardPaste';

function createClipboardData(data: {
  text?: string;
  html?: string;
  files?: Array<{ name: string; type: string }>;
}) {
  const items: Array<{ kind: string; type: string; getAsFile: () => File }> = [];

  if (data.files) {
    for (const f of data.files) {
      const file = new File(['content'], f.name, { type: f.type });
      items.push({
        kind: 'file',
        type: f.type,
        getAsFile: () => file,
      });
    }
  }

  return {
    getData: (type: string) => {
      if (type === 'text/plain') return data.text ?? '';
      if (type === 'text/html') return data.html ?? '';
      return '';
    },
    items: {
      length: items.length,
      ...Object.fromEntries(items.map((item, i) => [i, item])),
    },
  };
}

function dispatchPaste(
  target: EventTarget,
  data: { text?: string; html?: string; files?: Array<{ name: string; type: string }> }
) {
  const clipboardData = createClipboardData(data);
  const event = new Event('paste', { bubbles: true });
  Object.defineProperty(event, 'clipboardData', { value: clipboardData });
  target.dispatchEvent(event);
}

describe('useClipboardPaste', () => {
  it('calls onPaste with text data', () => {
    const onPaste = vi.fn();
    renderHook(() => useClipboardPaste({ onPaste }));

    dispatchPaste(document, { text: 'hello world' });

    expect(onPaste).toHaveBeenCalledTimes(1);
    const data: PasteData = onPaste.mock.calls[0][0];
    expect(data.text).toBe('hello world');
    expect(data.hasContent).toBe(true);
  });

  it('calls onPaste with HTML data', () => {
    const onPaste = vi.fn();
    renderHook(() => useClipboardPaste({ onPaste }));

    dispatchPaste(document, { html: '<b>bold</b>' });

    expect(onPaste).toHaveBeenCalledTimes(1);
    const data: PasteData = onPaste.mock.calls[0][0];
    expect(data.html).toBe('<b>bold</b>');
  });

  it('calls onPaste with image files', () => {
    const onPaste = vi.fn();
    renderHook(() => useClipboardPaste({ onPaste }));

    dispatchPaste(document, {
      files: [{ name: 'photo.png', type: 'image/png' }],
    });

    expect(onPaste).toHaveBeenCalledTimes(1);
    const data: PasteData = onPaste.mock.calls[0][0];
    expect(data.images).toHaveLength(1);
    expect(data.images[0].name).toBe('photo.png');
    expect(data.files).toHaveLength(0);
  });

  it('calls onPaste with non-image files', () => {
    const onPaste = vi.fn();
    renderHook(() => useClipboardPaste({ onPaste }));

    dispatchPaste(document, {
      files: [{ name: 'doc.pdf', type: 'application/pdf' }],
    });

    expect(onPaste).toHaveBeenCalledTimes(1);
    const data: PasteData = onPaste.mock.calls[0][0];
    expect(data.files).toHaveLength(1);
    expect(data.files[0].name).toBe('doc.pdf');
    expect(data.images).toHaveLength(0);
  });

  it('separates images from other files', () => {
    const onPaste = vi.fn();
    renderHook(() => useClipboardPaste({ onPaste }));

    dispatchPaste(document, {
      files: [
        { name: 'photo.jpg', type: 'image/jpeg' },
        { name: 'data.csv', type: 'text/csv' },
      ],
    });

    const data: PasteData = onPaste.mock.calls[0][0];
    expect(data.images).toHaveLength(1);
    expect(data.files).toHaveLength(1);
  });

  it('does not call onPaste when no content', () => {
    const onPaste = vi.fn();
    renderHook(() => useClipboardPaste({ onPaste }));

    dispatchPaste(document, {});

    expect(onPaste).not.toHaveBeenCalled();
  });

  it('filters by acceptTypes - text only', () => {
    const onPaste = vi.fn();
    renderHook(() =>
      useClipboardPaste({ onPaste, acceptTypes: ['text/plain'] })
    );

    dispatchPaste(document, {
      text: 'hello',
      html: '<b>bold</b>',
      files: [{ name: 'pic.png', type: 'image/png' }],
    });

    const data: PasteData = onPaste.mock.calls[0][0];
    expect(data.text).toBe('hello');
    expect(data.html).toBeNull();
    expect(data.images).toHaveLength(0);
  });

  it('filters by acceptTypes with wildcard', () => {
    const onPaste = vi.fn();
    renderHook(() =>
      useClipboardPaste({ onPaste, acceptTypes: ['image/*'] })
    );

    dispatchPaste(document, {
      text: 'hello',
      files: [
        { name: 'pic.png', type: 'image/png' },
        { name: 'doc.pdf', type: 'application/pdf' },
      ],
    });

    const data: PasteData = onPaste.mock.calls[0][0];
    expect(data.text).toBeNull();
    expect(data.images).toHaveLength(1);
    expect(data.files).toHaveLength(0);
  });

  it('does not listen when disabled', () => {
    const onPaste = vi.fn();
    renderHook(() => useClipboardPaste({ onPaste, enabled: false }));

    dispatchPaste(document, { text: 'hello' });

    expect(onPaste).not.toHaveBeenCalled();
  });

  it('starts listening when re-enabled', () => {
    const onPaste = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useClipboardPaste({ onPaste, enabled }),
      { initialProps: { enabled: false } }
    );

    dispatchPaste(document, { text: 'hello' });
    expect(onPaste).not.toHaveBeenCalled();

    rerender({ enabled: true });
    dispatchPaste(document, { text: 'world' });
    expect(onPaste).toHaveBeenCalledTimes(1);
  });

  it('cleans up listener on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const onPaste = vi.fn();

    const { unmount } = renderHook(() => useClipboardPaste({ onPaste }));
    expect(addSpy).toHaveBeenCalledWith('paste', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('paste', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('listens on target element ref when provided', () => {
    const element = document.createElement('div');
    const addSpy = vi.spyOn(element, 'addEventListener');
    const removeSpy = vi.spyOn(element, 'removeEventListener');
    const onPaste = vi.fn();
    const ref = { current: element };

    const { unmount } = renderHook(() =>
      useClipboardPaste({ onPaste, targetRef: ref })
    );

    expect(addSpy).toHaveBeenCalledWith('paste', expect.any(Function));

    dispatchPaste(element, { text: 'targeted' });
    expect(onPaste).toHaveBeenCalledTimes(1);

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('paste', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('handles both text and files in single paste', () => {
    const onPaste = vi.fn();
    renderHook(() => useClipboardPaste({ onPaste }));

    dispatchPaste(document, {
      text: 'some text',
      files: [{ name: 'img.gif', type: 'image/gif' }],
    });

    const data: PasteData = onPaste.mock.calls[0][0];
    expect(data.text).toBe('some text');
    expect(data.images).toHaveLength(1);
    expect(data.hasContent).toBe(true);
  });
});
