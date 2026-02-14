import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreamHandler } from './useStreamHandler';

// Mock electronAPI
let streamDataCallback: ((data: Record<string, unknown>) => void) | null = null;
let streamCompleteCallback: (() => void) | null = null;
let streamErrorCallback: ((data: { error: string }) => void) | null = null;

const mockCleanupStreamData = vi.fn();
const mockCleanupStreamComplete = vi.fn();
const mockCleanupStreamError = vi.fn();

const mockElectronAPI = {
  onStreamData: vi.fn((cb) => { streamDataCallback = cb; return mockCleanupStreamData; }),
  onStreamComplete: vi.fn((cb) => { streamCompleteCallback = cb; return mockCleanupStreamComplete; }),
  onStreamError: vi.fn((cb) => { streamErrorCallback = cb; return mockCleanupStreamError; }),
  removeAllListeners: vi.fn(),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('useStreamHandler', () => {
  const mockSetMessages = vi.fn();
  const mockUpdateCurrentConversation = vi.fn();
  const mockAddToast = vi.fn();

  const defaultOptions = {
    currentConversationId: 'conv-1',
    setMessages: mockSetMessages,
    updateCurrentConversation: mockUpdateCurrentConversation,
    addToast: mockAddToast,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    streamDataCallback = null;
    streamCompleteCallback = null;
    streamErrorCallback = null;
  });

  it('initializes with isLoading false', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));
    expect(result.current.isLoading).toBe(false);
  });

  it('initializes with isStreaming false', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));
    expect(result.current.isStreaming).toBe(false);
  });

  it('initializes with tokenUsage null', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));
    expect(result.current.tokenUsage).toBeNull();
  });

  it('registers stream listeners on mount', () => {
    renderHook(() => useStreamHandler(defaultOptions));
    expect(mockElectronAPI.onStreamData).toHaveBeenCalled();
    expect(mockElectronAPI.onStreamComplete).toHaveBeenCalled();
    expect(mockElectronAPI.onStreamError).toHaveBeenCalled();
  });

  it('removes individual listeners on unmount', () => {
    const { unmount } = renderHook(() => useStreamHandler(defaultOptions));
    unmount();
    expect(mockCleanupStreamData).toHaveBeenCalled();
    expect(mockCleanupStreamComplete).toHaveBeenCalled();
    expect(mockCleanupStreamError).toHaveBeenCalled();
  });

  it('startLoading sets isLoading to true', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));
    act(() => {
      result.current.startLoading();
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('stopLoading sets isLoading to false', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));
    act(() => {
      result.current.startLoading();
    });
    expect(result.current.isLoading).toBe(true);
    act(() => {
      result.current.stopLoading();
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('sets isStreaming true when assistant message arrives', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));
    expect(streamDataCallback).not.toBeNull();

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: 'Hello',
        delta: true,
      });
    });

    expect(result.current.isStreaming).toBe(true);
  });

  it('sets isLoading false and isStreaming false on stream complete', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      result.current.startLoading();
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: 'Hello',
        delta: true,
      });
    });
    expect(result.current.isStreaming).toBe(true);

    act(() => {
      streamCompleteCallback!();
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);
  });

  it('handles stream error: adds toast, sets loading false', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      result.current.startLoading();
    });

    act(() => {
      streamErrorCallback!({ error: 'Connection failed' });
    });

    expect(mockAddToast).toHaveBeenCalledWith('error', 'Connection failed');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);
  });

  it('extracts token usage from result stats (camelCase)', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'result',
        stats: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      });
    });

    expect(result.current.tokenUsage).toEqual({
      inputTokens: 10,
      outputTokens: 5,
      totalTokens: 15,
    });
  });

  it('extracts token usage from result stats (snake_case)', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'result',
        stats: { input_tokens: 20, output_tokens: 10, total_tokens: 30 },
      });
    });

    expect(result.current.tokenUsage).toEqual({
      inputTokens: 20,
      outputTokens: 10,
      totalTokens: 30,
    });
  });

  it('does not set tokenUsage when stats have zero tokens', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'result',
        stats: { someOtherField: 'value' },
      });
    });

    expect(result.current.tokenUsage).toBeNull();
  });

  it('clearTokenUsage resets tokenUsage to null', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'result',
        stats: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      });
    });
    expect(result.current.tokenUsage).not.toBeNull();

    act(() => {
      result.current.clearTokenUsage();
    });
    expect(result.current.tokenUsage).toBeNull();
  });

  it('calls setMessages on assistant message data', () => {
    renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: 'Hi there',
        delta: false,
      });
    });

    expect(mockSetMessages).toHaveBeenCalled();
  });

  it('calls setMessages on stream error with error message', () => {
    renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamErrorCallback!({ error: 'Something went wrong' });
    });

    expect(mockSetMessages).toHaveBeenCalled();
  });

  it('appends new assistant message when last message is not from assistant', () => {
    renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: 'First chunk',
        delta: false,
      });
    });

    // setMessages should be called with updater function
    const updater = mockSetMessages.mock.calls[0][0];
    const userMessages = [{ role: 'user', content: 'Hello', timestamp: new Date() }];
    const result = updater(userMessages);
    expect(result).toHaveLength(2);
    expect(result[1].role).toBe('assistant');
    expect(result[1].content).toBe('First chunk');
    expect(result[1].id).toMatch(/^msg-/);
  });

  it('appends to existing assistant message when delta is true', () => {
    renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'assistant',
        content: ' world',
        delta: true,
      });
    });

    const updater = mockSetMessages.mock.calls[0][0];
    const existingMessages = [
      { role: 'user', content: 'Hi', timestamp: new Date() },
      { role: 'assistant', content: 'Hello', timestamp: new Date(), id: 'msg-1' },
    ];
    const result = updater(existingMessages);
    expect(result).toHaveLength(2);
    expect(result[1].content).toBe('Hello world');
  });

  it('computes totalTokens as inputTokens+outputTokens when total not provided', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'result',
        stats: { inputTokens: 100, outputTokens: 50 },
      });
    });

    expect(result.current.tokenUsage).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    });
  });

  it('stream error adds error message with prefix to messages', () => {
    renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamErrorCallback!({ error: 'API timeout' });
    });

    const updater = mockSetMessages.mock.calls[0][0];
    const result = updater([]);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('assistant');
    expect(result[0].content).toContain('오류:');
    expect(result[0].content).toContain('API timeout');
    expect(result[0].id).toMatch(/^msg-/);
  });

  it('ignores non-assistant message data', () => {
    const { result } = renderHook(() => useStreamHandler(defaultOptions));

    act(() => {
      streamDataCallback!({
        type: 'message',
        role: 'user',
        content: 'Should be ignored',
        delta: false,
      });
    });

    // isStreaming should remain false — non-assistant messages are ignored
    expect(result.current.isStreaming).toBe(false);
    expect(mockSetMessages).not.toHaveBeenCalled();
  });

  it('re-registers listeners when currentConversationId changes', () => {
    const options = { ...defaultOptions };
    const { rerender } = renderHook(
      (props) => useStreamHandler(props),
      { initialProps: options }
    );

    const initialCallCount = mockElectronAPI.onStreamData.mock.calls.length;

    rerender({ ...options, currentConversationId: 'conv-2' });

    // Should have re-registered listeners
    expect(mockElectronAPI.onStreamData.mock.calls.length).toBeGreaterThan(initialCallCount);
    // Old listeners should have been cleaned up individually
    expect(mockCleanupStreamData).toHaveBeenCalled();
    expect(mockCleanupStreamComplete).toHaveBeenCalled();
    expect(mockCleanupStreamError).toHaveBeenCalled();
  });
});
