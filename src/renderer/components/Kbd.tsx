import React from 'react';
import './Kbd.css';

export interface KbdProps {
  keys: string | string[];
  separator?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'flat';
}

const KEY_SYMBOLS: Record<string, string> = {
  ctrl: '⌃',
  cmd: '⌘',
  command: '⌘',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  backspace: '⌫',
  delete: '⌦',
  tab: '⇥',
  escape: 'Esc',
  esc: 'Esc',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  space: '␣',
};

function formatKey(key: string): string {
  const lower = key.toLowerCase();
  return KEY_SYMBOLS[lower] ?? key;
}

const Kbd: React.FC<KbdProps> = ({
  keys,
  separator = '+',
  size = 'medium',
  variant = 'default',
}) => {
  const keyArray = typeof keys === 'string' ? keys.split('+').map(k => k.trim()) : keys;

  const containerClass = [
    'kbd-container',
    `kbd-${size}`,
  ].filter(Boolean).join(' ');

  const keyClass = [
    'kbd',
    `kbd-${variant}`,
  ].filter(Boolean).join(' ');

  return (
    <span className={containerClass} role="text" aria-label={keyArray.join(` ${separator} `)}>
      {keyArray.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="kbd-separator" aria-hidden="true">{separator}</span>
          )}
          <kbd className={keyClass}>{formatKey(key)}</kbd>
        </React.Fragment>
      ))}
    </span>
  );
};

export default React.memo(Kbd);
