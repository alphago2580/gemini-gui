import React from 'react';
import './SessionIndicator.css';
import * as S from '../constants/strings';

export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface SessionIndicatorProps {
  status: SessionStatus;
}

const STATUS_LABELS: Record<SessionStatus, string> = {
  idle: S.SESSION_IDLE,
  connecting: S.SESSION_CONNECTING,
  connected: S.SESSION_CONNECTED,
  error: S.SESSION_ERROR,
};

const SessionIndicator: React.FC<SessionIndicatorProps> = ({ status }) => {
  return (
    <div
      className={`session-indicator session-${status}`}
      role="status"
      aria-label={`${S.SESSION_STATUS_PREFIX} ${STATUS_LABELS[status]}`}
      title={STATUS_LABELS[status]}
    >
      <span className="session-dot" aria-hidden="true" />
      <span className="session-text">{STATUS_LABELS[status]}</span>
    </div>
  );
};

export default React.memo(SessionIndicator);
