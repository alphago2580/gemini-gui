import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import KeyboardShortcutHelp, { SHORTCUT_GROUPS } from './KeyboardShortcutHelp';

describe('KeyboardShortcutHelp', () => {
  it('returns null when not open', () => {
    const { container } = render(
      <KeyboardShortcutHelp isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when open', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('키보드 단축키')).toBeInTheDocument();
  });

  it('displays all shortcut groups', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    for (const group of SHORTCUT_GROUPS) {
      expect(screen.getByText(group.title)).toBeInTheDocument();
    }
  });

  it('displays shortcut keys and descriptions', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
    expect(screen.getByText('새 대화')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+Shift+P')).toBeInTheDocument();
    expect(screen.getByText('명령 팔레트')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutHelp isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('단축키 도움말 닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutHelp isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has correct dialog aria-label', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('키보드 단축키');
  });

  it('includes sidebar toggle shortcut', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ctrl+B')).toBeInTheDocument();
    expect(screen.getByText('사이드바 토글')).toBeInTheDocument();
  });

  it('includes tab shortcuts', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ctrl+Tab')).toBeInTheDocument();
    expect(screen.getByText('다음 탭')).toBeInTheDocument();
  });
});
