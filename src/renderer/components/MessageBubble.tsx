import React, { useState, useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import EmojiReactionPicker from './EmojiReactionPicker';
import UserAvatar from './UserAvatar';
import './MessageBubble.css';
import type { Message } from '../../preload/types';
import type { ReactionMap } from '../hooks/useReactions';
import * as S from '../constants/strings';

export interface MessageBubbleProps {
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
  /** Optional search query to highlight matches in message content */
  searchQuery?: string;
  /** Index of the active match within this message (0-based) */
  searchActiveMatchIndex?: number;
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
  searchQuery,
  searchActiveMatchIndex,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(message.content);
  }, [message.content]);

  const handleSaveEdit = useCallback(() => {
    if (editContent.trim()) {
      onEdit(index, editContent);
    }
    setIsEditing(false);
    setEditContent('');
  }, [editContent, onEdit, index]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent('');
  }, []);

  const handleToggleBookmark = useCallback(() => {
    onToggleBookmark?.(index);
  }, [onToggleBookmark, index]);

  const handleToggleReactionPicker = useCallback(() => {
    setIsReactionPickerOpen(prev => !prev);
  }, []);

  const handleReactionSelect = useCallback((emoji: string) => {
    onToggleReaction?.(index, emoji);
    setIsReactionPickerOpen(false);
  }, [onToggleReaction, index]);

  const handleReactionPickerClose = useCallback(() => {
    setIsReactionPickerOpen(false);
  }, []);

  const handleFork = useCallback(() => {
    onFork?.(index);
  }, [onFork, index]);

  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [onDelete, index]);

  const handleEditContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
  }, []);

  const handleReactionChipClick = useCallback((emoji: string) => {
    onToggleReaction?.(index, emoji);
  }, [onToggleReaction, index]);

  const showStreamingCursor = isStreaming && message.role === 'assistant' && isLastAssistant;
  const roleLabel = message.role === 'user' ? S.ROLE_USER : S.ROLE_ASSISTANT;

  return (
    <div
      className={`message ${message.role}${isEditing ? ' editing' : ''}`}
      role="article"
      aria-label={message.role === 'user' ? S.USER_MESSAGE : S.ASSISTANT_MESSAGE}
    >
      <div className="message-header">
        <UserAvatar role={message.role === 'user' ? 'user' : 'assistant'} size="small" />
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
            onClick={handleToggleBookmark}
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
              onClick={handleToggleReactionPicker}
              aria-label={S.ARIA_ADD_REACTION}
              title={S.TITLE_ADD_REACTION}
            >
              &#9786;
            </button>
            <EmojiReactionPicker
              isOpen={isReactionPickerOpen}
              onSelect={handleReactionSelect}
              onClose={handleReactionPickerClose}
            />
          </div>
        )}
        {onFork && (
          <button
            className="fork-message-btn"
            onClick={handleFork}
            aria-label={S.ARIA_FORK}
            title={S.TITLE_FORK}
          >
            &#9095;
          </button>
        )}
        <button
          className="delete-message-btn"
          onClick={handleDelete}
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
              onChange={handleEditContentChange}
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
          <MarkdownRenderer content={message.content} searchQuery={searchQuery} searchActiveMatchIndex={searchActiveMatchIndex} />
        )}
      </div>
      {onToggleReaction && Object.keys(reactions).length > 0 && (
        <div className="message-reactions" role="group" aria-label="리액션">
          {Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              className="reaction-chip"
              onClick={() => handleReactionChipClick(emoji)}
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
