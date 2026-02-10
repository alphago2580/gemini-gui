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
});
