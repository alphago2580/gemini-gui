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

  it('navigates with ArrowDown and selects second result with Enter', () => {
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
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onNavigateToResult).toHaveBeenCalledWith('1', 1);
  });

  it('ArrowUp does not go below zero', () => {
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
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should stay at index 0
    expect(onNavigateToResult).toHaveBeenCalledWith('1', 0);
  });

  it('ArrowDown does not exceed results length', () => {
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
    // 2 results: ArrowDown twice to go past end
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should clamp to last item index 1
    expect(onNavigateToResult).toHaveBeenCalledWith('1', 1);
  });

  it('does not call onNavigateToResult on Enter with no results', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onNavigateToResult).not.toHaveBeenCalled();
  });

  it('resets selectedIndex when query changes', () => {
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
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // go to index 1
    // Change query: selectedIndex should reset to 0
    fireEvent.change(input, { target: { value: 'TypeScript' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onNavigateToResult).toHaveBeenCalledWith('2', 0);
  });

  it('does not show count when query is empty', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    expect(document.querySelector('.message-search-count')).not.toBeInTheDocument();
  });

  it('does not show empty state when query is empty', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
  });

  it('does not propagate click from panel to overlay', () => {
    render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const panel = document.querySelector('.message-search-panel')!;
    fireEvent.click(panel);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('mouseEnter on result item updates selected index', () => {
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

    const options = screen.getAllByRole('option');
    fireEvent.mouseEnter(options[1]);
    // Now Enter should navigate to the second result
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigateToResult).toHaveBeenCalledWith('1', 1);
  });

  it('highlights matching text with <mark> elements', () => {
    const { container } = render(
      <MessageSearch
        isOpen={true}
        onClose={onClose}
        conversations={conversations}
        onNavigateToResult={onNavigateToResult}
      />
    );
    const input = screen.getByPlaceholderText('전체 대화 내용 검색...');
    fireEvent.change(input, { target: { value: 'React' } });

    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
  });

  it('has correct aria-selected on result items', () => {
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

    const options = screen.getAllByRole('option');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-selected')).toBe('false');
  });
});
