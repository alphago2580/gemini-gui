import React from 'react';
import { ConversationStatistics, formatNumber } from '../utils/conversationStats';
import './ConversationStats.css';
import * as S from '../constants/strings';

interface ConversationStatsProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ConversationStatistics;
}

const ConversationStatsInner: React.FC<ConversationStatsProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="stats-overlay" onClick={onClose} role="dialog" aria-label={S.STATS_LABEL}>
      <div className="stats-modal" onClick={e => e.stopPropagation()}>
        <div className="stats-header">
          <h2>{S.STATS_LABEL}</h2>
          <button className="stats-close-btn" onClick={onClose} aria-label={S.STATS_CLOSE_LABEL}>×</button>
        </div>

        <div className="stats-content">
          <div className="stats-grid">
            <div className="stats-card">
              <span className="stats-card-label">{S.STATS_TOTAL_CONV}</span>
              <span className="stats-card-value">{stats.totalConversations}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">{S.STATS_TOTAL_MSG}</span>
              <span className="stats-card-value">{formatNumber(stats.totalMessages)}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">{S.STATS_USER_MSG}</span>
              <span className="stats-card-value">{formatNumber(stats.userMessages)}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">{S.STATS_AI_MSG}</span>
              <span className="stats-card-value">{formatNumber(stats.assistantMessages)}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">{S.STATS_AVG_MSG}</span>
              <span className="stats-card-value">{stats.averageMessagesPerConversation}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">{S.STATS_AVG_LEN}</span>
              <span className="stats-card-value">{formatNumber(stats.averageMessageLength)}{S.STATS_CHAR_SUFFIX}</span>
            </div>
          </div>

          <div className="stats-details">
            <div className="stats-detail-row">
              <span className="stats-detail-label">{S.STATS_TOTAL_CHARS}</span>
              <span className="stats-detail-value">{formatNumber(stats.totalCharacters)}</span>
            </div>
            <div className="stats-detail-row">
              <span className="stats-detail-label">{S.STATS_EMPTY_CONV}</span>
              <span className="stats-detail-value">{stats.emptyConversations}</span>
            </div>
            {stats.longestConversation && (
              <div className="stats-detail-row">
                <span className="stats-detail-label">{S.STATS_LONGEST}</span>
                <span className="stats-detail-value" title={stats.longestConversation.title}>
                  {stats.longestConversation.title.length > 25
                    ? stats.longestConversation.title.substring(0, 25) + '...'
                    : stats.longestConversation.title}
                  {' '}({stats.longestConversation.messageCount}{S.STATS_COUNT_SUFFIX})
                </span>
              </div>
            )}
            {stats.shortestConversation && (
              <div className="stats-detail-row">
                <span className="stats-detail-label">{S.STATS_SHORTEST}</span>
                <span className="stats-detail-value" title={stats.shortestConversation.title}>
                  {stats.shortestConversation.title.length > 25
                    ? stats.shortestConversation.title.substring(0, 25) + '...'
                    : stats.shortestConversation.title}
                  {' '}({stats.shortestConversation.messageCount}{S.STATS_COUNT_SUFFIX})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversationStats = React.memo(ConversationStatsInner);
export default ConversationStats;
