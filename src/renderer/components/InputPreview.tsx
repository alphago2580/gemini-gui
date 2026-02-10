import React from 'react';
import './InputPreview.css';
import MarkdownRenderer from './MarkdownRenderer';
import * as S from '../constants/strings';

interface InputPreviewProps {
  content: string;
  isVisible: boolean;
}

const InputPreviewInner: React.FC<InputPreviewProps> = ({ content, isVisible }) => {
  if (!isVisible || !content.trim()) return null;

  return (
    <div className="input-preview" aria-label={S.INPUT_PREVIEW_LABEL}>
      <div className="input-preview-label">{S.INPUT_PREVIEW_TEXT}</div>
      <div className="input-preview-content">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

const InputPreview = React.memo(InputPreviewInner);
export default InputPreview;
