import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileReader } from './useFileReader';

interface MockReader {
  result: string | ArrayBuffer | null;
  error: DOMException | null;
  readyState: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  onprogress: ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) | null;
  onabort: (() => void) | null;
  abort: ReturnType<typeof vi.fn>;
  readAsText: ReturnType<typeof vi.fn>;
  readAsDataURL: ReturnType<typeof vi.fn>;
  readAsArrayBuffer: ReturnType<typeof vi.fn>;
  readAsBinaryString: ReturnType<typeof vi.fn>;
}

let captured: MockReader;

describe('useFileReader', () => {
  beforeEach(() => {
    const MockFileReader = vi.fn(function (this: MockReader) {
      this.result = null;
      this.error = null;
      this.readyState = 0;
      this.onload = null;
      this.onerror = null;
      this.onprogress = null;
      this.onabort = null;
      this.abort = vi.fn(() => {
        this.readyState = 0;
        this.onabort?.();
      });
      this.readAsText = vi.fn();
      this.readAsDataURL = vi.fn();
      this.readAsArrayBuffer = vi.fn();
      this.readAsBinaryString = vi.fn();
      captured = this;
    });
    Object.defineProperty(MockFileReader, 'LOADING', { value: 1, configurable: true });
    vi.stubGlobal('FileReader', MockFileReader);
  });

  function createFile(name: string, content = 'hello'): File {
    return new File([content], name, { type: 'text/plain' });
  }

  function simulateLoad(result: string | ArrayBuffer) {
    captured.result = result;
    captured.readyState = 2;
    captured.onload?.();
  }

  function simulateError(error: DOMException) {
    captured.error = error;
    captured.readyState = 2;
    captured.onerror?.();
  }

  function simulateProgress(loaded: number, total: number) {
    captured.onprogress?.({ lengthComputable: true, loaded, total });
  }

  it('initializes with default state', () => {
    const { result } = renderHook(() => useFileReader());
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('reads file as text by default', () => {
    const { result } = renderHook(() => useFileReader());
    act(() => result.current.readFile(createFile('test.txt')));
    expect(captured.readAsText).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(true);

    act(() => simulateLoad('file content'));
    expect(result.current.result).toBe('file content');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(100);
  });

  it('reads file as dataURL', () => {
    const { result } = renderHook(() => useFileReader({ method: 'dataURL' }));
    act(() => result.current.readFile(createFile('img.png')));
    expect(captured.readAsDataURL).toHaveBeenCalled();

    act(() => simulateLoad('data:image/png;base64,abc'));
    expect(result.current.result).toBe('data:image/png;base64,abc');
  });

  it('reads file as arrayBuffer', () => {
    const { result } = renderHook(() => useFileReader({ method: 'arrayBuffer' }));
    act(() => result.current.readFile(createFile('data.bin')));
    expect(captured.readAsArrayBuffer).toHaveBeenCalled();

    const buf = new ArrayBuffer(8);
    act(() => simulateLoad(buf));
    expect(result.current.result).toBe(buf);
  });

  it('reads file as binaryString', () => {
    const { result } = renderHook(() => useFileReader({ method: 'binaryString' }));
    act(() => result.current.readFile(createFile('data.bin')));
    expect(captured.readAsBinaryString).toHaveBeenCalled();

    act(() => simulateLoad('binary-content'));
    expect(result.current.result).toBe('binary-content');
  });

  it('calls onLoad callback', () => {
    const onLoad = vi.fn();
    const { result } = renderHook(() => useFileReader({ onLoad }));
    act(() => result.current.readFile(createFile('test.txt')));
    act(() => simulateLoad('loaded'));
    expect(onLoad).toHaveBeenCalledWith('loaded');
  });

  it('handles progress events', () => {
    const onProgress = vi.fn();
    const { result } = renderHook(() => useFileReader({ onProgress }));
    act(() => result.current.readFile(createFile('test.txt')));
    act(() => simulateProgress(50, 100));
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(result.current.progress).toBe(50);
  });

  it('handles error', () => {
    const onError = vi.fn();
    const mockError = new DOMException('read error');
    const { result } = renderHook(() => useFileReader({ onError }));
    act(() => result.current.readFile(createFile('bad.txt')));
    act(() => simulateError(mockError));
    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('resets state', () => {
    const { result } = renderHook(() => useFileReader());
    act(() => result.current.readFile(createFile('test.txt')));
    act(() => simulateLoad('data'));
    expect(result.current.result).toBe('data');

    act(() => result.current.reset());
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it('sets isLoading during read', () => {
    const { result } = renderHook(() => useFileReader());
    act(() => result.current.readFile(createFile('test.txt')));
    expect(result.current.isLoading).toBe(true);
  });

  it('clears previous result on new read', () => {
    const { result } = renderHook(() => useFileReader());
    act(() => result.current.readFile(createFile('first.txt')));
    act(() => simulateLoad('first'));
    expect(result.current.result).toBe('first');

    act(() => result.current.readFile(createFile('second.txt')));
    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('abort stops loading', () => {
    const { result } = renderHook(() => useFileReader());
    act(() => result.current.readFile(createFile('test.txt')));
    captured.readyState = 1;
    act(() => result.current.abort());
    expect(captured.abort).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});
