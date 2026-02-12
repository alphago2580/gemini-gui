import React, { useState, useCallback } from 'react';
import './ConfigPanel.css';

export interface TokenBurnerConfig {
  project: {
    repo: string;
    mainBranch: string;
    testCommand: string;
  };
  agents: {
    count: number;
    model: string;
    timeout: number;
  };
  task: {
    maxRetries: number;
  };
}

export interface ConfigPanelProps {
  config: TokenBurnerConfig;
  onSave: (config: TokenBurnerConfig) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

interface ValidationErrors {
  repo?: string;
  count?: string;
  timeout?: string;
  maxRetries?: string;
}

function validate(config: TokenBurnerConfig): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!config.project.repo.trim()) {
    errors.repo = 'Repository path is required';
  }
  if (config.agents.count < 1 || config.agents.count > 8) {
    errors.count = 'Agent count must be between 1 and 8';
  }
  if (config.agents.timeout <= 0) {
    errors.timeout = 'Timeout must be greater than 0';
  }
  if (config.task.maxRetries < 0) {
    errors.maxRetries = 'Max retries must be 0 or greater';
  }
  return errors;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onSave, onCancel, disabled = false }) => {
  const [draft, setDraft] = useState<TokenBurnerConfig>(() => structuredClone(config));
  const [errors, setErrors] = useState<ValidationErrors>({});

  const updateProject = useCallback((field: keyof TokenBurnerConfig['project'], value: string) => {
    setDraft((prev) => ({
      ...prev,
      project: { ...prev.project, [field]: value },
    }));
  }, []);

  const updateAgents = useCallback((field: keyof TokenBurnerConfig['agents'], value: number | string) => {
    setDraft((prev) => ({
      ...prev,
      agents: { ...prev.agents, [field]: value },
    }));
  }, []);

  const updateTask = useCallback((field: keyof TokenBurnerConfig['task'], value: number) => {
    setDraft((prev) => ({
      ...prev,
      task: { ...prev.task, [field]: value },
    }));
  }, []);

  const handleSave = useCallback(() => {
    const validationErrors = validate(draft);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSave(draft);
    }
  }, [draft, onSave]);

  const handleCancel = useCallback(() => {
    setDraft(structuredClone(config));
    setErrors({});
    onCancel?.();
  }, [config, onCancel]);

  return (
    <div className="tb-config" role="region" aria-label="Configuration">
      <h3 className="tb-config-title">Configuration</h3>

      <fieldset className="tb-config-section" disabled={disabled}>
        <legend className="tb-config-section-heading">Project</legend>

        <div className="tb-config-field">
          <label className="tb-config-label" htmlFor="tb-config-repo">Repository</label>
          <input
            id="tb-config-repo"
            className={`tb-config-input${errors.repo ? ' tb-config-input--error' : ''}`}
            type="text"
            value={draft.project.repo}
            onChange={(e) => updateProject('repo', e.target.value)}
            aria-invalid={!!errors.repo}
            aria-describedby={errors.repo ? 'tb-config-repo-error' : undefined}
          />
          {errors.repo && (
            <span id="tb-config-repo-error" className="tb-config-error" role="alert">
              {errors.repo}
            </span>
          )}
        </div>

        <div className="tb-config-field">
          <label className="tb-config-label" htmlFor="tb-config-branch">Main Branch</label>
          <input
            id="tb-config-branch"
            className="tb-config-input"
            type="text"
            value={draft.project.mainBranch}
            onChange={(e) => updateProject('mainBranch', e.target.value)}
          />
        </div>

        <div className="tb-config-field">
          <label className="tb-config-label" htmlFor="tb-config-test-cmd">Test Command</label>
          <input
            id="tb-config-test-cmd"
            className="tb-config-input"
            type="text"
            value={draft.project.testCommand}
            onChange={(e) => updateProject('testCommand', e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="tb-config-section" disabled={disabled}>
        <legend className="tb-config-section-heading">Agents</legend>

        <div className="tb-config-field">
          <label className="tb-config-label" htmlFor="tb-config-count">
            Agent Count <span className="tb-config-count-display">{draft.agents.count}</span>
          </label>
          <input
            id="tb-config-count"
            className="tb-config-range"
            type="range"
            min={1}
            max={8}
            step={1}
            value={draft.agents.count}
            onChange={(e) => updateAgents('count', Number(e.target.value))}
            aria-invalid={!!errors.count}
            aria-describedby={errors.count ? 'tb-config-count-error' : undefined}
          />
          {errors.count && (
            <span id="tb-config-count-error" className="tb-config-error" role="alert">
              {errors.count}
            </span>
          )}
        </div>

        <div className="tb-config-field">
          <label className="tb-config-label" htmlFor="tb-config-model">Model</label>
          <select
            id="tb-config-model"
            className="tb-config-select"
            value={draft.agents.model}
            onChange={(e) => updateAgents('model', e.target.value)}
          >
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        <div className="tb-config-field">
          <label className="tb-config-label" htmlFor="tb-config-timeout">Timeout (seconds)</label>
          <input
            id="tb-config-timeout"
            className={`tb-config-input${errors.timeout ? ' tb-config-input--error' : ''}`}
            type="number"
            min={1}
            value={draft.agents.timeout}
            onChange={(e) => updateAgents('timeout', Number(e.target.value))}
            aria-invalid={!!errors.timeout}
            aria-describedby={errors.timeout ? 'tb-config-timeout-error' : undefined}
          />
          {errors.timeout && (
            <span id="tb-config-timeout-error" className="tb-config-error" role="alert">
              {errors.timeout}
            </span>
          )}
        </div>
      </fieldset>

      <fieldset className="tb-config-section" disabled={disabled}>
        <legend className="tb-config-section-heading">Task</legend>

        <div className="tb-config-field">
          <label className="tb-config-label" htmlFor="tb-config-retries">Max Retries</label>
          <input
            id="tb-config-retries"
            className={`tb-config-input${errors.maxRetries ? ' tb-config-input--error' : ''}`}
            type="number"
            min={0}
            max={10}
            value={draft.task.maxRetries}
            onChange={(e) => updateTask('maxRetries', Number(e.target.value))}
            aria-invalid={!!errors.maxRetries}
            aria-describedby={errors.maxRetries ? 'tb-config-retries-error' : undefined}
          />
          {errors.maxRetries && (
            <span id="tb-config-retries-error" className="tb-config-error" role="alert">
              {errors.maxRetries}
            </span>
          )}
        </div>
      </fieldset>

      {!disabled && (
        <div className="tb-config-actions">
          <button className="tb-btn tb-btn--primary" onClick={handleSave}>
            Save
          </button>
          {onCancel && (
            <button className="tb-btn tb-btn--secondary" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ConfigPanel);
