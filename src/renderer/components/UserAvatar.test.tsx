import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import UserAvatar from './UserAvatar';
import type { AvatarRole } from './UserAvatar';

describe('UserAvatar', () => {
  it('renders user avatar with default icon', () => {
    render(<UserAvatar role="user" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('renders assistant avatar with star icon', () => {
    render(<UserAvatar role="assistant" />);
    expect(screen.getByText('✦')).toBeInTheDocument();
  });

  it('renders system avatar with gear icon', () => {
    render(<UserAvatar role="system" />);
    expect(screen.getByText('⚙')).toBeInTheDocument();
  });

  it('has correct aria-label for user role', () => {
    render(<UserAvatar role="user" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '사용자');
  });

  it('has correct aria-label for assistant role', () => {
    render(<UserAvatar role="assistant" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'AI 어시스턴트');
  });

  it('has correct aria-label for system role', () => {
    render(<UserAvatar role="system" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '시스템');
  });

  it('uses custom name as aria-label', () => {
    render(<UserAvatar role="user" name="Alice" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Alice');
  });

  it('shows initial when user has custom name', () => {
    render(<UserAvatar role="user" name="Bob" />);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('👤')).not.toBeInTheDocument();
  });

  it('shows icon for assistant even with custom name', () => {
    render(<UserAvatar role="assistant" name="Gemini" />);
    expect(screen.getByText('✦')).toBeInTheDocument();
    expect(screen.queryByText('G')).not.toBeInTheDocument();
  });

  it('has title attribute with display name', () => {
    render(<UserAvatar role="user" name="Charlie" />);
    expect(screen.getByRole('img')).toHaveAttribute('title', 'Charlie');
  });

  it('applies correct CSS class for user role', () => {
    const { container } = render(<UserAvatar role="user" />);
    expect(container.querySelector('.avatar--user')).toBeInTheDocument();
  });

  it('applies correct CSS class for assistant role', () => {
    const { container } = render(<UserAvatar role="assistant" />);
    expect(container.querySelector('.avatar--assistant')).toBeInTheDocument();
  });

  it('applies correct CSS class for system role', () => {
    const { container } = render(<UserAvatar role="system" />);
    expect(container.querySelector('.avatar--system')).toBeInTheDocument();
  });

  it('defaults to medium size', () => {
    const { container } = render(<UserAvatar role="user" />);
    expect(container.querySelector('.avatar--medium')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(<UserAvatar role="user" size="small" />);
    expect(container.querySelector('.avatar--small')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<UserAvatar role="user" size="large" />);
    expect(container.querySelector('.avatar--large')).toBeInTheDocument();
  });

  it('renders all three roles with correct classes', () => {
    const roles: AvatarRole[] = ['user', 'assistant', 'system'];
    roles.forEach(role => {
      const { container, unmount } = render(<UserAvatar role={role} />);
      expect(container.querySelector(`.avatar--${role}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('uppercases the initial letter', () => {
    render(<UserAvatar role="user" name="dave" />);
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
