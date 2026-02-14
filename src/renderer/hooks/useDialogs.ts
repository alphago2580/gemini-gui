import { useState, useCallback, useMemo } from 'react';

/**
 * Manages all dialog/panel open states for App.tsx.
 * Consolidates 10+ useState boolean calls into a single hook.
 */
export function useDialogs() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isCodeSnippetsOpen, setIsCodeSnippetsOpen] = useState(false);
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);
  const [isLinkCollectionOpen, setIsLinkCollectionOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isPerfPanelOpen, setIsPerfPanelOpen] = useState(false);
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);
  const [isInputPreviewVisible, setIsInputPreviewVisible] = useState(false);
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);
  const [imageViewerState, setImageViewerState] = useState<{ open: boolean; src: string; alt: string }>({ open: false, src: '', alt: '' });

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const toggleSettings = useCallback(() => setIsSettingsOpen(prev => !prev), []);

  const toggleCommandPalette = useCallback(() => setIsCommandPaletteOpen(prev => !prev), []);
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []);

  const toggleQuickSwitcher = useCallback(() => setIsQuickSwitcherOpen(prev => !prev), []);
  const closeQuickSwitcher = useCallback(() => setIsQuickSwitcherOpen(false), []);

  const openCodeSnippets = useCallback(() => setIsCodeSnippetsOpen(true), []);
  const closeCodeSnippets = useCallback(() => setIsCodeSnippetsOpen(false), []);

  const toggleShortcutHelp = useCallback(() => setIsShortcutHelpOpen(prev => !prev), []);
  const closeShortcutHelp = useCallback(() => setIsShortcutHelpOpen(false), []);

  const openLinkCollection = useCallback(() => setIsLinkCollectionOpen(true), []);
  const closeLinkCollection = useCallback(() => setIsLinkCollectionOpen(false), []);

  const openStats = useCallback(() => setIsStatsOpen(true), []);
  const closeStats = useCallback(() => setIsStatsOpen(false), []);

  const openBookmarks = useCallback(() => setIsBookmarksOpen(true), []);
  const closeBookmarks = useCallback(() => setIsBookmarksOpen(false), []);

  const openPerfPanel = useCallback(() => setIsPerfPanelOpen(true), []);
  const closePerfPanel = useCallback(() => setIsPerfPanelOpen(false), []);

  const openMessageSearch = useCallback(() => setIsMessageSearchOpen(true), []);
  const closeMessageSearch = useCallback(() => setIsMessageSearchOpen(false), []);

  const toggleInputPreview = useCallback(() => setIsInputPreviewVisible(prev => !prev), []);

  const openBookmarkDrawer = useCallback(() => setIsBookmarkDrawerOpen(true), []);
  const closeBookmarkDrawer = useCallback(() => setIsBookmarkDrawerOpen(false), []);

  const openImageViewer = useCallback((src: string, alt?: string) => {
    setImageViewerState({ open: true, src, alt: alt || '' });
  }, []);
  const closeImageViewer = useCallback(() => {
    setImageViewerState({ open: false, src: '', alt: '' });
  }, []);

  return useMemo(() => ({
    // Settings
    isSettingsOpen,
    openSettings,
    closeSettings,
    toggleSettings,

    // Command palette
    isCommandPaletteOpen,
    toggleCommandPalette,
    closeCommandPalette,

    // Quick switcher
    isQuickSwitcherOpen,
    toggleQuickSwitcher,
    closeQuickSwitcher,

    // Code snippets
    isCodeSnippetsOpen,
    openCodeSnippets,
    closeCodeSnippets,

    // Shortcut help
    isShortcutHelpOpen,
    toggleShortcutHelp,
    closeShortcutHelp,

    // Link collection
    isLinkCollectionOpen,
    openLinkCollection,
    closeLinkCollection,

    // Stats
    isStatsOpen,
    openStats,
    closeStats,

    // Bookmarks
    isBookmarksOpen,
    openBookmarks,
    closeBookmarks,

    // Performance panel
    isPerfPanelOpen,
    openPerfPanel,
    closePerfPanel,

    // Message search
    isMessageSearchOpen,
    openMessageSearch,
    closeMessageSearch,

    // Input preview
    isInputPreviewVisible,
    toggleInputPreview,

    // Bookmark drawer
    isBookmarkDrawerOpen,
    openBookmarkDrawer,
    closeBookmarkDrawer,

    // Image viewer
    imageViewerState,
    openImageViewer,
    closeImageViewer,
  }), [
    isSettingsOpen, openSettings, closeSettings, toggleSettings,
    isCommandPaletteOpen, toggleCommandPalette, closeCommandPalette,
    isQuickSwitcherOpen, toggleQuickSwitcher, closeQuickSwitcher,
    isCodeSnippetsOpen, openCodeSnippets, closeCodeSnippets,
    isShortcutHelpOpen, toggleShortcutHelp, closeShortcutHelp,
    isLinkCollectionOpen, openLinkCollection, closeLinkCollection,
    isStatsOpen, openStats, closeStats,
    isBookmarksOpen, openBookmarks, closeBookmarks,
    isPerfPanelOpen, openPerfPanel, closePerfPanel,
    isMessageSearchOpen, openMessageSearch, closeMessageSearch,
    isInputPreviewVisible, toggleInputPreview,
    isBookmarkDrawerOpen, openBookmarkDrawer, closeBookmarkDrawer,
    imageViewerState, openImageViewer, closeImageViewer,
  ]);
}
