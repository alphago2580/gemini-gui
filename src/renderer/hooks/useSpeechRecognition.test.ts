import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from './useSpeechRecognition';

interface MockRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
}

let mockRecognition: MockRecognition;

function setupMock() {
  mockRecognition = {
    lang: '',
    continuous: false,
    interimResults: false,
    onresult: null,
    onerror: null,
    onend: null,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
  };

  const MockSpeechRecognition = vi.fn(function (this: MockRecognition) {
    Object.assign(this, mockRecognition);
    mockRecognition = this;
  });
  vi.stubGlobal('SpeechRecognition', MockSpeechRecognition);
}

function removeMock() {
  const win = window as unknown as Record<string, unknown>;
  delete win.SpeechRecognition;
  delete win.webkitSpeechRecognition;
}

function createResultEvent(text: string, isFinal: boolean, resultIndex = 0) {
  return {
    resultIndex,
    results: {
      length: resultIndex + 1,
      [resultIndex]: {
        0: { transcript: text },
        isFinal,
        length: 1,
      },
    },
  };
}

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    setupMock();
  });

  afterEach(() => {
    removeMock();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.isListening).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('detects unsupported browser', () => {
    removeMock();
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(false);
  });

  it('starts listening', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => result.current.start());
    expect(mockRecognition.start).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);
  });

  it('sets language and options', () => {
    const { result } = renderHook(() =>
      useSpeechRecognition({ lang: 'en-US', continuous: true, interimResults: true })
    );
    act(() => result.current.start());
    expect(mockRecognition.lang).toBe('en-US');
    expect(mockRecognition.continuous).toBe(true);
    expect(mockRecognition.interimResults).toBe(true);
  });

  it('defaults to ko-KR language', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => result.current.start());
    expect(mockRecognition.lang).toBe('ko-KR');
  });

  it('handles final result', () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onResult }));
    act(() => result.current.start());

    act(() => {
      mockRecognition.onresult?.(createResultEvent('안녕하세요', true));
    });

    expect(result.current.transcript).toBe('안녕하세요');
    expect(onResult).toHaveBeenCalledWith('안녕하세요', true);
  });

  it('handles interim result', () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onResult }));
    act(() => result.current.start());

    act(() => {
      mockRecognition.onresult?.(createResultEvent('typing...', false));
    });

    expect(result.current.interimTranscript).toBe('typing...');
    expect(onResult).toHaveBeenCalledWith('typing...', false);
  });

  it('accumulates final transcripts', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => result.current.start());

    act(() => mockRecognition.onresult?.(createResultEvent('Hello ', true, 0)));
    act(() => mockRecognition.onresult?.(createResultEvent('World', true, 0)));

    expect(result.current.transcript).toBe('Hello World');
  });

  it('stops listening', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => result.current.start());
    act(() => result.current.stop());
    expect(mockRecognition.stop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);
  });

  it('handles end event', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onEnd }));
    act(() => result.current.start());

    act(() => mockRecognition.onend?.());
    expect(result.current.isListening).toBe(false);
    expect(onEnd).toHaveBeenCalled();
  });

  it('handles error', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onError }));
    act(() => result.current.start());

    act(() => mockRecognition.onerror?.({ error: 'no-speech' }));
    expect(result.current.error).toBe('no-speech');
    expect(result.current.isListening).toBe(false);
    expect(onError).toHaveBeenCalledWith('no-speech');
  });

  it('resets all state', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => result.current.start());
    act(() => mockRecognition.onresult?.(createResultEvent('text', true)));

    act(() => result.current.reset());
    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.isListening).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockRecognition.abort).toHaveBeenCalled();
  });

  it('sets error when unsupported and start called', () => {
    removeMock();
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => result.current.start());
    expect(result.current.error).toBe('SpeechRecognition is not supported');
    expect(result.current.isListening).toBe(false);
  });

  it('works with webkitSpeechRecognition', () => {
    removeMock();
    const win = window as unknown as Record<string, unknown>;
    win.webkitSpeechRecognition = vi.fn(function (this: MockRecognition) {
      Object.assign(this, mockRecognition);
      mockRecognition = this;
    });
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
    act(() => result.current.start());
    expect(mockRecognition.start).toHaveBeenCalled();
  });
});
