import React, { useState, useRef, useEffect } from 'react';
import './PromptTemplates.css';
import type { PromptTemplate } from '../../preload/types';
import * as S from '../constants/strings';

export interface PromptTemplatesProps {
  templates: PromptTemplate[];
  onSelect: (content: string) => void;
  onAdd: (name: string, content: string) => void;
  onDelete: (id: string) => void;
}

const PromptTemplates: React.FC<PromptTemplatesProps> = ({ templates, onSelect, onAdd, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (template: PromptTemplate) => {
    onSelect(template.content);
    setIsOpen(false);
  };

  const handleAdd = () => {
    if (newName.trim() && newContent.trim()) {
      onAdd(newName.trim(), newContent.trim());
      setNewName('');
      setNewContent('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewName('');
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className="prompt-templates" ref={dropdownRef}>
      <button
        className="prompt-templates-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={S.ARIA_PROMPT_TEMPLATES}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={S.TITLE_PROMPT_TEMPLATES}
      >
        📋
      </button>

      {isOpen && (
        <div className="prompt-templates-dropdown" role="listbox" aria-label={S.ARIA_PROMPT_TEMPLATES}>
          <div className="prompt-templates-header">
            <span>{S.PROMPT_TEMPLATES_HEADER}</span>
            <button
              className="prompt-templates-add-btn"
              onClick={() => setIsAdding(true)}
              aria-label={S.ARIA_ADD_TEMPLATE}
              title={S.TITLE_ADD_TEMPLATE}
            >
              +
            </button>
          </div>

          {isAdding && (
            <div className="prompt-templates-form" role="form" aria-label={S.ARIA_ADD_TEMPLATE}>
              <input
                className="prompt-templates-name-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={S.TEMPLATE_NAME_PLACEHOLDER}
                aria-label={S.ARIA_TEMPLATE_NAME}
                autoFocus
              />
              <textarea
                className="prompt-templates-content-input"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder={S.TEMPLATE_CONTENT_PLACEHOLDER}
                aria-label={S.ARIA_TEMPLATE_CONTENT}
                rows={3}
              />
              <div className="prompt-templates-form-actions">
                <button
                  className="prompt-templates-save-btn"
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newContent.trim()}
                  aria-label={S.ARIA_TEMPLATE_SAVE}
                >
                  {S.TEMPLATE_SAVE}
                </button>
                <button
                  className="prompt-templates-cancel-btn"
                  onClick={handleCancel}
                  aria-label={S.ARIA_TEMPLATE_CANCEL}
                >
                  {S.TEMPLATE_CANCEL}
                </button>
              </div>
            </div>
          )}

          {templates.length === 0 && !isAdding && (
            <div className="prompt-templates-empty">
              {S.TEMPLATES_EMPTY}
            </div>
          )}

          {templates.map(template => (
            <div
              key={template.id}
              className="prompt-templates-item"
              role="option"
              aria-label={template.name}
              onClick={() => handleSelect(template)}
            >
              <span className="prompt-templates-item-name">{template.name}</span>
              <button
                className="prompt-templates-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(template.id);
                }}
                aria-label={`${template.name} ${S.DELETE_SUFFIX}`}
                title={S.DELETE_TITLE}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(PromptTemplates);
