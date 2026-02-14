import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import React from 'react';
import type { StreamData, StreamErrorData } from '../preload/types';

/**
 * Integration test: 메시지 전송 → 응답 수신 플로우
 *
 * Tests the full message lifecycle through the App component:
 * 1. User types message → sends → user message appears in UI
 * 2. Stream data arrives → assistant message renders progressively
 * 3. Stream completes → loading state clears, UI returns to ready state
 * 4. Multi-turn conversation: send → receive → send → receive
 * 5. Error handling: stream errors surface in UI
 * 6. Token usage stats display after stream completion
 * 7. Conversation persistence across the flow
 */

// ---------- Mock setup ----------

const mockElectronAPI = {
  sendMessage: vi.fn().mockResolvedValue({ success: true }),
  onStreamData: vi.fn(),
  onStreamComplete: vi.fn(),
  onStreamError: vi.fn(),
  newConversation: vi.fn(),
  saveTempFile: vi.fn(),
  cleanupTempFiles: vi.fn(),
  removeAllListeners: vi.fn(),
  stopGemini: vi.fn(),
  exportMarkdown: vi.fn().mockResolvedValue({ success: true, path: '/tmp/test.md' }),
  exportPdf: vi.fn().mockResolvedValue({ success: true, path: '/tmp/test.pdf' }),
  onMenuAction: vi.fn(),
  onSessionStatus: vi.fn(),
  showNotification: vi.fn().mockResolvedValue({ success: true }),
  isWindowFocused: vi.fn().mockResolvedValue(true),
  setWindowTitle: vi.fn().mockResolvedValue(undefined),
};

global.window.electronAPI = mockElectronAPI as unknown as typeof window.electronAPI;

interface StreamCallbacks {
  streamData: ((data: StreamData) => void) | null;
  streamComplete: (() => void) | null;
  streamError: ((data: StreamErrorData) => void) | null;
}

function setupStreamCallbacks(): StreamCallbacks {
  const callbacks: StreamCallbacks = {
    streamData: null,
    streamComplete: null,
    streamError: null,
  };
  mockElectronAPI.onStreamData.mockImplementation((cb: (data: StreamData) => void) => {
    callbacks.streamData = cb;
  });
  mockElectronAPI.onStreamComplete.mockImplementation((cb: () => void) => {
    callbacks.streamComplete = cb;
  });
  mockElectronAPI.onStreamError.mockImplementation((cb: (data: StreamErrorData) => void) => {
    callbacks.streamError = cb;
  });
  return callbacks;
}

// ---------- Helpers ----------

async function sendMessage(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
  await user.type(input, text);
  await user.click(screen.getByText('전송'));
}

async function simulateAssistantResponse(
  callbacks: StreamCallbacks,
  content: string,
  options?: { chunks?: string[]; tokenStats?: Record<string, unknown> }
) {
  if (options?.chunks) {
    // Simulate streaming in multiple chunks
    for (let i = 0; i < options.chunks.length; i++) {
      await act(() => {
        callbacks.streamData?.({
          type: 'message',
          role: 'assistant',
          content: options.chunks![i],
          delta: true,
        });
      });
    }
  } else {
    // Single message
    await act(() => {
      callbacks.streamData?.({
        type: 'message',
        role: 'assistant',
        content,
        delta: false,
      });
    });
  }

  // Send token stats if provided
  if (options?.tokenStats) {
    await act(() => {
      callbacks.streamData?.({
        type: 'result',
        stats: options.tokenStats,
      });
    });
  }

  // Complete the stream
  await act(() => {
    callbacks.streamComplete?.();
  });
}

// ---------- Tests ----------

