import { useState, useEffect, useCallback } from 'react';
import { generateConversationTitle } from '../utils/format';
import type { Message, Conversation } from '../../preload/types';

const STORAGE_KEY_CONVERSATIONS = 'gemini-conversations';
const STORAGE_KEY_CURRENT_CONVERSATION = 'gemini-current-conversation';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    const savedCurrentConversationId = localStorage.getItem(STORAGE_KEY_CURRENT_CONVERSATION);

    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        const restored = parsed.map((conv: Record<string, unknown>) => ({
          ...conv,
          timestamp: new Date(conv.timestamp as string),
          messages: (conv.messages as Array<Record<string, unknown>>).map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp as string)
          }))
        })) as Conversation[];
        setConversations(restored);

        if (savedCurrentConversationId) {
          const conversation = restored.find((c: Conversation) => c.id === savedCurrentConversationId);
          if (conversation) {
            setCurrentConversationId(savedCurrentConversationId);
            setMessages(conversation.messages);
          }
        }
      } catch (error) {
        console.error('Failed to parse saved conversations:', error);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  // Save current conversation ID to localStorage
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem(STORAGE_KEY_CURRENT_CONVERSATION, currentConversationId);
    }
  }, [currentConversationId]);

  const updateCurrentConversation = useCallback((updatedMessages: Message[]) => {
    setMessages(updatedMessages);

    if (currentConversationId) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          const title = updatedMessages.length === 1 && updatedMessages[0].role === 'user'
            ? generateConversationTitle(updatedMessages[0].content)
            : conv.title;

          return {
            ...conv,
            messages: updatedMessages,
            title,
            timestamp: new Date()
          };
        }
        return conv;
      }));
    }
  }, [currentConversationId]);

  const handleNewChat = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: '새로운 대화',
      timestamp: new Date(),
      messages: []
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setMessages([]);

    if (window.electronAPI && window.electronAPI.newConversation) {
      window.electronAPI.newConversation();
    }
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setMessages(conversation.messages);
    }
  }, [conversations]);

  const deleteMessage = useCallback((index: number) => {
    setMessages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      updateCurrentConversation(updated);
      return updated;
    });
  }, [updateCurrentConversation]);

  const editMessage = useCallback((index: number, newContent: string) => {
    setMessages(prev => {
      const updated = prev.map((msg, i) =>
        i === index ? { ...msg, content: newContent } : msg
      );
      updateCurrentConversation(updated);
      return updated;
    });
  }, [updateCurrentConversation]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [currentConversationId]);

  const forkConversation = useCallback((messageIndex: number): string | null => {
    if (!currentConversationId) return null;

    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (!currentConv) return null;

    const forkedMessages = messages.slice(0, messageIndex + 1).map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    if (forkedMessages.length === 0) return null;

    const firstUserMsg = forkedMessages.find(m => m.role === 'user');
    const baseTitle = firstUserMsg
      ? generateConversationTitle(firstUserMsg.content)
      : currentConv.title;

    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `${baseTitle} (분기)`,
      timestamp: new Date(),
      messages: forkedMessages,
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setMessages(forkedMessages);

    if (window.electronAPI && window.electronAPI.newConversation) {
      window.electronAPI.newConversation();
    }

    return newConversation.id;
  }, [currentConversationId, conversations, messages]);

  return {
    conversations,
    currentConversationId,
    messages,
    setMessages,
    handleNewChat,
    handleSelectConversation,
    updateCurrentConversation,
    deleteMessage,
    editMessage,
    deleteConversation,
    forkConversation,
  };
}
