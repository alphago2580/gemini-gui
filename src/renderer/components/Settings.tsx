import React, { useState, useEffect, useMemo } from 'react';
import './Settings.css';
import type { AppSettings, ThemeMode } from '../../preload/types';
import Divider from './Divider';
import Switch from './Switch';
import Accordion from './Accordion';
import type { AccordionItem } from './Accordion';
import Select from './Select';
import type { SelectOption } from './Select';
import * as S from '../constants/strings';

export interface SettingsProps {
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

  const modelOptions: SelectOption[] = useMemo(() =>
    Object.entries(S.MODEL_DISPLAY_NAMES).map(([value, label]) => ({ value, label })),
    []
  );

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

  const advancedItems: AccordionItem[] = [
    {
      id: 'advanced',
      title: S.SETTINGS_SECTION_ADVANCED,
      content: (
        <>
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
          <div className="setting-group">
            <label htmlFor="fontSize">
              {S.FONT_SIZE_PREFIX} {localSettings.fontSize}px
              <span className="hint">{S.FONT_SIZE_HINT}</span>
            </label>
            <input
              type="range"
              id="fontSize"
              min="12"
              max="20"
              step="1"
              value={localSettings.fontSize}
              onChange={(e) => setLocalSettings({ ...localSettings, fontSize: parseInt(e.target.value) })}
              aria-label={S.ARIA_FONT_SIZE}
            />
          </div>
        </>
      ),
    },
  ];

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

          <Divider label={S.SETTINGS_SECTION_APPEARANCE} spacing="small" />

          {onHighContrastChange && (
            <div className="setting-group">
              <label htmlFor="high-contrast">
                {S.HIGH_CONTRAST_LABEL}
                <span className="hint">{S.HIGH_CONTRAST_HINT}</span>
              </label>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onChange={(val) => onHighContrastChange(val)}
                size="small"
                aria-label={S.ARIA_HIGH_CONTRAST}
              />
            </div>
          )}

          <Divider label={S.SETTINGS_SECTION_NOTIFICATIONS} spacing="small" />

          <div className="setting-group">
            <label htmlFor="notification-sound">
              {S.NOTIFICATION_SOUND_LABEL}
              <span className="hint">{S.NOTIFICATION_SOUND_HINT}</span>
            </label>
            <Switch
              id="notification-sound"
              checked={localSettings.notificationSound ?? false}
              onChange={(val) => setLocalSettings({ ...localSettings, notificationSound: val })}
              size="small"
              aria-label={S.ARIA_NOTIFICATION_SOUND}
            />
          </div>

          <div className="setting-group">
            <label htmlFor="show-timestamps">
              {S.SHOW_TIMESTAMPS_LABEL}
              <span className="hint">{S.SHOW_TIMESTAMPS_HINT}</span>
            </label>
            <Switch
              id="show-timestamps"
              checked={localSettings.showTimestamps ?? false}
              onChange={(val) => setLocalSettings({ ...localSettings, showTimestamps: val })}
              size="small"
              aria-label={S.ARIA_SHOW_TIMESTAMPS}
            />
          </div>

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

          <Divider label={S.SETTINGS_SECTION_MODEL} spacing="small" />

          <div className="setting-group">
            <Select
              label={S.MODEL_SELECT_LABEL}
              options={modelOptions}
              value={localSettings.model}
              onChange={(val) => setLocalSettings({ ...localSettings, model: val as string })}
              size="md"
              variant="outlined"
            />
          </div>

          <Accordion
            items={advancedItems}
            multiple={true}
            defaultExpanded={['advanced']}
          />

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
