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
    fontSize: 16,
    notificationSound: true,
    showTimestamps: true,
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

  describe('Tab Navigation', () => {
    it('renders four tab buttons', () => {
      render(<Settings {...defaultProps} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
    });

    it('renders tab labels: 일반, 외관, 단축키, 고급', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByRole('tab', { name: '일반' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '외관' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '단축키' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '고급' })).toBeInTheDocument();
    });

    it('general tab is active by default', () => {
      render(<Settings {...defaultProps} />);
      const generalTab = screen.getByRole('tab', { name: '일반' });
      expect(generalTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches tab on click', () => {
      render(<Settings {...defaultProps} />);
      const appearanceTab = screen.getByRole('tab', { name: '외관' });
      fireEvent.click(appearanceTab);
      expect(appearanceTab).toHaveAttribute('aria-selected', 'true');
      const generalTab = screen.getByRole('tab', { name: '일반' });
      expect(generalTab).toHaveAttribute('aria-selected', 'false');
    });

    it('tablist has correct aria-label', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByRole('tablist', { name: '설정 카테고리' })).toBeInTheDocument();
    });

    it('tabpanel has correct role', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('resets to general tab when reopened', () => {
      const { rerender } = render(<Settings {...defaultProps} />);
      // Navigate to advanced tab
      fireEvent.click(screen.getByRole('tab', { name: '고급' }));
      expect(screen.getByRole('tab', { name: '고급' })).toHaveAttribute('aria-selected', 'true');
      // Close and reopen
      rerender(<Settings {...defaultProps} isOpen={false} />);
      rerender(<Settings {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('tab', { name: '일반' })).toHaveAttribute('aria-selected', 'true');
    });

    it('supports keyboard navigation with ArrowRight', () => {
      render(<Settings {...defaultProps} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'ArrowRight' });
      expect(screen.getByRole('tab', { name: '외관' })).toHaveAttribute('aria-selected', 'true');
    });

    it('supports keyboard navigation with ArrowLeft wrapping', () => {
      render(<Settings {...defaultProps} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
      expect(screen.getByRole('tab', { name: '고급' })).toHaveAttribute('aria-selected', 'true');
    });

    it('supports Home key to go to first tab', () => {
      render(<Settings {...defaultProps} />);
      fireEvent.click(screen.getByRole('tab', { name: '고급' }));
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'Home' });
      expect(screen.getByRole('tab', { name: '일반' })).toHaveAttribute('aria-selected', 'true');
    });

    it('supports End key to go to last tab', () => {
      render(<Settings {...defaultProps} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'End' });
      expect(screen.getByRole('tab', { name: '고급' })).toHaveAttribute('aria-selected', 'true');
    });

    it('inactive tabs have tabIndex -1', () => {
      render(<Settings {...defaultProps} />);
      const appearanceTab = screen.getByRole('tab', { name: '외관' });
      expect(appearanceTab).toHaveAttribute('tabindex', '-1');
    });

    it('active tab has tabIndex 0', () => {
      render(<Settings {...defaultProps} />);
      const generalTab = screen.getByRole('tab', { name: '일반' });
      expect(generalTab).toHaveAttribute('tabindex', '0');
    });
  });

  describe('General Tab', () => {
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

    it('renders model selection dropdown', () => {
      render(<Settings {...defaultProps} />);
      const combobox = screen.getByRole('combobox', { name: '모델 선택' });
      expect(combobox).toBeInTheDocument();
      fireEvent.click(combobox);
      expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument();
      expect(screen.getByText('Gemini 2.5 Flash')).toBeInTheDocument();
    });

    it('updates model selection and saves correctly', () => {
      render(<Settings {...defaultProps} />);
      const combobox = screen.getByRole('combobox', { name: '모델 선택' });
      fireEvent.click(combobox);
      fireEvent.click(screen.getByText('Gemini 1.5 Pro'));
      fireEvent.click(screen.getByText('저장'));
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gemini-1.5-pro' })
      );
    });

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

    it('system prompt textarea has rows=4', () => {
      render(<Settings {...defaultProps} />);
      const textarea = screen.getByLabelText('시스템 프롬프트') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(4);
    });
  });

  describe('Appearance Tab', () => {
    const switchToAppearance = () => {
      fireEvent.click(screen.getByRole('tab', { name: '외관' }));
    };

    it('renders font size slider', () => {
      render(<Settings {...defaultProps} />);
      switchToAppearance();
      expect(screen.getByText('글꼴 크기')).toBeInTheDocument();
      expect(screen.getByText('16px')).toBeInTheDocument();
      const slider = screen.getByRole('slider', { name: '글꼴 크기' });
      expect(slider).toBeInTheDocument();
    });

    it('renders show-timestamps toggle', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, showTimestamps: false }} />);
      switchToAppearance();
      const toggle = screen.getByRole('switch', { name: '타임스탬프 표시' });
      expect(toggle).toBeInTheDocument();
    });

    it('show-timestamps toggle reflects checked state', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, showTimestamps: true }} />);
      switchToAppearance();
      const toggle = screen.getByRole('switch', { name: '타임스탬프 표시' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('renders high contrast toggle when onHighContrastChange is provided', () => {
      render(<Settings {...defaultProps} highContrast={false} onHighContrastChange={vi.fn()} />);
      switchToAppearance();
      expect(screen.getByRole('switch', { name: '고대비 모드' })).toBeInTheDocument();
    });

    it('does not render high contrast toggle when onHighContrastChange is not provided', () => {
      render(<Settings {...defaultProps} />);
      switchToAppearance();
      expect(screen.queryByRole('switch', { name: '고대비 모드' })).not.toBeInTheDocument();
    });

    it('shows unchecked state when high contrast is disabled', () => {
      render(<Settings {...defaultProps} highContrast={false} onHighContrastChange={vi.fn()} />);
      switchToAppearance();
      const toggle = screen.getByRole('switch', { name: '고대비 모드' });
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('shows checked state when high contrast is enabled', () => {
      render(<Settings {...defaultProps} highContrast={true} onHighContrastChange={vi.fn()} />);
      switchToAppearance();
      const toggle = screen.getByRole('switch', { name: '고대비 모드' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onHighContrastChange when toggle is clicked', () => {
      const onHighContrastChange = vi.fn();
      render(<Settings {...defaultProps} highContrast={false} onHighContrastChange={onHighContrastChange} />);
      switchToAppearance();
      fireEvent.click(screen.getByRole('switch', { name: '고대비 모드' }));
      expect(onHighContrastChange).toHaveBeenCalledWith(true);
    });

    it('calls onHighContrastChange with false when disabling', () => {
      const onHighContrastChange = vi.fn();
      render(<Settings {...defaultProps} highContrast={true} onHighContrastChange={onHighContrastChange} />);
      switchToAppearance();
      fireEvent.click(screen.getByRole('switch', { name: '고대비 모드' }));
      expect(onHighContrastChange).toHaveBeenCalledWith(false);
    });

    it('high contrast hint text is displayed', () => {
      render(<Settings {...defaultProps} highContrast={false} onHighContrastChange={vi.fn()} />);
      switchToAppearance();
      expect(screen.getByText('가독성을 높인 고대비 색상')).toBeInTheDocument();
    });

    it('font size slider has correct min/max aria attributes', () => {
      render(<Settings {...defaultProps} />);
      switchToAppearance();
      const slider = screen.getByRole('slider', { name: '글꼴 크기' });
      expect(slider).toHaveAttribute('aria-valuemin', '12');
      expect(slider).toHaveAttribute('aria-valuemax', '20');
      expect(slider).toHaveAttribute('aria-valuenow', '16');
    });
  });

  describe('Shortcuts Tab', () => {
    const switchToShortcuts = () => {
      fireEvent.click(screen.getByRole('tab', { name: '단축키' }));
    };

    it('renders shortcuts readonly hint', () => {
      render(<Settings {...defaultProps} />);
      switchToShortcuts();
      expect(screen.getByText('단축키는 시스템에서 자동으로 설정됩니다')).toBeInTheDocument();
    });

    it('renders shortcut groups', () => {
      const { container } = render(<Settings {...defaultProps} />);
      switchToShortcuts();
      const groupTitles = container.querySelectorAll('.settings-shortcut-group-title');
      const titles = Array.from(groupTitles).map(el => el.textContent);
      expect(titles).toContain('일반');
      expect(titles).toContain('메시지');
      expect(titles).toContain('검색');
      expect(titles).toContain('탭');
    });

    it('renders shortcut key bindings', () => {
      render(<Settings {...defaultProps} />);
      switchToShortcuts();
      expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
      expect(screen.getByText('새 대화')).toBeInTheDocument();
      expect(screen.getByText('Enter')).toBeInTheDocument();
      expect(screen.getByText('메시지 전송')).toBeInTheDocument();
    });

    it('renders kbd elements for shortcut keys', () => {
      const { container } = render(<Settings {...defaultProps} />);
      switchToShortcuts();
      const kbds = container.querySelectorAll('kbd');
      expect(kbds.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced Tab', () => {
    const switchToAdvanced = () => {
      fireEvent.click(screen.getByRole('tab', { name: '고급' }));
    };

    it('renders temperature slider with current value', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      expect(screen.getByText('Temperature')).toBeInTheDocument();
      expect(screen.getByText('1.0')).toBeInTheDocument();
      const temperatureSlider = screen.getByRole('slider', { name: /Temperature/ });
      expect(temperatureSlider).toHaveAttribute('aria-valuenow', '1');
    });

    it('renders max tokens slider with current value', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      expect(screen.getByText('최대 토큰')).toBeInTheDocument();
      expect(screen.getByText('2048')).toBeInTheDocument();
      const maxTokensSlider = screen.getByRole('slider', { name: /최대 토큰/ });
      expect(maxTokensSlider).toHaveAttribute('aria-valuenow', '2048');
    });

    it('renders hint text for temperature', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      expect(screen.getByText('낮을수록 일관적, 높을수록 창의적')).toBeInTheDocument();
    });

    it('renders hint text for max tokens', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      expect(screen.getByText('응답의 최대 길이')).toBeInTheDocument();
    });

    it('updates temperature via keyboard and saves correctly', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      const slider = screen.getByRole('slider', { name: /Temperature/ });
      // ArrowLeft decreases by step (0.1): 1.0 -> 0.9
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      fireEvent.click(screen.getByText('저장'));
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ temperature: 0.9 })
      );
    });

    it('updates max tokens via keyboard and saves correctly', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      const slider = screen.getByRole('slider', { name: /최대 토큰/ });
      // ArrowRight increases by step (256): 2048 -> 2304
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      fireEvent.click(screen.getByText('저장'));
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ maxTokens: 2304 })
      );
    });

    it('temperature slider has correct min/max aria attributes', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      const slider = screen.getByRole('slider', { name: /Temperature/ });
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '2');
    });

    it('maxTokens slider has correct min/max aria attributes', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      const slider = screen.getByRole('slider', { name: /최대 토큰/ });
      expect(slider).toHaveAttribute('aria-valuemin', '256');
      expect(slider).toHaveAttribute('aria-valuemax', '8192');
    });

    it('renders notification sound toggle', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, notificationSound: false }} />);
      switchToAdvanced();
      const toggle = screen.getByRole('switch', { name: '알림음' });
      expect(toggle).toBeInTheDocument();
    });

    it('notification sound Switch reflects checked state', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, notificationSound: true }} />);
      switchToAdvanced();
      const toggle = screen.getByRole('switch', { name: '알림음' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('notification sound Switch toggles on click', () => {
      render(<Settings {...defaultProps} settings={{ ...defaultSettings, notificationSound: false }} />);
      switchToAdvanced();
      const toggle = screen.getByRole('switch', { name: '알림음' });
      fireEvent.click(toggle);
      fireEvent.click(screen.getByText('저장'));
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ notificationSound: true })
      );
    });

    it('renders info section', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      expect(screen.getByText('정보')).toBeInTheDocument();
      expect(screen.getByText(/GUI 버전/)).toBeInTheDocument();
    });

    it('info section displays CLI version and config path', () => {
      render(<Settings {...defaultProps} />);
      switchToAdvanced();
      expect(screen.getByText('Gemini CLI 버전: 0.17.0')).toBeInTheDocument();
      expect(screen.getByText('설정 파일 위치: ~/.config/google-gemini-cli/')).toBeInTheDocument();
    });
  });

  describe('Modal Interaction', () => {
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

    it('renders save and cancel buttons', () => {
      render(<Settings {...defaultProps} />);
      expect(screen.getByText('저장')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });
  });

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

  describe('Settings Reset', () => {
    it('resets local settings when dialog reopens after cancel', () => {
      const { rerender } = render(<Settings {...defaultProps} />);
      // Navigate to advanced tab and modify temperature via keyboard
      fireEvent.click(screen.getByRole('tab', { name: '고급' }));
      const slider = screen.getByRole('slider', { name: /Temperature/ });
      fireEvent.keyDown(slider, { key: 'ArrowLeft' }); // 1.0 -> 0.9
      // Cancel (close without saving)
      rerender(<Settings {...defaultProps} isOpen={false} />);
      // Reopen
      rerender(<Settings {...defaultProps} isOpen={true} />);
      // Navigate to advanced tab again
      fireEvent.click(screen.getByRole('tab', { name: '고급' }));
      const resetSlider = screen.getByRole('slider', { name: /Temperature/ });
      expect(resetSlider).toHaveAttribute('aria-valuenow', '1');
    });

    it('syncs local settings when settings prop changes externally', () => {
      const { rerender } = render(<Settings {...defaultProps} />);
      const updatedSettings = { ...defaultSettings, model: 'gemini-2.5-pro' };
      rerender(<Settings {...defaultProps} settings={updatedSettings} />);
      expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
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

    it('settings-tabs container is present', () => {
      const { container } = render(<Settings {...defaultProps} />);
      expect(container.querySelector('.settings-tabs')).toBeInTheDocument();
    });
  });
});
