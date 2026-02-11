import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageViewer from './ImageViewer';

const mockOnClose = vi.fn();

beforeEach(() => {
  mockOnClose.mockReset();
  document.body.style.overflow = '';
});

function renderViewer(props: Partial<React.ComponentProps<typeof ImageViewer>> = {}) {
  return render(
    <ImageViewer
      src="test.jpg"
      alt="Test image"
      open={true}
      onClose={mockOnClose}
      {...props}
    />
  );
}

describe('ImageViewer', () => {
  // --- Rendering ---

  it('renders when open', () => {
    renderViewer();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderViewer({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders image with src and alt', () => {
    renderViewer();
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test.jpg');
  });

  it('renders caption when provided', () => {
    renderViewer({ caption: '테스트 캡션' });
    expect(screen.getByText('테스트 캡션')).toBeInTheDocument();
  });

  it('does not render caption when not provided', () => {
    const { container } = renderViewer();
    expect(container.querySelector('.image-viewer-caption')).not.toBeInTheDocument();
  });

  // --- Accessibility ---

  it('has dialog role with aria-modal', () => {
    renderViewer();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has default aria-label', () => {
    renderViewer();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '이미지 뷰어');
  });

  it('accepts custom ariaLabel', () => {
    renderViewer({ ariaLabel: '사진 보기' });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '사진 보기');
  });

  it('has toolbar with aria-label', () => {
    renderViewer();
    expect(screen.getByRole('toolbar', { name: '이미지 도구' })).toBeInTheDocument();
  });

  // --- Close behavior ---

  it('renders close button', () => {
    renderViewer();
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    renderViewer();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape key', () => {
    renderViewer();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closeOnEscape=false', () => {
    renderViewer({ closeOnEscape: false });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay clicked', () => {
    renderViewer();
    fireEvent.click(screen.getByTestId('image-viewer'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when overlay clicked with closeOnOverlay=false', () => {
    renderViewer({ closeOnOverlay: false });
    fireEvent.click(screen.getByTestId('image-viewer'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // --- Zoom controls ---

  it('shows zoom controls by default', () => {
    renderViewer();
    expect(screen.getByRole('button', { name: '확대' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '축소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '원래 크기' })).toBeInTheDocument();
  });

  it('shows 100% zoom initially', () => {
    renderViewer();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('zooms in when + button clicked', () => {
    renderViewer();
    fireEvent.click(screen.getByRole('button', { name: '확대' }));
    expect(screen.getByText('125%')).toBeInTheDocument();
  });

  it('zooms out when - button clicked', () => {
    renderViewer();
    fireEvent.click(screen.getByRole('button', { name: '축소' }));
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('resets zoom when 1:1 button clicked', () => {
    renderViewer();
    fireEvent.click(screen.getByRole('button', { name: '확대' }));
    fireEvent.click(screen.getByRole('button', { name: '확대' }));
    expect(screen.getByText('150%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '원래 크기' }));
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('disables zoom out at minZoom', () => {
    renderViewer({ minZoom: 1 });
    expect(screen.getByRole('button', { name: '축소' })).toBeDisabled();
  });

  it('disables zoom in at maxZoom', () => {
    renderViewer({ maxZoom: 1 });
    expect(screen.getByRole('button', { name: '확대' })).toBeDisabled();
  });

  it('does not show zoom controls when zoomable=false', () => {
    renderViewer({ zoomable: false });
    expect(screen.queryByRole('button', { name: '확대' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '축소' })).not.toBeInTheDocument();
  });

  it('hides controls when showControls=false', () => {
    renderViewer({ showControls: false });
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  // --- Keyboard zoom ---

  it('zooms in with + key', () => {
    renderViewer();
    fireEvent.keyDown(document, { key: '+' });
    expect(screen.getByText('125%')).toBeInTheDocument();
  });

  it('zooms in with = key', () => {
    renderViewer();
    fireEvent.keyDown(document, { key: '=' });
    expect(screen.getByText('125%')).toBeInTheDocument();
  });

  it('zooms out with - key', () => {
    renderViewer();
    fireEvent.keyDown(document, { key: '-' });
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('resets zoom with 0 key', () => {
    renderViewer();
    fireEvent.keyDown(document, { key: '+' });
    fireEvent.keyDown(document, { key: '0' });
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  // --- Gallery mode ---

  it('shows navigation in gallery mode', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'] });
    expect(screen.getByRole('button', { name: '이전 이미지' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 이미지' })).toBeInTheDocument();
  });

  it('shows counter in gallery mode', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'] });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates to next image', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'] });
    fireEvent.click(screen.getByRole('button', { name: '다음 이미지' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to previous image', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'], initialIndex: 1 });
    fireEvent.click(screen.getByRole('button', { name: '이전 이미지' }));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('wraps to last image when going prev from first', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'] });
    fireEvent.click(screen.getByRole('button', { name: '이전 이미지' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('wraps to first image when going next from last', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'], initialIndex: 2 });
    fireEvent.click(screen.getByRole('button', { name: '다음 이미지' }));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates with ArrowLeft key', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'], initialIndex: 1 });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates with ArrowRight key', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'] });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('does not show navigation without images', () => {
    renderViewer();
    expect(screen.queryByRole('button', { name: '이전 이미지' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음 이미지' })).not.toBeInTheDocument();
  });

  it('uses initialIndex', () => {
    renderViewer({ images: ['a.jpg', 'b.jpg', 'c.jpg'], initialIndex: 2 });
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  // --- Body overflow ---

  it('sets body overflow hidden when open', () => {
    renderViewer();
    expect(document.body.style.overflow).toBe('hidden');
  });

  // --- Image properties ---

  it('image is not draggable', () => {
    renderViewer();
    expect(screen.getByAltText('Test image')).toHaveAttribute('draggable', 'false');
  });

  it('applies zoom transform to image', () => {
    renderViewer();
    fireEvent.click(screen.getByRole('button', { name: '확대' }));
    expect(screen.getByAltText('Test image')).toHaveStyle({ transform: 'scale(1.25)' });
  });

  // --- Custom zoom step ---

  it('uses custom zoomStep', () => {
    renderViewer({ zoomStep: 0.5 });
    fireEvent.click(screen.getByRole('button', { name: '확대' }));
    expect(screen.getByText('150%')).toBeInTheDocument();
  });
});
