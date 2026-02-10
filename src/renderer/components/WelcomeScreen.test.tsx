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

  it('renders logo with correct text content', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    expect(screen.getByText('✦')).toBeInTheDocument();
  });

  it('calls onPromptClick with each suggestion prompt correctly', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    DEFAULT_SUGGESTIONS.forEach((suggestion) => {
      onPromptClick.mockClear();
      fireEvent.click(screen.getByLabelText(suggestion.label));
      expect(onPromptClick).toHaveBeenCalledWith(suggestion.prompt);
    });
  });

  it('renders correct number of suggestion cards', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(DEFAULT_SUGGESTIONS.length);
  });

  it('each suggestion card has correct CSS class', () => {
    const { container } = render(<WelcomeScreen onPromptClick={onPromptClick} />);
    const cards = container.querySelectorAll('.welcome-suggestion-card');
    expect(cards).toHaveLength(DEFAULT_SUGGESTIONS.length);
  });

  it('renders all six suggestion icons', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    DEFAULT_SUGGESTIONS.forEach(s => {
      expect(screen.getByText(s.icon)).toBeInTheDocument();
    });
  });

  it('renders all suggestion labels as text', () => {
    render(<WelcomeScreen onPromptClick={onPromptClick} />);
    DEFAULT_SUGGESTIONS.forEach(s => {
      expect(screen.getByText(s.label)).toBeInTheDocument();
    });
  });

  it('has welcome-screen class on root container', () => {
    const { container } = render(<WelcomeScreen onPromptClick={onPromptClick} />);
    expect(container.querySelector('.welcome-screen')).toBeTruthy();
  });

  it('has welcome-title and welcome-subtitle classes', () => {
    const { container } = render(<WelcomeScreen onPromptClick={onPromptClick} />);
    expect(container.querySelector('.welcome-title')).toBeTruthy();
    expect(container.querySelector('.welcome-subtitle')).toBeTruthy();
  });

  it('DEFAULT_SUGGESTIONS has exactly 6 entries', () => {
    expect(DEFAULT_SUGGESTIONS).toHaveLength(6);
  });

  it('each suggestion has icon, label, and prompt fields', () => {
    DEFAULT_SUGGESTIONS.forEach(s => {
      expect(typeof s.icon).toBe('string');
      expect(typeof s.label).toBe('string');
      expect(typeof s.prompt).toBe('string');
      expect(s.icon.length).toBeGreaterThan(0);
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.prompt.length).toBeGreaterThan(0);
    });
  });
});
