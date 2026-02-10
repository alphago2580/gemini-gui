import React from 'react';
import './Skeleton.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true,
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="skeleton-lines" role="status" aria-label="로딩 중" aria-busy="true">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`skeleton skeleton--text${animated ? ' skeleton--animated' : ''}`}
            style={i === lines - 1 ? { ...style, width: style.width || '80%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton skeleton--${variant}${animated ? ' skeleton--animated' : ''}`}
      style={style}
      role="status"
      aria-label="로딩 중"
      aria-busy="true"
    />
  );
};

export default React.memo(Skeleton);
