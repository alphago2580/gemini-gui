import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from './useExport';
import type { Message, Conversation } from '../../preload/types';

const mockExportMarkdown = vi.fn().mockResolvedValue({ success: true });
const mockExportPdf = vi.fn().mockResolvedValue({ success: true });

beforeEach(() => {
  vi.clearAllMocks();
  (window as unknown as Record<string, unknown>).electronAPI = {
    exportMarkdown: mockExportMarkdown,
    exportPdf: mockExportPdf,
  };
});

const makeMessages = (count: number): Message[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Message ${i}`,
    timestamp: new Date('2024-01-01'),
  }));

const makeConversations = (ids: string[]): Conversation[] =>
  ids.map(id => ({
    id,
    title: `Conv ${id}`,
    timestamp: new Date('2024-01-01'),
    messages: [],
  }));

describe('useExport', () => {
  it('returns getCurrentTitle, handleExport, handleExportPdf', () => {
    const { result } = renderHook(() =>
      useExport({
        messages: [],
        conversations: [],
        currentConversationId: null,
      })
    );
    expect(result.current.getCurrentTitle).toBeInstanceOf(Function);
    expect(result.current.handleExport).toBeInstanceOf(Function);
    expect(result.current.handleExportPdf).toBeInstanceOf(Function);
  });

  it('getCurrentTitle returns conversation title', () => {
    const { result } = renderHook(() =>
      useExport({
        messages: [],
        conversations: makeConversations(['abc']),
        currentConversationId: 'abc',
      })
    );
    expect(result.current.getCurrentTitle()).toBe('Conv abc');
  });

  it('getCurrentTitle returns fallback when no conversation found', () => {
    const { result } = renderHook(() =>
      useExport({
        messages: [],
        conversations: [],
        currentConversationId: 'missing',
      })
    );
    expect(result.current.getCurrentTitle()).toBe('Untitled Conversation');
  });

  it('handleExport does nothing when no messages', async () => {
    const { result } = renderHook(() =>
      useExport({
        messages: [],
        conversations: makeConversations(['abc']),
        currentConversationId: 'abc',
      })
    );
    await act(async () => {
      await result.current.handleExport();
    });
    expect(mockExportMarkdown).not.toHaveBeenCalled();
  });

  it('handleExport calls exportMarkdown with correct args', async () => {
    const messages = makeMessages(2);
    const { result } = renderHook(() =>
      useExport({
        messages,
        conversations: makeConversations(['abc']),
        currentConversationId: 'abc',
      })
    );
    await act(async () => {
      await result.current.handleExport();
    });
    expect(mockExportMarkdown).toHaveBeenCalledTimes(1);
    const [markdown, fileName] = mockExportMarkdown.mock.calls[0];
    expect(markdown).toContain('Conv abc');
    expect(fileName).toBe('Conv-abc.md');
  });

  it('handleExportPdf does nothing when no messages', async () => {
    const { result } = renderHook(() =>
      useExport({
        messages: [],
        conversations: makeConversations(['abc']),
        currentConversationId: 'abc',
      })
    );
    await act(async () => {
      await result.current.handleExportPdf();
    });
    expect(mockExportPdf).not.toHaveBeenCalled();
  });

  it('handleExportPdf calls exportPdf with correct args', async () => {
    const messages = makeMessages(2);
    const { result } = renderHook(() =>
      useExport({
        messages,
        conversations: makeConversations(['abc']),
        currentConversationId: 'abc',
      })
    );
    await act(async () => {
      await result.current.handleExportPdf();
    });
    expect(mockExportPdf).toHaveBeenCalledTimes(1);
    const [html, fileName] = mockExportPdf.mock.calls[0];
    expect(html).toContain('Conv abc');
    expect(fileName).toBe('Conv-abc.pdf');
  });

  it('sanitizes file name for export', async () => {
    const messages = makeMessages(1);
    const convs: Conversation[] = [{
      id: 'x',
      title: '테스트 대화!@#',
      timestamp: new Date(),
      messages: [],
    }];
    const { result } = renderHook(() =>
      useExport({
        messages,
        conversations: convs,
        currentConversationId: 'x',
      })
    );
    await act(async () => {
      await result.current.handleExport();
    });
    const fileName = mockExportMarkdown.mock.calls[0][1];
    expect(fileName).toBe('테스트-대화.md');
    expect(fileName).not.toMatch(/[!@#]/);
  });
});
