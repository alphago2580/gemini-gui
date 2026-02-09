import { renderHook, act } from '@testing-library/react';
import { useAutoScroll } from './useAutoScroll';

describe('useAutoScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with isNearBottom true and showScrollButton false', () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(result.current.showScrollButton).toBe(false);
  });

  it('provides messagesContainerRef and messagesEndRef', () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(result.current.messagesContainerRef).toBeDefined();
    expect(result.current.messagesEndRef).toBeDefined();
  });

  it('provides scrollToBottom function', () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(typeof result.current.scrollToBottom).toBe('function');
  });

  it('provides handleScroll function', () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(typeof result.current.handleScroll).toBe('function');
  });

  it('does not show scroll button when messages is empty', () => {
    const { result, rerender } = renderHook(
      ({ messages }) => useAutoScroll(messages),
      { initialProps: { messages: [] as unknown[] } }
    );
    expect(result.current.showScrollButton).toBe(false);

    // Even after clearing
    rerender({ messages: [] });
    expect(result.current.showScrollButton).toBe(false);
  });

  it('handleScroll updates showScrollButton based on scroll position', () => {
    const { result } = renderHook(() => useAutoScroll(['msg1', 'msg2']));

    // Simulate container where user is NOT near bottom
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });

    // Assign the ref
    Object.defineProperty(result.current.messagesContainerRef, 'current', {
      value: container,
      writable: true,
    });

    act(() => {
      result.current.handleScroll();
    });

    // scrollHeight(1000) - scrollTop(0) - clientHeight(400) = 600 > 100, so NOT near bottom
    expect(result.current.showScrollButton).toBe(true);
  });

  it('handleScroll hides button when near bottom', () => {
    const { result } = renderHook(() => useAutoScroll(['msg1', 'msg2']));

    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 550, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });

    Object.defineProperty(result.current.messagesContainerRef, 'current', {
      value: container,
      writable: true,
    });

    act(() => {
      result.current.handleScroll();
    });

    // scrollHeight(1000) - scrollTop(550) - clientHeight(400) = 50 <= 100, so near bottom
    expect(result.current.showScrollButton).toBe(false);
  });

  it('scrollToBottom calls scrollIntoView on messagesEndRef', () => {
    const { result } = renderHook(() => useAutoScroll([]));

    const endDiv = document.createElement('div');
    endDiv.scrollIntoView = vi.fn();
    Object.defineProperty(result.current.messagesEndRef, 'current', {
      value: endDiv,
      writable: true,
    });

    act(() => {
      result.current.scrollToBottom('smooth');
    });

    expect(endDiv.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('scrollToBottom hides the scroll button', () => {
    const { result } = renderHook(() => useAutoScroll(['msg1']));

    // First, simulate being scrolled up
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
    Object.defineProperty(result.current.messagesContainerRef, 'current', {
      value: container,
      writable: true,
    });

    act(() => {
      result.current.handleScroll();
    });
    expect(result.current.showScrollButton).toBe(true);

    // Now scroll to bottom
    const endDiv = document.createElement('div');
    endDiv.scrollIntoView = vi.fn();
    Object.defineProperty(result.current.messagesEndRef, 'current', {
      value: endDiv,
      writable: true,
    });

    act(() => {
      result.current.scrollToBottom('smooth');
    });
    expect(result.current.showScrollButton).toBe(false);
  });

  it('shows scroll button when messages added while scrolled up', () => {
    const { result, rerender } = renderHook(
      ({ messages }) => useAutoScroll(messages),
      { initialProps: { messages: ['msg1'] as unknown[] } }
    );

    // Simulate being scrolled up
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
    Object.defineProperty(result.current.messagesContainerRef, 'current', {
      value: container,
      writable: true,
    });

    // Mark as scrolled up
    act(() => {
      result.current.handleScroll();
    });

    // Add a new message
    rerender({ messages: ['msg1', 'msg2'] });

    expect(result.current.showScrollButton).toBe(true);
  });
});
