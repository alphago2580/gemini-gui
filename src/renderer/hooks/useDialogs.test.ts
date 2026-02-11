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

  it('toggleCommandPalette toggles from true to false', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleCommandPalette());
    expect(result.current.isCommandPaletteOpen).toBe(true);
    act(() => result.current.toggleCommandPalette());
    expect(result.current.isCommandPaletteOpen).toBe(false);
  });

  it('toggleQuickSwitcher toggles from true to false', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleQuickSwitcher());
    expect(result.current.isQuickSwitcherOpen).toBe(true);
    act(() => result.current.toggleQuickSwitcher());
    expect(result.current.isQuickSwitcherOpen).toBe(false);
  });

  it('toggleShortcutHelp toggles from true to false', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleShortcutHelp());
    expect(result.current.isShortcutHelpOpen).toBe(true);
    act(() => result.current.toggleShortcutHelp());
    expect(result.current.isShortcutHelpOpen).toBe(false);
  });

  it('all open/close callbacks are stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useDialogs());
    const first = {
      openSettings: result.current.openSettings,
      closeSettings: result.current.closeSettings,
      toggleSettings: result.current.toggleSettings,
      toggleCommandPalette: result.current.toggleCommandPalette,
      closeCommandPalette: result.current.closeCommandPalette,
      openCodeSnippets: result.current.openCodeSnippets,
      closeCodeSnippets: result.current.closeCodeSnippets,
      openLinkCollection: result.current.openLinkCollection,
      closeLinkCollection: result.current.closeLinkCollection,
      openStats: result.current.openStats,
      closeStats: result.current.closeStats,
      openBookmarks: result.current.openBookmarks,
      closeBookmarks: result.current.closeBookmarks,
      openPerfPanel: result.current.openPerfPanel,
      closePerfPanel: result.current.closePerfPanel,
      openMessageSearch: result.current.openMessageSearch,
      closeMessageSearch: result.current.closeMessageSearch,
      toggleInputPreview: result.current.toggleInputPreview,
    };
    rerender();
    expect(result.current.openSettings).toBe(first.openSettings);
    expect(result.current.closeSettings).toBe(first.closeSettings);
    expect(result.current.toggleSettings).toBe(first.toggleSettings);
    expect(result.current.toggleCommandPalette).toBe(first.toggleCommandPalette);
    expect(result.current.closeCommandPalette).toBe(first.closeCommandPalette);
    expect(result.current.openCodeSnippets).toBe(first.openCodeSnippets);
    expect(result.current.closeCodeSnippets).toBe(first.closeCodeSnippets);
    expect(result.current.openLinkCollection).toBe(first.openLinkCollection);
    expect(result.current.closeLinkCollection).toBe(first.closeLinkCollection);
    expect(result.current.openStats).toBe(first.openStats);
    expect(result.current.closeStats).toBe(first.closeStats);
    expect(result.current.openBookmarks).toBe(first.openBookmarks);
    expect(result.current.closeBookmarks).toBe(first.closeBookmarks);
    expect(result.current.openPerfPanel).toBe(first.openPerfPanel);
    expect(result.current.closePerfPanel).toBe(first.closePerfPanel);
    expect(result.current.openMessageSearch).toBe(first.openMessageSearch);
    expect(result.current.closeMessageSearch).toBe(first.closeMessageSearch);
    expect(result.current.toggleInputPreview).toBe(first.toggleInputPreview);
  });

  it('opening all dialogs works simultaneously', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => {
      result.current.openSettings();
      result.current.openCodeSnippets();
      result.current.openLinkCollection();
      result.current.openStats();
      result.current.openBookmarks();
      result.current.openPerfPanel();
      result.current.openMessageSearch();
    });
    expect(result.current.isSettingsOpen).toBe(true);
    expect(result.current.isCodeSnippetsOpen).toBe(true);
    expect(result.current.isLinkCollectionOpen).toBe(true);
    expect(result.current.isStatsOpen).toBe(true);
    expect(result.current.isBookmarksOpen).toBe(true);
    expect(result.current.isPerfPanelOpen).toBe(true);
    expect(result.current.isMessageSearchOpen).toBe(true);
  });

  it('closing all dialogs works after opening all', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => {
      result.current.openSettings();
      result.current.openCodeSnippets();
      result.current.openLinkCollection();
      result.current.openStats();
      result.current.openBookmarks();
      result.current.openPerfPanel();
      result.current.openMessageSearch();
    });
    act(() => {
      result.current.closeSettings();
      result.current.closeCodeSnippets();
      result.current.closeLinkCollection();
      result.current.closeStats();
      result.current.closeBookmarks();
      result.current.closePerfPanel();
      result.current.closeMessageSearch();
    });
    expect(result.current.isSettingsOpen).toBe(false);
    expect(result.current.isCodeSnippetsOpen).toBe(false);
    expect(result.current.isLinkCollectionOpen).toBe(false);
    expect(result.current.isStatsOpen).toBe(false);
    expect(result.current.isBookmarksOpen).toBe(false);
    expect(result.current.isPerfPanelOpen).toBe(false);
    expect(result.current.isMessageSearchOpen).toBe(false);
  });

  it('toggleInputPreview cycle', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.toggleInputPreview());
    act(() => result.current.toggleInputPreview());
    act(() => result.current.toggleInputPreview());
    expect(result.current.isInputPreviewVisible).toBe(true);
    act(() => result.current.toggleInputPreview());
    expect(result.current.isInputPreviewVisible).toBe(false);
  });

  it('close on already-closed dialog is a no-op', () => {
    const { result } = renderHook(() => useDialogs());
    expect(result.current.isSettingsOpen).toBe(false);
    act(() => result.current.closeSettings());
    expect(result.current.isSettingsOpen).toBe(false);
  });
});
