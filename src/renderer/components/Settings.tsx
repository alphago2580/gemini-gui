import React, { useState, useEffect } from 'react';
import './Settings.css';
import type { AppSettings, ThemeMode } from '../../preload/types';
import * as S from '../constants/strings';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  highContrast?: boolean;
  onHighContrastChange?: (enabled: boolean) => void;
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: S.THEME_LIGHT },
  { value: 'dark', label: S.THEME_DARK },
  { value: 'system', label: S.THEME_SYSTEM },
];

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onSave, themeMode, onThemeChange, highContrast = false, onHighContrastChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  // Reset local settings when dialog opens or settings change externally
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose} role="presentation">
      <div className="settings-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={S.ARIA_SETTINGS} aria-modal="true">
        <div className="settings-header">
          <h2>{S.SETTINGS_TITLE}</h2>
          <button className="close-btn" onClick={onClose} aria-label={S.ARIA_CLOSE_SETTINGS}>×</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label>{S.THEME_LABEL}</label>
            <div className="theme-selector">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`theme-option${themeMode === option.value ? ' active' : ''}`}
                  onClick={() => onThemeChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {onHighContrastChange && (
            <div className="setting-group">
              <label htmlFor="high-contrast">
                {S.HIGH_CONTRAST_LABEL}
                <span className="hint">{S.HIGH_CONTRAST_HINT}</span>
              </label>
              <button
                id="high-contrast"
                className={`toggle-btn${highContrast ? ' active' : ''}`}
                onClick={() => onHighContrastChange(!highContrast)}
                role="switch"
                aria-checked={highContrast}
                aria-label={S.ARIA_HIGH_CONTRAST}
              >
                {highContrast ? 'ON' : 'OFF'}
              </button>
            </div>
          )}

          <div className="setting-group">
            <label htmlFor="system-prompt">
              {S.SYSTEM_PROMPT_LABEL}
              <span className="hint">{S.SYSTEM_PROMPT_HINT}</span>
            </label>
            <textarea
              id="system-prompt"
              className="system-prompt-input"
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
              placeholder={S.SYSTEM_PROMPT_PLACEHOLDER}
              rows={4}
              aria-label={S.ARIA_SYSTEM_PROMPT}
            />
            {localSettings.systemPrompt && (
              <button
                className="clear-prompt-btn"
                onClick={() => setLocalSettings({ ...localSettings, systemPrompt: '' })}
                aria-label={S.ARIA_CLEAR_PROMPT}
                type="button"
              >
                {S.CLEAR_PROMPT}
              </button>
            )}
          </div>

          <div className="setting-group">
            <label htmlFor="model">
              {S.MODEL_SELECT_LABEL}
              <span className="hint">{S.MODEL_SELECT_HINT}</span>
            </label>
            <select
              id="model"
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              aria-label={S.ARIA_MODEL_SELECT}
            >
              <option value="auto">{S.MODEL_AUTO}</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="temperature">
              Temperature: {localSettings.temperature}
              <span className="hint">{S.TEMPERATURE_HINT}</span>
            </label>
            <input
              type="range"
              id="temperature"
              min="0"
              max="2"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
            />
          </div>

          <div className="setting-group">
            <label htmlFor="maxTokens">
              {S.MAX_TOKENS_PREFIX} {localSettings.maxTokens}
              <span className="hint">{S.MAX_TOKENS_HINT}</span>
            </label>
            <input
              type="range"
              id="maxTokens"
              min="256"
              max="8192"
              step="256"
              value={localSettings.maxTokens}
              onChange={(e) => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) })}
            />
          </div>

          <div className="info-section">
            <h3>{S.INFO_TITLE}</h3>
            <p>{S.INFO_CLI_VERSION}</p>
            <p>{S.INFO_CONFIG_PATH}</p>
            <p>{S.INFO_GUI_VERSION}</p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>{S.CANCEL_BUTTON}</button>
          <button className="save-btn" onClick={handleSave}>{S.SAVE_BUTTON}</button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Settings);
