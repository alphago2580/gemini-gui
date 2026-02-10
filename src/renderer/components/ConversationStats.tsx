import React from 'react';
import { ConversationStatistics, formatNumber } from '../utils/conversationStats';
import './ConversationStats.css';

interface ConversationStatsProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ConversationStatistics;
}

const ConversationStatsInner: React.FC<ConversationStatsProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="stats-overlay" onClick={onClose} role="dialog" aria-label="대화 통계">
      <div className="stats-modal" onClick={e => e.stopPropagation()}>
        <div className="stats-header">
          <h2>대화 통계</h2>
          <button className="stats-close-btn" onClick={onClose} aria-label="통계 닫기">×</button>
        </div>

        <div className="stats-content">
          <div className="stats-grid">
            <div className="stats-card">
              <span className="stats-card-label">전체 대화</span>
              <span className="stats-card-value">{stats.totalConversations}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">전체 메시지</span>
              <span className="stats-card-value">{formatNumber(stats.totalMessages)}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">사용자 메시지</span>
              <span className="stats-card-value">{formatNumber(stats.userMessages)}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">AI 응답</span>
              <span className="stats-card-value">{formatNumber(stats.assistantMessages)}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">대화당 평균 메시지</span>
              <span className="stats-card-value">{stats.averageMessagesPerConversation}</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-label">평균 메시지 길이</span>
              <span className="stats-card-value">{formatNumber(stats.averageMessageLength)}자</span>
            </div>
          </div>

          <div className="stats-details">
            <div className="stats-detail-row">
              <span className="stats-detail-label">총 글자 수</span>
              <span className="stats-detail-value">{formatNumber(stats.totalCharacters)}</span>
            </div>
            <div className="stats-detail-row">
              <span className="stats-detail-label">빈 대화</span>
              <span className="stats-detail-value">{stats.emptyConversations}</span>
            </div>
            {stats.longestConversation && (
              <div className="stats-detail-row">
                <span className="stats-detail-label">가장 긴 대화</span>
                <span className="stats-detail-value" title={stats.longestConversation.title}>
                  {stats.longestConversation.title.length > 25
                    ? stats.longestConversation.title.substring(0, 25) + '...'
                    : stats.longestConversation.title}
                  {' '}({stats.longestConversation.messageCount}개)
                </span>
              </div>
            )}
            {stats.shortestConversation && (
              <div className="stats-detail-row">
                <span className="stats-detail-label">가장 짧은 대화</span>
                <span className="stats-detail-value" title={stats.shortestConversation.title}>
                  {stats.shortestConversation.title.length > 25
                    ? stats.shortestConversation.title.substring(0, 25) + '...'
                    : stats.shortestConversation.title}
                  {' '}({stats.shortestConversation.messageCount}개)
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
