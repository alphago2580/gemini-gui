import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmojiReactionPicker, { QUICK_EMOJIS } from './EmojiReactionPicker';
import React from 'react';

describe('EmojiReactionPicker', () => {
  const defaultProps = {
    isOpen: true,
    onSelect: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<EmojiReactionPicker {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all quick emojis when open', () => {
    render(<EmojiReactionPicker {...defaultProps} />);
    for (const emoji of QUICK_EMOJIS) {
      expect(screen.getByLabelText(`반응 ${emoji}`)).toBeInTheDocument();
    }
  });

  it('calls onSelect when an emoji is clicked', () => {
    render(<EmojiReactionPicker {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('반응 👍'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('👍');
  });

  it('calls onClose on Escape key', () => {
    render(<EmojiReactionPicker {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose on click outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <EmojiReactionPicker {...defaultProps} />
      </div>
    );
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('has listbox role with aria-label', () => {
    render(<EmojiReactionPicker {...defaultProps} />);
    expect(screen.getByRole('listbox', { name: '이모지 선택' })).toBeInTheDocument();
  });

  it('renders correct number of emoji options', () => {
    render(<EmojiReactionPicker {...defaultProps} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(QUICK_EMOJIS.length);
  });

  it('calls onSelect with different emojis', () => {
    render(<EmojiReactionPicker {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('반응 ❤️'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('❤️');

    fireEvent.click(screen.getByLabelText('반응 🤔'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('🤔');
  });

  it('does not call onClose when clicking inside the picker', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <EmojiReactionPicker {...defaultProps} />
      </div>
    );
    fireEvent.mouseDown(screen.getByRole('listbox'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose on non-Escape keys', () => {
    render(<EmojiReactionPicker {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'a' });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('does not register listeners when closed', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    render(<EmojiReactionPicker {...defaultProps} isOpen={false} />);
    const mousedownCalls = addSpy.mock.calls.filter(c => c[0] === 'mousedown');
    const keydownCalls = addSpy.mock.calls.filter(c => c[0] === 'keydown');
    expect(mousedownCalls).toHaveLength(0);
    expect(keydownCalls).toHaveLength(0);
    addSpy.mockRestore();
  });

  it('cleans up listeners when closed after being open', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { rerender } = render(<EmojiReactionPicker {...defaultProps} isOpen={true} />);
    rerender(<EmojiReactionPicker {...defaultProps} isOpen={false} />);
    const mousedownCleanup = removeSpy.mock.calls.filter(c => c[0] === 'mousedown');
    const keydownCleanup = removeSpy.mock.calls.filter(c => c[0] === 'keydown');
    expect(mousedownCleanup.length).toBeGreaterThanOrEqual(1);
    expect(keydownCleanup.length).toBeGreaterThanOrEqual(1);
    removeSpy.mockRestore();
  });

  it('each emoji button has emoji-reaction-option class', () => {
    const { container } = render(<EmojiReactionPicker {...defaultProps} />);
    const buttons = container.querySelectorAll('.emoji-reaction-option');
    expect(buttons).toHaveLength(QUICK_EMOJIS.length);
  });

  it('has emoji-reaction-picker class on container', () => {
    const { container } = render(<EmojiReactionPicker {...defaultProps} />);
    expect(container.querySelector('.emoji-reaction-picker')).toBeTruthy();
  });

  it('each emoji button has role="option"', () => {
    render(<EmojiReactionPicker {...defaultProps} />);
    const options = screen.getAllByRole('option');
    options.forEach(option => {
      expect(option.tagName).toBe('BUTTON');
    });
  });

  it('QUICK_EMOJIS exports exactly 8 emojis', () => {
    expect(QUICK_EMOJIS).toHaveLength(8);
    expect(QUICK_EMOJIS).toContain('👍');
    expect(QUICK_EMOJIS).toContain('💡');
  });
});
