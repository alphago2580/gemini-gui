import { useState, useCallback, useRef } from 'react';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionInstance) | null {
  const win = window as Record<string, unknown>;
  return (win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null) as
    (new () => SpeechRecognitionInstance) | null;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const {
    lang = 'ko-KR',
    continuous = false,
    interimResults = false,
    onResult,
    onError,
    onEnd,
  } = options;

  const isSupported = getSpeechRecognitionConstructor() !== null;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const start = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      setError('SpeechRecognition is not supported');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognitionRef.current = recognition;

    setError(null);
    setInterimTranscript('');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
        onResult?.(final, true);
      }
      setInterimTranscript(interim);
      if (interim) {
        onResult?.(interim, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
      onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      onEnd?.();
    };

    recognition.start();
    setIsListening(true);
  }, [lang, continuous, interimResults, onResult, onError, onEnd]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setTranscript('');
    setInterimTranscript('');
    setIsListening(false);
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    start,
    stop,
    reset,
  };
}
