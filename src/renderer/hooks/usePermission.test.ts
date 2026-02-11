import { renderHook, act, waitFor } from '@testing-library/react';
import { usePermission } from './usePermission';

describe('usePermission', () => {
  let mockStatus: {
    state: string;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    onchange: null | (() => void);
  };
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockStatus = {
      state: 'prompt',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
    };
    mockQuery = vi.fn().mockResolvedValue(mockStatus);
    Object.defineProperty(navigator, 'permissions', {
      value: { query: mockQuery },
      writable: true,
      configurable: true,
    });
  });

  it('initializes with prompt state', () => {
    const { result } = renderHook(() => usePermission('notifications'));
    expect(result.current.state).toBe('prompt');
    expect(result.current.isPrompt).toBe(true);
  });

  it('queries permission on mount', async () => {
    mockStatus.state = 'granted';
    renderHook(() => usePermission('notifications'));
    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalledWith({ name: 'notifications' });
    });
  });

  it('sets granted state', async () => {
    mockStatus.state = 'granted';
    const { result } = renderHook(() => usePermission('notifications'));
    await waitFor(() => {
      expect(result.current.state).toBe('granted');
    });
    expect(result.current.isGranted).toBe(true);
    expect(result.current.isDenied).toBe(false);
    expect(result.current.isPrompt).toBe(false);
  });

  it('sets denied state', async () => {
    mockStatus.state = 'denied';
    const { result } = renderHook(() => usePermission('notifications'));
    await waitFor(() => {
      expect(result.current.state).toBe('denied');
    });
    expect(result.current.isDenied).toBe(true);
    expect(result.current.isGranted).toBe(false);
  });

  it('adds change listener', async () => {
    const { result } = renderHook(() => usePermission('notifications'));
    await waitFor(() => {
      expect(mockStatus.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
    expect(result.current.isSupported).toBe(true);
  });

  it('removes change listener on unmount', async () => {
    const { unmount } = renderHook(() => usePermission('notifications'));
    await waitFor(() => {
      expect(mockStatus.addEventListener).toHaveBeenCalled();
    });
    unmount();
    expect(mockStatus.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('handles permission change events', async () => {
    const { result } = renderHook(() => usePermission('notifications'));
    await waitFor(() => {
      expect(mockStatus.addEventListener).toHaveBeenCalled();
    });
    // Get the change handler
    const changeHandler = mockStatus.addEventListener.mock.calls[0][1];
    // Simulate permission change
    act(() => {
      mockStatus.state = 'granted';
      changeHandler();
    });
    expect(result.current.state).toBe('granted');
  });

  it('handles query rejection gracefully', async () => {
    mockQuery.mockRejectedValue(new Error('not supported'));
    const { result } = renderHook(() => usePermission('notifications'));
    await waitFor(() => {
      expect(result.current.state).toBe('unsupported');
    });
  });

  it('query() returns current state', async () => {
    mockStatus.state = 'granted';
    const { result } = renderHook(() => usePermission('notifications'));
    let queryResult: string | undefined;
    await act(async () => {
      queryResult = await result.current.query();
    });
    expect(queryResult).toBe('granted');
  });

  it('isSupported is true when permissions API exists', () => {
    const { result } = renderHook(() => usePermission('notifications'));
    expect(result.current.isSupported).toBe(true);
  });

  it('query returns unsupported when API throws', async () => {
    mockQuery.mockRejectedValue(new TypeError('not supported'));
    const { result } = renderHook(() => usePermission('notifications'));
    let queryResult: string | undefined;
    await act(async () => {
      queryResult = await result.current.query();
    });
    expect(queryResult).toBe('unsupported');
  });

  it('re-queries on permission name change', async () => {
    mockStatus.state = 'granted';
    const { rerender } = renderHook(
      ({ name }) => usePermission(name),
      { initialProps: { name: 'notifications' as PermissionName } }
    );
    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalledWith({ name: 'notifications' });
    });
    mockQuery.mockClear();
    mockStatus.state = 'denied';
    rerender({ name: 'geolocation' as PermissionName });
    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalledWith({ name: 'geolocation' });
    });
  });
});
