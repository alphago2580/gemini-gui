import React from 'react';
import './FormattingToolbar.css';

export interface FormattingAction {
  id: string;
  label: string;
  icon: string;
  title: string;
}

const ACTIONS: FormattingAction[] = [
  { id: 'bold', label: 'B', icon: 'B', title: '굵게' },
  { id: 'italic', label: 'I', icon: 'I', title: '기울임' },
  { id: 'code', label: '<>', icon: '<>', title: '인라인 코드' },
  { id: 'strikethrough', label: 'S', icon: 'S', title: '취소선' },
  { id: 'link', label: '🔗', icon: '🔗', title: '링크 삽입' },
  { id: 'codeblock', label: '{}', icon: '{}', title: '코드 블록' },
];

interface FormattingToolbarProps {
  onFormat: (actionId: string) => void;
}

const FormattingToolbarInner: React.FC<FormattingToolbarProps> = ({ onFormat }) => {
  return (
    <div className="formatting-toolbar" aria-label="텍스트 포맷팅 도구">
      {ACTIONS.map(action => (
        <button
          key={action.id}
          className={`formatting-btn formatting-btn-${action.id}`}
          onClick={() => onFormat(action.id)}
          title={action.title}
          aria-label={action.title}
          tabIndex={-1}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};

export { ACTIONS };
const FormattingToolbar = React.memo(FormattingToolbarInner);
export default FormattingToolbar;
