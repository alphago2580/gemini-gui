import React from 'react';
import './KeyboardShortcutHelp.css';

interface ShortcutEntry {
  keys: string;
  description: string;
}

const SHORTCUT_GROUPS: { title: string; shortcuts: ShortcutEntry[] }[] = [
  {
    title: '일반',
    shortcuts: [
      { keys: 'Ctrl+N', description: '새 대화' },
      { keys: 'Ctrl+L', description: '대화 내용 지우기' },
      { keys: 'Ctrl+,', description: '설정 열기' },
      { keys: 'Ctrl+Shift+P', description: '명령 팔레트' },
      { keys: 'Ctrl+B', description: '사이드바 토글' },
      { keys: 'Ctrl+K', description: '빠른 대화 전환' },
      { keys: 'Escape', description: '현재 패널 닫기' },
    ],
  },
  {
    title: '메시지',
    shortcuts: [
      { keys: 'Enter', description: '메시지 전송' },
      { keys: 'Shift+Enter', description: '줄바꿈' },
    ],
  },
  {
    title: '검색',
    shortcuts: [
      { keys: 'Ctrl+F', description: '대화 내 검색' },
    ],
  },
  {
    title: '탭',
    shortcuts: [
      { keys: 'Ctrl+Tab', description: '다음 탭' },
      { keys: 'Ctrl+Shift+Tab', description: '이전 탭' },
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
    <div className="shortcut-help-overlay" onClick={onClose} role="dialog" aria-label="키보드 단축키">
      <div className="shortcut-help-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcut-help-header">
          <h2>키보드 단축키</h2>
          <button className="shortcut-help-close" onClick={onClose} aria-label="단축키 도움말 닫기">×</button>
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
