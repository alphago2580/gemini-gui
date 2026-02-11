import { useState, useCallback, useRef, useEffect } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseWebSocketOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  protocols?: string | string[];
}

export interface UseWebSocketResult {
  status: WebSocketStatus;
  lastMessage: MessageEvent | null;
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  connect: () => void;
  disconnect: (code?: number, reason?: string) => void;
  reconnectCount: number;
}

export function useWebSocket(
  url: string | null,
  options: UseWebSocketOptions = {}
): UseWebSocketResult {
  const {
    reconnect = false,
    reconnectInterval = 3000,
    reconnectAttempts = 5,
    onOpen,
    onClose,
    onError,
    onMessage,
    protocols,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCountRef = useRef(0);
  const urlRef = useRef(url);
  urlRef.current = url;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const currentUrl = urlRef.current;
    if (!currentUrl) return;

    clearReconnectTimer();

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
    }

    setStatus('connecting');

    const ws = protocols
      ? new WebSocket(currentUrl, protocols)
      : new WebSocket(currentUrl);

    ws.onopen = (event: Event) => {
      setStatus('connected');
      reconnectCountRef.current = 0;
      setReconnectCount(0);
      optionsRef.current.onOpen?.(event);
    };

    ws.onclose = (event: CloseEvent) => {
      setStatus('disconnected');
      optionsRef.current.onClose?.(event);

      if (
        optionsRef.current.reconnect &&
        reconnectCountRef.current < (optionsRef.current.reconnectAttempts ?? reconnectAttempts)
      ) {
        reconnectTimerRef.current = setTimeout(() => {
          reconnectCountRef.current += 1;
          setReconnectCount(reconnectCountRef.current);
          connect();
        }, optionsRef.current.reconnectInterval ?? reconnectInterval);
      }
    };

    ws.onerror = (event: Event) => {
      setStatus('error');
      optionsRef.current.onError?.(event);
    };

    ws.onmessage = (event: MessageEvent) => {
      setLastMessage(event);
      optionsRef.current.onMessage?.(event);
    };

    wsRef.current = ws;
  }, [clearReconnectTimer, reconnectAttempts, reconnectInterval, protocols]);

  const disconnect = useCallback((code?: number, reason?: string) => {
    clearReconnectTimer();
    reconnectCountRef.current = 0;
    setReconnectCount(0);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close(code, reason);
      wsRef.current = null;
      setStatus('disconnected');
    }
  }, [clearReconnectTimer]);

  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  useEffect(() => {
    if (url) {
      connect();
    }
    return () => {
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, connect, clearReconnectTimer]);

  return {
    status,
    lastMessage,
    send,
    connect,
    disconnect,
    reconnectCount,
  };
}
