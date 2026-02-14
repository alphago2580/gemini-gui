import React from 'react';
import './StatusBar.css';
import type { SessionStatus } from './SessionIndicator';
import Sparkline from './Sparkline';
import * as S from '../constants/strings';

export interface StatusBarProps {
  sessionStatus: SessionStatus;
  model?: string;
  totalTokens?: number;
  tokenHistory?: number[];
  cursorLine?: number;
  cursorCol?: number;
  encoding?: string;
  isUserIdle?: boolean;
  children?: React.ReactNode;
}

const SESSION_DOT_CLASSES: Record<SessionStatus, string> = {
  idle: 'status-bar-dot--idle',
  connecting: 'status-bar-dot--connecting',
  connected: 'status-bar-dot--connected',
  error: 'status-bar-dot--error',
};

const SESSION_LABELS: Record<SessionStatus, string> = {
  idle: S.SESSION_IDLE,
  connecting: S.SESSION_CONNECTING,
  connected: S.SESSION_CONNECTED,
  error: S.SESSION_ERROR,
};

const StatusBar: React.FC<StatusBarProps> = ({
  sessionStatus,
  model,
  totalTokens,
  tokenHistory,
  cursorLine,
  cursorCol,
  encoding = S.STATUS_BAR_ENCODING_LABEL,
  isUserIdle = false,
  children,
}) => {
  const idleLabel = isUserIdle ? S.STATUS_BAR_USER_IDLE : S.STATUS_BAR_USER_ACTIVE;
  const idleDotClass = isUserIdle ? 'status-bar-dot--idle-user' : 'status-bar-dot--active-user';

  return (
    <div className="status-bar" role="status" aria-label={S.STATUS_BAR_ARIA}>
      <div className="status-bar-left">
        <div
          className="status-bar-item status-bar-session"
          title={SESSION_LABELS[sessionStatus]}
        >
          <span
            className={`status-bar-dot ${SESSION_DOT_CLASSES[sessionStatus]}`}
            aria-hidden="true"
          />
          <span className="status-bar-text">{SESSION_LABELS[sessionStatus]}</span>
        </div>

        <div className="status-bar-item" title={idleLabel}>
          <span
            className={`status-bar-dot ${idleDotClass}`}
            aria-hidden="true"
          />
          <span className="status-bar-text">{idleLabel}</span>
        </div>

        {model && (
          <div className="status-bar-item" title={`${S.STATUS_BAR_MODEL_LABEL}: ${model}`}>
            <span className="status-bar-text">{model}</span>
          </div>
        )}

        {children}
      </div>

      <div className="status-bar-right">
        {cursorLine != null && cursorCol != null && (
          <div className="status-bar-item">
            <span className="status-bar-text">
              {S.STATUS_BAR_LINE_COL(cursorLine, cursorCol)}
            </span>
          </div>
        )}

        {totalTokens != null && (
          <div className="status-bar-item status-bar-tokens" title={S.STATUS_BAR_TOKENS_LABEL}>
            {tokenHistory && tokenHistory.length >= 2 && (
              <Sparkline
                data={tokenHistory}
                variant="area"
                size="small"
                width={48}
                height={16}
                showEndDot
                label={S.STATUS_BAR_TOKEN_TREND_LABEL}
              />
            )}
            <span className="status-bar-text">
              {S.STATUS_BAR_TOKENS_LABEL}: {totalTokens.toLocaleString()}
            </span>
          </div>
        )}

        <div className="status-bar-item">
          <span className="status-bar-text">{encoding}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatusBar);
