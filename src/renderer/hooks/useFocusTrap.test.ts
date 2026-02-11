import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

function createContainer(): HTMLDivElement {
  const container = document.createElement('div');
  const btn1 = document.createElement('button');
  btn1.textContent = 'First';
  const btn2 = document.createElement('button');
  btn2.textContent = 'Second';
  const btn3 = document.createElement('button');
  btn3.textContent = 'Third';
  container.appendChild(btn1);
  container.appendChild(btn2);
  container.appendChild(btn3);
  document.body.appendChild(container);
  return container;
}

describe('useFocusTrap', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = createContainer();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it('auto-focuses first focusable element on mount', () => {
    const ref = { current: container };
    renderHook(() => useFocusTrap(ref));

    const buttons = container.querySelectorAll('button');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('does not auto-focus when autoFocus is false', () => {
    const previousFocus = document.activeElement;
    const ref = { current: container };
    renderHook(() => useFocusTrap(ref, { autoFocus: false }));

    expect(document.activeElement).toBe(previousFocus);
  });

  it('wraps focus from last to first on Tab', () => {
    const ref = { current: container };
    renderHook(() => useFocusTrap(ref));

    const buttons = container.querySelectorAll('button');
    buttons[2].focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('wraps focus from first to last on Shift+Tab', () => {
    const ref = { current: container };
    renderHook(() => useFocusTrap(ref));

    const buttons = container.querySelectorAll('button');
    buttons[0].focus();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(buttons[2]);
  });

  it('does not prevent default for non-Tab keys', () => {
    const ref = { current: container };
    renderHook(() => useFocusTrap(ref));

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('does not trap when enabled is false', () => {
    const ref = { current: container };
    const previousFocus = document.activeElement;
    renderHook(() => useFocusTrap(ref, { enabled: false }));

    expect(document.activeElement).toBe(previousFocus);
  });

  it('restores focus to previous element on unmount', () => {
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'Outside';
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    const ref = { current: container };
    const { unmount } = renderHook(() => useFocusTrap(ref, { restoreFocus: true }));

    expect(document.activeElement).not.toBe(outsideButton);

    unmount();

    expect(document.activeElement).toBe(outsideButton);
    document.body.removeChild(outsideButton);
  });

  it('does not restore focus when restoreFocus is false', () => {
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'Outside';
    document.body.appendChild(outsideButton);
    outsideButton.focus();
    expect(document.activeElement).toBe(outsideButton);

    const ref = { current: container };
    const { unmount } = renderHook(() => useFocusTrap(ref, { restoreFocus: false }));

    // Focus moved to first button inside container
    const buttons = container.querySelectorAll('button');
    expect(document.activeElement).toBe(buttons[0]);

    unmount();

    // Focus should NOT be restored to outsideButton
    expect(document.activeElement).not.toBe(outsideButton);
    document.body.removeChild(outsideButton);
  });

  it('handles container with no focusable elements', () => {
    const emptyContainer = document.createElement('div');
    emptyContainer.textContent = 'No buttons here';
    document.body.appendChild(emptyContainer);

    const ref = { current: emptyContainer };
    // Should not throw
    renderHook(() => useFocusTrap(ref));

    document.body.removeChild(emptyContainer);
  });

  it('handles null ref', () => {
    const ref = { current: null };
    // Should not throw
    renderHook(() => useFocusTrap(ref));
  });

  it('cleans up keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(container, 'removeEventListener');
    const ref = { current: container };
    const { unmount } = renderHook(() => useFocusTrap(ref));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('does not wrap Tab when focus is in the middle', () => {
    const ref = { current: container };
    renderHook(() => useFocusTrap(ref));

    const buttons = container.querySelectorAll('button');
    buttons[1].focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('skips disabled elements', () => {
    const buttons = container.querySelectorAll('button');
    buttons[1].disabled = true;

    const ref = { current: container };
    renderHook(() => useFocusTrap(ref));

    // First focusable should be buttons[0]
    expect(document.activeElement).toBe(buttons[0]);

    // When on last non-disabled button, Tab should go to first
    buttons[2].focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    container.dispatchEvent(event);

    expect(document.activeElement).toBe(buttons[0]);
  });
});
