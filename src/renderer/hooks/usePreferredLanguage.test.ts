import { renderHook, act } from '@testing-library/react';
import { usePreferredLanguage } from './usePreferredLanguage';

const originalLanguage = navigator.language;
const originalLanguages = navigator.languages;

function setLanguages(primary: string, all?: string[]) {
  Object.defineProperty(navigator, 'language', {
    value: primary,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(navigator, 'languages', {
    value: all ?? [primary],
    configurable: true,
    writable: true,
  });
}

function restoreLanguages() {
  Object.defineProperty(navigator, 'language', {
    value: originalLanguage,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(navigator, 'languages', {
    value: originalLanguages,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  restoreLanguages();
});

describe('usePreferredLanguage', () => {
  it('returns current browser language', () => {
    setLanguages('en-US', ['en-US', 'en']);
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.language).toBe('en-US');
  });

  it('parses base language', () => {
    setLanguages('fr-FR', ['fr-FR']);
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.baseLang).toBe('fr');
  });

  it('parses region code', () => {
    setLanguages('pt-BR', ['pt-BR']);
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.region).toBe('BR');
  });

  it('returns null region when no region', () => {
    setLanguages('ja', ['ja']);
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.baseLang).toBe('ja');
    expect(result.current.region).toBeNull();
  });

  it('returns all preferred languages', () => {
    setLanguages('ko-KR', ['ko-KR', 'ko', 'en-US', 'en']);
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.languages).toEqual(['ko-KR', 'ko', 'en-US', 'en']);
  });

  it('updates on languagechange event', () => {
    setLanguages('en-US', ['en-US']);
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.language).toBe('en-US');

    act(() => {
      setLanguages('de-DE', ['de-DE', 'de']);
      window.dispatchEvent(new Event('languagechange'));
    });

    expect(result.current.language).toBe('de-DE');
    expect(result.current.baseLang).toBe('de');
    expect(result.current.region).toBe('DE');
  });

  it('cleans up listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    setLanguages('en', ['en']);
    const { unmount } = renderHook(() => usePreferredLanguage());
    expect(addSpy).toHaveBeenCalledWith('languagechange', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('languagechange', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('handles language with extended subtags', () => {
    setLanguages('zh-Hant-TW', ['zh-Hant-TW']);
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.baseLang).toBe('zh');
    expect(result.current.region).toBe('Hant-TW');
  });

  it('falls back to navigator.language when languages is empty', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'es-MX',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'languages', {
      value: [],
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.language).toBe('es-MX');
    expect(result.current.baseLang).toBe('es');
  });

  it('defaults to en when all properties are empty', () => {
    Object.defineProperty(navigator, 'language', {
      value: '',
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'languages', {
      value: [],
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.language).toBe('en');
    expect(result.current.baseLang).toBe('en');
  });
});
