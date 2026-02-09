import { useEffect, useCallback } from 'react';

interface KeyboardShortcutActions {
  onNewChat: () => void;
  onClearConversation: () => void;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  isSettingsOpen: boolean;
}

export function useKeyboardShortcuts({
  onNewChat,
  onClearConversation,
  onToggleSettings,
  onCloseSettings,
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
    }
  }, [onNewChat, onClearConversation, onToggleSettings, onCloseSettings, isSettingsOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
