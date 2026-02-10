import { useRef, useCallback, useEffect, useState } from 'react';
import type { Message } from '../../preload/types';

const SCROLL_THRESHOLD = 100; // px from bottom to consider "near bottom"

export function useAutoScroll(messages: Message[]) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);

  const checkIfNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= SCROLL_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollButton(false);
    setIsNearBottom(true);
  }, []);

  // Handle scroll events on the messages container
  const handleScroll = useCallback(() => {
    const nearBottom = checkIfNearBottom();
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom);
  }, [checkIfNearBottom]);

  // Auto-scroll when messages change
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (messages.length === 0) {
      setShowScrollButton(false);
      return;
    }

    // New message added
    if (messages.length > prevLength) {
      if (isNearBottom) {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          scrollToBottom('smooth');
        });
      } else {
        setShowScrollButton(true);
      }
    }
  }, [messages, isNearBottom, scrollToBottom]);

  return {
    messagesContainerRef,
    messagesEndRef,
    showScrollButton,
    scrollToBottom,
    handleScroll,
  };
}
