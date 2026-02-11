import { useState, useEffect, useCallback } from 'react';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface UsePermissionResult {
  state: PermissionState;
  isGranted: boolean;
  isDenied: boolean;
  isPrompt: boolean;
  isSupported: boolean;
  query: () => Promise<PermissionState>;
}

export function usePermission(name: PermissionName): UsePermissionResult {
  const [state, setState] = useState<PermissionState>('prompt');
  const isSupported = typeof navigator !== 'undefined' && 'permissions' in navigator;

  const query = useCallback(async (): Promise<PermissionState> => {
    if (!isSupported) {
      setState('unsupported');
      return 'unsupported';
    }
    try {
      const status = await navigator.permissions.query({ name });
      const newState = status.state as PermissionState;
      setState(newState);
      return newState;
    } catch {
      setState('unsupported');
      return 'unsupported';
    }
  }, [name, isSupported]);

  useEffect(() => {
    if (!isSupported) {
      setState('unsupported');
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    const handleChange = () => {
      if (permissionStatus) {
        setState(permissionStatus.state as PermissionState);
      }
    };

    navigator.permissions.query({ name }).then(status => {
      permissionStatus = status;
      setState(status.state as PermissionState);
      status.addEventListener('change', handleChange);
    }).catch(() => {
      setState('unsupported');
    });

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', handleChange);
      }
    };
  }, [name, isSupported]);

  return {
    state,
    isGranted: state === 'granted',
    isDenied: state === 'denied',
    isPrompt: state === 'prompt',
    isSupported,
    query,
  };
}
