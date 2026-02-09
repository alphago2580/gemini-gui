import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

function fireKeyDown(key: string, options: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  document.dispatchEvent(event);
  return event;
}

describe('useKeyboardShortcuts', () => {
  const defaultActions = () => ({
    onNewChat: vi.fn(),
    onClearConversation: vi.fn(),
    onToggleSettings: vi.fn(),
    onCloseSettings: vi.fn(),
    onFocusSearch: vi.fn(),
    isSettingsOpen: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onNewChat on Ctrl+N', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('n', { ctrlKey: true });
    expect(actions.onNewChat).toHaveBeenCalledTimes(1);
  });

  it('calls onNewChat on Meta+N (macOS)', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('n', { metaKey: true });
    expect(actions.onNewChat).toHaveBeenCalledTimes(1);
  });

  it('calls onClearConversation on Ctrl+L', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('l', { ctrlKey: true });
    expect(actions.onClearConversation).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleSettings on Ctrl+,', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown(',', { ctrlKey: true });
    expect(actions.onToggleSettings).toHaveBeenCalledTimes(1);
  });

  it('calls onCloseSettings on Escape when settings is open', () => {
    const actions = defaultActions();
    actions.isSettingsOpen = true;
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('Escape');
    expect(actions.onCloseSettings).toHaveBeenCalledTimes(1);
  });

  it('does not call onCloseSettings on Escape when settings is closed', () => {
    const actions = defaultActions();
    actions.isSettingsOpen = false;
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('Escape');
    expect(actions.onCloseSettings).not.toHaveBeenCalled();
  });

  it('does not trigger shortcuts without Ctrl/Meta modifier', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('n');
    fireKeyDown('l');
    fireKeyDown(',');
    expect(actions.onNewChat).not.toHaveBeenCalled();
    expect(actions.onClearConversation).not.toHaveBeenCalled();
    expect(actions.onToggleSettings).not.toHaveBeenCalled();
  });

  it('does not trigger unrelated key combinations', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('a', { ctrlKey: true });
    fireKeyDown('s', { ctrlKey: true });
    fireKeyDown('z', { metaKey: true });

    expect(actions.onNewChat).not.toHaveBeenCalled();
    expect(actions.onClearConversation).not.toHaveBeenCalled();
    expect(actions.onToggleSettings).not.toHaveBeenCalled();
    expect(actions.onCloseSettings).not.toHaveBeenCalled();
  });

  it('calls onFocusSearch on Ctrl+F', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('f', { ctrlKey: true });
    expect(actions.onFocusSearch).toHaveBeenCalledTimes(1);
  });

  it('calls onFocusSearch on Meta+F (macOS)', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('f', { metaKey: true });
    expect(actions.onFocusSearch).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listener on unmount', () => {
    const actions = defaultActions();
    const { unmount } = renderHook(() => useKeyboardShortcuts(actions));

    unmount();

    fireKeyDown('n', { ctrlKey: true });
    expect(actions.onNewChat).not.toHaveBeenCalled();
  });

  it('Escape takes priority over Ctrl shortcuts when settings is open', () => {
    const actions = defaultActions();
    actions.isSettingsOpen = true;
    renderHook(() => useKeyboardShortcuts(actions));

    // Escape should close settings, not do anything else
    fireKeyDown('Escape');
    expect(actions.onCloseSettings).toHaveBeenCalledTimes(1);
    expect(actions.onNewChat).not.toHaveBeenCalled();
  });
});
