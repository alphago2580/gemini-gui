import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Sidebar from './Sidebar';

const mockConversations = [
  { id: '1', title: '첫 번째 대화', timestamp: new Date('2024-01-15') },
  { id: '2', title: '두 번째 대화', timestamp: new Date('2024-01-16') },
  { id: '3', title: '세 번째 대화', timestamp: new Date('2024-01-17') },
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
  });
});
