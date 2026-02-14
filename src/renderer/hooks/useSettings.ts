import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppSettings } from '../../preload/types';
import * as S from '../constants/strings';

const DEFAULT_SETTINGS: AppSettings = {
  model: 'auto',
  temperature: 1,
  maxTokens: 2048,
  theme: 'dark',
  systemPrompt: '',
  notificationSound: true,
  showTimestamps: true,
  fontSize: 14,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(S.STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(S.STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const handleSettingsSave = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  return useMemo(() => ({
    settings,
    handleSettingsSave,
  }), [settings, handleSettingsSave]);
}