describe('Message Send → Receive Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Single message round-trip', () => {
    it('complete flow: type → send → stream response → display', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      // 1. Welcome screen is visible
      expect(screen.getByText('Gemini에 오신 것을 환영합니다!')).toBeInTheDocument();

      // 2. Send a message
      await sendMessage(user, '안녕하세요');

      // 3. User message appears
      expect(screen.getByText('안녕하세요')).toBeInTheDocument();

      // 4. Welcome message is gone
      expect(screen.queryByText('Gemini에 오신 것을 환영합니다!')).not.toBeInTheDocument();

      // 5. Loading state is active (stop button visible)
      expect(screen.getByText('중지')).toBeInTheDocument();

      // 6. Input is disabled during loading
      const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
      expect(input).toBeDisabled();

      // 7. electronAPI was called correctly
      expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('안녕하세요', undefined, undefined);

      // 8. Simulate assistant response
      await simulateAssistantResponse(callbacks, '반갑습니다! 무엇을 도와드릴까요?', {
        tokenStats: { inputTokens: 15, outputTokens: 20, totalTokens: 35 },
      });

      // 9. Assistant message appears
      expect(screen.getByText(/반갑습니다/)).toBeInTheDocument();

      // 10. Loading state cleared — input re-enabled
      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });

      // 11. Stop button gone
      expect(screen.queryByText('중지')).not.toBeInTheDocument();

      // 12. Token usage displayed
      const tokenDisplay = screen.getByRole('status', { name: '토큰 사용량' });
      expect(tokenDisplay).toBeInTheDocument();
      expect(tokenDisplay).toHaveTextContent('15');
      expect(tokenDisplay).toHaveTextContent('20');
      expect(tokenDisplay).toHaveTextContent('35');
    });

    it('handles streamed response in multiple chunks', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      await sendMessage(user, 'Tell me a story');

      // Stream response in 3 chunks
      await act(() => {
        callbacks.streamData?.({
          type: 'message',
          role: 'assistant',
          content: 'Once upon ',
          delta: true,
        });
      });

      // First chunk visible
      expect(screen.getByText('Once upon')).toBeInTheDocument();

      await act(() => {
        callbacks.streamData?.({
          type: 'message',
          role: 'assistant',
          content: 'a time, ',
          delta: true,
        });
      });

      // Accumulated content visible
      expect(screen.getByText('Once upon a time,')).toBeInTheDocument();

      await act(() => {
        callbacks.streamData?.({
          type: 'message',
          role: 'assistant',
          content: 'there was a developer.',
          delta: true,
        });
      });

      // Full content visible
      expect(screen.getByText('Once upon a time, there was a developer.')).toBeInTheDocument();

      // Complete the stream
      await act(() => {
        callbacks.streamComplete?.();
      });

      // Input re-enabled
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('Multi-turn conversation', () => {
    it('supports two consecutive message exchanges', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      // --- Turn 1 ---
      await sendMessage(user, '첫 번째 질문');

      expect(screen.getByText('첫 번째 질문')).toBeInTheDocument();
      expect(mockElectronAPI.sendMessage).toHaveBeenCalledTimes(1);

      await simulateAssistantResponse(callbacks, '첫 번째 답변입니다.');

      expect(screen.getByText(/첫 번째 답변입니다/)).toBeInTheDocument();

      // --- Turn 2 ---
      await sendMessage(user, '두 번째 질문');

      expect(screen.getByText('두 번째 질문')).toBeInTheDocument();
      expect(mockElectronAPI.sendMessage).toHaveBeenCalledTimes(2);

      await simulateAssistantResponse(callbacks, '두 번째 답변입니다.');

      expect(screen.getByText(/두 번째 답변입니다/)).toBeInTheDocument();

      // All 4 messages visible (2 user + 2 assistant)
      expect(screen.getByText('첫 번째 질문')).toBeInTheDocument();
      expect(screen.getByText(/첫 번째 답변입니다/)).toBeInTheDocument();
      expect(screen.getByText('두 번째 질문')).toBeInTheDocument();
      expect(screen.getByText(/두 번째 답변입니다/)).toBeInTheDocument();
    });

    it('clears token usage between turns and shows new stats', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      // Turn 1 with token stats
      await sendMessage(user, 'Question 1');
      await simulateAssistantResponse(callbacks, 'Answer 1', {
        tokenStats: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      });

      let tokenDisplay = screen.getByRole('status', { name: '토큰 사용량' });
      expect(tokenDisplay).toHaveTextContent('10');

      // Turn 2 — token usage should reset during loading
      await sendMessage(user, 'Question 2');

      // Token display should be hidden while loading
      expect(screen.queryByRole('status', { name: '토큰 사용량' })).not.toBeInTheDocument();

      // Complete turn 2 with different stats
      await simulateAssistantResponse(callbacks, 'Answer 2', {
        tokenStats: { inputTokens: 30, outputTokens: 12, totalTokens: 42 },
      });

      tokenDisplay = screen.getByRole('status', { name: '토큰 사용량' });
      expect(tokenDisplay).toHaveTextContent('30');
      expect(tokenDisplay).toHaveTextContent('12');
      expect(tokenDisplay).toHaveTextContent('42');
    });
  });

  describe('Error handling in flow', () => {
    it('displays error when sendMessage rejects', async () => {
      mockElectronAPI.sendMessage.mockRejectedValueOnce({ error: '서버 연결 실패' });

      const user = userEvent.setup();
      render(<App />);

      await sendMessage(user, '이것은 실패합니다');

      // User message still appears
      await waitFor(() => {
        expect(screen.getByText('이것은 실패합니다')).toBeInTheDocument();
      });

      // Error message appears
      await waitFor(() => {
        expect(screen.getByText(/오류 발생: 서버 연결 실패/)).toBeInTheDocument();
      });

      // Toast notification appears
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/메시지 전송 실패: 서버 연결 실패/)).toBeInTheDocument();
      });

      // Input re-enabled for retry
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        expect(input).not.toBeDisabled();
      });
    });

    it('handles stream error during response', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      await sendMessage(user, '응답 중 에러');

      // Simulate partial response then error
      await act(() => {
        callbacks.streamData?.({
          type: 'message',
          role: 'assistant',
          content: '부분 응답...',
          delta: false,
        });
      });

      expect(screen.getByText('부분 응답...')).toBeInTheDocument();

      // Stream error
      await act(() => {
        callbacks.streamError?.({ error: '스트림 연결이 끊어졌습니다' });
      });

      // Error message appears in chat
      await waitFor(() => {
        expect(screen.getByText(/오류: 스트림 연결이 끊어졌습니다/)).toBeInTheDocument();
      });

      // Loading state cleared
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        expect(input).not.toBeDisabled();
      });
    });

    it('recovers after error — next message sends normally', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      // First message fails
      mockElectronAPI.sendMessage.mockRejectedValueOnce({ error: '타임아웃' });
      await sendMessage(user, '실패 메시지');

      await waitFor(() => {
        expect(screen.getByText(/오류 발생: 타임아웃/)).toBeInTheDocument();
      });

      // Second message succeeds
      mockElectronAPI.sendMessage.mockResolvedValueOnce({ success: true });
      await sendMessage(user, '성공 메시지');

      expect(screen.getByText('성공 메시지')).toBeInTheDocument();
      expect(mockElectronAPI.sendMessage).toHaveBeenCalledTimes(2);

      await simulateAssistantResponse(callbacks, '정상 응답입니다.');

      expect(screen.getByText(/정상 응답입니다/)).toBeInTheDocument();
    });
  });

  describe('Input state management', () => {
    it('clears input field after sending', async () => {
      setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/메시지를 입력하세요/) as HTMLTextAreaElement;
      await user.type(input, '메시지 내용');
      expect(input.value).toBe('메시지 내용');

      await user.click(screen.getByText('전송'));
      expect(input.value).toBe('');
    });

    it('prevents sending while loading', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      // Send first message
      await sendMessage(user, '첫 메시지');

      // Try to send another while loading — input is disabled
      const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
      expect(input).toBeDisabled();

      // Complete first response
      await simulateAssistantResponse(callbacks, '응답');

      // Now input should be enabled again
      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });

    it('sends message with Enter key (not Shift+Enter)', async () => {
      setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
      await user.type(input, 'Enter 전송 테스트');

      // Enter should send
      await user.keyboard('{Enter}');

      expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Enter 전송 테스트', undefined, undefined);
    });
  });

  describe('Conversation persistence', () => {
    it('persists messages to localStorage during conversation', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      await sendMessage(user, 'Persistence test');
      await simulateAssistantResponse(callbacks, 'Stored response');

      // Check localStorage has the conversation
      const stored = localStorage.getItem('gemini-conversations');
      expect(stored).not.toBeNull();

      const conversations = JSON.parse(stored!);
      expect(Array.isArray(conversations)).toBe(true);
      expect(conversations.length).toBeGreaterThan(0);

      // Find conversation with our messages
      const conv = conversations.find(
        (c: { messages: Array<{ content: string }> }) =>
          c.messages.some((m: { content: string }) => m.content === 'Persistence test')
      );
      expect(conv).toBeDefined();
      expect(conv.messages.length).toBeGreaterThanOrEqual(2);

      // Verify both user and assistant messages persisted
      const userMsg = conv.messages.find((m: { content: string }) => m.content === 'Persistence test');
      const assistantMsg = conv.messages.find(
        (m: { content: string }) => m.content.includes('Stored response')
      );
      expect(userMsg).toBeDefined();
      expect(assistantMsg).toBeDefined();
    });
  });

  describe('Stop generation', () => {
    it('stop button calls stopGemini API', async () => {
      setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      await sendMessage(user, '긴 응답 요청');

      // Stop button should be visible
      const stopBtn = screen.getByRole('button', { name: '응답 생성 중지' });
      expect(stopBtn).toBeInTheDocument();

      await user.click(stopBtn);

      expect(mockElectronAPI.stopGemini).toHaveBeenCalled();
    });
  });

  describe('Streaming cursor indicator', () => {
    it('shows streaming cursor class during streaming', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      const { container } = render(<App />);

      await sendMessage(user, 'Streaming test');

      // Simulate streaming data
      await act(() => {
        callbacks.streamData?.({
          type: 'message',
          role: 'assistant',
          content: 'Typing...',
          delta: true,
        });
      });

      // Streaming cursor should be present
      const streamingElement = container.querySelector('.streaming-cursor');
      expect(streamingElement).toBeInTheDocument();

      // Complete the stream
      await act(() => {
        callbacks.streamComplete?.();
      });

      // Streaming cursor should be removed
      await waitFor(() => {
        const cursor = container.querySelector('.streaming-cursor');
        expect(cursor).not.toBeInTheDocument();
      });
    });
  });

  describe('Non-assistant stream data', () => {
    it('ignores stream data with non-assistant role', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      await sendMessage(user, 'Test');

      // Send stream data with user role — should be ignored
      await act(() => {
        callbacks.streamData?.({
          type: 'message',
          role: 'user',
          content: 'Should not appear as assistant',
          delta: false,
        });
      });

      // Complete
      await act(() => {
        callbacks.streamComplete?.();
      });

      // The content should not appear as a separate message
      // Only the original user message "Test" should be present
      expect(screen.queryByText('Should not appear as assistant')).not.toBeInTheDocument();
    });

    it('ignores stream data with type other than message for content', async () => {
      const callbacks = setupStreamCallbacks();
      const user = userEvent.setup();
      render(<App />);

      await sendMessage(user, 'Test');

      // Send result-type data — should not create a message
      await act(() => {
        callbacks.streamData?.({
          type: 'result',
          stats: { inputTokens: 5, outputTokens: 3, totalTokens: 8 },
        });
      });

      await act(() => {
        callbacks.streamComplete?.();
      });

      // Token usage should appear since stats are valid
      const tokenDisplay = screen.getByRole('status', { name: '토큰 사용량' });
      expect(tokenDisplay).toBeInTheDocument();
    });
  });
});
