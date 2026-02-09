import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { PromptTemplate } from '../../preload/types';

const STORAGE_KEY = 'gemini-prompt-templates';

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  { id: 'default-1', name: '번역 (한→영)', content: '다음 한국어 텍스트를 영어로 번역해 주세요:\n\n' },
  { id: 'default-2', name: '코드 리뷰', content: '다음 코드를 리뷰하고 개선점을 제안해 주세요:\n\n' },
  { id: 'default-3', name: '요약', content: '다음 내용을 간결하게 요약해 주세요:\n\n' },
];

export function usePromptTemplates() {
  const [templates, setTemplates] = useLocalStorage<PromptTemplate[]>(STORAGE_KEY, DEFAULT_TEMPLATES);

  const addTemplate = useCallback((name: string, content: string) => {
    const newTemplate: PromptTemplate = {
      id: Date.now().toString(),
      name,
      content,
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, [setTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, [setTemplates]);

  const updateTemplate = useCallback((id: string, name: string, content: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, name, content } : t
    ));
  }, [setTemplates]);

  return {
    templates,
    addTemplate,
    deleteTemplate,
    updateTemplate,
  };
}
