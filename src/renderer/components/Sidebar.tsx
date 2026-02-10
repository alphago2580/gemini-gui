import React, { useState, useMemo } from 'react';
import './Sidebar.css';
import * as S from '../constants/strings';
import type { Conversation } from '../../preload/types';

interface SidebarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
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
  onDeleteConversation,
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
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label={S.SIDEBAR_LABEL}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>{S.APP_TITLE}</h2>}
        {onToggleCollapse && (
          <button
            className="collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? S.SIDEBAR_EXPAND : S.SIDEBAR_COLLAPSE}
            title={isCollapsed ? S.SIDEBAR_EXPAND_TITLE : S.SIDEBAR_COLLAPSE_TITLE}
          >
            <span aria-hidden="true">{isCollapsed ? '▶' : '◀'}</span>
          </button>
        )}
      </div>

      <button className="new-chat-btn" onClick={onNewChat} aria-label={S.ARIA_NEW_CHAT}>
        <span className="icon" aria-hidden="true">+</span>
        {!isCollapsed && S.NEW_CHAT}
      </button>

      {!isCollapsed && (
        <>
          <div className="search-container">
            <label htmlFor="sidebar-search" className="sr-only">{S.SEARCH_LABEL}</label>
            <input
              ref={searchInputRef}
              id="sidebar-search"
              className="search-input"
              type="text"
              placeholder={S.SEARCH_PLACEHOLDER}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={S.SEARCH_LABEL}
            />
          </div>

          <div className="conversations-list" role="list" aria-label={S.CONVERSATION_LIST_LABEL}>
            <h3>{S.CONVERSATION_HISTORY}</h3>
            {filteredConversations.length === 0 ? (
              <div className="empty-state" role="listitem">
                {searchQuery.trim() ? S.NO_SEARCH_RESULTS : S.NO_CONVERSATIONS}
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
                  onClick={() => onSelectConversation(conv.id)}
                  role="listitem"
                  aria-current={currentConversationId === conv.id ? 'true' : undefined}
                  aria-label={`${S.CONVERSATION_PREFIX} ${conv.title}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectConversation(conv.id);
                    }
                  }}
                >
                  <div className="conversation-title">{conv.title}</div>
                  <div className="conversation-meta">
                    <span className="conversation-time">
                      {conv.timestamp.toLocaleDateString()}
                    </span>
                    {conv.messages && conv.messages.length > 0 && (
                      <span
                        className="message-count-badge"
                        aria-label={`${conv.messages.length}${S.MESSAGE_COUNT_SUFFIX}`}
                        title={`${conv.messages.length}${S.MESSAGE_COUNT_SUFFIX}`}
                      >
                        {conv.messages.length}
                      </span>
                    )}
                  </div>
                  {onDeleteConversation && (
                    <button
                      className="delete-conversation-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      aria-label={`${S.DELETE_CONVERSATION_PREFIX} ${conv.title}`}
                      title={S.DELETE_CONVERSATION_TITLE}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onOpenSettings} aria-label={S.ARIA_OPEN_SETTINGS}>
          <span className="icon" aria-hidden="true">⚙</span>
          {!isCollapsed && S.SETTINGS_BUTTON}
        </button>
      </div>
    </nav>
  );
};

export default React.memo(Sidebar);
