import React from 'react';
import './FormattingToolbar.css';
import * as S from '../constants/strings';

export interface FormattingAction {
  id: string;
  label: string;
  icon: string;
  title: string;
}

const ACTIONS: FormattingAction[] = [
  { id: 'bold', label: 'B', icon: 'B', title: S.FMT_BOLD },
  { id: 'italic', label: 'I', icon: 'I', title: S.FMT_ITALIC },
  { id: 'code', label: '<>', icon: '<>', title: S.FMT_INLINE_CODE },
  { id: 'strikethrough', label: 'S', icon: 'S', title: S.FMT_STRIKETHROUGH },
  { id: 'link', label: '🔗', icon: '🔗', title: S.FMT_LINK },
  { id: 'codeblock', label: '{}', icon: '{}', title: S.FMT_CODE_BLOCK },
];

interface FormattingToolbarProps {
  onFormat: (actionId: string) => void;
}

const FormattingToolbarInner: React.FC<FormattingToolbarProps> = ({ onFormat }) => {
  return (
    <div className="formatting-toolbar" aria-label={S.FMT_TOOLBAR_LABEL}>
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
