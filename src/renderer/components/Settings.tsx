import React, { useState } from 'react';
import './Settings.css';
import type { AppSettings, ThemeMode } from '../../preload/types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
  { value: 'system', label: '시스템' },
];

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onSave, themeMode, onThemeChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>설정</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label>테마</label>
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
            <label htmlFor="model">모델 선택</label>
            <select
              id="model"
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
            >
              <option value="auto">자동 (Auto)</option>
              <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="temperature">
              Temperature: {localSettings.temperature}
              <span className="hint">낮을수록 일관적, 높을수록 창의적</span>
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
              최대 토큰: {localSettings.maxTokens}
              <span className="hint">응답의 최대 길이</span>
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
            <h3>정보</h3>
            <p>Gemini CLI 버전: 0.17.0</p>
            <p>설정 파일 위치: ~/.config/google-gemini-cli/</p>
            <p>GUI 버전: 1.0.0</p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="save-btn" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
