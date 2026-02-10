import React from 'react';
import './WelcomeScreen.css';
import * as S from '../constants/strings';

export interface SuggestedPrompt {
  icon: string;
  label: string;
  prompt: string;
}

export const DEFAULT_SUGGESTIONS: SuggestedPrompt[] = [
  { icon: '💡', label: S.SUGGESTION_BRAINSTORM, prompt: S.SUGGESTION_BRAINSTORM_PROMPT },
  { icon: '📝', label: S.SUGGESTION_WRITING, prompt: S.SUGGESTION_WRITING_PROMPT },
  { icon: '🐛', label: S.SUGGESTION_DEBUG, prompt: S.SUGGESTION_DEBUG_PROMPT },
  { icon: '📚', label: S.SUGGESTION_EXPLAIN, prompt: S.SUGGESTION_EXPLAIN_PROMPT },
  { icon: '🔍', label: S.SUGGESTION_REVIEW, prompt: S.SUGGESTION_REVIEW_PROMPT },
  { icon: '🌐', label: S.SUGGESTION_TRANSLATE, prompt: S.SUGGESTION_TRANSLATE_PROMPT },
];

export interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

const WelcomeScreenInner: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
  return (
    <div className="welcome-screen" role="region" aria-label={S.WELCOME_SCREEN_LABEL}>
      <div className="welcome-logo">✦</div>
      <h2 className="welcome-title">{S.WELCOME_TITLE}</h2>
      <p className="welcome-subtitle">{S.WELCOME_SUBTITLE}</p>
      <div className="welcome-suggestions" role="list" aria-label={S.WELCOME_SUGGESTIONS_LABEL}>
        {DEFAULT_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            className="welcome-suggestion-card"
            role="listitem"
            onClick={() => onPromptClick(suggestion.prompt)}
            aria-label={suggestion.label}
          >
            <span className="suggestion-icon">{suggestion.icon}</span>
            <span className="suggestion-label">{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const WelcomeScreen = React.memo(WelcomeScreenInner);
export default WelcomeScreen;
