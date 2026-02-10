import { useEffect, useCallback } from 'react';

interface KeyboardShortcutActions {
  onNewChat: () => void;
  onClearConversation: () => void;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  onFocusSearch: () => void;
  onToggleSidebar: () => void;
  onToggleCommandPalette?: () => void;
  onToggleQuickSwitcher?: () => void;
  onNextTab?: () => void;
  onPrevTab?: () => void;
  onToggleShortcutHelp?: () => void;
  isSettingsOpen: boolean;
}

export function useKeyboardShortcuts({
  onNewChat,
  onClearConversation,
  onToggleSettings,
  onCloseSettings,
  onFocusSearch,
  onToggleSidebar,
  onToggleCommandPalette,
  onToggleQuickSwitcher,
  onNextTab,
  onPrevTab,
  onToggleShortcutHelp,
  isSettingsOpen,
}: KeyboardShortcutActions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Escape: close settings panel
    if (e.key === 'Escape' && isSettingsOpen) {
      e.preventDefault();
      onCloseSettings();
      return;
    }

    if (!isCtrlOrMeta) return;

    // Ctrl+Tab / Ctrl+Shift+Tab: Tab navigation
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevTab?.();
      } else {
        onNextTab?.();
      }
      return;
    }

    // Ctrl+Shift+P: Command Palette
    if (e.shiftKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      onToggleCommandPalette?.();
      return;
    }

    switch (e.key) {
      case 'n':
        e.preventDefault();
        onNewChat();
        break;
      case 'l':
        e.preventDefault();
        onClearConversation();
        break;
      case ',':
        e.preventDefault();
        onToggleSettings();
        break;
      case 'f':
        e.preventDefault();
        onFocusSearch();
        break;
      case 'k':
        e.preventDefault();
        onToggleQuickSwitcher?.();
        break;
      case 'b':
        e.preventDefault();
        onToggleSidebar();
        break;
      case '/':
        e.preventDefault();
        onToggleShortcutHelp?.();
        break;
    }
  }, [onNewChat, onClearConversation, onToggleSettings, onCloseSettings, onFocusSearch, onToggleSidebar, onToggleCommandPalette, onToggleQuickSwitcher, onNextTab, onPrevTab, onToggleShortcutHelp, isSettingsOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
