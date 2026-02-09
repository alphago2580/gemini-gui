import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  conversations: Array<{ id: string; title: string; timestamp: Date }>;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onOpenSettings,
  conversations,
  currentConversationId,
  onSelectConversation
}) => {
  return (
    <nav className="sidebar" aria-label="사이드바">
      <div className="sidebar-header">
        <h2>Gemini GUI</h2>
      </div>

      <button className="new-chat-btn" onClick={onNewChat} aria-label="새 대화 시작">
        <span className="icon" aria-hidden="true">+</span>
        새 대화
      </button>

      <div className="conversations-list" role="list" aria-label="대화 기록 목록">
        <h3>대화 기록</h3>
        {conversations.length === 0 ? (
          <div className="empty-state" role="listitem">대화 기록이 없습니다</div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv.id)}
              role="listitem"
              aria-current={currentConversationId === conv.id ? 'true' : undefined}
              aria-label={`대화: ${conv.title}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectConversation(conv.id);
                }
              }}
            >
              <div className="conversation-title">{conv.title}</div>
              <div className="conversation-time">
                {conv.timestamp.toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onOpenSettings} aria-label="설정 열기">
          <span className="icon" aria-hidden="true">⚙</span>
          설정
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
