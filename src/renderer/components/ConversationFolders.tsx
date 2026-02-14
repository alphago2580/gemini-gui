import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ConversationFolders.css';
import * as S from '../constants/strings';
import type { ConversationFolder } from '../../preload/types';

export interface ConversationFoldersProps {
  folders: ConversationFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  folderConversationCounts: Record<string, number>;
  uncategorizedCount: number;
  totalCount: number;
}

const ConversationFolders: React.FC<ConversationFoldersProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  folderConversationCounts,
  uncategorizedCount,
  totalCount,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const createInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleCreateSubmit = useCallback(() => {
    const trimmed = newFolderName.trim();
    if (trimmed) {
      onCreateFolder(trimmed);
    }
    setNewFolderName('');
    setIsCreating(false);
  }, [newFolderName, onCreateFolder]);

  const handleCreateKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateSubmit();
    } else if (e.key === 'Escape') {
      setNewFolderName('');
      setIsCreating(false);
    }
  }, [handleCreateSubmit]);

  const handleRenameSubmit = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      onRenameFolder(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  }, [renamingId, renameValue, onRenameFolder]);

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
      setRenameValue('');
    }
  }, [handleRenameSubmit]);

  const startRename = useCallback((folder: ConversationFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(folder.id);
    setRenameValue(folder.name);
  }, []);

  const handleDelete = useCallback((folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteFolder(folderId);
  }, [onDeleteFolder]);

  return (
    <div className="conversation-folders" role="listbox" aria-label={S.FOLDER_SECTION_LABEL}>
      <div className="folder-header">
        <h4 className="folder-section-title">{S.FOLDER_SECTION_LABEL}</h4>
        <button
          className="folder-create-btn"
          onClick={() => setIsCreating(true)}
          aria-label={S.FOLDER_CREATE_ARIA}
          title={S.FOLDER_CREATE}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div
        className={`folder-item ${selectedFolderId === null ? 'folder-item--active' : ''}`}
        onClick={() => onSelectFolder(null)}
        role="option"
        aria-selected={selectedFolderId === null}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectFolder(null); } }}
      >
        <span className="folder-icon" aria-hidden="true">📁</span>
        <span className="folder-name">{S.FOLDER_ALL_CONVERSATIONS}</span>
        <span className="folder-count">{totalCount}</span>
      </div>

      {folders.map((folder) => (
        <div
          key={folder.id}
          className={`folder-item ${selectedFolderId === folder.id ? 'folder-item--active' : ''}`}
          onClick={() => onSelectFolder(folder.id)}
          role="option"
          aria-selected={selectedFolderId === folder.id}
          aria-label={`${S.FOLDER_TOGGLE_ARIA}: ${folder.name}`}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectFolder(folder.id); } }}
        >
          <span
            className="folder-color-dot"
            style={{ backgroundColor: folder.color }}
            aria-hidden="true"
          />
          {renamingId === folder.id ? (
            <input
              ref={renameInputRef}
              className="folder-rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              aria-label={S.FOLDER_RENAME_ARIA}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span className="folder-name">{folder.name}</span>
              <span className="folder-count">{folderConversationCounts[folder.id] || 0}</span>
              <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="folder-action-btn"
                  onClick={(e) => startRename(folder, e)}
                  aria-label={S.FOLDER_RENAME_ARIA}
                  title={S.FOLDER_RENAME}
                >
                  <span aria-hidden="true">✏</span>
                </button>
                <button
                  className="folder-action-btn folder-action-btn--danger"
                  onClick={(e) => handleDelete(folder.id, e)}
                  aria-label={S.FOLDER_DELETE_ARIA}
                  title={S.FOLDER_DELETE}
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {folders.length > 0 && (
        <div
          className={`folder-item folder-item--uncategorized ${selectedFolderId === '__uncategorized__' ? 'folder-item--active' : ''}`}
          onClick={() => onSelectFolder('__uncategorized__')}
          role="option"
          aria-selected={selectedFolderId === '__uncategorized__'}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectFolder('__uncategorized__'); } }}
        >
          <span className="folder-icon" aria-hidden="true">📄</span>
          <span className="folder-name">{S.FOLDER_UNCATEGORIZED}</span>
          <span className="folder-count">{uncategorizedCount}</span>
        </div>
      )}

      {isCreating && (
        <div className="folder-create-form">
          <input
            ref={createInputRef}
            className="folder-create-input"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={handleCreateSubmit}
            onKeyDown={handleCreateKeyDown}
            placeholder={S.FOLDER_CREATE_PLACEHOLDER}
            aria-label={S.FOLDER_CREATE_ARIA}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(ConversationFolders);
