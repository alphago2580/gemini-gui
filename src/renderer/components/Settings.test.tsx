import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Settings from './Settings';

describe('Settings', () => {
  const defaultSettings = {
    model: 'auto',
    temperature: 1,
    maxTokens: 2048,
    theme: 'dark' as const,
    systemPrompt: '',
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    settings: defaultSettings,
    onSave: vi.fn(),
    themeMode: 'dark' as const,
    onThemeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<Settings {...defaultProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal when isOpen is true', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('renders model selection dropdown', () => {
    render(<Settings {...defaultProps} />);
    const combobox = screen.getByRole('combobox', { name: '모델 선택' });
    expect(combobox).toBeInTheDocument();
    // Open dropdown to verify options
    fireEvent.click(combobox);
    expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.5 Flash')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
    expect(screen.getByText('Gemini 1.5 Pro')).toBeInTheDocument();
    expect(screen.getByText('Gemini 1.5 Flash')).toBeInTheDocument();
  });

  it('renders temperature slider with current value', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText(/Temperature: 1/)).toBeInTheDocument();
    const temperatureSlider = screen.getByLabelText(/Temperature/);
    expect(temperatureSlider).toHaveValue('1');
  });

  it('renders max tokens slider with current value', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText(/최대 토큰: 2048/)).toBeInTheDocument();
    const maxTokensSlider = screen.getByLabelText(/최대 토큰/);
    expect(maxTokensSlider).toHaveValue('2048');
  });

  it('renders info section', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText('정보')).toBeInTheDocument();
    expect(screen.getByText(/GUI 버전/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Settings {...defaultProps} />);
    fireEvent.click(screen.getByText('×'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<Settings {...defaultProps} />);
    fireEvent.click(screen.getByText('취소'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    render(<Settings {...defaultProps} />);
    const overlay = document.querySelector('.settings-overlay');
    fireEvent.click(overlay!);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    render(<Settings {...defaultProps} />);
    const modal = document.querySelector('.settings-modal');
    fireEvent.click(modal!);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('calls onSave and onClose when save button is clicked', () => {
    render(<Settings {...defaultProps} />);
    fireEvent.click(screen.getByText('저장'));
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSave).toHaveBeenCalledWith(defaultSettings);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('updates model selection and saves correctly', () => {
    render(<Settings {...defaultProps} />);
    const combobox = screen.getByRole('combobox', { name: '모델 선택' });
    // Open dropdown and select a model
    fireEvent.click(combobox);
    fireEvent.click(screen.getByText('Gemini 1.5 Pro'));
    fireEvent.click(screen.getByText('저장'));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-1.5-pro' })
    );
  });

  it('updates temperature and saves correctly', () => {
    render(<Settings {...defaultProps} />);
    const slider = screen.getByLabelText(/Temperature/);
    fireEvent.change(slider, { target: { value: '0.5' } });
    fireEvent.click(screen.getByText('저장'));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.5 })
    );
  });

  it('updates max tokens and saves correctly', () => {
    render(<Settings {...defaultProps} />);
    const slider = screen.getByLabelText(/최대 토큰/);
    fireEvent.change(slider, { target: { value: '4096' } });
    fireEvent.click(screen.getByText('저장'));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ maxTokens: 4096 })
    );
  });

  it('renders save and cancel buttons', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText('저장')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('renders hint text for temperature', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText('낮을수록 일관적, 높을수록 창의적')).toBeInTheDocument();
  });

  it('renders hint text for max tokens', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText('응답의 최대 길이')).toBeInTheDocument();
  });

  it('renders theme selector with three options', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText('테마')).toBeInTheDocument();
    expect(screen.getByText('라이트')).toBeInTheDocument();
    expect(screen.getByText('다크')).toBeInTheDocument();
    expect(screen.getByText('시스템')).toBeInTheDocument();
  });

  it('highlights the active theme option', () => {
    render(<Settings {...defaultProps} themeMode="dark" />);
    const darkBtn = screen.getByText('다크');
    expect(darkBtn.className).toContain('active');
    const lightBtn = screen.getByText('라이트');
    expect(lightBtn.className).not.toContain('active');
  });

  it('calls onThemeChange when a theme option is clicked', () => {
    render(<Settings {...defaultProps} />);
    fireEvent.click(screen.getByText('라이트'));
    expect(defaultProps.onThemeChange).toHaveBeenCalledWith('light');
  });

  it('calls onThemeChange with system when system option is clicked', () => {
    render(<Settings {...defaultProps} />);
    fireEvent.click(screen.getByText('시스템'));
    expect(defaultProps.onThemeChange).toHaveBeenCalledWith('system');
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('modal has role="dialog" and aria-modal', () => {
      render(<Settings {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', '설정');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('close button has aria-label', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByRole('button', { name: '설정 닫기' })).toBeInTheDocument();
    });

    it('overlay has role="presentation"', () => {
      const { container } = render(<Settings {...defaultProps} />);
      expect(container.querySelector('[role="presentation"]')).toBeInTheDocument();
    });
  });

  // System prompt editor tests
  describe('System Prompt Editor', () => {
    it('renders system prompt textarea', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByLabelText('시스템 프롬프트')).toBeInTheDocument();
    });

    it('displays placeholder text in system prompt textarea', () => {
      render(<Settings {...defaultProps} />);
      const textarea = screen.getByLabelText('시스템 프롬프트');
      expect(textarea).toHaveAttribute('placeholder', '예: 당신은 친절한 한국어 튜터입니다...');
    });

    it('shows hint text for system prompt', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByText('AI의 동작을 지시하는 시스템 메시지')).toBeInTheDocument();
    });

    it('shows current system prompt value', () => {
      const settingsWithPrompt = { ...defaultSettings, systemPrompt: 'You are a helpful assistant' };
      render(<Settings {...defaultProps} settings={settingsWithPrompt} />);
      const textarea = screen.getByLabelText('시스템 프롬프트');
      expect(textarea).toHaveValue('You are a helpful assistant');
    });

    it('updates system prompt and saves correctly', () => {
      render(<Settings {...defaultProps} />);
      const textarea = screen.getByLabelText('시스템 프롬프트');
      fireEvent.change(textarea, { target: { value: 'New system prompt' } });
      fireEvent.click(screen.getByText('저장'));
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ systemPrompt: 'New system prompt' })
      );
    });

    it('does not show clear button when system prompt is empty', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.queryByRole('button', { name: '시스템 프롬프트 초기화' })).not.toBeInTheDocument();
    });

    it('shows clear button when system prompt has content', () => {
      const settingsWithPrompt = { ...defaultSettings, systemPrompt: 'Some prompt' };
      render(<Settings {...defaultProps} settings={settingsWithPrompt} />);
      expect(screen.getByRole('button', { name: '시스템 프롬프트 초기화' })).toBeInTheDocument();
    });

    it('clears system prompt when clear button is clicked', () => {
      const settingsWithPrompt = { ...defaultSettings, systemPrompt: 'Some prompt' };
      render(<Settings {...defaultProps} settings={settingsWithPrompt} />);
      fireEvent.click(screen.getByRole('button', { name: '시스템 프롬프트 초기화' }));
      const textarea = screen.getByLabelText('시스템 프롬프트');
      expect(textarea).toHaveValue('');
    });

    it('saves empty system prompt after clearing', () => {
      const settingsWithPrompt = { ...defaultSettings, systemPrompt: 'Some prompt' };
      render(<Settings {...defaultProps} settings={settingsWithPrompt} />);
      fireEvent.click(screen.getByRole('button', { name: '시스템 프롬프트 초기화' }));
      fireEvent.click(screen.getByText('저장'));
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ systemPrompt: '' })
      );
    });
  });

  // Settings reset on re-open tests
  describe('Settings Reset', () => {
    it('resets local settings when dialog reopens after cancel', () => {
      const { rerender } = render(<Settings {...defaultProps} />);
      // Modify temperature locally
      const slider = screen.getByLabelText(/Temperature/);
      fireEvent.change(slider, { target: { value: '0.3' } });
      // Cancel (close without saving) — sets isOpen to false
      rerender(<Settings {...defaultProps} isOpen={false} />);
      // Reopen — isOpen changes back to true, triggering useEffect reset
      rerender(<Settings {...defaultProps} isOpen={true} />);
      const resetSlider = screen.getByLabelText(/Temperature/);
      expect(resetSlider).toHaveValue('1');
    });

    it('syncs local settings when settings prop changes externally', () => {
      const { rerender } = render(<Settings {...defaultProps} />);
      const updatedSettings = { ...defaultSettings, model: 'gemini-2.5-pro' };
      rerender(<Settings {...defaultProps} settings={updatedSettings} />);
      // Select component displays the label of the selected option
      expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument();
    });
  });

  // High contrast mode tests
  describe('High Contrast', () => {
    it('does not render high contrast toggle when onHighContrastChange is not provided', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.queryByRole('switch', { name: '고대비 모드' })).not.toBeInTheDocument();
    });

    it('renders high contrast toggle when onHighContrastChange is provided', () => {
      render(<Settings {...defaultProps} highContrast={false} onHighContrastChange={vi.fn()} />);
      expect(screen.getByRole('switch', { name: '고대비 모드' })).toBeInTheDocument();
    });

    it('shows unchecked state when high contrast is disabled', () => {
      render(<Settings {...defaultProps} highContrast={false} onHighContrastChange={vi.fn()} />);
      const toggle = screen.getByRole('switch', { name: '고대비 모드' });
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('shows checked state when high contrast is enabled', () => {
      render(<Settings {...defaultProps} highContrast={true} onHighContrastChange={vi.fn()} />);
      const toggle = screen.getByRole('switch', { name: '고대비 모드' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onHighContrastChange when toggle is clicked', () => {
      const onHighContrastChange = vi.fn();
      render(<Settings {...defaultProps} highContrast={false} onHighContrastChange={onHighContrastChange} />);
      fireEvent.click(screen.getByRole('switch', { name: '고대비 모드' }));
      expect(onHighContrastChange).toHaveBeenCalledWith(true);
    });

    it('calls onHighContrastChange with false when disabling', () => {
      const onHighContrastChange = vi.fn();
      render(<Settings {...defaultProps} highContrast={true} onHighContrastChange={onHighContrastChange} />);
      fireEvent.click(screen.getByRole('switch', { name: '고대비 모드' }));
      expect(onHighContrastChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Additional coverage', () => {
    it('settings-header contains h2 and close button', () => {
      const { container } = render(<Settings {...defaultProps} />);
      const header = container.querySelector('.settings-header');
      expect(header).toBeInTheDocument();
      expect(header!.querySelector('h2')).toBeInTheDocument();
      expect(header!.querySelector('.close-btn')).toBeInTheDocument();
    });

    it('settings-footer contains cancel and save buttons', () => {
      const { container } = render(<Settings {...defaultProps} />);
      const footer = container.querySelector('.settings-footer');
      expect(footer).toBeInTheDocument();
      expect(footer!.querySelector('.cancel-btn')).toBeInTheDocument();
      expect(footer!.querySelector('.save-btn')).toBeInTheDocument();
    });

    it('temperature slider has correct min/max/step attributes', () => {
      render(<Settings {...defaultProps} />);
      const slider = screen.getByLabelText(/Temperature/) as HTMLInputElement;
      expect(slider.min).toBe('0');
      expect(slider.max).toBe('2');
      expect(slider.step).toBe('0.1');
    });

    it('maxTokens slider has correct min/max/step attributes', () => {
      render(<Settings {...defaultProps} />);
      const slider = screen.getByLabelText(/최대 토큰/) as HTMLInputElement;
      expect(slider.min).toBe('256');
      expect(slider.max).toBe('8192');
      expect(slider.step).toBe('256');
    });

    it('system prompt textarea has rows=4', () => {
      render(<Settings {...defaultProps} />);
      const textarea = screen.getByLabelText('시스템 프롬프트') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(4);
    });

    it('info section displays CLI version and config path', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByText('Gemini CLI 버전: 0.17.0')).toBeInTheDocument();
      expect(screen.getByText('설정 파일 위치: ~/.config/google-gemini-cli/')).toBeInTheDocument();
    });

    it('light theme option is not active when dark mode selected', () => {
      render(<Settings {...defaultProps} themeMode="dark" />);
      const lightBtn = screen.getByText('라이트');
      expect(lightBtn.className).not.toContain('active');
      const systemBtn = screen.getByText('시스템');
      expect(systemBtn.className).not.toContain('active');
    });

    it('high contrast hint text is displayed', () => {
      render(<Settings {...defaultProps} highContrast={false} onHighContrastChange={vi.fn()} />);
      expect(screen.getByText('가독성을 높인 고대비 색상')).toBeInTheDocument();
    });
  });

  describe('Switch toggle integration', () => {
    it('renders Switch components for notification and timestamp toggles', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, notificationSound: false, showTimestamps: false }} />);
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThanOrEqual(2);
    });

    it('notification sound Switch reflects checked state', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, notificationSound: true }} />);
      const toggle = screen.getByRole('switch', { name: '알림음' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('notification sound Switch toggles on click', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, notificationSound: false }} />);
      const toggle = screen.getByRole('switch', { name: '알림음' });
      fireEvent.click(toggle);
      // Save and verify the new value
      fireEvent.click(screen.getByText('저장'));
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ notificationSound: true })
      );
    });

    it('show-timestamps Switch reflects checked state', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, showTimestamps: true }} />);
      const toggle = screen.getByRole('switch', { name: '타임스탬프 표시' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Divider section separators', () => {
    it('renders appearance section divider', () => {
      render(<Settings {...defaultProps} onHighContrastChange={vi.fn()} />);
      expect(screen.getByText('외관')).toBeInTheDocument();
    });

    it('renders notifications section divider', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByText('알림 및 표시')).toBeInTheDocument();
    });

    it('renders model section divider', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByText('모델 설정')).toBeInTheDocument();
    });

    it('renders three separator roles', () => {
      render(<Settings {...defaultProps} onHighContrastChange={vi.fn()} />);
      const separators = screen.getAllByRole('separator');
      expect(separators.length).toBeGreaterThanOrEqual(3);
    });
  });
});
