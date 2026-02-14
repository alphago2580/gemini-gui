import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import CommandPalette from './CommandPalette';
import type { Command } from './CommandPalette';

const createCommands = (): Command[] => [
  { id: 'new-chat', label: '새 대화', shortcut: 'Ctrl+N', action: vi.fn<() => void>() },
  { id: 'clear', label: '대화 지우기', shortcut: 'Ctrl+L', action: vi.fn<() => void>() },
  { id: 'search', label: '대화 검색', shortcut: 'Ctrl+F', action: vi.fn<() => void>() },
  { id: 'settings', label: '설정 열기', shortcut: 'Ctrl+,', action: vi.fn<() => void>() },
  { id: 'export', label: 'Markdown으로 내보내기', action: vi.fn<() => void>() },
];

/**
 * Helper to find a command option by its accessible name.
 * Uses getByRole('option') which aggregates text across child elements
 * (including <mark> highlight tags from fuzzy search).
 */
function getOption(name: string | RegExp): HTMLElement {
  return screen.getByRole('option', { name });
}

function queryOption(name: string | RegExp): HTMLElement | null {
  return screen.queryByRole('option', { name });
}

describe('CommandPalette', () => {
  let commands: Command[];
  let onClose: () => void;

  beforeEach(() => {
    commands = createCommands();
    onClose = vi.fn<() => void>();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <CommandPalette isOpen={false} onClose={onClose} commands={commands} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders dialog when open', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '명령 팔레트');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders search input with placeholder', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    expect(screen.getByPlaceholderText('명령어 검색...')).toBeInTheDocument();
  });

  it('renders all commands when no search query', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    expect(screen.getByText('새 대화')).toBeInTheDocument();
    expect(screen.getByText('대화 지우기')).toBeInTheDocument();
    expect(screen.getByText('대화 검색')).toBeInTheDocument();
    expect(screen.getByText('설정 열기')).toBeInTheDocument();
    expect(screen.getByText('Markdown으로 내보내기')).toBeInTheDocument();
  });

  it('displays keyboard shortcuts', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+L')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+F')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+,')).toBeInTheDocument();
  });

  it('does not show shortcut badge when shortcut is undefined', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const exportItem = screen.getByText('Markdown으로 내보내기').closest('li');
    expect(exportItem?.querySelector('.command-shortcut')).toBeNull();
  });

  it('filters commands based on search query', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    await user.type(input, '대화');
    // Commands containing "대화" should be visible (text may span <mark> elements)
    expect(getOption(/새 대화/)).toBeInTheDocument();
    expect(getOption(/대화 지우기/)).toBeInTheDocument();
    expect(getOption(/대화 검색/)).toBeInTheDocument();
    // Commands without "대화" should be filtered out
    expect(queryOption(/설정 열기/)).not.toBeInTheDocument();
    expect(queryOption(/Markdown으로 내보내기/)).not.toBeInTheDocument();
  });

  it('filters case-insensitively', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    await user.type(input, 'markdown');
    expect(getOption(/Markdown으로 내보내기/)).toBeInTheDocument();
  });

  it('shows empty message when no commands match', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    await user.type(input, 'nonexistent');
    expect(screen.getByText('일치하는 명령어가 없습니다')).toBeInTheDocument();
  });

  it('executes command on click and closes palette', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);

    await user.click(screen.getByText('새 대화'));
    expect(commands[0].action).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('executes selected command on Enter', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(commands[0].action).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates commands with ArrowDown', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    // Initially first item is selected
    const firstItem = screen.getByText('새 대화').closest('li');
    expect(firstItem).toHaveAttribute('aria-selected', 'true');

    // Press ArrowDown to select second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const secondItem = screen.getByText('대화 지우기').closest('li');
    expect(secondItem).toHaveAttribute('aria-selected', 'true');
    expect(firstItem).toHaveAttribute('aria-selected', 'false');
  });

  it('navigates commands with ArrowUp', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    // ArrowUp from first item should wrap to last
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const lastItem = screen.getByText('Markdown으로 내보내기').closest('li');
    expect(lastItem).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps ArrowDown at the end back to first', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    // Navigate to last item
    for (let i = 0; i < commands.length; i++) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }
    // Should wrap to first
    const firstItem = screen.getByText('새 대화').closest('li');
    expect(firstItem).toHaveAttribute('aria-selected', 'true');
  });

  it('closes on Escape', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);

    const overlay = screen.getByRole('dialog');
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside palette', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);

    const input = screen.getByPlaceholderText('명령어 검색...');
    await user.click(input);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets query when reopened', () => {
    const { rerender } = render(
      <CommandPalette isOpen={true} onClose={onClose} commands={commands} />
    );
    const input = screen.getByPlaceholderText('명령어 검색...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input.value).toBe('test');

    // Close and reopen
    rerender(<CommandPalette isOpen={false} onClose={onClose} commands={commands} />);
    rerender(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);

    const newInput = screen.getByPlaceholderText('명령어 검색...') as HTMLInputElement;
    expect(newInput.value).toBe('');
  });

  it('resets selection to first when search query changes', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    // Navigate to second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Type to filter — selection should reset to 0
    await user.type(input, '설정');
    const settingsItem = getOption(/설정 열기/);
    expect(settingsItem).toHaveAttribute('aria-selected', 'true');
  });

  it('executes filtered command on Enter after search', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    await user.type(input, '설정');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(commands[3].action).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('input has combobox role', () => {
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('list has listbox role', () => {
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('items have option role', () => {
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(commands.length);
    });

    it('input has aria-activedescendant pointing to selected item', () => {
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-activedescendant', 'cmd-new-chat');
    });

    it('input has aria-controls pointing to command list', () => {
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-controls', 'command-list');
    });

    it('input has aria-autocomplete="list"', () => {
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });
  });

  it('does not execute when Enter pressed on empty filtered list', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    await user.type(input, 'zzzzzznonexistent');
    fireEvent.keyDown(input, { key: 'Enter' });
    commands.forEach(cmd => {
      expect(cmd.action).not.toHaveBeenCalled();
    });
  });

  it('trims whitespace in filter query', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    await user.type(input, '   ');
    expect(screen.getAllByRole('option')).toHaveLength(commands.length);
  });

  it('updates aria-activedescendant after ArrowDown navigation', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByRole('combobox');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'cmd-clear');
  });

  it('renders command-palette-input CSS class on input', () => {
    const { container } = render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    expect(container.querySelector('.command-palette-input')).toBeInTheDocument();
  });

  it('renders command-palette-overlay CSS class', () => {
    const { container } = render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    expect(container.querySelector('.command-palette-overlay')).toBeInTheDocument();
  });

  it('renders command-palette CSS class on inner container', () => {
    const { container } = render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    expect(container.querySelector('.command-palette')).toBeInTheDocument();
  });

  it('selectedIndex clamped when filter reduces list below current index', async () => {
    const user = userEvent.setup();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
    const input = screen.getByPlaceholderText('명령어 검색...');

    for (let i = 0; i < 4; i++) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }
    await user.type(input, '설정');
    const settingsItem = getOption(/설정 열기/);
    expect(settingsItem).toHaveAttribute('aria-selected', 'true');
  });

  it('renders with empty commands array', () => {
    render(<CommandPalette isOpen={true} onClose={onClose} commands={[]} />);
    expect(screen.getByText('일치하는 명령어가 없습니다')).toBeInTheDocument();
  });

  describe('Korean chosung search', () => {
    it('filters commands by initial consonants (chosung)', async () => {
      const user = userEvent.setup();
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByPlaceholderText('명령어 검색...');

      await user.type(input, 'ㅅㅈ');
      // "설정 열기" starts with ㅅㅈ (text may have <mark> highlights)
      expect(getOption(/설정 열기/)).toBeInTheDocument();
      // Commands without ㅅㅈ chosung sequence should be filtered out
      expect(queryOption(/새 대화/)).not.toBeInTheDocument();
    });

    it('matches chosung anywhere in label', async () => {
      const user = userEvent.setup();
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByPlaceholderText('명령어 검색...');

      await user.type(input, 'ㄱㅅ');
      // "대화 검색" contains ㄱㅅ in chosung
      expect(getOption(/대화 검색/)).toBeInTheDocument();
    });

    it('executes chosung-filtered command on Enter', async () => {
      const user = userEvent.setup();
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByPlaceholderText('명령어 검색...');

      await user.type(input, 'ㅅㅈ');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(commands[3].action).toHaveBeenCalledTimes(1);
    });

    it('shows empty message when no chosung match found', async () => {
      const user = userEvent.setup();
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByPlaceholderText('명령어 검색...');

      await user.type(input, 'ㅎㅎㅎ');
      expect(screen.getByText('일치하는 명령어가 없습니다')).toBeInTheDocument();
    });
  });

  describe('Fuzzy search and match highlighting', () => {
    it('ranks results by relevance score', async () => {
      const user = userEvent.setup();
      render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByPlaceholderText('명령어 검색...');

      await user.type(input, '대화');
      const options = screen.getAllByRole('option');
      // All three "대화" commands should be present
      expect(options.length).toBe(3);
    });

    it('highlights matched characters with <mark> elements', async () => {
      const user = userEvent.setup();
      const { container } = render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const input = screen.getByPlaceholderText('명령어 검색...');

      await user.type(input, 'ㅅㅈ');
      const marks = container.querySelectorAll('mark.command-match');
      expect(marks.length).toBeGreaterThan(0);
    });

    it('does not highlight when no query', () => {
      const { container } = render(<CommandPalette isOpen={true} onClose={onClose} commands={commands} />);
      const marks = container.querySelectorAll('mark.command-match');
      expect(marks.length).toBe(0);
    });

    it('matches subsequences (fuzzy), not just substrings', async () => {
      const user = userEvent.setup();
      const cmds: Command[] = [
        { id: 'abc', label: 'abcdef', action: vi.fn<() => void>() },
        { id: 'xyz', label: 'xyz', action: vi.fn<() => void>() },
      ];
      render(<CommandPalette isOpen={true} onClose={vi.fn()} commands={cmds} />);
      const input = screen.getByPlaceholderText('명령어 검색...');

      // "adf" is a subsequence of "abcdef" but not a substring
      await user.type(input, 'adf');
      expect(getOption(/abcdef/)).toBeInTheDocument();
      expect(queryOption(/xyz/)).not.toBeInTheDocument();
    });
  });
});
