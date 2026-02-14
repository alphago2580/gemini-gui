import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Settings.css';
import type { AppSettings, ThemeMode } from '../../preload/types';
import Switch from './Switch';
import Select from './Select';
import type { SelectOption } from './Select';
import Slider from './Slider';
import MarkdownEditor from './MarkdownEditor';
import { SHORTCUT_GROUPS } from './KeyboardShortcutHelp';
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

type SettingsTab = 'general' | 'appearance' | 'shortcuts' | 'advanced';

const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: S.SETTINGS_TAB_GENERAL },
  { id: 'appearance', label: S.SETTINGS_TAB_APPEARANCE },
  { id: 'shortcuts', label: S.SETTINGS_TAB_SHORTCUTS },
  { id: 'advanced', label: S.SETTINGS_TAB_ADVANCED },
];

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: S.THEME_LIGHT },
  { value: 'dark', label: S.THEME_DARK },
  { value: 'system', label: S.THEME_SYSTEM },
];

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onSave, themeMode, onThemeChange, highContrast = false, onHighContrastChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const modelOptions: SelectOption[] = useMemo(() =>
    Object.entries(S.MODEL_DISPLAY_NAMES).map(([value, label]) => ({ value, label })),
    []
  );

  // Reset local settings and tab when dialog opens or settings change externally
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setActiveTab('general');
    }
  }, [isOpen, settings]);

  const handleSave = useCallback(() => {
    onSave(localSettings);
    onClose();
  }, [localSettings, onSave, onClose]);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = SETTINGS_TABS.findIndex(t => t.id === activeTab);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % SETTINGS_TABS.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = (currentIndex - 1 + SETTINGS_TABS.length) % SETTINGS_TABS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = SETTINGS_TABS.length - 1;
    } else {
      return;
    }

    setActiveTab(SETTINGS_TABS[newIndex].id);
    const tabButton = document.getElementById(`settings-tab-${SETTINGS_TABS[newIndex].id}`);
    tabButton?.focus();
  }, [activeTab]);

  if (!isOpen) return null;

  const renderGeneralTab = () => (
    <>
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

      <div className="setting-group">
        <label>
          {S.SYSTEM_PROMPT_LABEL}
          <span className="hint">{S.SYSTEM_PROMPT_HINT}</span>
        </label>
        <MarkdownEditor
          value={localSettings.systemPrompt}
          onChange={(val) => setLocalSettings({ ...localSettings, systemPrompt: val })}
          placeholder={S.SYSTEM_PROMPT_PLACEHOLDER}
          minHeight={100}
          defaultMode="write"
          showToolbar={true}
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
    </>
  );

  const renderAppearanceTab = () => (
    <>
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

      <div className="setting-group">
        <Slider
          value={localSettings.fontSize}
          onChange={(val) => setLocalSettings({ ...localSettings, fontSize: val })}
          min={12}
          max={20}
          step={1}
          label={S.FONT_SIZE_LABEL}
          showValue={true}
          formatValue={(v) => `${v}px`}
          size="small"
          marks={[
            { value: 12, label: '12' },
            { value: 16, label: '16' },
            { value: 20, label: '20' },
          ]}
          ariaLabel={S.ARIA_FONT_SIZE}
        />
        <span className="hint">{S.FONT_SIZE_HINT}</span>
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
    </>
  );

  const renderShortcutsTab = () => (
    <>
      <p className="settings-shortcuts-hint">{S.SETTINGS_SHORTCUTS_READONLY_HINT}</p>
      {SHORTCUT_GROUPS.map(group => (
        <div key={group.title} className="settings-shortcut-group">
          <h3 className="settings-shortcut-group-title">{group.title}</h3>
          <div className="settings-shortcut-list">
            {group.shortcuts.map(shortcut => (
              <div key={shortcut.keys} className="settings-shortcut-row">
                <span className="settings-shortcut-description">{shortcut.description}</span>
                <kbd className="settings-shortcut-keys">{shortcut.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );

  const renderAdvancedTab = () => (
    <>
      <div className="setting-group">
        <Slider
          value={localSettings.temperature}
          onChange={(val) => setLocalSettings({ ...localSettings, temperature: val })}
          min={0}
          max={2}
          step={0.1}
          label={S.TEMPERATURE_LABEL}
          showValue={true}
          formatValue={(v) => v.toFixed(1)}
          size="small"
          marks={[
            { value: 0, label: '0' },
            { value: 1, label: '1' },
            { value: 2, label: '2' },
          ]}
          ariaLabel={S.ARIA_TEMPERATURE}
        />
        <span className="hint">{S.TEMPERATURE_HINT}</span>
      </div>

      <div className="setting-group">
        <Slider
          value={localSettings.maxTokens}
          onChange={(val) => setLocalSettings({ ...localSettings, maxTokens: val })}
          min={256}
          max={8192}
          step={256}
          label={S.MAX_TOKENS_LABEL}
          showValue={true}
          formatValue={(v) => `${v}`}
          size="small"
          marks={[
            { value: 256, label: '256' },
            { value: 4096, label: '4K' },
            { value: 8192, label: '8K' },
          ]}
          ariaLabel={S.ARIA_MAX_TOKENS}
        />
        <span className="hint">{S.MAX_TOKENS_HINT}</span>
      </div>

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

      <div className="info-section">
        <h3>{S.INFO_TITLE}</h3>
        <p>{S.INFO_CLI_VERSION}</p>
        <p>{S.INFO_CONFIG_PATH}</p>
        <p>{S.INFO_GUI_VERSION}</p>
      </div>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'appearance': return renderAppearanceTab();
      case 'shortcuts': return renderShortcutsTab();
      case 'advanced': return renderAdvancedTab();
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose} role="presentation">
      <div className="settings-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={S.ARIA_SETTINGS} aria-modal="true">
        <div className="settings-header">
          <h2>{S.SETTINGS_TITLE}</h2>
          <button className="close-btn" onClick={onClose} aria-label={S.ARIA_CLOSE_SETTINGS}>×</button>
        </div>

        <div
          className="settings-tabs"
          role="tablist"
          aria-label={S.SETTINGS_TABS_ARIA}
          onKeyDown={handleTabKeyDown}
        >
          {SETTINGS_TABS.map(tab => (
            <button
              key={tab.id}
              id={`settings-tab-${tab.id}`}
              className={`settings-tab${activeTab === tab.id ? ' settings-tab-active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`settings-tabpanel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className="settings-content"
          role="tabpanel"
          id={`settings-tabpanel-${activeTab}`}
          aria-labelledby={`settings-tab-${activeTab}`}
        >
          {renderTabContent()}
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
