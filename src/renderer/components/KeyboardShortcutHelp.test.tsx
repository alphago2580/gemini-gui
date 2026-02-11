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

  it('does not propagate click from modal body to overlay', () => {
    const onClose = vi.fn();
    const { container } = render(<KeyboardShortcutHelp isOpen={true} onClose={onClose} />);
    const modal = container.querySelector('.shortcut-help-modal')!;
    fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders shortcut keys in kbd elements', () => {
    const { container } = render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    const kbdElements = container.querySelectorAll('kbd.shortcut-keys');
    const totalShortcuts = SHORTCUT_GROUPS.reduce((sum, g) => sum + g.shortcuts.length, 0);
    expect(kbdElements).toHaveLength(totalShortcuts);
  });

  it('renders all shortcut descriptions in rows', () => {
    const { container } = render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    const rows = container.querySelectorAll('.shortcut-row');
    const totalShortcuts = SHORTCUT_GROUPS.reduce((sum, g) => sum + g.shortcuts.length, 0);
    expect(rows).toHaveLength(totalShortcuts);
  });

  it('includes search shortcut Ctrl+F', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ctrl+F')).toBeInTheDocument();
    expect(screen.getByText('대화 내 검색')).toBeInTheDocument();
  });

  it('includes all 4 shortcut group titles', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    const { container } = render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    const groups = container.querySelectorAll('.shortcut-group');
    expect(groups).toHaveLength(SHORTCUT_GROUPS.length);
  });

  it('includes Escape shortcut with close description', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getAllByText('Escape').length).toBeGreaterThan(0);
  });

  it('includes message shortcuts (Enter, Shift+Enter)', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Enter')).toBeInTheDocument();
    expect(screen.getByText('Shift+Enter')).toBeInTheDocument();
  });

  it('includes previous tab shortcut', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ctrl+Shift+Tab')).toBeInTheDocument();
  });

  it('includes Ctrl+K quick switch shortcut', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });

  it('includes Ctrl+L clear shortcut', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ctrl+L')).toBeInTheDocument();
  });

  it('includes Ctrl+, settings shortcut', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ctrl+,')).toBeInTheDocument();
  });

  it('SHORTCUT_GROUPS has correct structure', () => {
    for (const group of SHORTCUT_GROUPS) {
      expect(group).toHaveProperty('title');
      expect(group).toHaveProperty('shortcuts');
      expect(Array.isArray(group.shortcuts)).toBe(true);
      for (const shortcut of group.shortcuts) {
        expect(shortcut).toHaveProperty('keys');
        expect(shortcut).toHaveProperty('description');
      }
    }
  });

  it('close button has × text', () => {
    render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    const closeBtn = screen.getByLabelText('단축키 도움말 닫기');
    expect(closeBtn.textContent).toBe('×');
  });

  it('has shortcut-help-header and shortcut-help-content sections', () => {
    const { container } = render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);
    expect(container.querySelector('.shortcut-help-header')).toBeTruthy();
    expect(container.querySelector('.shortcut-help-content')).toBeTruthy();
  });
});
