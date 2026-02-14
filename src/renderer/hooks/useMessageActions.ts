import { useState, useCallback, useMemo } from 'react';
import type { ContextMenuItem } from '../components/MessageContextMenu';
import type { PinnedMessage } from '../components/PinnedMessages';
import { useLocalStorage } from './useLocalStorage';
import { useBookmarks } from './useBookmarks';
import { useEmojiReactions } from './useEmojiReactions';
import * as S from '../constants/strings';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

interface Conversation {
  id: string;
  title: string;
}

interface UseMessageActionsParams {
  messages: Message[];
  conversations: Conversation[];
  currentConversationId: string | null;
  editMessage: (index: number, content: string) => void;
  deleteMessage: (index: number) => void;
  forkConversation: (fromIndex: number) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  handleSelectConversation: (id: string) => void;
}

export function useMessageActions({
  messages,
  conversations,
  currentConversationId,
  editMessage,
  deleteMessage,
  forkConversation,
  messagesContainerRef,
  handleSelectConversation,
}: UseMessageActionsParams) {
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageIndex: number } | null>(null);

  // Pinned messages
  const [pinnedMessages, setPinnedMessages] = useLocalStorage<PinnedMessage[]>(S.STORAGE_KEY_PINNED_MESSAGES, []);

  // Bookmarks
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();

  // Emoji reactions
  const { toggleReaction, getReactions } = useEmojiReactions();
  const [emojiPickerTarget, setEmojiPickerTarget] = useState<{ index: number; x: number; y: number } | null>(null);

  // Pin/unpin message handlers
  const handlePinMessage = useCallback((messageIndex: number) => {
    const msg = messages[messageIndex];
    if (!msg) return;
    setPinnedMessages(prev => {
      if (prev.some(p => p.index === messageIndex)) return prev;
      return [...prev, { index: messageIndex, role: msg.role, content: msg.content }];
    });
  }, [messages, setPinnedMessages]);

  const handleUnpinMessage = useCallback((messageIndex: number) => {
    setPinnedMessages(prev => prev.filter(p => p.index !== messageIndex));
  }, [setPinnedMessages]);

  // Navigate to message
  const handleNavigateToMessage = useCallback((messageIndex: number) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const messageElements = container.querySelectorAll('[data-message-index]');
    const target = messageElements[messageIndex];
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [messagesContainerRef]);

  // Context menu
  const handleMessageContextMenu = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageIndex: index });
  }, []);

  const contextMenuItems: ContextMenuItem[] = useMemo(() => [
    { id: 'copy', label: S.CTX_COPY, icon: S.CTX_COPY_ICON },
    { id: 'edit', label: S.CTX_EDIT, icon: S.CTX_EDIT_ICON },
    { id: 'pin', label: S.CTX_PIN, icon: S.CTX_PIN_ICON },
    { id: 'bookmark', label: S.CTX_BOOKMARK, icon: S.CTX_BOOKMARK_ICON },
    { id: 'emoji', label: S.CTX_REACTION, icon: S.CTX_REACTION_ICON },
    { id: 'fork', label: S.CTX_FORK, icon: S.CTX_FORK_ICON },
    { id: 'delete', label: S.CTX_DELETE, icon: S.CTX_DELETE_ICON, danger: true },
  ], []);

  const handleContextMenuAction = useCallback((actionId: string) => {
    if (contextMenu === null) return;
    const idx = contextMenu.messageIndex;
    switch (actionId) {
      case 'copy':
        navigator.clipboard.writeText(messages[idx]?.content || '');
        break;
      case 'edit':
        editMessage(idx, messages[idx]?.content || '');
        break;
      case 'pin':
        handlePinMessage(idx);
        break;
      case 'bookmark': {
        const msg = messages[idx];
        if (msg) {
          const conv = conversations.find(c => c.id === currentConversationId);
          addBookmark({
            conversationId: currentConversationId || '',
            conversationTitle: conv?.title || S.CTX_NO_TITLE,
            messageIndex: idx,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(),
          });
        }
        break;
      }
      case 'emoji':
        setEmojiPickerTarget({ index: idx, x: contextMenu.x, y: contextMenu.y });
        break;
      case 'fork':
        forkConversation(idx);
        break;
      case 'delete':
        deleteMessage(idx);
        break;
    }
    setContextMenu(null);
  }, [contextMenu, messages, editMessage, handlePinMessage, forkConversation, deleteMessage, conversations, currentConversationId, addBookmark]);

  // Emoji reaction handler
  const handleEmojiSelect = useCallback((emoji: string) => {
    if (emojiPickerTarget && currentConversationId) {
      toggleReaction(currentConversationId, emojiPickerTarget.index, emoji);
    }
    setEmojiPickerTarget(null);
  }, [emojiPickerTarget, currentConversationId, toggleReaction]);

  // MessageSearch navigation: switch to conversation and scroll to message
  const handleSearchNavigate = useCallback((conversationId: string, messageIndex: number) => {
    if (conversationId !== currentConversationId) {
      handleSelectConversation(conversationId);
    }
    setTimeout(() => handleNavigateToMessage(messageIndex), 100);
  }, [currentConversationId, handleSelectConversation, handleNavigateToMessage]);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);
  const closeEmojiPicker = useCallback(() => setEmojiPickerTarget(null), []);

  return useMemo(() => ({
    // Context menu
    contextMenu,
    contextMenuItems,
    handleMessageContextMenu,
    handleContextMenuAction,
    closeContextMenu,

    // Pinned messages
    pinnedMessages,
    handlePinMessage,
    handleUnpinMessage,

    // Bookmarks
    bookmarks,
    removeBookmark,

    // Emoji reactions
    getReactions,
    emojiPickerTarget,
    handleEmojiSelect,
    closeEmojiPicker,

    // Navigation
    handleNavigateToMessage,
    handleSearchNavigate,
  }), [contextMenu, contextMenuItems, handleMessageContextMenu, handleContextMenuAction, closeContextMenu, pinnedMessages, handlePinMessage, handleUnpinMessage, bookmarks, removeBookmark, getReactions, emojiPickerTarget, handleEmojiSelect, closeEmojiPicker, handleNavigateToMessage, handleSearchNavigate]);
}
