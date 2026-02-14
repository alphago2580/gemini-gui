import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('useSettings', () => {
  it('returns default settings when nothing is saved', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({
      model: 'auto',
      temperature: 1,
      maxTokens: 2048,
      theme: 'dark',
      systemPrompt: '',
      notificationSound: true,
      showTimestamps: true,
      fontSize: 14,
    });
  });

  it('loads saved settings from localStorage', () => {
    const saved = {
      model: 'gemini-2.5-pro',
      temperature: 0.5,
      maxTokens: 4096,
      theme: 'light',
      systemPrompt: 'You are helpful',
    };
    localStorage.setItem('gemini-settings', JSON.stringify(saved));

    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual(saved);
  });

  it('falls back to defaults when localStorage has invalid JSON', () => {
    localStorage.setItem('gemini-settings', 'not-json');

    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.model).toBe('auto');
  });

  it('handleSettingsSave updates settings', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.handleSettingsSave({
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 1024,
        theme: 'light',
        systemPrompt: 'test',
        notificationSound: true,
        showTimestamps: true,
        fontSize: 14,
      });
    });

    expect(result.current.settings.model).toBe('gemini-2.0-flash');
    expect(result.current.settings.temperature).toBe(0.7);
  });

  it('persists settings to localStorage on change', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.handleSettingsSave({
        model: 'gemini-1.5-pro',
        temperature: 0.9,
        maxTokens: 2048,
        theme: 'dark',
        systemPrompt: 'hello',
        notificationSound: false,
        showTimestamps: true,
        fontSize: 16,
      });
    });

    const stored = JSON.parse(localStorage.getItem('gemini-settings') || '{}');
    expect(stored.model).toBe('gemini-1.5-pro');
    expect(stored.systemPrompt).toBe('hello');
  });

  it('returns handleSettingsSave as a function', () => {
    const { result } = renderHook(() => useSettings());
    expect(typeof result.current.handleSettingsSave).toBe('function');
  });

  it('preserves all default settings fields', () => {
    const { result } = renderHook(() => useSettings());
    const s = result.current.settings;
    expect(s).toHaveProperty('model');
    expect(s).toHaveProperty('temperature');
    expect(s).toHaveProperty('maxTokens');
    expect(s).toHaveProperty('theme');
    expect(s).toHaveProperty('systemPrompt');
  });

  it('overwrites all fields on save', () => {
    const { result } = renderHook(() => useSettings());

    const newSettings = {
      model: 'gemini-2.5-flash',
      temperature: 0.2,
      maxTokens: 512,
      theme: 'system' as const,
      systemPrompt: 'Be helpful',
      notificationSound: false,
      showTimestamps: false,
      fontSize: 14,
    };

    act(() => {
      result.current.handleSettingsSave(newSettings);
    });

    expect(result.current.settings).toEqual(newSettings);
  });

  it('multiple saves overwrite each other', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.handleSettingsSave({
        model: 'gemini-1.5-pro',
        temperature: 0.5,
        maxTokens: 1024,
        theme: 'light',
        systemPrompt: 'first',
        notificationSound: true,
        showTimestamps: true,
        fontSize: 16,
      });
    });

    act(() => {
      result.current.handleSettingsSave({
        model: 'gemini-2.0-flash',
        temperature: 1.0,
        maxTokens: 4096,
        theme: 'dark',
        systemPrompt: 'second',
        notificationSound: true,
        showTimestamps: true,
        fontSize: 16,
      });
    });

    expect(result.current.settings.model).toBe('gemini-2.0-flash');
    expect(result.current.settings.systemPrompt).toBe('second');
    const stored = JSON.parse(localStorage.getItem('gemini-settings') || '{}');
    expect(stored.systemPrompt).toBe('second');
  });

  it('handles partial saved settings by using whatever is stored', () => {
    // If localStorage has incomplete data, it loads as-is (no merge with defaults)
    localStorage.setItem('gemini-settings', JSON.stringify({ model: 'gemini-2.5-pro' }));

    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.model).toBe('gemini-2.5-pro');
    // Missing fields will be undefined (no merge with defaults in current implementation)
    expect(result.current.settings.temperature).toBeUndefined();
  });

  it('handles empty string in localStorage gracefully', () => {
    localStorage.setItem('gemini-settings', '');

    const { result } = renderHook(() => useSettings());
    // Empty string is falsy, so JSON.parse is not called, defaults used
    expect(result.current.settings.model).toBe('auto');
  });

  it('settings object reference changes on save', () => {
    const { result } = renderHook(() => useSettings());
    const initialSettings = result.current.settings;

    act(() => {
      result.current.handleSettingsSave({
        model: 'gemini-2.5-pro',
        temperature: 0.8,
        maxTokens: 2048,
        theme: 'dark',
        systemPrompt: '',
        notificationSound: true,
        showTimestamps: true,
        fontSize: 16,
      });
    });

    expect(result.current.settings).not.toBe(initialSettings);
  });

  it('handleSettingsSave is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useSettings());
    const firstSave = result.current.handleSettingsSave;
    rerender();
    expect(result.current.handleSettingsSave).toBe(firstSave);
  });

  it('persists empty systemPrompt correctly', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.handleSettingsSave({
        model: 'auto',
        temperature: 1,
        maxTokens: 2048,
        theme: 'dark',
        systemPrompt: '',
        notificationSound: true,
        showTimestamps: true,
        fontSize: 16,
      });
    });

    const stored = JSON.parse(localStorage.getItem('gemini-settings') || '{}');
    expect(stored.systemPrompt).toBe('');
  });
});
