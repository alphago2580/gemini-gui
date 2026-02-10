import React from 'react';
import './Divider.css';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  variant?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'small' | 'medium' | 'large';
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  variant = 'solid',
  spacing = 'medium',
}) => {
  if (label && orientation === 'horizontal') {
    return (
      <div
        className={`divider divider--horizontal divider--${variant} divider--spacing-${spacing} divider--with-label`}
        role="separator"
        aria-orientation="horizontal"
        aria-label={label}
      >
        <span className="divider-line" />
        <span className="divider-label">{label}</span>
        <span className="divider-line" />
      </div>
    );
  }

  return (
    <div
      className={`divider divider--${orientation} divider--${variant} divider--spacing-${spacing}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

export default React.memo(Divider);
