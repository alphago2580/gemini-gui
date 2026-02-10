import React from 'react';
import './TokenUsage.css';
import type { TokenUsage as TokenUsageType } from '../../preload/types';
import * as S from '../constants/strings';

export interface TokenUsageProps {
  usage: TokenUsageType;
}

const TokenUsage: React.FC<TokenUsageProps> = ({ usage }) => {
  return (
    <div className="token-usage" role="status" aria-label={S.ARIA_TOKEN_USAGE}>
      <span className="token-usage-label">{S.TOKEN_LABEL}</span>
      <span className="token-usage-item" title={S.TOKEN_INPUT_TITLE}>
        <span className="token-icon">↑</span>
        {usage.inputTokens.toLocaleString()}
      </span>
      <span className="token-usage-item" title={S.TOKEN_OUTPUT_TITLE}>
        <span className="token-icon">↓</span>
        {usage.outputTokens.toLocaleString()}
      </span>
      <span className="token-usage-total" title={S.TOKEN_TOTAL_TITLE}>
        = {usage.totalTokens.toLocaleString()}
      </span>
    </div>
  );
};

export default React.memo(TokenUsage);
