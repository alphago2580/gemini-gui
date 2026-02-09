import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import './MessageBubble.css';
import type { Message } from '../../preload/types';

interface MessageBubbleProps {
  message: Message;
  index: number;
  isStreaming: boolean;
  isLastAssistant: boolean;
  onDelete: (index: number) => void;
  onEdit: (index: number, content: string) => void;
  onFork?: (index: number) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  isStreaming,
  isLastAssistant,
  onDelete,
  onEdit,
  onFork,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

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

  return (
    <div
      className={`message ${message.role}${isEditing ? ' editing' : ''}`}
      role="article"
      aria-label={`${message.role === 'user' ? '사용자' : 'Gemini'} 메시지`}
    >
      <div className="message-header">
        <span className="role">{message.role === 'user' ? '사용자' : 'Gemini'}</span>
        <span className="timestamp">{message.timestamp.toLocaleTimeString()}</span>
        {message.role === 'user' && !isEditing && (
          <button
            className="edit-message-btn"
            onClick={handleStartEdit}
            aria-label="메시지 수정"
            title="메시지 수정"
          >
            &#9998;
          </button>
        )}
        {onFork && (
          <button
            className="fork-message-btn"
            onClick={() => onFork(index)}
            aria-label="여기서 분기"
            title="여기서 대화 분기"
          >
            &#9095;
          </button>
        )}
        <button
          className="delete-message-btn"
          onClick={() => onDelete(index)}
          aria-label="메시지 삭제"
          title="메시지 삭제"
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
              aria-label="메시지 수정 입력"
              rows={3}
            />
            <div className="edit-message-actions">
              <button
                className="edit-save-btn"
                onClick={handleSaveEdit}
                aria-label="수정 저장"
              >
                저장
              </button>
              <button
                className="edit-cancel-btn"
                onClick={handleCancelEdit}
                aria-label="수정 취소"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
