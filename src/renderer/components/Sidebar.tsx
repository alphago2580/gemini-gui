import React, { useState, useMemo } from 'react';
import './Sidebar.css';

interface SidebarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  conversations: Array<{ id: string; title: string; timestamp: Date; messages?: Array<{ content: string }> }>;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onOpenSettings,
  conversations,
  currentConversationId,
  onSelectConversation,
  searchInputRef,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      if (conv.title.toLowerCase().includes(query)) return true;
      if (conv.messages) {
        return conv.messages.some(msg => msg.content.toLowerCase().includes(query));
      }
      return false;
    });
  }, [conversations, searchQuery]);

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="사이드바">
      <div className="sidebar-header">
        {!isCollapsed && <h2>Gemini GUI</h2>}
        {onToggleCollapse && (
          <button
            className="collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            title={isCollapsed ? '사이드바 펼치기 (Ctrl+B)' : '사이드바 접기 (Ctrl+B)'}
          >
            <span aria-hidden="true">{isCollapsed ? '▶' : '◀'}</span>
          </button>
        )}
      </div>

      <button className="new-chat-btn" onClick={onNewChat} aria-label="새 대화 시작">
        <span className="icon" aria-hidden="true">+</span>
        {!isCollapsed && '새 대화'}
      </button>

      {!isCollapsed && (
        <>
          <div className="search-container">
            <label htmlFor="sidebar-search" className="sr-only">대화 검색</label>
            <input
              ref={searchInputRef}
              id="sidebar-search"
              className="search-input"
              type="text"
              placeholder="대화 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="대화 검색"
            />
          </div>

          <div className="conversations-list" role="list" aria-label="대화 기록 목록">
            <h3>대화 기록</h3>
            {filteredConversations.length === 0 ? (
              <div className="empty-state" role="listitem">
                {searchQuery.trim() ? '검색 결과가 없습니다' : '대화 기록이 없습니다'}
              </div>
            ) : (
              filteredConversations.map(conv => (
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
        </>
      )}

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onOpenSettings} aria-label="설정 열기">
          <span className="icon" aria-hidden="true">⚙</span>
          {!isCollapsed && '설정'}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
