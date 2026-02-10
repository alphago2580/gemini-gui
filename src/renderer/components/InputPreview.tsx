import React from 'react';
import './InputPreview.css';
import MarkdownRenderer from './MarkdownRenderer';

interface InputPreviewProps {
  content: string;
  isVisible: boolean;
}

const InputPreviewInner: React.FC<InputPreviewProps> = ({ content, isVisible }) => {
  if (!isVisible || !content.trim()) return null;

  return (
    <div className="input-preview" aria-label="입력 미리보기">
      <div className="input-preview-label">미리보기</div>
      <div className="input-preview-content">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

const InputPreview = React.memo(InputPreviewInner);
export default InputPreview;
