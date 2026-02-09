import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePromptTemplates } from './usePromptTemplates';

describe('usePromptTemplates', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default templates when no saved data exists', () => {
    const { result } = renderHook(() => usePromptTemplates());
    expect(result.current.templates).toHaveLength(3);
    expect(result.current.templates[0].name).toBe('번역 (한→영)');
    expect(result.current.templates[1].name).toBe('코드 리뷰');
    expect(result.current.templates[2].name).toBe('요약');
  });

  it('each default template has id, name, and content', () => {
    const { result } = renderHook(() => usePromptTemplates());
    result.current.templates.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.content).toBeTruthy();
    });
  });

  it('adds a new template', () => {
    const { result } = renderHook(() => usePromptTemplates());
    act(() => {
      result.current.addTemplate('테스트 템플릿', '테스트 내용입니다');
    });
    expect(result.current.templates).toHaveLength(4);
    expect(result.current.templates[3].name).toBe('테스트 템플릿');
    expect(result.current.templates[3].content).toBe('테스트 내용입니다');
  });

  it('addTemplate returns the new template with generated id', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
    const { result } = renderHook(() => usePromptTemplates());
    let newTemplate: ReturnType<typeof result.current.addTemplate>;
    act(() => {
      newTemplate = result.current.addTemplate('새 템플릿', '내용');
    });
    expect(newTemplate!.id).toBe('1234567890');
    expect(newTemplate!.name).toBe('새 템플릿');
    vi.restoreAllMocks();
  });

  it('deletes a template by id', () => {
    const { result } = renderHook(() => usePromptTemplates());
    const idToDelete = result.current.templates[0].id;
    act(() => {
      result.current.deleteTemplate(idToDelete);
    });
    expect(result.current.templates).toHaveLength(2);
    expect(result.current.templates.find(t => t.id === idToDelete)).toBeUndefined();
  });

  it('updates a template', () => {
    const { result } = renderHook(() => usePromptTemplates());
    const idToUpdate = result.current.templates[1].id;
    act(() => {
      result.current.updateTemplate(idToUpdate, '수정된 이름', '수정된 내용');
    });
    const updated = result.current.templates.find(t => t.id === idToUpdate);
    expect(updated?.name).toBe('수정된 이름');
    expect(updated?.content).toBe('수정된 내용');
  });

  it('persists templates to localStorage', () => {
    const { result } = renderHook(() => usePromptTemplates());
    act(() => {
      result.current.addTemplate('저장 테스트', '내용');
    });
    const stored = JSON.parse(localStorage.getItem('gemini-prompt-templates') || '[]');
    expect(stored).toHaveLength(4);
    expect(stored[3].name).toBe('저장 테스트');
  });

  it('loads templates from localStorage on mount', () => {
    const saved = [{ id: 'saved-1', name: '저장된 템플릿', content: '저장된 내용' }];
    localStorage.setItem('gemini-prompt-templates', JSON.stringify(saved));
    const { result } = renderHook(() => usePromptTemplates());
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].name).toBe('저장된 템플릿');
  });

  it('deleting non-existent id does not change templates', () => {
    const { result } = renderHook(() => usePromptTemplates());
    const initialLength = result.current.templates.length;
    act(() => {
      result.current.deleteTemplate('non-existent');
    });
    expect(result.current.templates).toHaveLength(initialLength);
  });
});
