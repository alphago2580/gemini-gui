import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AvatarGroup, { AvatarGroupItem } from './AvatarGroup';

const mockItems: AvatarGroupItem[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' },
  { id: '5', name: 'Eve' },
  { id: '6', name: 'Frank' },
];

describe('AvatarGroup', () => {
  it('renders with role="group"', () => {
    render(<AvatarGroup items={mockItems} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('shows correct aria-label with total count', () => {
    render(<AvatarGroup items={mockItems} />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '6명의 사용자');
  });

  it('shows max 5 avatars by default', () => {
    render(<AvatarGroup items={mockItems} />);
    expect(screen.getByText('A')).toBeInTheDocument(); // Alice
    expect(screen.getByText('B')).toBeInTheDocument(); // Bob
    expect(screen.getByText('C')).toBeInTheDocument(); // Charlie
    expect(screen.getByText('D')).toBeInTheDocument(); // Diana
    expect(screen.getByText('E')).toBeInTheDocument(); // Eve
  });

  it('shows overflow indicator when items exceed max', () => {
    render(<AvatarGroup items={mockItems} />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('overflow has correct aria-label', () => {
    render(<AvatarGroup items={mockItems} />);
    expect(screen.getByTitle('외 1명')).toBeInTheDocument();
  });

  it('respects custom max', () => {
    render(<AvatarGroup items={mockItems} max={3} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('does not show overflow when items fit within max', () => {
    render(<AvatarGroup items={mockItems.slice(0, 3)} />);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('shows title tooltip with name on each avatar', () => {
    render(<AvatarGroup items={[mockItems[0]]} />);
    expect(screen.getByTitle('Alice')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    render(<AvatarGroup items={[mockItems[0]]} size="small" />);
    expect(screen.getByRole('group')).toHaveClass('avatar-group--small');
  });

  it('applies medium size class by default', () => {
    render(<AvatarGroup items={[mockItems[0]]} />);
    expect(screen.getByRole('group')).toHaveClass('avatar-group--medium');
  });

  it('applies large size class', () => {
    render(<AvatarGroup items={[mockItems[0]]} size="large" />);
    expect(screen.getByRole('group')).toHaveClass('avatar-group--large');
  });

  it('uses custom color when provided', () => {
    const items: AvatarGroupItem[] = [
      { id: '1', name: 'Test', color: '#ff0000' },
    ];
    render(<AvatarGroup items={items} />);
    const avatar = screen.getByTitle('Test');
    expect(avatar).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('generates deterministic color from name', () => {
    render(<AvatarGroup items={[mockItems[0]]} />);
    const avatar = screen.getByTitle('Alice');
    expect(avatar.style.backgroundColor).toBeTruthy();
  });

  it('renders empty items without error', () => {
    render(<AvatarGroup items={[]} />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '0명의 사용자');
  });

  it('sets correct z-index ordering (first avatar on top)', () => {
    render(<AvatarGroup items={mockItems.slice(0, 3)} />);
    const alice = screen.getByTitle('Alice');
    const charlie = screen.getByTitle('Charlie');
    expect(Number(alice.style.zIndex)).toBeGreaterThan(Number(charlie.style.zIndex));
  });

  it('renders first character uppercase as initial', () => {
    const items: AvatarGroupItem[] = [
      { id: '1', name: 'lowercase' },
    ];
    render(<AvatarGroup items={items} />);
    expect(screen.getByText('L')).toBeInTheDocument();
  });
});
