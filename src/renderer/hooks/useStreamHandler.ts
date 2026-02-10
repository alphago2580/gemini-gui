import { useState, useEffect, useCallback } from 'react';
import type { StreamData, StreamErrorData, SessionStatusData, Message, TokenUsage } from '../../preload/types';
import { generateMessageId } from '../utils/format';
import * as S from '../constants/strings';

export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface UseStreamHandlerOptions {
  currentConversationId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  updateCurrentConversation: (messages: Message[]) => void;
  addToast: (type: 'error' | 'success' | 'info', message: string) => void;
  onComplete?: () => void;
}

export function useStreamHandler({
  currentConversationId,
  setMessages,
  updateCurrentConversation,
  addToast,
  onComplete,
}: UseStreamHandlerOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');

  const clearTokenUsage = useCallback(() => {
    setTokenUsage(null);
  }, []);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!window.electronAPI) return;

    // 스트리밍 데이터 처리
    window.electronAPI.onStreamData((data: StreamData) => {
      if (data.type === 'message' && data.role === 'assistant') {
        setIsStreaming(true);
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];

          if (lastMessage && lastMessage.role === 'assistant' && data.delta) {
            const updated = [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + (data.content || '') }
            ];
            updateCurrentConversation(updated);
            return updated;
          }
          const updated = [...prev, {
            id: generateMessageId(),
            role: 'assistant' as const,
            content: data.content || '',
            timestamp: new Date()
          }];
          updateCurrentConversation(updated);
          return updated;
        });
      } else if (data.type === 'result' && data.stats) {
        const stats = data.stats;
        const inputTokens = typeof stats.inputTokens === 'number' ? stats.inputTokens
          : typeof stats.input_tokens === 'number' ? stats.input_tokens : 0;
        const outputTokens = typeof stats.outputTokens === 'number' ? stats.outputTokens
          : typeof stats.output_tokens === 'number' ? stats.output_tokens : 0;
        const totalTokens = typeof stats.totalTokens === 'number' ? stats.totalTokens
          : typeof stats.total_tokens === 'number' ? stats.total_tokens
          : inputTokens + outputTokens;
        if (inputTokens > 0 || outputTokens > 0) {
          setTokenUsage({ inputTokens, outputTokens, totalTokens });
        }
      }
    });

    // 스트리밍 완료 처리
    window.electronAPI.onStreamComplete(() => {
      setIsLoading(false);
      setIsStreaming(false);
      onComplete?.();
    });

    // 세션 상태 처리
    if (window.electronAPI.onSessionStatus) {
      window.electronAPI.onSessionStatus((data: SessionStatusData) => {
        setSessionStatus(data.status);
      });
    }

    // 스트리밍 에러 처리
    window.electronAPI.onStreamError((data: StreamErrorData) => {
      console.error('Stream error:', data);
      addToast('error', data.error);
      setMessages(prev => {
        const updated = [...prev, {
          id: generateMessageId(),
          role: 'assistant' as const,
          content: `${S.STREAM_ERROR_PREFIX} ${data.error}`,
          timestamp: new Date()
        }];
        updateCurrentConversation(updated);
        return updated;
      });
      setIsLoading(false);
      setIsStreaming(false);
    });

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners();
      }
    };
  }, [currentConversationId, setMessages, updateCurrentConversation, addToast, onComplete]);

  return {
    isLoading,
    isStreaming,
    tokenUsage,
    clearTokenUsage,
    startLoading,
    stopLoading,
    sessionStatus,
  };
}
