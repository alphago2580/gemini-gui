import React, { useState, useRef, useEffect } from 'react';
import './PromptTemplates.css';
import type { PromptTemplate } from '../../preload/types';

interface PromptTemplatesProps {
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
        aria-label="프롬프트 템플릿"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="프롬프트 템플릿"
      >
        📋
      </button>

      {isOpen && (
        <div className="prompt-templates-dropdown" role="listbox" aria-label="프롬프트 템플릿 목록">
          <div className="prompt-templates-header">
            <span>프롬프트 템플릿</span>
            <button
              className="prompt-templates-add-btn"
              onClick={() => setIsAdding(true)}
              aria-label="새 템플릿 추가"
              title="새 템플릿 추가"
            >
              +
            </button>
          </div>

          {isAdding && (
            <div className="prompt-templates-form" role="form" aria-label="새 템플릿 추가">
              <input
                className="prompt-templates-name-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="템플릿 이름"
                aria-label="템플릿 이름"
                autoFocus
              />
              <textarea
                className="prompt-templates-content-input"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="템플릿 내용"
                aria-label="템플릿 내용"
                rows={3}
              />
              <div className="prompt-templates-form-actions">
                <button
                  className="prompt-templates-save-btn"
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newContent.trim()}
                  aria-label="템플릿 저장"
                >
                  저장
                </button>
                <button
                  className="prompt-templates-cancel-btn"
                  onClick={handleCancel}
                  aria-label="추가 취소"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {templates.length === 0 && !isAdding && (
            <div className="prompt-templates-empty">
              템플릿이 없습니다
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
                aria-label={`${template.name} 삭제`}
                title="삭제"
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
