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
    expect(screen.getByLabelText('모델 선택')).toBeInTheDocument();
    expect(screen.getByText('자동 (Auto)')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.0 Flash (Experimental)')).toBeInTheDocument();
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
    const select = screen.getByLabelText('모델 선택');
    fireEvent.change(select, { target: { value: 'gemini-1.5-pro' } });
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
});
