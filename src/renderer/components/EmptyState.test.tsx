import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  // --- Rendering ---

  it('renders title', () => {
    render(<EmptyState title="데이터가 없습니다" />);
    expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<EmptyState title="빈 목록" description="항목을 추가해보세요." />);
    expect(screen.getByText('항목을 추가해보세요.')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<EmptyState title="빈 목록" icon="📭" />);
    expect(screen.getByText('📭')).toBeInTheDocument();
  });

  it('does not render icon when not provided', () => {
    const { container } = render(<EmptyState title="빈 목록" />);
    expect(container.querySelector('.empty-state-icon')).not.toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="빈 목록" />);
    expect(container.querySelector('.empty-state-description')).not.toBeInTheDocument();
  });

  it('renders with role="status"', () => {
    render(<EmptyState title="빈 목록" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('icon is aria-hidden', () => {
    const { container } = render(<EmptyState title="빈 목록" icon="📭" />);
    const icon = container.querySelector('.empty-state-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Actions ---

  it('renders action buttons', () => {
    const actions = [
      { id: 'add', label: '추가하기', onClick: vi.fn() },
      { id: 'import', label: '가져오기', onClick: vi.fn() },
    ];
    render(<EmptyState title="빈 목록" actions={actions} />);
    expect(screen.getByText('추가하기')).toBeInTheDocument();
    expect(screen.getByText('가져오기')).toBeInTheDocument();
  });

  it('calls action onClick when clicked', () => {
    const onClick = vi.fn();
    const actions = [{ id: 'add', label: '추가', onClick }];
    render(<EmptyState title="빈 목록" actions={actions} />);
    fireEvent.click(screen.getByText('추가'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render actions when no actions', () => {
    const { container } = render(<EmptyState title="빈 목록" />);
    expect(container.querySelector('.empty-state-actions')).not.toBeInTheDocument();
  });

  it('applies primary variant to action by default', () => {
    const actions = [{ id: 'add', label: '추가', onClick: vi.fn() }];
    const { container } = render(<EmptyState title="빈 목록" actions={actions} />);
    expect(container.querySelector('.empty-state-action-primary')).toBeInTheDocument();
  });

  it('applies secondary variant to action', () => {
    const actions = [{ id: 'cancel', label: '취소', onClick: vi.fn(), variant: 'secondary' as const }];
    const { container } = render(<EmptyState title="빈 목록" actions={actions} />);
    expect(container.querySelector('.empty-state-action-secondary')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size', () => {
    const { container } = render(<EmptyState title="빈 목록" size="small" />);
    expect(container.querySelector('.empty-state-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<EmptyState title="빈 목록" />);
    expect(container.querySelector('.empty-state-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = render(<EmptyState title="빈 목록" size="large" />);
    expect(container.querySelector('.empty-state-large')).toBeInTheDocument();
  });

  // --- Children ---

  it('renders custom children', () => {
    render(
      <EmptyState title="빈 목록">
        <p>추가 설명</p>
      </EmptyState>
    );
    expect(screen.getByText('추가 설명')).toBeInTheDocument();
  });

  it('does not render content wrapper when no children', () => {
    const { container } = render(<EmptyState title="빈 목록" />);
    expect(container.querySelector('.empty-state-content')).not.toBeInTheDocument();
  });

  // --- Full combination ---

  it('renders all parts together', () => {
    const actions = [{ id: 'add', label: '새 대화 시작', onClick: vi.fn() }];
    render(
      <EmptyState
        icon="💬"
        title="대화가 없습니다"
        description="Gemini와 새로운 대화를 시작해보세요."
        actions={actions}
      />
    );
    expect(screen.getByText('💬')).toBeInTheDocument();
    expect(screen.getByText('대화가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('Gemini와 새로운 대화를 시작해보세요.')).toBeInTheDocument();
    expect(screen.getByText('새 대화 시작')).toBeInTheDocument();
  });
});
