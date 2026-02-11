import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SessionIndicator from './SessionIndicator';
import type { SessionStatus } from './SessionIndicator';

describe('SessionIndicator', () => {
  it('renders idle status', () => {
    render(<SessionIndicator status="idle" />);
    expect(screen.getByText('대기 중')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '세션 상태: 대기 중');
  });

  it('renders connecting status', () => {
    render(<SessionIndicator status="connecting" />);
    expect(screen.getByText('연결 중...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '세션 상태: 연결 중...');
  });

  it('renders connected status', () => {
    render(<SessionIndicator status="connected" />);
    expect(screen.getByText('연결됨')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '세션 상태: 연결됨');
  });

  it('renders error status', () => {
    render(<SessionIndicator status="error" />);
    expect(screen.getByText('연결 오류')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '세션 상태: 연결 오류');
  });

  it('applies correct CSS class for each status', () => {
    const statuses: SessionStatus[] = ['idle', 'connecting', 'connected', 'error'];
    statuses.forEach(status => {
      const { unmount } = render(<SessionIndicator status={status} />);
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass(`session-${status}`);
      unmount();
    });
  });

  it('has role="status" for accessibility', () => {
    render(<SessionIndicator status="idle" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('dot element is hidden from screen readers', () => {
    const { container } = render(<SessionIndicator status="idle" />);
    const dot = container.querySelector('.session-dot');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('has title tooltip matching status', () => {
    render(<SessionIndicator status="connected" />);
    expect(screen.getByRole('status')).toHaveAttribute('title', '연결됨');
  });

  it('has session-indicator base CSS class', () => {
    const { container } = render(<SessionIndicator status="idle" />);
    expect(container.querySelector('.session-indicator')).toBeInTheDocument();
  });

  it('session-dot is a span element', () => {
    const { container } = render(<SessionIndicator status="idle" />);
    const dot = container.querySelector('.session-dot');
    expect(dot?.tagName).toBe('SPAN');
  });

  it('session-text is a span element', () => {
    const { container } = render(<SessionIndicator status="connected" />);
    const text = container.querySelector('.session-text');
    expect(text?.tagName).toBe('SPAN');
  });

  it('session-text contains label text', () => {
    const { container } = render(<SessionIndicator status="error" />);
    const text = container.querySelector('.session-text');
    expect(text?.textContent).toBe('연결 오류');
  });

  it('title tooltip for idle matches label', () => {
    render(<SessionIndicator status="idle" />);
    expect(screen.getByRole('status')).toHaveAttribute('title', '대기 중');
  });

  it('title tooltip for connecting matches label', () => {
    render(<SessionIndicator status="connecting" />);
    expect(screen.getByRole('status')).toHaveAttribute('title', '연결 중...');
  });

  it('title tooltip for error matches label', () => {
    render(<SessionIndicator status="error" />);
    expect(screen.getByRole('status')).toHaveAttribute('title', '연결 오류');
  });

  it('root element is a div', () => {
    const { container } = render(<SessionIndicator status="idle" />);
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('DIV');
  });
});
