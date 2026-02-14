import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConversationFolders } from './useConversationFolders';

describe('useConversationFolders', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty folders and no selection', () => {
    const { result } = renderHook(() => useConversationFolders());
    expect(result.current.folders).toEqual([]);
    expect(result.current.assignments).toEqual({});
    expect(result.current.selectedFolderId).toBeNull();
  });

  it('creates a folder with generated id, name, color and createdAt', () => {
    const { result } = renderHook(() => useConversationFolders());

    let folder: ReturnType<typeof result.current.createFolder>;
    act(() => {
      folder = result.current.createFolder('프로젝트');
    });

    expect(result.current.folders).toHaveLength(1);
    expect(result.current.folders[0].name).toBe('프로젝트');
    expect(result.current.folders[0].id).toMatch(/^folder-/);
    expect(result.current.folders[0].color).toBeTruthy();
    expect(result.current.folders[0].createdAt).toBeInstanceOf(Date);
    expect(folder!.name).toBe('프로젝트');
  });

  it('trims whitespace from folder name on create', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('  주제  ');
    });

    expect(result.current.folders[0].name).toBe('주제');
  });

  it('creates multiple folders with cycling colors', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('첫 번째');
    });
    act(() => {
      result.current.createFolder('두 번째');
    });

    expect(result.current.folders).toHaveLength(2);
    expect(result.current.folders[0].color).not.toBe(result.current.folders[1].color);
  });

  it('renames a folder', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('원래 이름');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.renameFolder(folderId, '새 이름');
    });

    expect(result.current.folders[0].name).toBe('새 이름');
  });

  it('trims whitespace from folder name on rename', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('원래');
    });

    act(() => {
      result.current.renameFolder(result.current.folders[0].id, '  공백  ');
    });

    expect(result.current.folders[0].name).toBe('공백');
  });

  it('deletes a folder', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('삭제할 폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.deleteFolder(folderId);
    });

    expect(result.current.folders).toHaveLength(0);
  });

  it('removes conversation assignments when folder is deleted', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.assignConversation('conv-1', folderId);
      result.current.assignConversation('conv-2', folderId);
    });

    act(() => {
      result.current.deleteFolder(folderId);
    });

    expect(result.current.assignments).toEqual({});
  });

  it('resets selectedFolderId when selected folder is deleted', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.selectFolder(folderId);
    });
    expect(result.current.selectedFolderId).toBe(folderId);

    act(() => {
      result.current.deleteFolder(folderId);
    });
    expect(result.current.selectedFolderId).toBeNull();
  });

  it('assigns a conversation to a folder', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.assignConversation('conv-1', folderId);
    });

    expect(result.current.assignments['conv-1']).toBe(folderId);
    expect(result.current.getConversationFolderId('conv-1')).toBe(folderId);
  });

  it('does not assign conversation to non-existent folder', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.assignConversation('conv-1', 'non-existent');
    });

    expect(result.current.assignments).toEqual({});
  });

  it('unassigns a conversation from its folder', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.assignConversation('conv-1', folderId);
    });
    expect(result.current.assignments['conv-1']).toBe(folderId);

    act(() => {
      result.current.unassignConversation('conv-1');
    });

    expect(result.current.assignments['conv-1']).toBeUndefined();
  });

  it('selects and deselects folders', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.selectFolder('some-folder');
    });
    expect(result.current.selectedFolderId).toBe('some-folder');

    act(() => {
      result.current.selectFolder(null);
    });
    expect(result.current.selectedFolderId).toBeNull();
  });

  it('gets conversation folder id', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.assignConversation('conv-1', folderId);
    });

    expect(result.current.getConversationFolderId('conv-1')).toBe(folderId);
    expect(result.current.getConversationFolderId('conv-2')).toBeUndefined();
  });

  it('gets conversation ids for a folder', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.assignConversation('conv-1', folderId);
    });
    act(() => {
      result.current.assignConversation('conv-2', folderId);
    });

    const ids = result.current.getFolderConversationIds(folderId);
    expect(ids).toContain('conv-1');
    expect(ids).toContain('conv-2');
    expect(ids).toHaveLength(2);
  });

  it('gets uncategorized conversation ids', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.assignConversation('conv-1', folderId);
    });

    const uncategorized = result.current.getUncategorizedConversationIds(['conv-1', 'conv-2', 'conv-3']);
    expect(uncategorized).toEqual(['conv-2', 'conv-3']);
  });

  it('persists folders to localStorage', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('저장 테스트');
    });

    const stored = JSON.parse(localStorage.getItem('gemini-conversation-folders') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('저장 테스트');
  });

  it('persists assignments to localStorage', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더');
    });
    const folderId = result.current.folders[0].id;

    act(() => {
      result.current.assignConversation('conv-1', folderId);
    });

    const stored = JSON.parse(localStorage.getItem('gemini-folder-assignments') || '{}');
    expect(stored['conv-1']).toBe(folderId);
  });

  it('restores folders from localStorage on init', () => {
    const testFolders = [
      { id: 'folder-1', name: '복원 테스트', color: '#4A90D9', createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    localStorage.setItem('gemini-conversation-folders', JSON.stringify(testFolders));

    const { result } = renderHook(() => useConversationFolders());
    expect(result.current.folders).toHaveLength(1);
    expect(result.current.folders[0].name).toBe('복원 테스트');
    expect(result.current.folders[0].createdAt).toBeInstanceOf(Date);
  });

  it('restores assignments from localStorage on init', () => {
    const testAssignments = { 'conv-1': 'folder-1' };
    localStorage.setItem('gemini-folder-assignments', JSON.stringify(testAssignments));

    const { result } = renderHook(() => useConversationFolders());
    expect(result.current.assignments).toEqual(testAssignments);
  });

  it('reassigns conversation when moved to different folder', () => {
    const { result } = renderHook(() => useConversationFolders());

    act(() => {
      result.current.createFolder('폴더 A');
    });
    act(() => {
      result.current.createFolder('폴더 B');
    });
    const folderA = result.current.folders[0].id;
    const folderB = result.current.folders[1].id;

    act(() => {
      result.current.assignConversation('conv-1', folderA);
    });
    expect(result.current.getConversationFolderId('conv-1')).toBe(folderA);

    act(() => {
      result.current.assignConversation('conv-1', folderB);
    });
    expect(result.current.getConversationFolderId('conv-1')).toBe(folderB);
  });

  it('handles invalid localStorage data gracefully', () => {
    localStorage.setItem('gemini-conversation-folders', 'invalid-json');
    localStorage.setItem('gemini-folder-assignments', 'invalid-json');

    const { result } = renderHook(() => useConversationFolders());
    expect(result.current.folders).toEqual([]);
    expect(result.current.assignments).toEqual({});
  });
});
