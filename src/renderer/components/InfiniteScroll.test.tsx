import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import InfiniteScroll from './InfiniteScroll';

const mockOnLoadMore = vi.fn();
const mockOnRetry = vi.fn();

beforeEach(() => {
  mockOnLoadMore.mockReset();
  mockOnRetry.mockReset();
  mockOnLoadMore.mockResolvedValue(undefined);
});

function renderScroll(props: Partial<React.ComponentProps<typeof InfiniteScroll>> = {}) {
  return render(
    <InfiniteScroll
      onLoadMore={mockOnLoadMore}
      hasMore={true}
      {...props}
    >
      <div data-testid="item-1">Item 1</div>
      <div data-testid="item-2">Item 2</div>
      <div data-testid="item-3">Item 3</div>
    </InfiniteScroll>
  );
}

function setScrollProps(
  el: HTMLElement,
  opts: { scrollHeight: number; scrollTop: number; clientHeight: number }
) {
  Object.defineProperty(el, 'scrollHeight', { value: opts.scrollHeight, configurable: true });
  Object.defineProperty(el, 'scrollTop', { value: opts.scrollTop, configurable: true, writable: true });
  Object.defineProperty(el, 'clientHeight', { value: opts.clientHeight, configurable: true });
}

describe('InfiniteScroll', () => {
  // --- Rendering ---

  it('renders children', () => {
    renderScroll();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();
  });

  it('renders with feed role', () => {
    renderScroll();
    expect(screen.getByRole('feed')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    renderScroll();
    expect(screen.getByRole('feed')).toHaveAttribute('aria-label', '무한 스크롤 목록');
  });

  it('accepts custom aria-label', () => {
    renderScroll({ ariaLabel: '메시지 목록' });
    expect(screen.getByRole('feed')).toHaveAttribute('aria-label', '메시지 목록');
  });

  it('applies custom className', () => {
    renderScroll({ className: 'my-custom-class' });
    expect(screen.getByRole('feed')).toHaveClass('infinite-scroll', 'my-custom-class');
  });

  it('applies infinite-scroll-up class for up direction', () => {
    renderScroll({ direction: 'up' });
    expect(screen.getByRole('feed')).toHaveClass('infinite-scroll-up');
  });

  // --- Loading state ---

  it('shows default loader when loading', () => {
    renderScroll({ loading: true });
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('shows custom loader when loading', () => {
    renderScroll({ loading: true, loader: <div data-testid="custom-loader">Loading...</div> });
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
  });

  it('sets aria-busy when loading', () => {
    renderScroll({ loading: true });
    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not show loader when not loading', () => {
    renderScroll({ loading: false });
    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
  });

  // --- End state ---

  it('shows default end message when no more items', () => {
    renderScroll({ hasMore: false });
    expect(screen.getByText('모든 항목을 불러왔습니다')).toBeInTheDocument();
  });

  it('shows custom end message when no more items', () => {
    renderScroll({
      hasMore: false,
      endMessage: <div data-testid="custom-end">No more!</div>,
    });
    expect(screen.getByTestId('custom-end')).toBeInTheDocument();
  });

  it('does not show end message when hasMore is true', () => {
    renderScroll({ hasMore: true });
    expect(screen.queryByText('모든 항목을 불러왔습니다')).not.toBeInTheDocument();
  });

  // --- Error state ---

  it('shows default error message when error', () => {
    renderScroll({ error: true });
    expect(screen.getByText('불러오기에 실패했습니다')).toBeInTheDocument();
  });

  it('shows custom error message when error', () => {
    renderScroll({
      error: true,
      errorMessage: <div data-testid="custom-error">Error!</div>,
    });
    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
  });

  it('shows retry button when error and onRetry provided', () => {
    renderScroll({ error: true, onRetry: mockOnRetry });
    const retryBtn = screen.getByRole('button', { name: '다시 시도' });
    expect(retryBtn).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    renderScroll({ error: true, onRetry: mockOnRetry });
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when no onRetry', () => {
    renderScroll({ error: true });
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });

  it('error message has alert role', () => {
    renderScroll({ error: true });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // --- Scroll down behavior ---

  it('calls onLoadMore when scrolled near bottom', async () => {
    renderScroll({ threshold: 50 });
    const container = screen.getByRole('feed');
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 920, clientHeight: 100 });

    await act(async () => {
      fireEvent.scroll(container);
    });

    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onLoadMore when not near bottom', async () => {
    renderScroll({ threshold: 50 });
    const container = screen.getByRole('feed');
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 100, clientHeight: 100 });

    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when loading', async () => {
    renderScroll({ threshold: 50, loading: true });
    const container = screen.getByRole('feed');
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 920, clientHeight: 100 });

    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when hasMore is false', async () => {
    renderScroll({ threshold: 50, hasMore: false });
    const container = screen.getByRole('feed');
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 920, clientHeight: 100 });

    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when error', async () => {
    renderScroll({ threshold: 50, error: true });
    const container = screen.getByRole('feed');
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 920, clientHeight: 100 });

    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });

  // --- Scroll up behavior ---

  it('calls onLoadMore when scrolled near top (direction=up)', async () => {
    renderScroll({ direction: 'up', threshold: 50 });
    const container = screen.getByRole('feed');
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 30, clientHeight: 100 });

    await act(async () => {
      fireEvent.scroll(container);
    });

    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onLoadMore when not near top (direction=up)', async () => {
    renderScroll({ direction: 'up', threshold: 50 });
    const container = screen.getByRole('feed');
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 500, clientHeight: 100 });

    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });

  // --- Direction-specific status placement ---

  it('renders loader after children in down direction', () => {
    const { container } = render(
      <InfiniteScroll onLoadMore={mockOnLoadMore} hasMore={true} loading={true} direction="down">
        <div data-testid="content">Content</div>
      </InfiniteScroll>
    );
    const feed = container.querySelector('.infinite-scroll')!;
    const contentIdx = Array.from(feed.children).findIndex(
      c => (c as HTMLElement).dataset.testid === 'content'
    );
    const loaderIdx = Array.from(feed.children).findIndex(
      c => c.classList.contains('infinite-scroll-loader')
    );
    expect(contentIdx).toBeLessThan(loaderIdx);
  });

  it('renders loader before children in up direction', () => {
    const { container } = render(
      <InfiniteScroll onLoadMore={mockOnLoadMore} hasMore={true} loading={true} direction="up">
        <div data-testid="content">Content</div>
      </InfiniteScroll>
    );
    const feed = container.querySelector('.infinite-scroll')!;
    const contentIdx = Array.from(feed.children).findIndex(
      c => (c as HTMLElement).dataset.testid === 'content'
    );
    const loaderIdx = Array.from(feed.children).findIndex(
      c => c.classList.contains('infinite-scroll-loader')
    );
    expect(loaderIdx).toBeLessThan(contentIdx);
  });

  // --- Default threshold ---

  it('uses default threshold of 100', async () => {
    renderScroll();
    const container = screen.getByRole('feed');
    // 100 pixels from bottom: scrollHeight(1000) - scrollTop(800) - clientHeight(100) = 100
    setScrollProps(container, { scrollHeight: 1000, scrollTop: 800, clientHeight: 100 });

    await act(async () => {
      fireEvent.scroll(container);
    });

    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  // --- Loader spinner accessibility ---

  it('spinner is aria-hidden', () => {
    renderScroll({ loading: true });
    const spinner = document.querySelector('.infinite-scroll-spinner');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('loader has status role', () => {
    renderScroll({ loading: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // --- aria-busy ---

  it('aria-busy is false when not loading', () => {
    renderScroll({ loading: false });
    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'false');
  });
});
