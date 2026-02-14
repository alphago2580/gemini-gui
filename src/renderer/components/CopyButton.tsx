import React, { useState, useCallback, useRef, useEffect } from 'react';
import './CopyButton.css';

export interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  icon?: string;
  copiedIcon?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'ghost' | 'outline';
  resetDelay?: number;
  disabled?: boolean;
  onCopy?: (text: string) => void;
  onError?: (error: unknown) => void;
  ariaLabel?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  copiedLabel = '복사됨',
  icon = '📋',
  copiedIcon = '✓',
  size = 'medium',
  variant = 'default',
  resetDelay = 2000,
  disabled = false,
  onCopy,
  onError,
  ariaLabel = '복사',
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (disabled || copied) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.(text);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, resetDelay);
    } catch (err) {
      onError?.(err);
    }
  }, [disabled, copied, text, onCopy, onError, resetDelay]);

  const displayIcon = copied ? copiedIcon : icon;
  const displayLabel = copied ? copiedLabel : label;

  const buttonClass = [
    'copy-button',
    `copy-button-${size}`,
    `copy-button-${variant}`,
    copied && 'copy-button-copied',
    disabled && 'copy-button-disabled',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      onClick={handleCopy}
      disabled={disabled}
      aria-label={copied ? copiedLabel : ariaLabel}
      type="button"
    >
      <span className="copy-button-icon" aria-hidden="true">
        {displayIcon}
      </span>
      {displayLabel && (
        <span className="copy-button-label">{displayLabel}</span>
      )}
    </button>
  );
};

export default React.memo(CopyButton);
