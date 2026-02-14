import { useState, useCallback, useMemo } from 'react';
import type { ConversationFolder } from '../../preload/types';
import * as S from '../constants/strings';

interface FolderAssignments {
  [conversationId: string]: string; // folderId
}

interface UseConversationFoldersReturn {
  folders: ConversationFolder[];
  assignments: FolderAssignments;
  selectedFolderId: string | null;
  createFolder: (name: string) => ConversationFolder;
  renameFolder: (folderId: string, newName: string) => void;
  deleteFolder: (folderId: string) => void;
  assignConversation: (conversationId: string, folderId: string) => void;
  unassignConversation: (conversationId: string) => void;
  selectFolder: (folderId: string | null) => void;
  getConversationFolderId: (conversationId: string) => string | undefined;
  getFolderConversationIds: (folderId: string) => string[];
  getUncategorizedConversationIds: (allConversationIds: string[]) => string[];
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFolders(): ConversationFolder[] {
  const raw = loadFromStorage<Array<{ id: string; name: string; color: string; createdAt: string }>>(S.STORAGE_KEY_FOLDERS, []);
  return raw.map(f => ({
    ...f,
    createdAt: new Date(f.createdAt),
  }));
}

export function useConversationFolders(): UseConversationFoldersReturn {
  const [folders, setFolders] = useState<ConversationFolder[]>(() => loadFolders());
  const [assignments, setAssignments] = useState<FolderAssignments>(() =>
    loadFromStorage<FolderAssignments>(S.STORAGE_KEY_FOLDER_ASSIGNMENTS, {})
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const persistFolders = useCallback((newFolders: ConversationFolder[]) => {
    setFolders(newFolders);
    saveToStorage(S.STORAGE_KEY_FOLDERS, newFolders);
  }, []);

  const persistAssignments = useCallback((newAssignments: FolderAssignments) => {
    setAssignments(newAssignments);
    saveToStorage(S.STORAGE_KEY_FOLDER_ASSIGNMENTS, newAssignments);
  }, []);

  const createFolder = useCallback((name: string): ConversationFolder => {
    const colorIndex = folders.length % S.FOLDER_COLORS.length;
    const newFolder: ConversationFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      color: S.FOLDER_COLORS[colorIndex],
      createdAt: new Date(),
    };
    persistFolders([...folders, newFolder]);
    return newFolder;
  }, [folders, persistFolders]);

  const renameFolder = useCallback((folderId: string, newName: string) => {
    const updated = folders.map(f =>
      f.id === folderId ? { ...f, name: newName.trim() } : f
    );
    persistFolders(updated);
  }, [folders, persistFolders]);

  const deleteFolder = useCallback((folderId: string) => {
    persistFolders(folders.filter(f => f.id !== folderId));
    const newAssignments = { ...assignments };
    for (const [convId, assignedFolderId] of Object.entries(newAssignments)) {
      if (assignedFolderId === folderId) {
        delete newAssignments[convId];
      }
    }
    persistAssignments(newAssignments);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  }, [folders, assignments, selectedFolderId, persistFolders, persistAssignments]);

  const assignConversation = useCallback((conversationId: string, folderId: string) => {
    const folderExists = folders.some(f => f.id === folderId);
    if (!folderExists) return;
    persistAssignments({ ...assignments, [conversationId]: folderId });
  }, [folders, assignments, persistAssignments]);

  const unassignConversation = useCallback((conversationId: string) => {
    const newAssignments = { ...assignments };
    delete newAssignments[conversationId];
    persistAssignments(newAssignments);
  }, [assignments, persistAssignments]);

  const selectFolder = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
  }, []);

  const getConversationFolderId = useCallback((conversationId: string): string | undefined => {
    return assignments[conversationId];
  }, [assignments]);

  const getFolderConversationIds = useCallback((folderId: string): string[] => {
    return Object.entries(assignments)
      .filter(([, assignedId]) => assignedId === folderId)
      .map(([convId]) => convId);
  }, [assignments]);

  const getUncategorizedConversationIds = useCallback((allConversationIds: string[]): string[] => {
    return allConversationIds.filter(id => !assignments[id]);
  }, [assignments]);

  return useMemo(() => ({
    folders,
    assignments,
    selectedFolderId,
    createFolder,
    renameFolder,
    deleteFolder,
    assignConversation,
    unassignConversation,
    selectFolder,
    getConversationFolderId,
    getFolderConversationIds,
    getUncategorizedConversationIds,
  }), [
    folders,
    assignments,
    selectedFolderId,
    createFolder,
    renameFolder,
    deleteFolder,
    assignConversation,
    unassignConversation,
    selectFolder,
    getConversationFolderId,
    getFolderConversationIds,
    getUncategorizedConversationIds,
  ]);
}
