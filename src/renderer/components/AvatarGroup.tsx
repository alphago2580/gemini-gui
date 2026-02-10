import React from 'react';
import './AvatarGroup.css';

export interface AvatarGroupItem {
  id: string;
  name: string;
  color?: string;
}

export interface AvatarGroupProps {
  items: AvatarGroupItem[];
  max?: number;
  size?: 'small' | 'medium' | 'large';
}

const SIZE_MAP = { small: 24, medium: 32, large: 40 };

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  items,
  max = 5,
  size = 'medium',
}) => {
  const visible = items.slice(0, max);
  const overflow = items.length - max;
  const px = SIZE_MAP[size];

  return (
    <div
      className={`avatar-group avatar-group--${size}`}
      role="group"
      aria-label={`${items.length}명의 사용자`}
    >
      {visible.map((item, index) => {
        const initial = item.name.charAt(0).toUpperCase();
        const bg = item.color || `hsl(${(item.name.charCodeAt(0) * 37) % 360}, 50%, 45%)`;
        return (
          <div
            key={item.id}
            className="avatar-group-item"
            style={{
              width: px,
              height: px,
              backgroundColor: bg,
              zIndex: items.length - index,
            }}
            title={item.name}
            aria-label={item.name}
          >
            <span className="avatar-group-initial">{initial}</span>
          </div>
        );
      })}
      {overflow > 0 && (
        <div
          className="avatar-group-item avatar-group-overflow"
          style={{ width: px, height: px, zIndex: 0 }}
          aria-label={`외 ${overflow}명`}
          title={`외 ${overflow}명`}
        >
          <span className="avatar-group-initial">+{overflow}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(AvatarGroup);
