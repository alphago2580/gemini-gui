import React, { useState, useCallback } from 'react';
import './Avatar.css';

export type AvatarSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  icon?: React.ReactNode;
  fallback?: React.ReactNode;
  onClick?: () => void;
  id?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'medium',
  shape = 'circle',
  status,
  icon,
  fallback,
  onClick,
  id,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleImgError = useCallback(() => {
    setImgError(true);
  }, []);

  const showImage = src && !imgError;
  const showInitials = !showImage && name && !icon && !fallback;
  const showIcon = !showImage && icon;
  const showFallback = !showImage && !showInitials && !showIcon && fallback;
  const showDefault = !showImage && !showInitials && !showIcon && !showFallback;

  const classNames = [
    'avatar',
    `avatar--${size}`,
    `avatar--${shape}`,
    onClick ? 'avatar--clickable' : '',
  ].filter(Boolean).join(' ');

  const bgStyle = showInitials && name ? { backgroundColor: nameToColor(name) } : undefined;

  const content = (
    <>
      {showImage && (
        <img
          className="avatar-image"
          src={src}
          alt={alt || name || '아바타'}
          onError={handleImgError}
        />
      )}
      {showInitials && name && (
        <span className="avatar-initials">{getInitials(name)}</span>
      )}
      {showIcon && (
        <span className="avatar-icon">{icon}</span>
      )}
      {showFallback && fallback}
      {showDefault && (
        <span className="avatar-default" aria-hidden="true">👤</span>
      )}
      {status && (
        <span
          className={`avatar-status avatar-status--${status}`}
          aria-label={status}
        />
      )}
    </>
  );

  return (
    <div
      id={id}
      className={classNames}
      style={bgStyle}
      role={onClick ? 'button' : 'img'}
      aria-label={alt || name || '아바타'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {content}
    </div>
  );
};

export default React.memo(Avatar);
