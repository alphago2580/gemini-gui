import React from 'react';
import './WelcomeScreen.css';

export interface SuggestedPrompt {
  icon: string;
  label: string;
  prompt: string;
}

export const DEFAULT_SUGGESTIONS: SuggestedPrompt[] = [
  { icon: '💡', label: '아이디어 브레인스토밍', prompt: '새로운 사이드 프로젝트 아이디어를 5개 제안해줘' },
  { icon: '📝', label: '글쓰기 도움', prompt: '블로그 게시물의 개요를 작성해줘' },
  { icon: '🐛', label: '코드 디버깅', prompt: '이 코드의 버그를 찾아줘:\n' },
  { icon: '📚', label: '개념 설명', prompt: '초보자에게 설명하듯이 알려줘: ' },
  { icon: '🔍', label: '코드 리뷰', prompt: '이 코드를 리뷰하고 개선점을 알려줘:\n' },
  { icon: '🌐', label: '번역 도움', prompt: '다음 텍스트를 영어로 번역해줘:\n' },
];

export interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

const WelcomeScreenInner: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
  return (
    <div className="welcome-screen" role="region" aria-label="환영 화면">
      <div className="welcome-logo">✦</div>
      <h2 className="welcome-title">Gemini에 오신 것을 환영합니다!</h2>
      <p className="welcome-subtitle">아래 입력창에 메시지를 입력하거나 제안을 클릭하세요.</p>
      <div className="welcome-suggestions" role="list" aria-label="제안 프롬프트">
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
