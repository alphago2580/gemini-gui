import React from 'react';
import './TypingIndicator.css';
import * as S from '../constants/strings';

interface TypingIndicatorProps {
  isStreaming?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isStreaming = false }) => {
  return (
    <div
      className="typing-indicator"
      role="status"
      aria-label={S.ARIA_GENERATING}
    >
      <div className="typing-indicator-header">
        <span className="role">{S.ROLE_ASSISTANT}</span>
      </div>
      <div className="typing-indicator-content">
        <div className="typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="typing-text">
          {isStreaming ? S.TYPING_TEXT : S.THINKING_TEXT}
        </span>
      </div>
    </div>
  );
};

export default React.memo(TypingIndicator);
