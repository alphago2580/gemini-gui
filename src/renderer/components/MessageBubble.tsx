import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import EmojiReactionPicker from './EmojiReactionPicker';
import './MessageBubble.css';
import type { Message } from '../../preload/types';
import type { ReactionMap } from '../hooks/useReactions';
import * as S from '../constants/strings';

interface MessageBubbleProps {
  message: Message;
  index: number;
  isStreaming: boolean;
  isLastAssistant: boolean;
  onDelete: (index: number) => void;
  onEdit: (index: number, content: string) => void;
  onFork?: (index: number) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (index: number) => void;
  reactions?: ReactionMap;
  onToggleReaction?: (index: number, emoji: string) => void;
  showTimestamps?: boolean;
}

const MessageBubbleInner: React.FC<MessageBubbleProps> = ({
  message,
  index,
  isStreaming,
  isLastAssistant,
  onDelete,
  onEdit,
  onFork,
  isBookmarked = false,
  onToggleBookmark,
  reactions = {},
  onToggleReaction,
  showTimestamps = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(index, editContent);
    }
    setIsEditing(false);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const showStreamingCursor = isStreaming && message.role === 'assistant' && isLastAssistant;
  const roleLabel = message.role === 'user' ? S.ROLE_USER : S.ROLE_ASSISTANT;

  return (
    <div
      className={`message ${message.role}${isEditing ? ' editing' : ''}`}
      role="article"
      aria-label={message.role === 'user' ? S.USER_MESSAGE : S.ASSISTANT_MESSAGE}
    >
      <div className="message-header">
        <span className="role">{roleLabel}</span>
        {showTimestamps && (
          <span className="timestamp">{message.timestamp.toLocaleTimeString()}</span>
        )}
        {message.role === 'user' && !isEditing && (
          <button
            className="edit-message-btn"
            onClick={handleStartEdit}
            aria-label={S.ARIA_EDIT_MESSAGE}
            title={S.TITLE_EDIT_MESSAGE}
          >
            &#9998;
          </button>
        )}
        {onToggleBookmark && (
          <button
            className={`bookmark-message-btn${isBookmarked ? ' bookmarked' : ''}`}
            onClick={() => onToggleBookmark(index)}
            aria-label={isBookmarked ? S.ARIA_UNBOOKMARK : S.ARIA_BOOKMARK}
            title={isBookmarked ? S.TITLE_UNBOOKMARK : S.TITLE_BOOKMARK}
          >
            {isBookmarked ? '\u2605' : '\u2606'}
          </button>
        )}
        {onToggleReaction && (
          <div className="reaction-btn-wrapper">
            <button
              className="reaction-add-btn"
              onClick={() => setIsReactionPickerOpen(prev => !prev)}
              aria-label={S.ARIA_ADD_REACTION}
              title={S.TITLE_ADD_REACTION}
            >
              &#9786;
            </button>
            <EmojiReactionPicker
              isOpen={isReactionPickerOpen}
              onSelect={(emoji) => {
                onToggleReaction(index, emoji);
                setIsReactionPickerOpen(false);
              }}
              onClose={() => setIsReactionPickerOpen(false)}
            />
          </div>
        )}
        {onFork && (
          <button
            className="fork-message-btn"
            onClick={() => onFork(index)}
            aria-label={S.ARIA_FORK}
            title={S.TITLE_FORK}
          >
            &#9095;
          </button>
        )}
        <button
          className="delete-message-btn"
          onClick={() => onDelete(index)}
          aria-label={S.ARIA_DELETE_MESSAGE}
          title={S.TITLE_DELETE_MESSAGE}
        >
          &times;
        </button>
      </div>
      <div className={`message-content${showStreamingCursor ? ' streaming-cursor' : ''}`}>
        {isEditing ? (
          <div className="edit-message-form">
            <textarea
              className="edit-message-input"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              aria-label={S.ARIA_EDIT_INPUT}
              rows={3}
            />
            <div className="edit-message-actions">
              <button
                className="edit-save-btn"
                onClick={handleSaveEdit}
                aria-label={S.ARIA_EDIT_SAVE}
              >
                {S.EDIT_SAVE}
              </button>
              <button
                className="edit-cancel-btn"
                onClick={handleCancelEdit}
                aria-label={S.ARIA_EDIT_CANCEL}
              >
                {S.EDIT_CANCEL}
              </button>
            </div>
          </div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
      {onToggleReaction && Object.keys(reactions).length > 0 && (
        <div className="message-reactions" role="group" aria-label="리액션">
          {Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              className="reaction-chip"
              onClick={() => onToggleReaction(index, emoji)}
              aria-label={`${emoji} ${count}`}
            >
              {emoji} {count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MessageBubble = React.memo(MessageBubbleInner);

export default MessageBubble;
