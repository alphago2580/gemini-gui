import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Tab } from '../components/TabBar';

const STORAGE_KEY_OPEN_TABS = 'gemini-open-tabs';

export function useTabs(
  currentConversationId: string | null,
  onSelectConversation: (id: string) => void,
  onNewChat: () => void,
  conversations: Array<{ id: string; title: string }>,
) {
  const [openTabIds, setOpenTabIds] = useLocalStorage<string[]>(STORAGE_KEY_OPEN_TABS, []);
  const [closedCurrentTab, setClosedCurrentTab] = useState(false);

  // Build tab objects from open tab IDs
  const tabs: Tab[] = useMemo(() => openTabIds
    .map(id => {
      const conv = conversations.find(c => c.id === id);
      return conv ? { id: conv.id, title: conv.title } : null;
    })
    .filter((tab): tab is Tab => tab !== null), [openTabIds, conversations]);

  // Ensure current conversation is in tabs
  const ensureTabOpen = useCallback((id: string) => {
    setOpenTabIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, [setOpenTabIds]);

  // Open a tab (select conversation + ensure tab is open)
  const selectTab = useCallback((id: string) => {
    ensureTabOpen(id);
    onSelectConversation(id);
  }, [ensureTabOpen, onSelectConversation]);

  // Close a tab
  const closeTab = useCallback((id: string) => {
    setOpenTabIds(prev => {
      const updated = prev.filter(tabId => tabId !== id);

      // If closing the active tab, switch to adjacent tab
      if (currentConversationId === id) {
        const currentIndex = prev.indexOf(id);
        const nextId = updated[Math.min(currentIndex, updated.length - 1)];
        if (nextId) {
          // Use setTimeout to avoid state update during render
          setTimeout(() => onSelectConversation(nextId), 0);
        } else {
          setClosedCurrentTab(true);
          setTimeout(() => {
            onNewChat();
            setClosedCurrentTab(false);
          }, 0);
        }
      }

      return updated;
    });
  }, [currentConversationId, onSelectConversation, onNewChat, setOpenTabIds]);

  // New tab = new conversation + add to tabs
  const newTab = useCallback(() => {
    onNewChat();
    // The new conversation ID will be ensured via the effect in App
  }, [onNewChat]);

  // Navigate to next tab (Ctrl+Tab)
  const nextTab = useCallback(() => {
    if (tabs.length <= 1 || !currentConversationId) return;
    const currentIndex = openTabIds.indexOf(currentConversationId);
    const nextIndex = (currentIndex + 1) % openTabIds.length;
    onSelectConversation(openTabIds[nextIndex]);
  }, [tabs.length, currentConversationId, openTabIds, onSelectConversation]);

  // Navigate to previous tab (Ctrl+Shift+Tab)
  const prevTab = useCallback(() => {
    if (tabs.length <= 1 || !currentConversationId) return;
    const currentIndex = openTabIds.indexOf(currentConversationId);
    const prevIndex = (currentIndex - 1 + openTabIds.length) % openTabIds.length;
    onSelectConversation(openTabIds[prevIndex]);
  }, [tabs.length, currentConversationId, openTabIds, onSelectConversation]);

  // Remove tab IDs that no longer have corresponding conversations
  const cleanupTabs = useCallback((conversationIds: string[]) => {
    setOpenTabIds(prev => prev.filter(id => conversationIds.includes(id)));
  }, [setOpenTabIds]);

  return {
    tabs,
    openTabIds,
    selectTab,
    closeTab,
    newTab,
    nextTab,
    prevTab,
    ensureTabOpen,
    cleanupTabs,
    closedCurrentTab,
  };
}
