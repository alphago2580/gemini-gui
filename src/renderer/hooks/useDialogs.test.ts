import { renderHook, act } from '@testing-library/react';
import { useDialogs } from './useDialogs';

describe('useDialogs', () => {
  it('initializes all dialogs as closed', () => {
    const { result } = renderHook(() => useDialogs());
    expect(result.current.isSettingsOpen).toBe(false);
    expect(result.current.isCommandPaletteOpen).toBe(false);
    expect(result.current.isQuickSwitcherOpen).toBe(false);
    expect(result.current.isCodeSnippetsOpen).toBe(false);
    expect(result.current.isShortcutHelpOpen).toBe(false);
    expect(result.current.isLinkCollectionOpen).toBe(false);
    expect(result.current.isStatsOpen).toBe(false);
    expect(result.current.isBookmarksOpen).toBe(false);
    expect(result.current.isPerfPanelOpen).toBe(false);
    expect(result.current.isMessageSearchOpen).toBe(false);
    expect(result.current.isInputPreviewVisible).toBe(false);
  });

  it('opens and closes settings', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openSettings());
    expect(result.current.isSettingsOpen).toBe(true);
    act(() => result.current.closeSettings());
    expect(result.current.isSettingsOpen).toBe(false);
  });

  it('toggles settings', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleSettings());
    expect(result.current.isSettingsOpen).toBe(true);
    act(() => result.current.toggleSettings());
    expect(result.current.isSettingsOpen).toBe(false);
  });

  it('toggles and closes command palette', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleCommandPalette());
    expect(result.current.isCommandPaletteOpen).toBe(true);
    act(() => result.current.closeCommandPalette());
    expect(result.current.isCommandPaletteOpen).toBe(false);
  });

  it('toggles and closes quick switcher', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleQuickSwitcher());
    expect(result.current.isQuickSwitcherOpen).toBe(true);
    act(() => result.current.closeQuickSwitcher());
    expect(result.current.isQuickSwitcherOpen).toBe(false);
  });

  it('opens and closes code snippets', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openCodeSnippets());
    expect(result.current.isCodeSnippetsOpen).toBe(true);
    act(() => result.current.closeCodeSnippets());
    expect(result.current.isCodeSnippetsOpen).toBe(false);
  });

  it('toggles and closes shortcut help', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleShortcutHelp());
    expect(result.current.isShortcutHelpOpen).toBe(true);
    act(() => result.current.closeShortcutHelp());
    expect(result.current.isShortcutHelpOpen).toBe(false);
  });

  it('opens and closes link collection', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openLinkCollection());
    expect(result.current.isLinkCollectionOpen).toBe(true);
    act(() => result.current.closeLinkCollection());
    expect(result.current.isLinkCollectionOpen).toBe(false);
  });

  it('opens and closes stats', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openStats());
    expect(result.current.isStatsOpen).toBe(true);
    act(() => result.current.closeStats());
    expect(result.current.isStatsOpen).toBe(false);
  });

  it('opens and closes bookmarks', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openBookmarks());
    expect(result.current.isBookmarksOpen).toBe(true);
    act(() => result.current.closeBookmarks());
    expect(result.current.isBookmarksOpen).toBe(false);
  });

  it('opens and closes performance panel', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openPerfPanel());
    expect(result.current.isPerfPanelOpen).toBe(true);
    act(() => result.current.closePerfPanel());
    expect(result.current.isPerfPanelOpen).toBe(false);
  });

  it('opens and closes message search', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openMessageSearch());
    expect(result.current.isMessageSearchOpen).toBe(true);
    act(() => result.current.closeMessageSearch());
    expect(result.current.isMessageSearchOpen).toBe(false);
  });

  it('toggles input preview', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleInputPreview());
    expect(result.current.isInputPreviewVisible).toBe(true);
    act(() => result.current.toggleInputPreview());
    expect(result.current.isInputPreviewVisible).toBe(false);
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useDialogs());
    const firstOpenSettings = result.current.openSettings;
    const firstCloseSettings = result.current.closeSettings;
    const firstToggleCommandPalette = result.current.toggleCommandPalette;
    rerender();
    expect(result.current.openSettings).toBe(firstOpenSettings);
    expect(result.current.closeSettings).toBe(firstCloseSettings);
    expect(result.current.toggleCommandPalette).toBe(firstToggleCommandPalette);
  });

  it('dialogs are independent of each other', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => {
      result.current.openSettings();
      result.current.openCodeSnippets();
    });
    expect(result.current.isSettingsOpen).toBe(true);
    expect(result.current.isCodeSnippetsOpen).toBe(true);
    expect(result.current.isBookmarksOpen).toBe(false);
    act(() => result.current.closeSettings());
    expect(result.current.isSettingsOpen).toBe(false);
    expect(result.current.isCodeSnippetsOpen).toBe(true);
  });
});
