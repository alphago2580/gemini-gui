import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMessageSend } from './useMessageSend';

// Mock electronAPI
const mockElectronAPI = {
  sendMessage: vi.fn().mockResolvedValue({ success: true, output: '', error: null }),
  saveTempFile: vi.fn().mockResolvedValue('/tmp/test-file.txt'),
  cleanupTempFiles: vi.fn().mockResolvedValue({ success: true }),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('useMessageSend', () => {
  const mockSetMessages = vi.fn();
  const mockUpdateCurrentConversation = vi.fn();
  const mockHandleNewChat = vi.fn();
  const mockStartLoading = vi.fn();
  const mockStopLoading = vi.fn();
  const mockClearTokenUsage = vi.fn();
  const mockAddToast = vi.fn();

  const defaultOptions = {
    currentConversationId: 'conv-1',
    isLoading: false,
    settings: { systemPrompt: '', model: 'auto' },
    setMessages: mockSetMessages,
    updateCurrentConversation: mockUpdateCurrentConversation,
    handleNewChat: mockHandleNewChat,
    startLoading: mockStartLoading,
    stopLoading: mockStopLoading,
    clearTokenUsage: mockClearTokenUsage,
    addToast: mockAddToast,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockElectronAPI.sendMessage.mockResolvedValue({ success: true, output: '', error: null });
  });

  it('initializes with empty input and no attached files', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    expect(result.current.input).toBe('');
    expect(result.current.attachedFiles).toEqual([]);
  });

  it('updates input value', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello');
    });
    expect(result.current.input).toBe('Hello');
  });

  it('adds files via handleFilesSelected', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    act(() => {
      result.current.handleFilesSelected([file]);
    });
    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].name).toBe('test.txt');
  });

  it('removes file by index via handleRemoveFile', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
    const file2 = new File(['b'], 'b.txt', { type: 'text/plain' });
    act(() => {
      result.current.handleFilesSelected([file1, file2]);
    });
    expect(result.current.attachedFiles).toHaveLength(2);
    act(() => {
      result.current.handleRemoveFile(0);
    });
    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].name).toBe('b.txt');
  });

  it('does not send when input is empty', async () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
    expect(mockStartLoading).not.toHaveBeenCalled();
  });

  it('does not send when isLoading is true', async () => {
    const { result } = renderHook(() => useMessageSend({ ...defaultOptions, isLoading: true }));
    act(() => {
      result.current.setInput('Hello');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
  });

  it('sends message with correct arguments', async () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello world');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hello world', undefined, undefined);
    expect(mockStartLoading).toHaveBeenCalled();
    expect(mockClearTokenUsage).toHaveBeenCalled();
  });

  it('passes systemPrompt when set', async () => {
    const { result } = renderHook(() => useMessageSend({
      ...defaultOptions,
      settings: { systemPrompt: 'You are helpful', model: 'auto' },
    }));
    act(() => {
      result.current.setInput('Hi');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hi', 'You are helpful', undefined);
  });

  it('passes model when not auto', async () => {
    const { result } = renderHook(() => useMessageSend({
      ...defaultOptions,
      settings: { systemPrompt: '', model: 'gemini-2.5-pro' },
    }));
    act(() => {
      result.current.setInput('Hi');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hi', undefined, 'gemini-2.5-pro');
  });

  it('clears input after sending', async () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(result.current.input).toBe('');
  });

  it('adds user message to state via setMessages', async () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Test message');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockSetMessages).toHaveBeenCalled();
    // Get the updater function passed to setMessages
    const updater = mockSetMessages.mock.calls[0][0];
    const updated = updater([]);
    expect(updated).toHaveLength(1);
    expect(updated[0].role).toBe('user');
    expect(updated[0].content).toBe('Test message');
    expect(updated[0].id).toMatch(/^msg-/);
  });

  it('calls handleNewChat when no currentConversationId', async () => {
    const { result } = renderHook(() => useMessageSend({
      ...defaultOptions,
      currentConversationId: null,
    }));
    act(() => {
      result.current.setInput('Hi');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockHandleNewChat).toHaveBeenCalled();
  });

  it('shows toast and error message on send failure', async () => {
    mockElectronAPI.sendMessage.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockAddToast).toHaveBeenCalledWith('error', '메시지 전송 실패: Network error');
    expect(mockStopLoading).toHaveBeenCalled();
    // Error message added to messages
    expect(mockSetMessages).toHaveBeenCalledTimes(2); // user message + error message
  });

  it('handleKeyDown sends on Enter without Shift', async () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello');
    });
    const event = {
      key: 'Enter',
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;
    await act(async () => {
      result.current.handleKeyDown(event);
    });
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockElectronAPI.sendMessage).toHaveBeenCalled();
  });

  it('handleKeyDown does not send on Shift+Enter', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello');
    });
    const event = {
      key: 'Enter',
      shiftKey: true,
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;
    act(() => {
      result.current.handleKeyDown(event);
    });
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
  });

  it('handlePaste detects image files and adds them', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const file = new File(['pixels'], 'image.png', { type: 'image/png' });
    const event = {
      clipboardData: {
        items: {
          length: 1,
          0: { type: 'image/png', getAsFile: () => file },
        },
      },
      preventDefault: vi.fn(),
    } as unknown as React.ClipboardEvent;
    act(() => {
      result.current.handlePaste(event);
    });
    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].name).toBe('image.png');
  });

  it('handlePaste ignores non-image clipboard data', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const event = {
      clipboardData: {
        items: {
          length: 1,
          0: { type: 'text/plain', getAsFile: () => null },
        },
      },
      preventDefault: vi.fn(),
    } as unknown as React.ClipboardEvent;
    act(() => {
      result.current.handlePaste(event);
    });
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  it('cleans up temp files on unmount', () => {
    const { unmount } = renderHook(() => useMessageSend(defaultOptions));
    unmount();
    expect(mockElectronAPI.cleanupTempFiles).toHaveBeenCalled();
  });

  it('does not send when input is only whitespace', async () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('   \n\t  ');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
    expect(mockStartLoading).not.toHaveBeenCalled();
  });

  it('appends file names to message content when files are attached', async () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const file = new File(['data'], 'report.pdf', { type: 'application/pdf' });
    act(() => {
      result.current.setInput('Check this file');
      result.current.handleFilesSelected([file]);
    });
    await act(async () => {
      await result.current.handleSend();
    });
    const updater = mockSetMessages.mock.calls[0][0];
    const updated = updater([]);
    expect(updated[0].content).toContain('첨부 파일:');
    expect(updated[0].content).toContain('report.pdf');
  });

  it('clears attached files after successful send', async () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const file = new File(['data'], 'image.png', { type: 'image/png' });
    act(() => {
      result.current.setInput('Here is an image');
      result.current.handleFilesSelected([file]);
    });
    expect(result.current.attachedFiles).toHaveLength(1);
    await act(async () => {
      await result.current.handleSend();
    });
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  it('accumulates multiple file selections', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
    const file2 = new File(['b'], 'b.txt', { type: 'text/plain' });
    const file3 = new File(['c'], 'c.txt', { type: 'text/plain' });
    act(() => {
      result.current.handleFilesSelected([file1]);
    });
    act(() => {
      result.current.handleFilesSelected([file2, file3]);
    });
    expect(result.current.attachedFiles).toHaveLength(3);
    expect(result.current.attachedFiles[0].name).toBe('a.txt');
    expect(result.current.attachedFiles[2].name).toBe('c.txt');
  });

  it('handles error with non-Error object (object with error field)', async () => {
    mockElectronAPI.sendMessage.mockRejectedValueOnce({ error: 'Custom error object' });
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockAddToast).toHaveBeenCalledWith('error', '메시지 전송 실패: Custom error object');
  });

  it('handles error with plain string', async () => {
    mockElectronAPI.sendMessage.mockRejectedValueOnce('string error');
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockAddToast).toHaveBeenCalledWith('error', '메시지 전송 실패: string error');
  });

  it('passes both systemPrompt and model when both are set', async () => {
    const { result } = renderHook(() => useMessageSend({
      ...defaultOptions,
      settings: { systemPrompt: 'Be concise', model: 'gemini-2.5-flash' },
    }));
    act(() => {
      result.current.setInput('Hi');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hi', 'Be concise', 'gemini-2.5-flash');
  });

  it('handleKeyDown ignores non-Enter keys', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    act(() => {
      result.current.setInput('Hello');
    });
    const event = {
      key: 'a',
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;
    act(() => {
      result.current.handleKeyDown(event);
    });
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
  });

  it('handlePaste handles null clipboardData gracefully', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const event = {
      clipboardData: null,
      preventDefault: vi.fn(),
    } as unknown as React.ClipboardEvent;
    act(() => {
      result.current.handlePaste(event);
    });
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  it('handlePaste skips image items that return null from getAsFile', () => {
    const { result } = renderHook(() => useMessageSend(defaultOptions));
    const event = {
      clipboardData: {
        items: {
          length: 1,
          0: { type: 'image/png', getAsFile: () => null },
        },
      },
      preventDefault: vi.fn(),
    } as unknown as React.ClipboardEvent;
    act(() => {
      result.current.handlePaste(event);
    });
    // No files were added, so preventDefault should not be called
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current.attachedFiles).toHaveLength(0);
  });
});
