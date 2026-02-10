import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageSearch from './MessageSearch';
import React from 'react';

const conversations = [
  {
    id: '1',
    title: 'React 대화',
    messages: [
      { role: 'user' as const, content: 'React hooks에 대해 알려줘' },
      { role: 'assistant' as const, content: 'React hooks는 함수 컴포넌트에서 사용합니다' },
    ],
  },
  {
    id: '2',
    title: 'TypeScript 질문',
    messages: [
      { role: 'user' as const, content: 'TypeScript 제네릭 설명' },
    ],
  },
];

describe('MessageSearch Component', () => {
  const onClose = vi.fn();
  const onNavigateToResult = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    render(
      <MessageSearch
        isOpen={false}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    expect(screen.queryByLabelText('메시지 검색')).not.toBeInTheDocument();
  });

  it('renders search input when open', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    expect(screen.getByPlaceholderText('전체 대화 내용 검색...')).toBeInTheDocument();
  });

  it('shows search results when typing', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.change(input, { target: { value: 'React' } });

    expect(screen.getByText('2개 결과')).toBeInTheDocument();
    expect(screen.getAllByText('React 대화')).toHaveLength(2);
  });

  it('shows empty state when no results', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.change(input, { target: { value: 'Python' } });

    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to result on Enter key', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onNavigateToResult).toHaveBeenCalledWith('1', 0);
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates to result on click', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.change(input, { target: { value: 'TypeScript' } });

    const resultItem = screen.getByText('TypeScript 질문');
    fireEvent.click(resultItem.closest('.search-result-item')!);

    expect(onNavigateToResult).toHaveBeenCalledWith('2', 0);
  });

  it('closes when clicking overlay', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const overlay = document.querySelector('.message-search-overlay')!;
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows result count', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.change(input, { target: { value: 'TypeScript' } });

    expect(screen.getByText('1개 결과')).toBeInTheDocument();
  });

  it('shows role labels in results', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.change(input, { target: { value: 'React' } });

    expect(screen.getByText('사용자')).toBeInTheDocument();
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });
});
