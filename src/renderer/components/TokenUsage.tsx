import React from 'react';
import './TokenUsage.css';
import type { TokenUsage as TokenUsageType } from '../../preload/types';
import ProgressBar from './ProgressBar';
import * as S from '../constants/strings';

export interface TokenUsageProps {
  usage: TokenUsageType;
  maxTokens?: number;
}

const TokenUsage: React.FC<TokenUsageProps> = ({ usage, maxTokens }) => {
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
      {maxTokens && maxTokens > 0 && (
        <span className="token-usage-progress">
          <ProgressBar
            value={usage.totalTokens}
            max={maxTokens}
            size="small"
            variant={usage.totalTokens > maxTokens * 0.9 ? 'error' : usage.totalTokens > maxTokens * 0.7 ? 'warning' : 'default'}
            label={S.TOKEN_USAGE_PROGRESS_LABEL}
            showPercentage
          />
        </span>
      )}
    </div>
  );
};

export default React.memo(TokenUsage);
