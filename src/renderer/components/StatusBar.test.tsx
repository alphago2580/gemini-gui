import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBar from './StatusBar';

describe('StatusBar', () => {
  it('renders with role="status" and aria-label', () => {
    render(<StatusBar sessionStatus="idle" />);
    const bar = screen.getByRole('status');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-label', '상태 표시줄');
  });

  it('renders status-bar CSS class', () => {
    const { container } = render(<StatusBar sessionStatus="idle" />);
    expect(container.querySelector('.status-bar')).toBeInTheDocument();
  });

  // --- Session status ---

  it('shows idle session status', () => {
    render(<StatusBar sessionStatus="idle" />);
    expect(screen.getByText('대기 중')).toBeInTheDocument();
  });

  it('shows connecting session status', () => {
    render(<StatusBar sessionStatus="connecting" />);
    expect(screen.getByText('연결 중...')).toBeInTheDocument();
  });

  it('shows connected session status', () => {
    render(<StatusBar sessionStatus="connected" />);
    expect(screen.getByText('연결됨')).toBeInTheDocument();
  });

  it('shows error session status', () => {
    render(<StatusBar sessionStatus="error" />);
    expect(screen.getByText('연결 오류')).toBeInTheDocument();
  });

  it('renders session status dot with correct class for idle', () => {
    const { container } = render(<StatusBar sessionStatus="idle" />);
    const dot = container.querySelector('.status-bar-dot');
    expect(dot).toHaveClass('status-bar-dot--idle');
  });

  it('renders session status dot with correct class for connecting', () => {
    const { container } = render(<StatusBar sessionStatus="connecting" />);
    const dot = container.querySelector('.status-bar-dot');
    expect(dot).toHaveClass('status-bar-dot--connecting');
  });

  it('renders session status dot with correct class for connected', () => {
    const { container } = render(<StatusBar sessionStatus="connected" />);
    const dot = container.querySelector('.status-bar-dot');
    expect(dot).toHaveClass('status-bar-dot--connected');
  });

  it('renders session status dot with correct class for error', () => {
    const { container } = render(<StatusBar sessionStatus="error" />);
    const dot = container.querySelector('.status-bar-dot');
    expect(dot).toHaveClass('status-bar-dot--error');
  });

  it('session dot has aria-hidden', () => {
    const { container } = render(<StatusBar sessionStatus="idle" />);
    const dot = container.querySelector('.status-bar-dot');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Model display ---

  it('shows model name when provided', () => {
    render(<StatusBar sessionStatus="connected" model="gemini-2.0-flash" />);
    expect(screen.getByText('gemini-2.0-flash')).toBeInTheDocument();
  });

  it('does not show model section when model is not provided', () => {
    render(<StatusBar sessionStatus="idle" />);
    expect(screen.queryByText('gemini-2.0-flash')).not.toBeInTheDocument();
  });

  it('model item has title with label prefix', () => {
    render(<StatusBar sessionStatus="idle" model="gemini-pro" />);
    const modelItem = screen.getByText('gemini-pro').closest('.status-bar-item');
    expect(modelItem).toHaveAttribute('title', '모델: gemini-pro');
  });

  // --- Token usage ---

  it('shows total tokens when provided', () => {
    render(<StatusBar sessionStatus="idle" totalTokens={1500} />);
    expect(screen.getByText('토큰: 1,500')).toBeInTheDocument();
  });

  it('does not show tokens section when totalTokens is not provided', () => {
    render(<StatusBar sessionStatus="idle" />);
    expect(screen.queryByText(/토큰:/)).not.toBeInTheDocument();
  });

  it('shows zero tokens', () => {
    render(<StatusBar sessionStatus="idle" totalTokens={0} />);
    expect(screen.getByText('토큰: 0')).toBeInTheDocument();
  });

  it('formats large token numbers with locale separators', () => {
    render(<StatusBar sessionStatus="idle" totalTokens={123456} />);
    expect(screen.getByText('토큰: 123,456')).toBeInTheDocument();
  });

  // --- Cursor position ---

  it('shows cursor position when line and col are provided', () => {
    render(<StatusBar sessionStatus="idle" cursorLine={5} cursorCol={12} />);
    expect(screen.getByText('Ln 5, Col 12')).toBeInTheDocument();
  });

  it('does not show cursor position when only line is provided', () => {
    render(<StatusBar sessionStatus="idle" cursorLine={5} />);
    expect(screen.queryByText(/Ln/)).not.toBeInTheDocument();
  });

  it('does not show cursor position when only col is provided', () => {
    render(<StatusBar sessionStatus="idle" cursorCol={12} />);
    expect(screen.queryByText(/Col/)).not.toBeInTheDocument();
  });

  // --- Encoding ---

  it('shows default encoding UTF-8', () => {
    render(<StatusBar sessionStatus="idle" />);
    expect(screen.getByText('UTF-8')).toBeInTheDocument();
  });

  it('shows custom encoding', () => {
    render(<StatusBar sessionStatus="idle" encoding="EUC-KR" />);
    expect(screen.getByText('EUC-KR')).toBeInTheDocument();
  });

  // --- Layout ---

  it('renders left and right sections', () => {
    const { container } = render(<StatusBar sessionStatus="idle" />);
    expect(container.querySelector('.status-bar-left')).toBeInTheDocument();
    expect(container.querySelector('.status-bar-right')).toBeInTheDocument();
  });

  it('session indicator is in the left section', () => {
    const { container } = render(<StatusBar sessionStatus="idle" />);
    const left = container.querySelector('.status-bar-left');
    expect(left?.querySelector('.status-bar-session')).toBeInTheDocument();
  });

  // --- Children ---

  it('renders children in the left section', () => {
    const { container } = render(
      <StatusBar sessionStatus="idle">
        <span data-testid="custom-item">Custom</span>
      </StatusBar>
    );
    const left = container.querySelector('.status-bar-left');
    expect(left?.querySelector('[data-testid="custom-item"]')).toBeInTheDocument();
  });

  // --- Multiple props combined ---

  it('renders all sections when all props are provided', () => {
    render(
      <StatusBar
        sessionStatus="connected"
        model="gemini-pro"
        totalTokens={2500}
        cursorLine={10}
        cursorCol={25}
      />
    );

    expect(screen.getByText('연결됨')).toBeInTheDocument();
    expect(screen.getByText('gemini-pro')).toBeInTheDocument();
    expect(screen.getByText('토큰: 2,500')).toBeInTheDocument();
    expect(screen.getByText('Ln 10, Col 25')).toBeInTheDocument();
    expect(screen.getByText('UTF-8')).toBeInTheDocument();
  });

  it('renders minimal state with only required props', () => {
    const { container } = render(<StatusBar sessionStatus="idle" />);
    // Should have at least session and encoding
    expect(screen.getByText('대기 중')).toBeInTheDocument();
    expect(screen.getByText('UTF-8')).toBeInTheDocument();
    // Should not have model or tokens
    const items = container.querySelectorAll('.status-bar-item');
    // Session (left) + idle indicator (left) + encoding (right) = at minimum 3
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('session title attribute shows status label', () => {
    const { container } = render(<StatusBar sessionStatus="connected" />);
    const sessionItem = container.querySelector('.status-bar-session');
    expect(sessionItem).toHaveAttribute('title', '연결됨');
  });

  // --- Token history sparkline ---

  it('renders sparkline when tokenHistory has 2+ data points', () => {
    const { container } = render(
      <StatusBar sessionStatus="idle" totalTokens={300} tokenHistory={[100, 200, 300]} />
    );
    expect(container.querySelector('.sparkline')).toBeInTheDocument();
  });

  it('does not render sparkline when tokenHistory has fewer than 2 points', () => {
    const { container } = render(
      <StatusBar sessionStatus="idle" totalTokens={100} tokenHistory={[100]} />
    );
    expect(container.querySelector('.sparkline')).not.toBeInTheDocument();
  });

  it('does not render sparkline when tokenHistory is not provided', () => {
    const { container } = render(
      <StatusBar sessionStatus="idle" totalTokens={100} />
    );
    expect(container.querySelector('.sparkline')).not.toBeInTheDocument();
  });

  it('sparkline has correct aria-label', () => {
    render(
      <StatusBar sessionStatus="idle" totalTokens={300} tokenHistory={[100, 200, 300]} />
    );
    expect(screen.getByLabelText('토큰 사용 추이')).toBeInTheDocument();
  });

  it('sparkline is inside the tokens section', () => {
    const { container } = render(
      <StatusBar sessionStatus="idle" totalTokens={300} tokenHistory={[100, 200, 300]} />
    );
    const tokensItem = container.querySelector('.status-bar-tokens');
    expect(tokensItem).toBeInTheDocument();
    expect(tokensItem?.querySelector('.sparkline')).toBeInTheDocument();
  });

  // --- User idle indicator ---

  it('shows active status by default when isUserIdle is not provided', () => {
    render(<StatusBar sessionStatus="idle" />);
    expect(screen.getByText('활성')).toBeInTheDocument();
  });

  it('shows active status when isUserIdle is false', () => {
    render(<StatusBar sessionStatus="idle" isUserIdle={false} />);
    expect(screen.getByText('활성')).toBeInTheDocument();
  });

  it('shows idle status when isUserIdle is true', () => {
    render(<StatusBar sessionStatus="idle" isUserIdle={true} />);
    expect(screen.getByText('자리 비움')).toBeInTheDocument();
  });

  it('renders active-user dot class when not idle', () => {
    const { container } = render(<StatusBar sessionStatus="idle" isUserIdle={false} />);
    const dot = container.querySelector('.status-bar-dot--active-user');
    expect(dot).toBeInTheDocument();
  });

  it('renders idle-user dot class when idle', () => {
    const { container } = render(<StatusBar sessionStatus="idle" isUserIdle={true} />);
    const dot = container.querySelector('.status-bar-dot--idle-user');
    expect(dot).toBeInTheDocument();
  });

  it('idle indicator dot has aria-hidden', () => {
    const { container } = render(<StatusBar sessionStatus="idle" isUserIdle={true} />);
    const dot = container.querySelector('.status-bar-dot--idle-user');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('idle indicator has title attribute matching label', () => {
    const { container } = render(<StatusBar sessionStatus="idle" isUserIdle={true} />);
    const dots = container.querySelectorAll('.status-bar-dot');
    // Second dot is the idle indicator
    const idleDot = dots[1];
    const idleItem = idleDot?.closest('.status-bar-item');
    expect(idleItem).toHaveAttribute('title', '자리 비움');
  });

  it('active indicator has title attribute matching label', () => {
    const { container } = render(<StatusBar sessionStatus="idle" isUserIdle={false} />);
    const dot = container.querySelector('.status-bar-dot--active-user');
    const item = dot?.closest('.status-bar-item');
    expect(item).toHaveAttribute('title', '활성');
  });
});
