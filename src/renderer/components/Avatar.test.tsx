import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Avatar from './Avatar';

describe('Avatar', () => {
  // -- Rendering --
  it('renders with role="img" by default', () => {
    render(<Avatar />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders default avatar icon when no props', () => {
    render(<Avatar />);
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="User" />);
    const img = screen.getByAltText('User');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveClass('avatar-image');
  });

  it('renders initials from single word name', () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders initials from multi-word name', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders initials from three-word name', () => {
    render(<Avatar name="John Michael Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<Avatar icon={<span data-testid="custom-icon">🎨</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders custom fallback', () => {
    render(<Avatar fallback={<span data-testid="fallback">?</span>} />);
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('prefers image over initials', () => {
    render(<Avatar src="photo.jpg" name="John" />);
    expect(screen.queryByText('JO')).not.toBeInTheDocument();
  });

  it('falls back to initials on image error', () => {
    render(<Avatar src="bad.jpg" name="Alice" />);
    const img = screen.getByAltText('Alice');
    fireEvent.error(img);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('prefers icon over initials', () => {
    render(<Avatar name="John" icon={<span>📧</span>} />);
    expect(screen.queryByText('JO')).not.toBeInTheDocument();
    expect(screen.getByText('📧')).toBeInTheDocument();
  });

  it('applies custom id', () => {
    render(<Avatar id="my-avatar" />);
    expect(screen.getByRole('img')).toHaveAttribute('id', 'my-avatar');
  });

  // -- ARIA --
  it('has default aria-label', () => {
    render(<Avatar />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '아바타');
  });

  it('uses alt for aria-label', () => {
    render(<Avatar alt="프로필 사진" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '프로필 사진');
  });

  it('uses name for aria-label when no alt', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'John Doe');
  });

  // -- Sizes --
  it('applies medium size by default', () => {
    render(<Avatar />);
    expect(screen.getByRole('img')).toHaveClass('avatar--medium');
  });

  it('applies xs size', () => {
    render(<Avatar size="xs" />);
    expect(screen.getByRole('img')).toHaveClass('avatar--xs');
  });

  it('applies small size', () => {
    render(<Avatar size="small" />);
    expect(screen.getByRole('img')).toHaveClass('avatar--small');
  });

  it('applies large size', () => {
    render(<Avatar size="large" />);
    expect(screen.getByRole('img')).toHaveClass('avatar--large');
  });

  it('applies xl size', () => {
    render(<Avatar size="xl" />);
    expect(screen.getByRole('img')).toHaveClass('avatar--xl');
  });

  // -- Shapes --
  it('applies circle shape by default', () => {
    render(<Avatar />);
    expect(screen.getByRole('img')).toHaveClass('avatar--circle');
  });

  it('applies square shape', () => {
    render(<Avatar shape="square" />);
    expect(screen.getByRole('img')).toHaveClass('avatar--square');
  });

  // -- Status --
  it('renders online status dot', () => {
    const { container } = render(<Avatar status="online" />);
    const statusDot = container.querySelector('.avatar-status--online');
    expect(statusDot).toBeInTheDocument();
  });

  it('renders offline status dot', () => {
    const { container } = render(<Avatar status="offline" />);
    expect(container.querySelector('.avatar-status--offline')).toBeInTheDocument();
  });

  it('renders busy status dot', () => {
    const { container } = render(<Avatar status="busy" />);
    expect(container.querySelector('.avatar-status--busy')).toBeInTheDocument();
  });

  it('renders away status dot', () => {
    const { container } = render(<Avatar status="away" />);
    expect(container.querySelector('.avatar-status--away')).toBeInTheDocument();
  });

  it('status dot has aria-label', () => {
    const { container } = render(<Avatar status="online" />);
    const dot = container.querySelector('.avatar-status');
    expect(dot).toHaveAttribute('aria-label', 'online');
  });

  it('does not render status dot when no status', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('.avatar-status')).not.toBeInTheDocument();
  });

  // -- Clickable --
  it('has role="button" when onClick is provided', () => {
    render(<Avatar onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Avatar onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has tabIndex=0 when clickable', () => {
    render(<Avatar onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });

  it('responds to Enter key when clickable', () => {
    const onClick = vi.fn();
    render(<Avatar onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('responds to Space key when clickable', () => {
    const onClick = vi.fn();
    render(<Avatar onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies clickable CSS class', () => {
    render(<Avatar onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('avatar--clickable');
  });

  it('does not have clickable class when no onClick', () => {
    render(<Avatar />);
    expect(screen.getByRole('img')).not.toHaveClass('avatar--clickable');
  });

  // -- Color from name --
  it('applies background color based on name', () => {
    render(<Avatar name="Alice" />);
    const avatar = screen.getByRole('img');
    expect(avatar.style.backgroundColor).not.toBe('');
  });

  it('does not apply background color when showing image', () => {
    const { container } = render(<Avatar src="photo.jpg" name="Alice" />);
    const avatar = container.querySelector('.avatar');
    expect(avatar!.getAttribute('style')).toBeNull();
  });

  // -- Image --
  it('image has avatar-image class', () => {
    render(<Avatar src="photo.jpg" />);
    const img = screen.getByAltText('아바타');
    expect(img).toHaveClass('avatar-image');
  });

  it('default avatar icon has aria-hidden', () => {
    render(<Avatar />);
    const defaultIcon = screen.getByText('👤');
    expect(defaultIcon).toHaveAttribute('aria-hidden', 'true');
  });
});
