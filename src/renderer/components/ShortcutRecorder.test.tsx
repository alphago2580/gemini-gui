import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import ShortcutRecorder from './ShortcutRecorder';

describe('ShortcutRecorder', () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
  });

  it('renders with placeholder when value is empty', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    expect(screen.getByText('클릭하여 단축키 입력')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} placeholder="커스텀 안내" />);
    expect(screen.getByText('커스텀 안내')).toBeInTheDocument();
  });

  it('renders current key combination', () => {
    render(<ShortcutRecorder value={['Control', 'S']} onChange={onChange} />);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders separator between keys', () => {
    const { container } = render(
      <ShortcutRecorder value={['Control', 'Shift', 'P']} onChange={onChange} />
    );
    const separators = container.querySelectorAll('.shortcut-recorder-separator');
    expect(separators).toHaveLength(2);
    expect(separators[0].textContent).toBe('+');
  });

  it('has correct ARIA attributes', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    expect(recorder).toHaveAttribute('aria-label', '단축키 입력');
    expect(recorder).toHaveAttribute('aria-disabled', 'false');
    expect(recorder).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-disabled true when disabled', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} disabled />);
    const recorder = screen.getByRole('button');
    expect(recorder).toHaveAttribute('aria-disabled', 'true');
  });

  it('has tabIndex -1 when disabled', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} disabled />);
    const recorder = screen.getByRole('button');
    expect(recorder).toHaveAttribute('tabindex', '-1');
  });

  it('has tabIndex 0 when enabled', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    expect(recorder).toHaveAttribute('tabindex', '0');
  });

  it('enters recording mode on click', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    fireEvent.click(recorder);
    expect(screen.getByText('키 조합을 누르세요...')).toBeInTheDocument();
  });

  it('enters recording mode on Enter key', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    fireEvent.keyDown(recorder, { key: 'Enter' });
    expect(screen.getByText('키 조합을 누르세요...')).toBeInTheDocument();
  });

  it('enters recording mode on Space key', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    fireEvent.keyDown(recorder, { key: ' ' });
    expect(screen.getByText('키 조합을 누르세요...')).toBeInTheDocument();
  });

  it('does not enter recording mode when disabled', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} disabled />);
    const recorder = screen.getByRole('button');
    fireEvent.click(recorder);
    expect(screen.queryByText('키 조합을 누르세요...')).not.toBeInTheDocument();
  });

  it('captures modifier + key combination and auto-confirms', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    fireEvent.click(recorder);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }));
    });

    expect(onChange).toHaveBeenCalledWith(['Control', 'k']);
  });

  it('captures Ctrl+Shift+P combination', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    fireEvent.click(recorder);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'P',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }));
    });

    expect(onChange).toHaveBeenCalledWith(['Control', 'Shift', 'P']);
  });

  it('captures Alt+key combination', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    fireEvent.click(recorder);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'F4',
        altKey: true,
        bubbles: true,
        cancelable: true,
      }));
    });

    expect(onChange).toHaveBeenCalledWith(['Alt', 'F4']);
  });

  it('shows modifier keys while being held', () => {
    const { container } = render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    fireEvent.click(recorder);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }));
    });

    expect(container.querySelector('.shortcut-recorder-key')).toBeInTheDocument();
    expect(container.querySelector('.shortcut-recorder-key')!.textContent).toBe('Ctrl');
  });

  it('cancels recording on Escape', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    const recorder = screen.getByRole('button');
    fireEvent.click(recorder);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }));
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('클릭하여 단축키 입력')).toBeInTheDocument();
  });

  it('shows clear button when value is set', () => {
    render(<ShortcutRecorder value={['Control', 'S']} onChange={onChange} />);
    expect(screen.getByLabelText('단축키 지우기')).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    expect(screen.queryByLabelText('단축키 지우기')).not.toBeInTheDocument();
  });

  it('does not show clear button when disabled', () => {
    render(<ShortcutRecorder value={['Control', 'S']} onChange={onChange} disabled />);
    expect(screen.queryByLabelText('단축키 지우기')).not.toBeInTheDocument();
  });

  it('clears value when clear button is clicked', () => {
    render(<ShortcutRecorder value={['Control', 'S']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('단축키 지우기'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('clear button click does not start recording', () => {
    render(<ShortcutRecorder value={['Control', 'S']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('단축키 지우기'));
    expect(screen.queryByText('키 조합을 누르세요...')).not.toBeInTheDocument();
  });

  it('applies recording CSS class when recording', () => {
    const { container } = render(<ShortcutRecorder value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(container.querySelector('.shortcut-recorder--recording')).toBeInTheDocument();
  });

  it('applies disabled CSS class when disabled', () => {
    const { container } = render(<ShortcutRecorder value={[]} onChange={onChange} disabled />);
    expect(container.querySelector('.shortcut-recorder--disabled')).toBeInTheDocument();
  });

  it('does not apply recording CSS class when not recording', () => {
    const { container } = render(<ShortcutRecorder value={[]} onChange={onChange} />);
    expect(container.querySelector('.shortcut-recorder--recording')).not.toBeInTheDocument();
  });

  it('displays key names correctly', () => {
    render(<ShortcutRecorder value={['Control', 'Shift', 'ArrowUp']} onChange={onChange} />);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('displays special key names', () => {
    const { rerender } = render(
      <ShortcutRecorder value={['Meta', 'Enter']} onChange={onChange} />
    );
    expect(screen.getByText('Cmd')).toBeInTheDocument();
    expect(screen.getByText('↵')).toBeInTheDocument();

    rerender(<ShortcutRecorder value={['Alt', 'Backspace']} onChange={onChange} />);
    expect(screen.getByText('Alt')).toBeInTheDocument();
    expect(screen.getByText('⌫')).toBeInTheDocument();
  });

  it('renders keys as <kbd> elements', () => {
    const { container } = render(
      <ShortcutRecorder value={['Control', 'S']} onChange={onChange} />
    );
    const kbds = container.querySelectorAll('kbd.shortcut-recorder-key');
    expect(kbds).toHaveLength(2);
  });

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<ShortcutRecorder value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    unmount();
    // Should have removed keydown and keyup listeners
    const removedEvents = removeSpy.mock.calls.map(c => c[0]);
    expect(removedEvents).toContain('keydown');
    expect(removedEvents).toContain('keyup');
    removeSpy.mockRestore();
  });

  it('stops recording on outside click', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('키 조합을 누르세요...')).toBeInTheDocument();

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(screen.getByText('클릭하여 단축키 입력')).toBeInTheDocument();
  });

  it('prevents default on key events during recording', () => {
    render(<ShortcutRecorder value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));

    let prevented = false;
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'preventDefault', {
      value: () => { prevented = true; },
    });

    act(() => {
      document.dispatchEvent(event);
    });

    expect(prevented).toBe(true);
  });

  it('renders without key content when recording starts', () => {
    const { container } = render(<ShortcutRecorder value={['Control', 'N']} onChange={onChange} />);
    // Before recording: shows current keys
    expect(container.querySelectorAll('.shortcut-recorder-key')).toHaveLength(2);

    fireEvent.click(screen.getByLabelText('단축키 입력'));
    // During recording with no pending keys: shows hint text
    expect(screen.getByText('키 조합을 누르세요...')).toBeInTheDocument();
  });

  it('clear button renders × character', () => {
    render(<ShortcutRecorder value={['Control', 'S']} onChange={onChange} />);
    const clearBtn = screen.getByLabelText('단축키 지우기');
    expect(clearBtn.textContent).toBe('×');
  });

  it('has shortcut-recorder base class', () => {
    const { container } = render(<ShortcutRecorder value={[]} onChange={onChange} />);
    expect(container.querySelector('.shortcut-recorder')).toBeInTheDocument();
  });

  it('Shift display name renders correctly', () => {
    render(<ShortcutRecorder value={['Shift']} onChange={onChange} />);
    expect(screen.getByText('⇧')).toBeInTheDocument();
  });
});
