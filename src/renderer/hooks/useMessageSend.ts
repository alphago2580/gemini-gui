import { useState, useEffect, useCallback } from 'react';
import type { Message } from '../../preload/types';

interface UseMessageSendOptions {
  currentConversationId: string | null;
  isLoading: boolean;
  settings: { systemPrompt: string; model: string };
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  updateCurrentConversation: (messages: Message[]) => void;
  handleNewChat: () => void;
  startLoading: () => void;
  stopLoading: () => void;
  clearTokenUsage: () => void;
  addToast: (type: 'error' | 'success' | 'info', message: string) => void;
}

function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function useMessageSend({
  currentConversationId,
  isLoading,
  settings,
  setMessages,
  updateCurrentConversation,
  handleNewChat,
  startLoading,
  stopLoading,
  clearTokenUsage,
  addToast,
}: UseMessageSendOptions) {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleFilesSelected = useCallback((files: File[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const saveTempFiles = useCallback(async (): Promise<string[]> => {
    const tempFilePaths: string[] = [];

    for (const file of attachedFiles) {
      try {
        const buffer = await fileToArrayBuffer(file);
        if (window.electronAPI && window.electronAPI.saveTempFile) {
          const filePath = await window.electronAPI.saveTempFile(file.name, buffer);
          tempFilePaths.push(filePath);
        }
      } catch (error) {
        console.error(`Error saving temp file ${file.name}:`, error);
      }
    }

    return tempFilePaths;
  }, [attachedFiles]);

  // Cleanup temp files on unmount
  useEffect(() => {
    return () => {
      if (window.electronAPI && window.electronAPI.cleanupTempFiles) {
        window.electronAPI.cleanupTempFiles();
      }
    };
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    if (!currentConversationId) {
      handleNewChat();
    }

    let fullMessageContent = input;
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(f => f.name).join(', ');
      fullMessageContent = `${input}\n\n[첨부 파일: ${fileNames}]`;

      try {
        const tempFilePaths = await saveTempFiles();
        if (tempFilePaths.length > 0) {
          fullMessageContent += `\n[파일 경로: ${tempFilePaths.join(', ')}]`;
        }
      } catch (error) {
        console.error('Error saving temp files:', error);
      }
    }

    const userMessage: Message = {
      role: 'user',
      content: fullMessageContent,
      timestamp: new Date()
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      updateCurrentConversation(updated);
      return updated;
    });

    const messageToSend = input;
    setInput('');
    startLoading();
    clearTokenUsage();

    try {
      await window.electronAPI.sendMessage(
        messageToSend,
        settings.systemPrompt || undefined,
        settings.model !== 'auto' ? settings.model : undefined
      );
      setAttachedFiles([]);
    } catch (error: unknown) {
      const errMsg = error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'error' in error
          ? String((error as { error: unknown }).error)
          : String(error);
      addToast('error', `메시지 전송 실패: ${errMsg}`);
      const errorMessage: Message = {
        role: 'assistant',
        content: `오류 발생: ${errMsg}`,
        timestamp: new Date()
      };
      setMessages(prev => {
        const updated = [...prev, errorMessage];
        updateCurrentConversation(updated);
        return updated;
      });
      stopLoading();
    }
  }, [input, isLoading, currentConversationId, attachedFiles, settings, setMessages, updateCurrentConversation, handleNewChat, startLoading, stopLoading, clearTokenUsage, addToast, saveTempFiles]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      handleFilesSelected(imageFiles);
    }
  }, [handleFilesSelected]);

  return {
    input,
    setInput,
    attachedFiles,
    handleFilesSelected,
    handleRemoveFile,
    handleSend,
    handleKeyDown,
    handlePaste,
  };
}
