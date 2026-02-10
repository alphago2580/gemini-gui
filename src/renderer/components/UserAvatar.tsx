import React from 'react';
import './UserAvatar.css';

export type AvatarRole = 'user' | 'assistant' | 'system';

export interface UserAvatarProps {
  role: AvatarRole;
  size?: 'small' | 'medium' | 'large';
  name?: string;
}

const ROLE_CONFIG: Record<AvatarRole, { icon: string; label: string; className: string }> = {
  user: { icon: '👤', label: '사용자', className: 'avatar--user' },
  assistant: { icon: '✦', label: 'AI 어시스턴트', className: 'avatar--assistant' },
  system: { icon: '⚙', label: '시스템', className: 'avatar--system' },
};

const UserAvatar: React.FC<UserAvatarProps> = ({ role, size = 'medium', name }) => {
  const config = ROLE_CONFIG[role];
  const displayName = name || config.label;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className={`avatar ${config.className} avatar--${size}`}
      role="img"
      aria-label={displayName}
      title={displayName}
    >
      {role === 'user' && name ? (
        <span className="avatar-initial">{initial}</span>
      ) : (
        <span className="avatar-icon">{config.icon}</span>
      )}
    </div>
  );
};

export default React.memo(UserAvatar);
