import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Sidebar from './Sidebar';

const mockConversations = [
  { id: '1', title: '첫 번째 대화', timestamp: new Date('2024-01-15') },
  { id: '2', title: '두 번째 대화', timestamp: new Date('2024-01-16') },
  { id: '3', title: '세 번째 대화', timestamp: new Date('2024-01-17') },
];

const mockConversationsWithMessages = [
  { id: '1', title: '인사', timestamp: new Date('2024-01-15'), messages: [{ content: 'Hello world' }] },
  { id: '2', title: '질문', timestamp: new Date('2024-01-16'), messages: [{ content: '오늘 날씨 어때?' }] },
  { id: '3', title: 'React 관련', timestamp: new Date('2024-01-17'), messages: [{ content: 'React hooks 설명해줘' }] },
];

describe('Sidebar', () => {
  const defaultProps = {
    onNewChat: vi.fn(),
    onOpenSettings: vi.fn(),
    conversations: [] as Array<{ id: string; title: string; timestamp: Date }>,
    currentConversationId: null as string | null,
    onSelectConversation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with app name', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Gemini GUI')).toBeInTheDocument();
  });

  it('renders new chat button', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('새 대화')).toBeInTheDocument();
  });

  it('renders settings button', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('shows empty state when no conversations', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('대화 기록이 없습니다')).toBeInTheDocument();
  });

  it('renders conversation list when conversations exist', () => {
    render(<Sidebar {...defaultProps} conversations={mockConversations} />);
    expect(screen.getByText('첫 번째 대화')).toBeInTheDocument();
    expect(screen.getByText('두 번째 대화')).toBeInTheDocument();
    expect(screen.getByText('세 번째 대화')).toBeInTheDocument();
  });

  it('does not show empty state when conversations exist', () => {
    render(<Sidebar {...defaultProps} conversations={mockConversations} />);
    expect(screen.queryByText('대화 기록이 없습니다')).not.toBeInTheDocument();
  });

  it('calls onNewChat when new chat button is clicked', () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(screen.getByText('새 대화'));
    expect(defaultProps.onNewChat).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenSettings when settings button is clicked', () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(screen.getByText('설정'));
    expect(defaultProps.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectConversation with correct id when conversation is clicked', () => {
    render(<Sidebar {...defaultProps} conversations={mockConversations} />);
    fireEvent.click(screen.getByText('두 번째 대화'));
    expect(defaultProps.onSelectConversation).toHaveBeenCalledWith('2');
  });

  it('highlights active conversation', () => {
    render(
      <Sidebar
        {...defaultProps}
        conversations={mockConversations}
        currentConversationId="2"
      />
    );
    const activeItem = screen.getByText('두 번째 대화').closest('.conversation-item');
    expect(activeItem).toHaveClass('active');
  });

  it('does not highlight non-active conversations', () => {
    render(
      <Sidebar
        {...defaultProps}
        conversations={mockConversations}
        currentConversationId="2"
      />
    );
    const inactiveItem = screen.getByText('첫 번째 대화').closest('.conversation-item');
    expect(inactiveItem).not.toHaveClass('active');
  });

  it('displays conversation dates', () => {
    render(<Sidebar {...defaultProps} conversations={mockConversations} />);
    // Date format depends on locale, just verify the date elements exist
    const dateElements = document.querySelectorAll('.conversation-time');
    expect(dateElements).toHaveLength(3);
  });

  it('renders conversation history header', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('대화 기록')).toBeInTheDocument();
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('uses <nav> element with aria-label', () => {
      render(<Sidebar {...defaultProps} />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', '사이드바');
    });

    it('new chat button has aria-label', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole('button', { name: '새 대화 시작' })).toBeInTheDocument();
    });

    it('settings button has aria-label', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole('button', { name: '설정 열기' })).toBeInTheDocument();
    });

    it('conversations list has role="list"', () => {
      render(<Sidebar {...defaultProps} conversations={mockConversations} />);
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', '대화 기록 목록');
    });

    it('conversation items have role="listitem" and aria-label', () => {
      render(<Sidebar {...defaultProps} conversations={mockConversations} />);
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveAttribute('aria-label', '대화: 첫 번째 대화');
    });

    it('active conversation has aria-current="true"', () => {
      render(
        <Sidebar
          {...defaultProps}
          conversations={mockConversations}
          currentConversationId="2"
        />
      );
      const activeItem = screen.getByLabelText('대화: 두 번째 대화');
      expect(activeItem).toHaveAttribute('aria-current', 'true');
    });

    it('conversation items are keyboard navigable', () => {
      render(<Sidebar {...defaultProps} conversations={mockConversations} />);
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveAttribute('tabIndex', '0');
    });

    it('conversation items respond to Enter key', () => {
      render(<Sidebar {...defaultProps} conversations={mockConversations} />);
      const item = screen.getByLabelText('대화: 첫 번째 대화');
      fireEvent.keyDown(item, { key: 'Enter' });
      expect(defaultProps.onSelectConversation).toHaveBeenCalledWith('1');
    });

    it('conversation items respond to Space key', () => {
      render(<Sidebar {...defaultProps} conversations={mockConversations} />);
      const item = screen.getByLabelText('대화: 두 번째 대화');
      fireEvent.keyDown(item, { key: ' ' });
      expect(defaultProps.onSelectConversation).toHaveBeenCalledWith('2');
    });

    it('icons are hidden from screen readers', () => {
      const { container } = render(<Sidebar {...defaultProps} />);
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThanOrEqual(2); // + icon and ⚙ icon
    });

    it('search input has aria-label', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole('textbox', { name: '대화 검색' })).toBeInTheDocument();
    });
  });

  // Collapse tests
  describe('Collapse', () => {
    it('renders collapse toggle button when onToggleCollapse is provided', () => {
      render(<Sidebar {...defaultProps} onToggleCollapse={vi.fn()} />);
      expect(screen.getByRole('button', { name: '사이드바 접기' })).toBeInTheDocument();
    });

    it('does not render collapse toggle when onToggleCollapse is not provided', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.queryByRole('button', { name: '사이드바 접기' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '사이드바 펼치기' })).not.toBeInTheDocument();
    });

    it('adds collapsed class when isCollapsed is true', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={vi.fn()} />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('collapsed');
    });

    it('does not add collapsed class when isCollapsed is false', () => {
      render(<Sidebar {...defaultProps} isCollapsed={false} onToggleCollapse={vi.fn()} />);
      const nav = screen.getByRole('navigation');
      expect(nav).not.toHaveClass('collapsed');
    });

    it('calls onToggleCollapse when collapse button is clicked', () => {
      const onToggleCollapse = vi.fn();
      render(<Sidebar {...defaultProps} onToggleCollapse={onToggleCollapse} />);
      fireEvent.click(screen.getByRole('button', { name: '사이드바 접기' }));
      expect(onToggleCollapse).toHaveBeenCalledTimes(1);
    });

    it('hides header title when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={vi.fn()} />);
      expect(screen.queryByText('Gemini GUI')).not.toBeInTheDocument();
    });

    it('shows expand button label when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={vi.fn()} />);
      expect(screen.getByRole('button', { name: '사이드바 펼치기' })).toBeInTheDocument();
    });

    it('hides search input when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={vi.fn()} />);
      expect(screen.queryByPlaceholderText('대화 검색...')).not.toBeInTheDocument();
    });

    it('hides conversations list when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={vi.fn()} conversations={mockConversations} />);
      expect(screen.queryByText('첫 번째 대화')).not.toBeInTheDocument();
    });

    it('hides "새 대화" text but keeps button when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={vi.fn()} />);
      // Button should still exist (by aria-label) but text should be hidden
      expect(screen.getByRole('button', { name: '새 대화 시작' })).toBeInTheDocument();
      expect(screen.queryByText('새 대화')).not.toBeInTheDocument();
    });

    it('hides "설정" text but keeps button when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={vi.fn()} />);
      expect(screen.getByRole('button', { name: '설정 열기' })).toBeInTheDocument();
      expect(screen.queryByText('설정')).not.toBeInTheDocument();
    });
  });

  // Delete conversation tests
  describe('Delete Conversation', () => {
    it('shows delete button on conversation items when onDeleteConversation is provided', () => {
      render(
        <Sidebar
          {...defaultProps}
          conversations={mockConversations}
          onDeleteConversation={vi.fn()}
        />
      );
      const deleteButtons = screen.getAllByRole('button', { name: /대화 삭제:/ });
      expect(deleteButtons).toHaveLength(3);
    });

    it('does not show delete button when onDeleteConversation is not provided', () => {
      render(
        <Sidebar
          {...defaultProps}
          conversations={mockConversations}
        />
      );
      expect(screen.queryByRole('button', { name: /대화 삭제:/ })).not.toBeInTheDocument();
    });

    it('calls onDeleteConversation with correct id when delete button is clicked', async () => {
      const onDeleteConversation = vi.fn();
      const user = userEvent.setup();
      render(
        <Sidebar
          {...defaultProps}
          conversations={mockConversations}
          onDeleteConversation={onDeleteConversation}
        />
      );
      const deleteBtn = screen.getByRole('button', { name: '대화 삭제: 두 번째 대화' });
      await user.click(deleteBtn);
      expect(onDeleteConversation).toHaveBeenCalledWith('2');
    });

    it('does not trigger onSelectConversation when delete button is clicked', async () => {
      const onDeleteConversation = vi.fn();
      const user = userEvent.setup();
      render(
        <Sidebar
          {...defaultProps}
          conversations={mockConversations}
          onDeleteConversation={onDeleteConversation}
        />
      );
      const deleteBtn = screen.getByRole('button', { name: '대화 삭제: 첫 번째 대화' });
      await user.click(deleteBtn);
      expect(onDeleteConversation).toHaveBeenCalledWith('1');
      expect(defaultProps.onSelectConversation).not.toHaveBeenCalled();
    });

    it('delete button has correct aria-label with conversation title', () => {
      render(
        <Sidebar
          {...defaultProps}
          conversations={mockConversations}
          onDeleteConversation={vi.fn()}
        />
      );
      expect(screen.getByRole('button', { name: '대화 삭제: 첫 번째 대화' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '대화 삭제: 두 번째 대화' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '대화 삭제: 세 번째 대화' })).toBeInTheDocument();
    });
  });

  // Search tests
  describe('Search', () => {
    it('renders search input', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByPlaceholderText('대화 검색...')).toBeInTheDocument();
    });

    it('filters conversations by title', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} conversations={mockConversations} />);
      const searchInput = screen.getByPlaceholderText('대화 검색...');
      await user.type(searchInput, '첫 번째');
      expect(screen.getByText('첫 번째 대화')).toBeInTheDocument();
      expect(screen.queryByText('두 번째 대화')).not.toBeInTheDocument();
      expect(screen.queryByText('세 번째 대화')).not.toBeInTheDocument();
    });

    it('filters conversations by message content', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} conversations={mockConversationsWithMessages} />);
      const searchInput = screen.getByPlaceholderText('대화 검색...');
      await user.type(searchInput, 'React');
      expect(screen.getByText('React 관련')).toBeInTheDocument();
      expect(screen.queryByText('인사')).not.toBeInTheDocument();
      expect(screen.queryByText('질문')).not.toBeInTheDocument();
    });

    it('search is case-insensitive', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} conversations={mockConversationsWithMessages} />);
      const searchInput = screen.getByPlaceholderText('대화 검색...');
      await user.type(searchInput, 'hello');
      expect(screen.getByText('인사')).toBeInTheDocument();
    });

    it('shows "검색 결과가 없습니다" when no match', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} conversations={mockConversations} />);
      const searchInput = screen.getByPlaceholderText('대화 검색...');
      await user.type(searchInput, 'zzzzzzz');
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    });

    it('shows all conversations when search is empty', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} conversations={mockConversations} />);
      const searchInput = screen.getByPlaceholderText('대화 검색...');
      await user.type(searchInput, '첫');
      expect(screen.queryByText('두 번째 대화')).not.toBeInTheDocument();
      await user.clear(searchInput);
      expect(screen.getByText('첫 번째 대화')).toBeInTheDocument();
      expect(screen.getByText('두 번째 대화')).toBeInTheDocument();
      expect(screen.getByText('세 번째 대화')).toBeInTheDocument();
    });

    it('shows "대화 기록이 없습니다" when no conversations and no search query', () => {
      render(<Sidebar {...defaultProps} conversations={[]} />);
      expect(screen.getByText('대화 기록이 없습니다')).toBeInTheDocument();
    });
  });
});
