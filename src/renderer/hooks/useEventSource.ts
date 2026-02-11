import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseEventSourceOptions {
  withCredentials?: boolean;
  events?: string[];
  onOpen?: (event: Event) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export type EventSourceStatus = 'connecting' | 'open' | 'closed' | 'error';

export interface UseEventSourceReturn {
  status: EventSourceStatus;
  lastMessage: MessageEvent | null;
  lastEventData: string | null;
  error: Event | null;
  close: () => void;
  open: () => void;
}

export function useEventSource(
  url: string | undefined,
  options: UseEventSourceOptions = {}
): UseEventSourceReturn {
  const {
    withCredentials = false,
    events = [],
    onOpen,
    onError,
    onMessage,
    autoReconnect = false,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const [status, setStatus] = useState<EventSourceStatus>('closed');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [lastEventData, setLastEventData] = useState<string | null>(null);
  const [error, setError] = useState<Event | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualCloseRef = useRef(false);

  const eventsKey = events.join(',');

  const close = useCallback(() => {
    manualCloseRef.current = true;
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setStatus('closed');
  }, []);

  const connect = useCallback(() => {
    if (!url) return;

    manualCloseRef.current = false;

    if (esRef.current) {
      esRef.current.close();
    }

    setStatus('connecting');
    const es = new EventSource(url, { withCredentials });
    esRef.current = es;

    es.onopen = (event: Event) => {
      setStatus('open');
      setError(null);
      reconnectAttemptsRef.current = 0;
      onOpenRef.current?.(event);
    };

    es.onerror = (event: Event) => {
      setStatus('error');
      setError(event);
      onErrorRef.current?.(event);

      if (
        autoReconnect &&
        !manualCloseRef.current &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          connect();
        }, reconnectInterval);
      }
    };

    es.onmessage = (event: MessageEvent) => {
      setLastMessage(event);
      setLastEventData(event.data as string);
      onMessageRef.current?.(event);
    };

    const eventNames = eventsKey ? eventsKey.split(',') : [];
    for (const name of eventNames) {
      if (name) {
        es.addEventListener(name, ((event: Event) => {
          const msgEvent = event as MessageEvent;
          setLastMessage(msgEvent);
          setLastEventData(msgEvent.data as string);
          onMessageRef.current?.(msgEvent);
        }) as EventListener);
      }
    }
  }, [url, withCredentials, autoReconnect, reconnectInterval, maxReconnectAttempts, eventsKey]);

  const open = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    if (!url) {
      setStatus('closed');
      return;
    }

    connect();

    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [url, connect]);

  return {
    status,
    lastMessage,
    lastEventData,
    error,
    close,
    open,
  };
}
