import React from 'react';
import './TokenUsage.css';
import type { TokenUsage as TokenUsageType } from '../../preload/types';

interface TokenUsageProps {
  usage: TokenUsageType;
}

const TokenUsage: React.FC<TokenUsageProps> = ({ usage }) => {
  return (
    <div className="token-usage" role="status" aria-label="토큰 사용량">
      <span className="token-usage-label">토큰:</span>
      <span className="token-usage-item" title="입력 토큰">
        <span className="token-icon">↑</span>
        {usage.inputTokens.toLocaleString()}
      </span>
      <span className="token-usage-item" title="출력 토큰">
        <span className="token-icon">↓</span>
        {usage.outputTokens.toLocaleString()}
      </span>
      <span className="token-usage-total" title="총 토큰">
        = {usage.totalTokens.toLocaleString()}
      </span>
    </div>
  );
};

export default TokenUsage;
