import React, { useState, useMemo, useCallback, useRef } from 'react';
import './Sidebar.css';
import * as S from '../constants/strings';
import type { Conversation, ConversationFolder } from '../../preload/types';
import { useDebounce } from '../hooks/useDebounce';
import Badge from './Badge';
import DropdownMenu from './DropdownMenu';
import type { DropdownMenuEntry } from './DropdownMenu';
import ConversationFolders from './ConversationFolders';

export interface SidebarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onReorderConversations?: (conversations: Conversation[]) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  folders?: ConversationFolder[];
  selectedFolderId?: string | null;
  folderAssignments?: Record<string, string>;
  onSelectFolder?: (folderId: string | null) => void;
  onCreateFolder?: (name: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onAssignConversation?: (conversationId: string, folderId: string) => void;
  onUnassignConversation?: (conversationId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onOpenSettings,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onReorderConversations,
  searchInputRef,
  isCollapsed = false,
  onToggleCollapse,
  folders = [],
  selectedFolderId = null,
  folderAssignments = {},
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onAssignConversation,
  onUnassignConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const getConversationMenuItems = useCallback((convId: string): DropdownMenuEntry[] => {
    const items: DropdownMenuEntry[] = [
      { id: 'select', label: S.CONV_MENU_OPEN, icon: '💬', onClick: () => { onSelectConversation(convId); setOpenMenuId(null); } },
      { type: 'separator' as const },
    ];
    if (onAssignConversation && folders.length > 0) {
      const currentFolderId = folderAssignments[convId];
      for (const folder of folders) {
        if (folder.id !== currentFolderId) {
          items.push({
            id: `move-${folder.id}`,
            label: `${S.FOLDER_MOVE_TO}: ${folder.name}`,
            icon: '📂',
            onClick: () => { onAssignConversation(convId, folder.id); setOpenMenuId(null); },
          });
        }
      }
      if (currentFolderId && onUnassignConversation) {
        items.push({
          id: 'unassign-folder',
          label: S.FOLDER_REMOVE_FROM,
          icon: '📄',
          onClick: () => { onUnassignConversation(convId); setOpenMenuId(null); },
        });
      }
      items.push({ type: 'separator' as const });
    }
    if (onDeleteConversation) {
      items.push({ id: 'delete', label: S.CONV_MENU_DELETE, icon: '🗑', danger: true, onClick: () => { onDeleteConversation(convId); setOpenMenuId(null); } });
    }
    return items;
  }, [onSelectConversation, onDeleteConversation, folders, folderAssignments, onAssignConversation, onUnassignConversation]);

  const canDrag = !!onReorderConversations && !debouncedSearchQuery.trim();

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (!onReorderConversations) return;
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    requestAnimationFrame(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.classList.add('conversation-item--dragging');
      }
    });
  }, [onReorderConversations]);

  const handleDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.classList.remove('conversation-item--dragging');
    }
    setDragIndex(null);
    setOverIndex(null);
    dragNodeRef.current = null;
  }, []);

  const handleDrop = useCallback((dropIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex || !onReorderConversations) {
      handleDragEnd();
      return;
    }
    const newConversations = [...conversations];
    const [moved] = newConversations.splice(dragIndex, 1);
    newConversations.splice(dropIndex, 0, moved);
    onReorderConversations(newConversations);
    handleDragEnd();
  }, [dragIndex, conversations, onReorderConversations, handleDragEnd]);

  const folderFilteredConversations = useMemo(() => {
    if (selectedFolderId === null) return conversations;
    if (selectedFolderId === '__uncategorized__') {
      return conversations.filter(conv => !folderAssignments[conv.id]);
    }
    return conversations.filter(conv => folderAssignments[conv.id] === selectedFolderId);
  }, [conversations, selectedFolderId, folderAssignments]);

  const filteredConversations = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return folderFilteredConversations;
    const query = debouncedSearchQuery.toLowerCase();
    return folderFilteredConversations.filter(conv => {
      if (conv.title.toLowerCase().includes(query)) return true;
      if (conv.messages) {
        return conv.messages.some(msg => msg.content.toLowerCase().includes(query));
      }
      return false;
    });
  }, [folderFilteredConversations, debouncedSearchQuery]);

  const folderConversationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const folder of folders) {
      counts[folder.id] = conversations.filter(c => folderAssignments[c.id] === folder.id).length;
    }
    return counts;
  }, [folders, conversations, folderAssignments]);

  const uncategorizedCount = useMemo(() => {
    return conversations.filter(c => !folderAssignments[c.id]).length;
  }, [conversations, folderAssignments]);

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

          {onSelectFolder && onCreateFolder && onRenameFolder && onDeleteFolder && (
            <ConversationFolders
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              folderConversationCounts={folderConversationCounts}
              uncategorizedCount={uncategorizedCount}
              totalCount={conversations.length}
            />
          )}

          <div className="conversations-list" role="list" aria-label={S.CONVERSATION_LIST_LABEL}>
            <h3>{S.CONVERSATION_HISTORY}</h3>
            {filteredConversations.length === 0 ? (
              <div className="empty-state" role="listitem">
                {debouncedSearchQuery.trim() ? S.NO_SEARCH_RESULTS : S.NO_CONVERSATIONS}
              </div>
            ) : (
              filteredConversations.map((conv, index) => {
                const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;
                const classNames = [
                  'conversation-item',
                  currentConversationId === conv.id ? 'active' : '',
                  isOver ? 'conversation-item--over' : '',
                ].filter(Boolean).join(' ');

                return (
                <div
                  key={conv.id}
                  className={classNames}
                  onClick={() => onSelectConversation(conv.id)}
                  role="listitem"
                  aria-current={currentConversationId === conv.id ? 'true' : undefined}
                  aria-label={`${S.CONVERSATION_PREFIX} ${conv.title}`}
                  tabIndex={0}
                  draggable={canDrag}
                  onDragStart={(e) => handleDragStart(index, e)}
                  onDragOver={(e) => handleDragOver(index, e)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(index, e)}
                  title={canDrag ? S.CONV_DRAG_LABEL : undefined}
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
                      <Badge
                        count={conv.messages.length}
                        variant="primary"
                        maxCount={999}
                      />
                    )}
                  </div>
                  <div className="conversation-actions" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu
                      isOpen={openMenuId === conv.id}
                      onClose={() => setOpenMenuId(null)}
                      onToggle={() => setOpenMenuId(prev => prev === conv.id ? null : conv.id)}
                      items={getConversationMenuItems(conv.id)}
                      trigger={<span aria-hidden="true">⋮</span>}
                      position="bottom-right"
                      label={S.CONV_MENU_LABEL}
                    />
                  </div>
                </div>
                );
              })
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
