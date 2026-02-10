import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeScreen, { DEFAULT_SUGGESTIONS } from './WelcomeScreen';

describe('WelcomeScreen', () => {
  const onPromptClick = vi.fn();

  it('renders welcome title and subtitle', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    expect(screen.getByText('Gemini에 오신 것을 환영합니다!')).toBeInTheDocument();
    expect(screen.getByText(/입력창에 메시지를 입력하거나/)).toBeInTheDocument();
  });

  it('renders all suggestion cards', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    DEFAULT_SUGGESTIONS.forEach(s => {
      expect(screen.getByLabelText(s.label)).toBeInTheDocument();
    });
  });

  it('calls onPromptClick with correct prompt when card is clicked', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    fireEvent.click(screen.getByLabelText('아이디어 브레인스토밍'));
    expect(onPromptClick).toHaveBeenCalledWith(DEFAULT_SUGGESTIONS[0].prompt);
  });

  it('renders icons for each suggestion', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    expect(screen.getByText('💡')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByText('🐛')).toBeInTheDocument();
  });

  it('has accessible region and list roles', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    expect(screen.getByRole('region', { name: '환영 화면' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '제안 프롬프트' })).toBeInTheDocument();
  });

  it('renders logo element', () => {
    const { container } = render(<WelcomeScreen onPromptClick={onPromptClick} />);
    expect(container.querySelector('.welcome-logo')).toBeTruthy();
  });
});
