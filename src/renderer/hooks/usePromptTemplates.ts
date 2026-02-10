import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateUniqueId } from '../utils/format';
import type { PromptTemplate } from '../../preload/types';
import * as S from '../constants/strings';

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  { id: 'default-1', name: S.DEFAULT_TEMPLATE_TRANSLATE, content: S.DEFAULT_TEMPLATE_TRANSLATE_CONTENT },
  { id: 'default-2', name: S.DEFAULT_TEMPLATE_REVIEW, content: S.DEFAULT_TEMPLATE_REVIEW_CONTENT },
  { id: 'default-3', name: S.DEFAULT_TEMPLATE_SUMMARY, content: S.DEFAULT_TEMPLATE_SUMMARY_CONTENT },
];

export function usePromptTemplates() {
  const [templates, setTemplates] = useLocalStorage<PromptTemplate[]>(S.STORAGE_KEY_PROMPT_TEMPLATES, DEFAULT_TEMPLATES);

  const addTemplate = useCallback((name: string, content: string) => {
    const newTemplate: PromptTemplate = {
      id: generateUniqueId('tpl'),
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
