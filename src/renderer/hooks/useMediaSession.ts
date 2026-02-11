import { useEffect, useRef, useCallback } from 'react';

export interface MediaSessionMetadata {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[];
}

export type MediaSessionAction =
  | 'play'
  | 'pause'
  | 'seekbackward'
  | 'seekforward'
  | 'previoustrack'
  | 'nexttrack'
  | 'stop';

export interface MediaSessionHandlers {
  onPlay?: () => void;
  onPause?: () => void;
  onSeekBackward?: () => void;
  onSeekForward?: () => void;
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
  onStop?: () => void;
}

export interface UseMediaSessionReturn {
  isSupported: boolean;
  setMetadata: (metadata: MediaSessionMetadata) => void;
  setPlaybackState: (state: MediaSessionPlaybackState) => void;
  setPositionState: (state: MediaPositionState) => void;
}

export function useMediaSession(handlers: MediaSessionHandlers = {}): UseMediaSessionReturn {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const isSupported = typeof navigator !== 'undefined' && 'mediaSession' in navigator;

  useEffect(() => {
    if (!isSupported) return;

    const actionMap: Array<[MediaSessionAction, keyof MediaSessionHandlers]> = [
      ['play', 'onPlay'],
      ['pause', 'onPause'],
      ['seekbackward', 'onSeekBackward'],
      ['seekforward', 'onSeekForward'],
      ['previoustrack', 'onPreviousTrack'],
      ['nexttrack', 'onNextTrack'],
      ['stop', 'onStop'],
    ];

    const registeredActions: MediaSessionAction[] = [];

    for (const [action, handlerKey] of actionMap) {
      if (handlersRef.current[handlerKey]) {
        try {
          navigator.mediaSession.setActionHandler(action, () => {
            handlersRef.current[handlerKey]?.();
          });
          registeredActions.push(action);
        } catch {
          // Some actions may not be supported
        }
      }
    }

    return () => {
      for (const action of registeredActions) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [isSupported]);

  const setMetadata = useCallback(
    (metadata: MediaSessionMetadata) => {
      if (!isSupported) return;
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    },
    [isSupported]
  );

  const setPlaybackState = useCallback(
    (state: MediaSessionPlaybackState) => {
      if (!isSupported) return;
      navigator.mediaSession.playbackState = state;
    },
    [isSupported]
  );

  const setPositionState = useCallback(
    (state: MediaPositionState) => {
      if (!isSupported) return;
      navigator.mediaSession.setPositionState(state);
    },
    [isSupported]
  );

  return {
    isSupported,
    setMetadata,
    setPlaybackState,
    setPositionState,
  };
}
