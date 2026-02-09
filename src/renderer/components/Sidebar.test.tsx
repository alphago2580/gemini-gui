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
});
