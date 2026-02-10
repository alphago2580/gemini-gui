import React from 'react';
import './KeyboardShortcutHelp.css';
import * as S from '../constants/strings';

interface ShortcutEntry {
  keys: string;
  description: string;
}

const SHORTCUT_GROUPS: { title: string; shortcuts: ShortcutEntry[] }[] = [
  {
    title: S.SHORTCUT_GROUP_GENERAL,
    shortcuts: [
      { keys: 'Ctrl+N', description: S.SHORTCUT_NEW_CHAT },
      { keys: 'Ctrl+L', description: S.SHORTCUT_CLEAR },
      { keys: 'Ctrl+,', description: S.SHORTCUT_SETTINGS },
      { keys: 'Ctrl+Shift+P', description: S.SHORTCUT_CMD_PALETTE },
      { keys: 'Ctrl+B', description: S.SHORTCUT_SIDEBAR },
      { keys: 'Ctrl+K', description: S.SHORTCUT_QUICK_SWITCH },
      { keys: 'Escape', description: S.SHORTCUT_CLOSE },
    ],
  },
  {
    title: S.SHORTCUT_GROUP_MESSAGE,
    shortcuts: [
      { keys: 'Enter', description: S.SHORTCUT_SEND },
      { keys: 'Shift+Enter', description: S.SHORTCUT_NEWLINE },
    ],
  },
  {
    title: S.SHORTCUT_GROUP_SEARCH,
    shortcuts: [
      { keys: 'Ctrl+F', description: S.SHORTCUT_FIND },
    ],
  },
  {
    title: S.SHORTCUT_GROUP_TABS,
    shortcuts: [
      { keys: 'Ctrl+Tab', description: S.SHORTCUT_NEXT_TAB },
      { keys: 'Ctrl+Shift+Tab', description: S.SHORTCUT_PREV_TAB },
    ],
  },
];

export { SHORTCUT_GROUPS };

export interface KeyboardShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutHelpInner: React.FC<KeyboardShortcutHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="shortcut-help-overlay" onClick={onClose} role="dialog" aria-label={S.SHORTCUT_HELP_LABEL}>
      <div className="shortcut-help-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcut-help-header">
          <h2>{S.SHORTCUT_HELP_LABEL}</h2>
          <button className="shortcut-help-close" onClick={onClose} aria-label={S.SHORTCUT_HELP_CLOSE}>×</button>
        </div>
        <div className="shortcut-help-content">
          {SHORTCUT_GROUPS.map(group => (
            <div key={group.title} className="shortcut-group">
              <h3>{group.title}</h3>
              <div className="shortcut-list">
                {group.shortcuts.map(shortcut => (
                  <div key={shortcut.keys} className="shortcut-row">
                    <span className="shortcut-description">{shortcut.description}</span>
                    <kbd className="shortcut-keys">{shortcut.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KeyboardShortcutHelp = React.memo(KeyboardShortcutHelpInner);
export default KeyboardShortcutHelp;
