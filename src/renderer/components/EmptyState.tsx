import React from 'react';
import './EmptyState.css';

export interface EmptyStateAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions,
  size = 'medium',
  children,
}) => {
  const containerClass = [
    'empty-state',
    `empty-state-${size}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} role="status">
      {icon && (
        <div className="empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="empty-state-title">{title}</h3>

      {description && (
        <p className="empty-state-description">{description}</p>
      )}

      {children && (
        <div className="empty-state-content">{children}</div>
      )}

      {actions && actions.length > 0 && (
        <div className="empty-state-actions">
          {actions.map((action) => (
            <button
              key={action.id}
              className={`empty-state-action empty-state-action-${action.variant || 'primary'}`}
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(EmptyState);
