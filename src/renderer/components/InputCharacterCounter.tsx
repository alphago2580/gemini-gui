import React, { useMemo } from 'react';
import './InputCharacterCounter.css';
import { countWords } from '../utils/wordCount';
import * as S from '../constants/strings';

export interface InputCharacterCounterProps {
  text: string;
  maxCharacters?: number;
  isVisible: boolean;
}

function estimateTokens(text: string): number {
  if (!text) return 0;
  // Rough estimation: ~4 characters per token for English, ~2 for Korean/CJK
  const cjkChars = (text.match(/[\u3000-\u9fff\uac00-\ud7af]/g) || []).length;
  const nonCjkLength = text.length - cjkChars;
  return Math.ceil(nonCjkLength / 4 + cjkChars / 2);
}

const InputCharacterCounterInner: React.FC<InputCharacterCounterProps> = ({
  text,
  maxCharacters,
  isVisible,
}) => {
  const stats = useMemo(() => {
    const characters = text.length;
    const words = countWords(text);
    const tokens = estimateTokens(text);
    return { characters, words, tokens };
  }, [text]);

  if (!isVisible || stats.characters === 0) return null;

  const isOverLimit = maxCharacters !== undefined && stats.characters > maxCharacters;

  return (
    <div
      className={`input-char-counter${isOverLimit ? ' input-char-counter--over' : ''}`}
      aria-label={S.CHAR_COUNTER_LABEL}
      aria-live="polite"
    >
      <span className="input-char-counter__item">
        {S.CHAR_COUNTER_CHARS(stats.characters)}
      </span>
      <span className="input-char-counter__separator" aria-hidden="true">|</span>
      <span className="input-char-counter__item">
        {S.CHAR_COUNTER_WORDS(stats.words)}
      </span>
      <span className="input-char-counter__separator" aria-hidden="true">|</span>
      <span className="input-char-counter__item">
        {S.CHAR_COUNTER_TOKENS(stats.tokens)}
      </span>
      {maxCharacters !== undefined && (
        <>
          <span className="input-char-counter__separator" aria-hidden="true">|</span>
          <span className={`input-char-counter__item input-char-counter__limit${isOverLimit ? ' input-char-counter__limit--over' : ''}`}>
            {S.CHAR_COUNTER_LIMIT(stats.characters, maxCharacters)}
          </span>
        </>
      )}
    </div>
  );
};

const InputCharacterCounter = React.memo(InputCharacterCounterInner);
export default InputCharacterCounter;
export { estimateTokens };
