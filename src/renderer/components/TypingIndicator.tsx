import React from 'react';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  isStreaming?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isStreaming = false }) => {
  return (
    <div
      className="typing-indicator"
      role="status"
      aria-label="응답 생성 중"
    >
      <div className="typing-indicator-header">
        <span className="role">Gemini</span>
      </div>
      <div className="typing-indicator-content">
        <div className="typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="typing-text">
          {isStreaming ? '입력 중...' : '생각하는 중...'}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
