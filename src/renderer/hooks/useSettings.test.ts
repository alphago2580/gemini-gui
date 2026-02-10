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
});
