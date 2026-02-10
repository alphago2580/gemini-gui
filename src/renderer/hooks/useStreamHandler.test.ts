import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreamHandler } from './useStreamHandler';

// Mock electronAPI
let streamDataCallback: ((data: Record<string, unknown>) => void) | null = null;
let streamCompleteCallback: (() => void) | null = null;
let streamErrorCallback: ((data: { error: string }) => void) | null = null;
let sessionStatusCallback: ((data: { status: string }) => void) | null = null;

const mockElectronAPI = {
  onStreamData: vi.fn((cb) => { streamDataCallback = cb; }),
  onStreamComplete: vi.fn((cb) => { streamCompleteCallback = cb; }),
  onStreamError: vi.fn((cb) => { streamErrorCallback = cb; }),
  onSessionStatus: vi.fn((cb) => { sessionStatusCallback = cb; }),
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
    sessionStatusCallback = null;
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

  it('removes listeners on unmount', () => {
    const { unmount } = renderHook(() => useStreamHandler(defaultOptions));
    unmount();
    expect(mockElectronAPI.removeAllListeners).toHaveBeenCalled();
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

  describe('sessionStatus', () => {
    it('initializes with idle status', () => {
      const { result } = renderHook(() => useStreamHandler(defaultOptions));
      expect(result.current.sessionStatus).toBe('idle');
    });

    it('registers session status listener on mount', () => {
      renderHook(() => useStreamHandler(defaultOptions));
      expect(mockElectronAPI.onSessionStatus).toHaveBeenCalled();
    });

    it('updates sessionStatus when session-status event fires', () => {
      const { result } = renderHook(() => useStreamHandler(defaultOptions));

      act(() => {
        sessionStatusCallback!({ status: 'connecting' });
      });
      expect(result.current.sessionStatus).toBe('connecting');

      act(() => {
        sessionStatusCallback!({ status: 'connected' });
      });
      expect(result.current.sessionStatus).toBe('connected');

      act(() => {
        sessionStatusCallback!({ status: 'idle' });
      });
      expect(result.current.sessionStatus).toBe('idle');
    });

    it('updates sessionStatus to error on error event', () => {
      const { result } = renderHook(() => useStreamHandler(defaultOptions));

      act(() => {
        sessionStatusCallback!({ status: 'error' });
      });
      expect(result.current.sessionStatus).toBe('error');
    });
  });
});
