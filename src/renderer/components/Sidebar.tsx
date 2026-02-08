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
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Gemini GUI</h2>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <span className="icon">+</span>
        새 대화
      </button>

      <div className="conversations-list">
        <h3>대화 기록</h3>
        {conversations.length === 0 ? (
          <div className="empty-state">대화 기록이 없습니다</div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv.id)}
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
        <button className="settings-btn" onClick={onOpenSettings}>
          <span className="icon">⚙</span>
          설정
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
