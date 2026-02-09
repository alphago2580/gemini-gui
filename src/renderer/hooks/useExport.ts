import { useCallback } from 'react';
import type { Message, Conversation } from '../../preload/types';
import { exportToMarkdown, exportToHtml, sanitizeFileName } from '../utils/format';

interface UseExportOptions {
  messages: Message[];
  conversations: Conversation[];
  currentConversationId: string | null;
}

export function useExport({
  messages,
  conversations,
  currentConversationId,
}: UseExportOptions) {
  const getCurrentTitle = useCallback(() => {
    const currentConv = conversations.find(c => c.id === currentConversationId);
    return currentConv?.title || 'Untitled Conversation';
  }, [conversations, currentConversationId]);

  const handleExport = useCallback(async () => {
    if (messages.length === 0) return;
    const title = getCurrentTitle();
    const markdown = exportToMarkdown(title, messages);
    const defaultFileName = `${sanitizeFileName(title)}.md`;
    if (window.electronAPI?.exportMarkdown) {
      await window.electronAPI.exportMarkdown(markdown, defaultFileName);
    }
  }, [messages, getCurrentTitle]);

  const handleExportPdf = useCallback(async () => {
    if (messages.length === 0) return;
    const title = getCurrentTitle();
    const html = exportToHtml(title, messages);
    const defaultFileName = `${sanitizeFileName(title)}.pdf`;
    if (window.electronAPI?.exportPdf) {
      await window.electronAPI.exportPdf(html, defaultFileName);
    }
  }, [messages, getCurrentTitle]);

  return {
    getCurrentTitle,
    handleExport,
    handleExportPdf,
  };
}
