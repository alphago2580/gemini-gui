import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';
import TabBar from './TabBar';
import Settings from './Settings';
import WelcomeScreen from './WelcomeScreen';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';
import CommandPalette from './CommandPalette';
import Badge from './Badge';
import Tooltip from './Tooltip';

import type { Message, Conversation, AppSettings } from '../../preload/types.d';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

const noop = () => {};

// --- Fixtures ---

const sampleMessage: Message = {
  id: 'msg-1',
  role: 'assistant',
  content: 'Hello, how can I help you today?',
  timestamp: new Date('2026-01-01T00:00:00Z'),
};

const sampleUserMessage: Message = {
  id: 'msg-2',
  role: 'user',
  content: 'What is TypeScript?',
  timestamp: new Date('2026-01-01T00:01:00Z'),
};

const sampleConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'First Conversation',
    timestamp: new Date('2026-01-01T00:00:00Z'),
    messages: [sampleUserMessage, sampleMessage],
  },
  {
    id: 'conv-2',
    title: 'Second Conversation',
    timestamp: new Date('2026-01-02T00:00:00Z'),
    messages: [],
  },
];

const sampleSettings: AppSettings = {
  model: 'gemini-pro',
  temperature: 0.7,
  maxTokens: 4096,
  theme: 'dark',
  systemPrompt: '',
  notificationSound: true,
  showTimestamps: true,
  fontSize: 14,
};

// --- Snapshot Tests ---

describe('Snapshot Tests — Key Components', () => {
  describe('MessageBubble', () => {
    it('matches snapshot for assistant message', () => {
      const { container } = render(
        <MessageBubble
          message={sampleMessage}
          index={0}
          isStreaming={false}
          isLastAssistant={true}
          onDelete={noop}
          onEdit={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot for user message', () => {
      const { container } = render(
        <MessageBubble
          message={sampleUserMessage}
          index={1}
          isStreaming={false}
          isLastAssistant={false}
          onDelete={noop}
          onEdit={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot while streaming', () => {
      const { container } = render(
        <MessageBubble
          message={{ ...sampleMessage, content: 'Partial response...' }}
          index={0}
          isStreaming={true}
          isLastAssistant={true}
          onDelete={noop}
          onEdit={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Sidebar', () => {
    it('matches snapshot with conversations', () => {
      const { container } = render(
        <Sidebar
          onNewChat={noop}
          onOpenSettings={noop}
          conversations={sampleConversations}
          currentConversationId="conv-1"
          onSelectConversation={noop}
          onDeleteConversation={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when collapsed', () => {
      const { container } = render(
        <Sidebar
          onNewChat={noop}
          onOpenSettings={noop}
          conversations={sampleConversations}
          currentConversationId={null}
          onSelectConversation={noop}
          isCollapsed={true}
          onToggleCollapse={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('TabBar', () => {
    it('matches snapshot with tabs', () => {
      const { container } = render(
        <TabBar
          tabs={[
            { id: 'tab-1', title: 'Tab One' },
            { id: 'tab-2', title: 'Tab Two' },
            { id: 'tab-3', title: 'Tab Three' },
          ]}
          activeTabId="tab-1"
          onSelectTab={noop}
          onCloseTab={noop}
          onNewTab={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with no tabs (returns null)', () => {
      const { container } = render(
        <TabBar
          tabs={[]}
          activeTabId={null}
          onSelectTab={noop}
          onCloseTab={noop}
          onNewTab={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Settings', () => {
    it('matches snapshot when open', () => {
      const { container } = render(
        <Settings
          isOpen={true}
          onClose={noop}
          settings={sampleSettings}
          onSave={noop}
          themeMode="dark"
          onThemeChange={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when closed (returns null)', () => {
      const { container } = render(
        <Settings
          isOpen={false}
          onClose={noop}
          settings={sampleSettings}
          onSave={noop}
          themeMode="light"
          onThemeChange={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('WelcomeScreen', () => {
    it('matches snapshot', () => {
      const { container } = render(
        <WelcomeScreen onPromptClick={noop} />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('ConfirmDialog', () => {
    it('matches snapshot for danger variant', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          title="삭제 확인"
          message="정말 삭제하시겠습니까?"
          variant="danger"
          onConfirm={noop}
          onCancel={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot for warning variant', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          title="경고"
          message="변경사항이 손실됩니다."
          variant="warning"
          confirmLabel="계속"
          cancelLabel="돌아가기"
          onConfirm={noop}
          onCancel={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when closed (returns null)', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={false}
          title="Hidden"
          message="Not visible"
          onConfirm={noop}
          onCancel={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Toast', () => {
    it('matches snapshot with multiple toasts', () => {
      const { container } = render(
        <Toast
          toasts={[
            { id: 'toast-1', type: 'error', message: '오류가 발생했습니다' },
            { id: 'toast-2', type: 'success', message: '저장되었습니다' },
            { id: 'toast-3', type: 'info', message: '업데이트가 있습니다' },
          ]}
          onDismiss={noop}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with no toasts (returns null)', () => {
      const { container } = render(
        <Toast toasts={[]} onDismiss={noop} />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('CommandPalette', () => {
    it('matches snapshot when open with commands', () => {
      const { container } = render(
        <CommandPalette
          isOpen={true}
          onClose={noop}
          commands={[
            { id: 'cmd-1', label: '새 대화', shortcut: 'Ctrl+N', action: noop },
            { id: 'cmd-2', label: '설정 열기', shortcut: 'Ctrl+,', action: noop },
            { id: 'cmd-3', label: '검색', action: noop },
          ]}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when closed (returns null)', () => {
      const { container } = render(
        <CommandPalette
          isOpen={false}
          onClose={noop}
          commands={[]}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Badge', () => {
    it('matches snapshot with count', () => {
      const { container } = render(<Badge count={42} />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with dot variant', () => {
      const { container } = render(
        <Badge dot variant="error">
          <span>Inbox</span>
        </Badge>
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with text and wrapper', () => {
      const { container } = render(
        <Badge text="NEW" variant="primary">
          <button>Messages</button>
        </Badge>
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Tooltip', () => {
    it('matches snapshot (tooltip hidden by default)', () => {
      const { container } = render(
        <Tooltip content="도움말 텍스트" position="top">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with bottom position', () => {
      const { container } = render(
        <Tooltip content="하단 툴팁" position="bottom" delay={0}>
          <span>Target</span>
        </Tooltip>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
