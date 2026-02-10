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
    onToggleSidebar: vi.fn(),
    onToggleCommandPalette: vi.fn(),
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

  it('calls onToggleSidebar on Ctrl+B', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('b', { ctrlKey: true });
    expect(actions.onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleSidebar on Meta+B (macOS)', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('b', { metaKey: true });
    expect(actions.onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listener on unmount', () => {
    const actions = defaultActions();
    const { unmount } = renderHook(() => useKeyboardShortcuts(actions));

    unmount();

    fireKeyDown('n', { ctrlKey: true });
    expect(actions.onNewChat).not.toHaveBeenCalled();
  });

  it('calls onToggleCommandPalette on Ctrl+Shift+P', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('p', { ctrlKey: true, shiftKey: true });
    expect(actions.onToggleCommandPalette).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleCommandPalette on Meta+Shift+P (macOS)', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('p', { metaKey: true, shiftKey: true });
    expect(actions.onToggleCommandPalette).toHaveBeenCalledTimes(1);
  });

  it('does not call other shortcuts when Ctrl+Shift+P is pressed', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('p', { ctrlKey: true, shiftKey: true });
    expect(actions.onNewChat).not.toHaveBeenCalled();
    expect(actions.onClearConversation).not.toHaveBeenCalled();
    expect(actions.onToggleSettings).not.toHaveBeenCalled();
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

  it('calls onNextTab on Ctrl+Tab', () => {
    const actions = { ...defaultActions(), onNextTab: vi.fn(), onPrevTab: vi.fn() };
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('Tab', { ctrlKey: true });
    expect(actions.onNextTab).toHaveBeenCalledTimes(1);
    expect(actions.onPrevTab).not.toHaveBeenCalled();
  });

  it('calls onPrevTab on Ctrl+Shift+Tab', () => {
    const actions = { ...defaultActions(), onNextTab: vi.fn(), onPrevTab: vi.fn() };
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('Tab', { ctrlKey: true, shiftKey: true });
    expect(actions.onPrevTab).toHaveBeenCalledTimes(1);
    expect(actions.onNextTab).not.toHaveBeenCalled();
  });

  it('calls onNextTab on Meta+Tab (macOS)', () => {
    const actions = { ...defaultActions(), onNextTab: vi.fn(), onPrevTab: vi.fn() };
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('Tab', { metaKey: true });
    expect(actions.onNextTab).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleQuickSwitcher on Ctrl+K', () => {
    const actions = { ...defaultActions(), onToggleQuickSwitcher: vi.fn() };
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('k', { ctrlKey: true });
    expect(actions.onToggleQuickSwitcher).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleShortcutHelp on Ctrl+/', () => {
    const actions = { ...defaultActions(), onToggleShortcutHelp: vi.fn() };
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('/', { ctrlKey: true });
    expect(actions.onToggleShortcutHelp).toHaveBeenCalledTimes(1);
  });

  it('handles uppercase P for Ctrl+Shift+P', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('P', { ctrlKey: true, shiftKey: true });
    expect(actions.onToggleCommandPalette).toHaveBeenCalledTimes(1);
  });

  it('does not crash when optional onNextTab is undefined and Ctrl+Tab pressed', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    // onNextTab/onPrevTab are not provided — should not throw
    expect(() => fireKeyDown('Tab', { ctrlKey: true })).not.toThrow();
  });

  it('does not crash when optional onToggleQuickSwitcher is undefined', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    expect(() => fireKeyDown('k', { ctrlKey: true })).not.toThrow();
  });

  it('does not crash when optional onToggleShortcutHelp is undefined', () => {
    const actions = defaultActions();
    renderHook(() => useKeyboardShortcuts(actions));

    expect(() => fireKeyDown('/', { ctrlKey: true })).not.toThrow();
  });

  it('Ctrl+Tab takes priority over switch-case shortcuts', () => {
    const actions = { ...defaultActions(), onNextTab: vi.fn() };
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('Tab', { ctrlKey: true });
    expect(actions.onNextTab).toHaveBeenCalledTimes(1);
    expect(actions.onNewChat).not.toHaveBeenCalled();
    expect(actions.onToggleSidebar).not.toHaveBeenCalled();
  });

  it('Escape without settings open and without ctrl does nothing', () => {
    const actions = defaultActions();
    actions.isSettingsOpen = false;
    renderHook(() => useKeyboardShortcuts(actions));

    fireKeyDown('Escape');
    expect(actions.onCloseSettings).not.toHaveBeenCalled();
    expect(actions.onNewChat).not.toHaveBeenCalled();
  });
});
