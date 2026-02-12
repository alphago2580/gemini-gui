import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ConfigPanel, { TokenBurnerConfig } from './ConfigPanel';

const defaultConfig: TokenBurnerConfig = {
  project: {
    repo: '/home/user/my-project',
    mainBranch: 'main',
    testCommand: 'npm test',
  },
  agents: {
    count: 4,
    model: 'claude',
    timeout: 300,
  },
  task: {
    maxRetries: 3,
  },
};

function renderPanel(overrides: Partial<React.ComponentProps<typeof ConfigPanel>> = {}) {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  const result = render(
    <ConfigPanel
      config={defaultConfig}
      onSave={onSave}
      onCancel={onCancel}
      {...overrides}
    />
  );
  return { onSave, onCancel, ...result };
}

describe('ConfigPanel', () => {
  it('should render with config values populated', () => {
    renderPanel();
    expect(screen.getByLabelText(/repository/i)).toHaveValue('/home/user/my-project');
    expect(screen.getByLabelText(/main branch/i)).toHaveValue('main');
    expect(screen.getByLabelText(/test command/i)).toHaveValue('npm test');
    expect(screen.getByLabelText(/model/i)).toHaveValue('claude');
    expect(screen.getByLabelText(/timeout/i)).toHaveValue(300);
    expect(screen.getByLabelText(/max retries/i)).toHaveValue(3);
  });

  it('should render section headings', () => {
    renderPanel();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('should render Configuration title', () => {
    renderPanel();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should call onSave with updated config when Save is clicked', () => {
    const { onSave } = renderPanel();

    const repoInput = screen.getByLabelText(/repository/i);
    fireEvent.change(repoInput, { target: { value: '/new/repo/path' } });

    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedConfig = onSave.mock.calls[0][0] as TokenBurnerConfig;
    expect(savedConfig.project.repo).toBe('/new/repo/path');
    expect(savedConfig.project.mainBranch).toBe('main');
    expect(savedConfig.agents.count).toBe(4);
  });

  it('should call onCancel when Cancel is clicked', () => {
    const { onCancel } = renderPanel();
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should disable inputs and hide Save when disabled is true', () => {
    renderPanel({ disabled: true });

    const fieldsets = document.querySelectorAll('fieldset');
    fieldsets.forEach((fs) => {
      expect(fs).toBeDisabled();
    });

    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('should show validation error for empty repo and not call onSave', () => {
    const { onSave } = renderPanel();

    const repoInput = screen.getByLabelText(/repository/i);
    fireEvent.change(repoInput, { target: { value: '' } });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Repository path is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should show validation error for timeout of 0', () => {
    const { onSave } = renderPanel();

    const timeoutInput = screen.getByLabelText(/timeout/i);
    fireEvent.change(timeoutInput, { target: { value: '0' } });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Timeout must be greater than 0')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should show validation error for negative maxRetries', () => {
    const { onSave } = renderPanel();

    const retriesInput = screen.getByLabelText(/max retries/i);
    fireEvent.change(retriesInput, { target: { value: '-1' } });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Max retries must be 0 or greater')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should update model via select dropdown', () => {
    const { onSave } = renderPanel();

    const modelSelect = screen.getByLabelText(/model/i);
    fireEvent.change(modelSelect, { target: { value: 'gemini' } });
    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedConfig = onSave.mock.calls[0][0] as TokenBurnerConfig;
    expect(savedConfig.agents.model).toBe('gemini');
  });

  it('should display agent count from range slider', () => {
    renderPanel();
    const slider = screen.getByLabelText(/agent count/i);
    expect(slider).toHaveValue('4');

    // The count display should show the current value
    expect(screen.getByText('4')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '6' } });
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should not render Cancel button when onCancel is not provided', () => {
    render(<ConfigPanel config={defaultConfig} onSave={vi.fn()} />);
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
