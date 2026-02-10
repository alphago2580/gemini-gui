import React, { useRef, useEffect } from 'react';
import './EmojiReactionPicker.css';

const QUICK_EMOJIS = ['👍', '👎', '❤️', '😂', '🤔', '👀', '🎉', '💡'];

export interface EmojiReactionPickerProps {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiReactionPickerInner: React.FC<EmojiReactionPickerProps> = ({ isOpen, onSelect, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="emoji-reaction-picker" ref={ref} role="listbox" aria-label="이모지 선택">
      {QUICK_EMOJIS.map(emoji => (
        <button
          key={emoji}
          className="emoji-reaction-option"
          role="option"
          onClick={() => onSelect(emoji)}
          aria-label={`반응 ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

const EmojiReactionPicker = React.memo(EmojiReactionPickerInner);
export default EmojiReactionPicker;
export { QUICK_EMOJIS };
