import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechSynthesis } from './useSpeechSynthesis';

let mockUtteranceInstance: {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  text: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
};

class MockSpeechSynthesisUtterance {
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  text: string;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
    mockUtteranceInstance = this;
  }
}

const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn((): SpeechSynthesisVoice[] => []),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
  vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);
  Object.defineProperty(window, 'speechSynthesis', {
    value: mockSpeechSynthesis,
    configurable: true,
    writable: true,
  });
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSpeechSynthesis', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.voices).toEqual([]);
    expect(typeof result.current.speak).toBe('function');
    expect(typeof result.current.cancel).toBe('function');
    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.resume).toBe('function');
  });

  it('calls speechSynthesis.speak with text', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('안녕하세요');
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(mockUtteranceInstance.text).toBe('안녕하세요');
  });

  it('sets default language to ko-KR', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('테스트');
    });

    expect(mockUtteranceInstance.lang).toBe('ko-KR');
  });

  it('supports custom language option', () => {
    const { result } = renderHook(() => useSpeechSynthesis({ lang: 'en-US' }));

    act(() => {
      result.current.speak('hello');
    });

    expect(mockUtteranceInstance.lang).toBe('en-US');
  });

  it('supports rate, pitch, and volume options', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ rate: 1.5, pitch: 0.8, volume: 0.5 })
    );

    act(() => {
      result.current.speak('test');
    });

    expect(mockUtteranceInstance.rate).toBe(1.5);
    expect(mockUtteranceInstance.pitch).toBe(0.8);
    expect(mockUtteranceInstance.volume).toBe(0.5);
  });

  it('sets isSpeaking to true on start', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('text');
    });

    act(() => {
      mockUtteranceInstance.onstart?.();
    });

    expect(result.current.isSpeaking).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('sets isSpeaking to false on end', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('text');
    });
    act(() => {
      mockUtteranceInstance.onstart?.();
    });
    act(() => {
      mockUtteranceInstance.onend?.();
    });

    expect(result.current.isSpeaking).toBe(false);
  });

  it('handles error event', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('text');
    });
    act(() => {
      mockUtteranceInstance.onstart?.();
    });
    act(() => {
      mockUtteranceInstance.onerror?.();
    });

    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('handles pause and resume events', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('text');
    });
    act(() => {
      mockUtteranceInstance.onstart?.();
    });
    act(() => {
      mockUtteranceInstance.onpause?.();
    });

    expect(result.current.isPaused).toBe(true);

    act(() => {
      mockUtteranceInstance.onresume?.();
    });

    expect(result.current.isPaused).toBe(false);
  });

  it('cancels speech', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.cancel();
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  it('pauses and resumes speech', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.pause();
    });
    expect(mockSpeechSynthesis.pause).toHaveBeenCalled();

    act(() => {
      result.current.resume();
    });
    expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
  });

  it('does not speak empty text', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('');
    });

    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('cancels on unmount', () => {
    const { unmount } = renderHook(() => useSpeechSynthesis());

    mockSpeechSynthesis.cancel.mockClear();
    unmount();

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  it('loads voices on mount', () => {
    const mockVoices = [{ name: 'Korean', lang: 'ko-KR' }] as SpeechSynthesisVoice[];
    mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);

    const { result } = renderHook(() => useSpeechSynthesis());

    expect(result.current.voices).toEqual(mockVoices);
  });

  it('sets voice on utterance when voice option provided', () => {
    const mockVoice = { name: 'Google Korean', lang: 'ko-KR' } as SpeechSynthesisVoice;
    const { result } = renderHook(() => useSpeechSynthesis({ voice: mockVoice }));

    act(() => {
      result.current.speak('테스트');
    });

    expect(mockUtteranceInstance.voice).toBe(mockVoice);
  });

  it('does not set voice when voice option is null', () => {
    const { result } = renderHook(() => useSpeechSynthesis({ voice: null }));

    act(() => {
      result.current.speak('테스트');
    });

    expect(mockUtteranceInstance.voice).toBeNull();
  });

  it('cancel resets isSpeaking and isPaused to false', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('text');
    });
    act(() => {
      mockUtteranceInstance.onstart?.();
    });
    act(() => {
      mockUtteranceInstance.onpause?.();
    });
    expect(result.current.isSpeaking).toBe(true);
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.cancel();
    });
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('registers voiceschanged listener on mount', () => {
    renderHook(() => useSpeechSynthesis());

    expect(mockSpeechSynthesis.addEventListener).toHaveBeenCalledWith(
      'voiceschanged',
      expect.any(Function)
    );
  });

  it('removes voiceschanged listener on unmount', () => {
    const { unmount } = renderHook(() => useSpeechSynthesis());
    unmount();

    expect(mockSpeechSynthesis.removeEventListener).toHaveBeenCalledWith(
      'voiceschanged',
      expect.any(Function)
    );
  });

  it('cancels previous speech before starting new', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('first');
    });
    mockSpeechSynthesis.cancel.mockClear();

    act(() => {
      result.current.speak('second');
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(1);
    expect(mockUtteranceInstance.text).toBe('second');
  });

  it('speak/cancel/pause/resume are stable callback references', () => {
    const { result, rerender } = renderHook(() => useSpeechSynthesis());
    const first = {
      speak: result.current.speak,
      cancel: result.current.cancel,
      pause: result.current.pause,
      resume: result.current.resume,
    };
    rerender();
    expect(result.current.speak).toBe(first.speak);
    expect(result.current.cancel).toBe(first.cancel);
    expect(result.current.pause).toBe(first.pause);
    expect(result.current.resume).toBe(first.resume);
  });
});
