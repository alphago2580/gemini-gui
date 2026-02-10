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
    expect(result.current.getCurrentTitle()).toBe('제목 없는 대화');
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

  it('getCurrentTitle returns fallback when currentConversationId is null', () => {
    const { result } = renderHook(() =>
      useExport({
        messages: [],
        conversations: makeConversations(['a']),
        currentConversationId: null,
      })
    );
    expect(result.current.getCurrentTitle()).toBe('제목 없는 대화');
  });

  it('handleExportPdf sanitizes file name', async () => {
    const messages = makeMessages(1);
    const convs: Conversation[] = [{
      id: 'z',
      title: 'PDF 테스트!@#$',
      timestamp: new Date(),
      messages: [],
    }];
    const { result } = renderHook(() =>
      useExport({
        messages,
        conversations: convs,
        currentConversationId: 'z',
      })
    );
    await act(async () => {
      await result.current.handleExportPdf();
    });
    const fileName = mockExportPdf.mock.calls[0][1];
    expect(fileName).toBe('PDF-테스트.pdf');
    expect(fileName).not.toMatch(/[!@#$]/);
  });

  it('handleExport does not call exportMarkdown when electronAPI has no exportMarkdown', async () => {
    (window as unknown as Record<string, unknown>).electronAPI = {};
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
    expect(mockExportMarkdown).not.toHaveBeenCalled();
  });

  it('handleExportPdf does not call exportPdf when electronAPI has no exportPdf', async () => {
    (window as unknown as Record<string, unknown>).electronAPI = {};
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
    expect(mockExportPdf).not.toHaveBeenCalled();
  });

  it('handleExport includes message content in markdown', async () => {
    const messages = makeMessages(3);
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
    const markdown = mockExportMarkdown.mock.calls[0][0];
    expect(markdown).toContain('Message 0');
    expect(markdown).toContain('Message 1');
    expect(markdown).toContain('Message 2');
  });

  it('handleExportPdf includes message content in html', async () => {
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
    const html = mockExportPdf.mock.calls[0][0];
    expect(html).toContain('Message 0');
    expect(html).toContain('Message 1');
  });

  it('getCurrentTitle updates when conversations change', () => {
    const initialConvs = makeConversations(['abc']);
    const { result, rerender } = renderHook(
      (props: { conversations: Conversation[]; currentConversationId: string | null }) =>
        useExport({ messages: [], ...props }),
      { initialProps: { conversations: initialConvs, currentConversationId: 'abc' } }
    );
    expect(result.current.getCurrentTitle()).toBe('Conv abc');

    const updatedConvs: Conversation[] = [{
      id: 'abc',
      title: '변경된 제목',
      timestamp: new Date(),
      messages: [],
    }];
    rerender({ conversations: updatedConvs, currentConversationId: 'abc' });
    expect(result.current.getCurrentTitle()).toBe('변경된 제목');
  });

  it('handles export with single message', async () => {
    const messages = makeMessages(1);
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
  });
});
