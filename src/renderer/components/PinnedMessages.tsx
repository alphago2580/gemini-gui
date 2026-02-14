import React from 'react';
import './PinnedMessages.css';
import * as S from '../constants/strings';

export interface PinnedMessage {
  index: number;
  role: 'user' | 'assistant';
  content: string;
}

interface PinnedMessagesProps {
  messages: PinnedMessage[];
  onNavigate: (messageIndex: number) => void;
  onUnpin: (messageIndex: number) => void;
}

const MAX_PREVIEW_LENGTH = 80;

const PinnedMessagesInner: React.FC<PinnedMessagesProps> = ({ messages, onNavigate, onUnpin }) => {
  if (messages.length === 0) return null;

  return (
    <div className="pinned-messages" aria-label={S.PINNED_LABEL}>
      <div className="pinned-messages-header">
        <span className="pinned-messages-icon">📌</span>
        <span className="pinned-messages-count">{messages.length}{S.PINNED_COUNT_SUFFIX}</span>
      </div>
      <div className="pinned-messages-list">
        {messages.map(msg => {
          const preview = msg.content.length > MAX_PREVIEW_LENGTH
            ? msg.content.substring(0, MAX_PREVIEW_LENGTH) + '...'
            : msg.content;
          return (
            <div
              key={msg.index}
              className="pinned-message-item"
              onClick={() => onNavigate(msg.index)}
              role="button"
              tabIndex={0}
              aria-label={`${S.PINNED_NAV_PREFIX} ${preview}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(msg.index);
                }
              }}
            >
              <span className={`pinned-message-role ${msg.role}`}>
                {msg.role === 'user' ? S.ROLE_USER : S.ROLE_ASSISTANT}
              </span>
              <span className="pinned-message-preview">{preview}</span>
              <button
                className="pinned-message-unpin"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpin(msg.index);
                }}
                title={S.PINNED_UNPIN}
                aria-label={S.PINNED_UNPIN}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PinnedMessages = React.memo(PinnedMessagesInner);
export default PinnedMessages;
