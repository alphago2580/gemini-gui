import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConversations } from './useConversations';
import { useStreamHandler } from './useStreamHandler';
import { useMessageSend } from './useMessageSend';
import type { StreamData, StreamErrorData } from '../../preload/types';

/**
 * Integration test: Message send → response receive flow
 *
 * Tests the full message lifecycle by wiring together:
 *   useConversations (state) + useMessageSend (input/send) + useStreamHandler (stream)
 *
 * Flow under test:
 *   1. User creates a new conversation
 *   2. User types a message and sends it
 *   3. User message appears in the conversation
 *   4. Stream data arrives from the assistant
 *   5. Stream completes — loading/streaming flags reset
 *   6. Both user and assistant messages are persisted in conversation state
 */

// ---------- Mock electronAPI ----------

let streamDataCallback: ((data: StreamData) => void) | null = null;
let streamCompleteCallback: (() => void) | null = null;
let streamErrorCallback: ((data: StreamErrorData) => void) | null = null;

const noop = () => {};
const mockElectronAPI = {
  sendMessage: vi.fn().mockResolvedValue({ success: true, output: '', error: null }),
  newConversation: vi.fn().mockResolvedValue({ success: true }),
  onStreamData: vi.fn((cb: (data: StreamData) => void) => { streamDataCallback = cb; return noop; }),
  onStreamComplete: vi.fn((cb: () => void) => { streamCompleteCallback = cb; return noop; }),
  onStreamError: vi.fn((cb: (data: StreamErrorData) => void) => { streamErrorCallback = cb; return noop; }),
  removeAllListeners: vi.fn(),
  saveTempFile: vi.fn().mockResolvedValue('/tmp/test.txt'),
  cleanupTempFiles: vi.fn().mockResolvedValue({ success: true }),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// ---------- Helper: Combined hooks for integration testing ----------

interface IntegrationHookOptions {
  systemPrompt?: string;
  model?: string;
}

function useMessageFlowIntegration(options: IntegrationHookOptions = {}) {
  const conversations = useConversations();

  const stream = useStreamHandler({
    currentConversationId: conversations.currentConversationId,
    setMessages: conversations.setMessages,
    updateCurrentConversation: conversations.updateCurrentConversation,
    addToast: vi.fn(),
  });

  const messageSend = useMessageSend({
    currentConversationId: conversations.currentConversationId,
    isLoading: stream.isLoading,
    settings: {
      systemPrompt: options.systemPrompt || '',
      model: options.model || 'auto',
    },
    setMessages: conversations.setMessages,
    updateCurrentConversation: conversations.updateCurrentConversation,
    handleNewChat: conversations.handleNewChat,
    startLoading: stream.startLoading,
    stopLoading: stream.stopLoading,
    clearTokenUsage: stream.clearTokenUsage,
    addToast: vi.fn(),
  });

  return { conversations, stream, messageSend };
}

// ---------- Tests ----------

describe('Message Send → Response Receive Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    streamDataCallback = null;
    streamCompleteCallback = null;
    streamErrorCallback = null;
  });

  it('full flow: type → send → stream response → complete', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    // 1. Create a new conversation
    act(() => {
      result.current.conversations.handleNewChat();
    });
    expect(result.current.conversations.currentConversationId).not.toBeNull();
    expect(result.current.conversations.messages).toHaveLength(0);

    // 2. Type and send a message
    act(() => {
      result.current.messageSend.setInput('안녕하세요');
    });
    expect(result.current.messageSend.input).toBe('안녕하세요');

    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    // 3. User message should appear in conversation
    expect(result.current.conversations.messages).toHaveLength(1);
    expect(result.current.conversations.messages[0].role).toBe('user');
    expect(result.current.conversations.messages[0].content).toBe('안녕하세요');
    expect(result.current.conversations.messages[0].id).toMatch(/^msg-/);

    // 4. Loading should be true
    expect(result.current.stream.isLoading).toBe(true);
    expect(result.current.messageSend.input).toBe('');

    // 5. Simulate assistant streaming response
    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: '안녕하세요! ',
        delta: false,
      });
    });

    expect(result.current.stream.isStreaming).toBe(true);
    expect(result.current.conversations.messages).toHaveLength(2);
    expect(result.current.conversations.messages[1].role).toBe('assistant');
    expect(result.current.conversations.messages[1].content).toBe('안녕하세요! ');

    // 6. Simulate streaming delta (append)
    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: '무엇을 도와드릴까요?',
        delta: true,
      });
    });

    expect(result.current.conversations.messages).toHaveLength(2);
    expect(result.current.conversations.messages[1].content).toBe('안녕하세요! 무엇을 도와드릴까요?');

    // 7. Stream completes
    act(() => {
      streamCompleteCallback!();
    });

    expect(result.current.stream.isLoading).toBe(false);
    expect(result.current.stream.isStreaming).toBe(false);

    // 8. Final state: 2 messages in conversation
    expect(result.current.conversations.messages).toHaveLength(2);
    expect(result.current.conversations.messages[0].role).toBe('user');
    expect(result.current.conversations.messages[1].role).toBe('assistant');
  });

  it('sends message with system prompt and model settings', async () => {
    const { result } = renderHook(() =>
      useMessageFlowIntegration({ systemPrompt: 'Be concise', model: 'gemini-2.5-pro' })
    );

    act(() => {
      result.current.conversations.handleNewChat();
    });

    act(() => {
      result.current.messageSend.setInput('Hello');
    });

    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hello', 'Be concise', 'gemini-2.5-pro');
  });

  it('creates new conversation automatically when sending without one', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    // No conversation selected
    expect(result.current.conversations.currentConversationId).toBeNull();

    act(() => {
      result.current.messageSend.setInput('First message');
    });

    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    // handleNewChat should have been triggered
    expect(result.current.conversations.currentConversationId).not.toBeNull();
    expect(result.current.conversations.conversations.length).toBeGreaterThanOrEqual(1);
  });

  it('handles stream error gracefully', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    act(() => {
      result.current.messageSend.setInput('Test');
    });

    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    expect(result.current.stream.isLoading).toBe(true);
    expect(result.current.conversations.messages).toHaveLength(1);

    // Simulate stream error
    act(() => {
      streamErrorCallback!({ error: 'API rate limit exceeded' });
    });

    expect(result.current.stream.isLoading).toBe(false);
    expect(result.current.stream.isStreaming).toBe(false);

    // Error message should be added
    expect(result.current.conversations.messages).toHaveLength(2);
    expect(result.current.conversations.messages[1].role).toBe('assistant');
    expect(result.current.conversations.messages[1].content).toContain('API rate limit exceeded');
  });

  it('handles send failure (electronAPI rejection)', async () => {
    mockElectronAPI.sendMessage.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    act(() => {
      result.current.messageSend.setInput('Test');
    });

    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    // User message + error message
    expect(result.current.conversations.messages).toHaveLength(2);
    expect(result.current.conversations.messages[0].role).toBe('user');
    expect(result.current.conversations.messages[1].role).toBe('assistant');
    expect(result.current.conversations.messages[1].content).toContain('Network error');
  });

  it('prevents double-send while loading', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    // First send
    act(() => {
      result.current.messageSend.setInput('First');
    });

    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    expect(result.current.stream.isLoading).toBe(true);

    // Try to send again while loading
    act(() => {
      result.current.messageSend.setInput('Second');
    });

    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    // Only one call to sendMessage
    expect(mockElectronAPI.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('token usage is reported and cleared on new send', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    // Send message
    act(() => {
      result.current.messageSend.setInput('Test');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    // Simulate token usage in result
    act(() => {
      streamDataCallback!({
        type: 'result',
        stats: { inputTokens: 50, outputTokens: 25, totalTokens: 75 },
      });
    });

    expect(result.current.stream.tokenUsage).toEqual({
      inputTokens: 50,
      outputTokens: 25,
      totalTokens: 75,
    });

    // Complete the stream
    act(() => {
      streamCompleteCallback!();
    });

    // Send another message — tokenUsage should be cleared on send
    act(() => {
      result.current.messageSend.setInput('Second');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    expect(result.current.stream.tokenUsage).toBeNull();
  });

  it('multi-turn conversation preserves message history', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    // Turn 1
    act(() => {
      result.current.messageSend.setInput('첫 번째 질문');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: '첫 번째 답변',
        delta: false,
      });
    });
    act(() => {
      streamCompleteCallback!();
    });

    expect(result.current.conversations.messages).toHaveLength(2);

    // Turn 2
    act(() => {
      result.current.messageSend.setInput('두 번째 질문');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: '두 번째 답변',
        delta: false,
      });
    });
    act(() => {
      streamCompleteCallback!();
    });

    // All 4 messages should be in order
    expect(result.current.conversations.messages).toHaveLength(4);
    expect(result.current.conversations.messages[0].content).toBe('첫 번째 질문');
    expect(result.current.conversations.messages[0].role).toBe('user');
    expect(result.current.conversations.messages[1].content).toBe('첫 번째 답변');
    expect(result.current.conversations.messages[1].role).toBe('assistant');
    expect(result.current.conversations.messages[2].content).toBe('두 번째 질문');
    expect(result.current.conversations.messages[2].role).toBe('user');
    expect(result.current.conversations.messages[3].content).toBe('두 번째 답변');
    expect(result.current.conversations.messages[3].role).toBe('assistant');
  });

  it('streaming delta appends content correctly across multiple chunks', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    act(() => {
      result.current.messageSend.setInput('Tell me a story');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    // Simulate multi-chunk streaming
    const chunks = ['Once ', 'upon ', 'a ', 'time...'];

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: chunks[0],
        delta: false,
      });
    });

    for (let i = 1; i < chunks.length; i++) {
      act(() => {
        streamDataCallback!({
          type: 'message',
          role: 'assistant',
          content: chunks[i],
          delta: true,
        });
      });
    }

    act(() => {
      streamCompleteCallback!();
    });

    expect(result.current.conversations.messages).toHaveLength(2);
    expect(result.current.conversations.messages[1].content).toBe('Once upon a time...');
    expect(result.current.stream.isLoading).toBe(false);
    expect(result.current.stream.isStreaming).toBe(false);
  });

  it('conversation title is generated from first user message', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    const convId = result.current.conversations.currentConversationId!;

    act(() => {
      result.current.messageSend.setInput('리액트 함수형 컴포넌트에 대해 설명해주세요');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    // The conversation title should be updated from the first user message
    const conv = result.current.conversations.conversations.find(c => c.id === convId);
    expect(conv).toBeDefined();
    expect(conv!.title).not.toBe('새로운 대화');
    expect(conv!.title.length).toBeGreaterThan(0);
  });

  it('switching conversations preserves separate message histories', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    // Create conversation 1
    act(() => {
      result.current.conversations.handleNewChat();
    });
    const conv1Id = result.current.conversations.currentConversationId!;

    act(() => {
      result.current.messageSend.setInput('대화 1 메시지');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });
    act(() => {
      streamDataCallback!({ type: 'message', role: 'assistant', content: '대화 1 답변', delta: false });
    });
    act(() => {
      streamCompleteCallback!();
    });

    // Create conversation 2
    act(() => {
      result.current.conversations.handleNewChat();
    });
    const conv2Id = result.current.conversations.currentConversationId!;
    expect(conv2Id).not.toBe(conv1Id);

    act(() => {
      result.current.messageSend.setInput('대화 2 메시지');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });
    act(() => {
      streamDataCallback!({ type: 'message', role: 'assistant', content: '대화 2 답변', delta: false });
    });
    act(() => {
      streamCompleteCallback!();
    });

    // Conv2 should have its own messages
    expect(result.current.conversations.messages).toHaveLength(2);
    expect(result.current.conversations.messages[0].content).toBe('대화 2 메시지');

    // Switch back to conv1
    act(() => {
      result.current.conversations.handleSelectConversation(conv1Id);
    });

    expect(result.current.conversations.messages).toHaveLength(2);
    expect(result.current.conversations.messages[0].content).toBe('대화 1 메시지');
    expect(result.current.conversations.messages[1].content).toBe('대화 1 답변');
  });

  it('empty and whitespace-only inputs are rejected', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    // Empty
    await act(async () => {
      await result.current.messageSend.handleSend();
    });
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();

    // Whitespace only
    act(() => {
      result.current.messageSend.setInput('   \n\t  ');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
    expect(result.current.conversations.messages).toHaveLength(0);
  });

  it('all messages have unique IDs', async () => {
    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    // Send 3 turns
    for (const text of ['A', 'B', 'C']) {
      act(() => {
        result.current.messageSend.setInput(text);
      });
      await act(async () => {
        await result.current.messageSend.handleSend();
      });
      act(() => {
        streamDataCallback!({ type: 'message', role: 'assistant', content: `Reply to ${text}`, delta: false });
      });
      act(() => {
        streamCompleteCallback!();
      });
    }

    const ids = result.current.conversations.messages.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    expect(ids.length).toBe(6); // 3 user + 3 assistant
  });

  it('messages have valid timestamps', async () => {
    const before = new Date();

    const { result } = renderHook(() => useMessageFlowIntegration());

    act(() => {
      result.current.conversations.handleNewChat();
    });

    act(() => {
      result.current.messageSend.setInput('Timestamp test');
    });
    await act(async () => {
      await result.current.messageSend.handleSend();
    });

    act(() => {
      streamDataCallback!({ type: 'message', role: 'assistant', content: 'Reply', delta: false });
    });
    act(() => {
      streamCompleteCallback!();
    });

    const after = new Date();

    for (const msg of result.current.conversations.messages) {
      expect(msg.timestamp).toBeInstanceOf(Date);
      expect(msg.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(msg.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    }
  });
});
