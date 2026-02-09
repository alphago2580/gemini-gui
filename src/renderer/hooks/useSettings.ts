import { useState, useEffect } from 'react';
import type { AppSettings } from '../../preload/types';

const STORAGE_KEY_SETTINGS = 'gemini-settings';

const DEFAULT_SETTINGS: AppSettings = {
  model: 'auto',
  temperature: 1,
  maxTokens: 2048,
  theme: 'dark',
  systemPrompt: ''
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return {
    settings,
    handleSettingsSave,
  };
}
