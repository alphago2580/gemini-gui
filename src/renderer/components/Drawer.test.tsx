import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Drawer from './Drawer';

const mockOnClose = vi.fn();

beforeEach(() => {
  mockOnClose.mockReset();
  document.body.style.overflow = '';
});

function renderDrawer(props: Partial<React.ComponentProps<typeof Drawer>> = {}) {
  return render(
    <Drawer open={true} onClose={mockOnClose} {...props}>
      <p>Drawer content</p>
    </Drawer>
  );
}

describe('Drawer', () => {
  // --- Rendering ---

  it('renders when open', () => {
    renderDrawer();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderDrawer({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with title', () => {
    renderDrawer({ title: '설정' });
    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    renderDrawer();
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('hides close button when showClose=false', () => {
    renderDrawer({ showClose: false });
    expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
  });

  // --- Accessibility ---

  it('has dialog role with aria-modal', () => {
    renderDrawer();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('uses title as aria-label', () => {
    renderDrawer({ title: '메뉴' });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '메뉴');
  });

  it('uses custom ariaLabel', () => {
    renderDrawer({ ariaLabel: '사이드 메뉴' });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '사이드 메뉴');
  });

  it('uses default aria-label when no title or ariaLabel', () => {
    renderDrawer();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '서랍 패널');
  });

  // --- Close behavior ---

  it('calls onClose when close button clicked', () => {
    renderDrawer();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', () => {
    renderDrawer();
    fireEvent.click(screen.getByTestId('drawer-overlay'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when overlay clicked with closeOnOverlay=false', () => {
    renderDrawer({ closeOnOverlay: false });
    fireEvent.click(screen.getByTestId('drawer-overlay'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key', () => {
    renderDrawer();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closeOnEscape=false', () => {
    renderDrawer({ closeOnEscape: false });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // --- Overlay ---

  it('renders overlay by default', () => {
    renderDrawer();
    expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument();
  });

  it('does not render overlay when overlay=false', () => {
    renderDrawer({ overlay: false });
    expect(screen.queryByTestId('drawer-overlay')).not.toBeInTheDocument();
  });

  it('overlay is aria-hidden', () => {
    renderDrawer();
    expect(screen.getByTestId('drawer-overlay')).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Positions ---

  it('applies right position by default', () => {
    const { container } = renderDrawer();
    expect(container.querySelector('.drawer-right')).toBeInTheDocument();
  });

  it('applies left position', () => {
    const { container } = renderDrawer({ position: 'left' });
    expect(container.querySelector('.drawer-left')).toBeInTheDocument();
  });

  it('applies top position', () => {
    const { container } = renderDrawer({ position: 'top' });
    expect(container.querySelector('.drawer-top')).toBeInTheDocument();
  });

  it('applies bottom position', () => {
    const { container } = renderDrawer({ position: 'bottom' });
    expect(container.querySelector('.drawer-bottom')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size', () => {
    const { container } = renderDrawer({ size: 'small' });
    expect(container.querySelector('.drawer-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = renderDrawer();
    expect(container.querySelector('.drawer-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = renderDrawer({ size: 'large' });
    expect(container.querySelector('.drawer-large')).toBeInTheDocument();
  });

  it('applies full size', () => {
    const { container } = renderDrawer({ size: 'full' });
    expect(container.querySelector('.drawer-full')).toBeInTheDocument();
  });

  // --- Custom className ---

  it('applies custom className', () => {
    const { container } = renderDrawer({ className: 'my-drawer' });
    expect(container.querySelector('.drawer-panel.my-drawer')).toBeInTheDocument();
  });

  // --- Body overflow ---

  it('sets body overflow hidden when open', () => {
    renderDrawer();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', () => {
    const { rerender } = render(
      <Drawer open={true} onClose={mockOnClose}><p>Content</p></Drawer>
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Drawer open={false} onClose={mockOnClose}><p>Content</p></Drawer>);
    expect(document.body.style.overflow).toBe('');
  });

  // --- Focus trap ---

  it('focuses drawer panel when opened', async () => {
    renderDrawer();
    // requestAnimationFrame is used, so flush
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
  });

  // --- Header rendering ---

  it('renders header when title provided', () => {
    const { container } = renderDrawer({ title: '제목' });
    expect(container.querySelector('.drawer-header')).toBeInTheDocument();
    expect(container.querySelector('.drawer-title')).toBeInTheDocument();
  });

  it('renders header when showClose is true even without title', () => {
    const { container } = renderDrawer({ showClose: true });
    expect(container.querySelector('.drawer-header')).toBeInTheDocument();
  });

  it('does not render header when no title and showClose=false', () => {
    const { container } = renderDrawer({ showClose: false, title: undefined });
    expect(container.querySelector('.drawer-header')).not.toBeInTheDocument();
  });

  // --- Container ---

  it('renders container with test id', () => {
    renderDrawer();
    expect(screen.getByTestId('drawer-container')).toBeInTheDocument();
  });
});
