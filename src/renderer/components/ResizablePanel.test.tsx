import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ResizablePanel from './ResizablePanel';

describe('ResizablePanel', () => {
  const defaultProps = {
    children: <div>Primary Content</div>,
    secondaryChildren: <div>Secondary Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('rendering', () => {
    it('renders primary and secondary content', () => {
      render(<ResizablePanel {...defaultProps} />);
      expect(screen.getByText('Primary Content')).toBeInTheDocument();
      expect(screen.getByText('Secondary Content')).toBeInTheDocument();
    });

    it('renders with data-testid attributes', () => {
      render(<ResizablePanel {...defaultProps} />);
      expect(screen.getByTestId('resizable-panel')).toBeInTheDocument();
      expect(screen.getByTestId('resizable-panel-primary')).toBeInTheDocument();
      expect(screen.getByTestId('resizable-panel-secondary')).toBeInTheDocument();
      expect(screen.getByTestId('resizable-panel-handle')).toBeInTheDocument();
    });

    it('renders separator role on handle', () => {
      render(<ResizablePanel {...defaultProps} />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('renders with default horizontal direction', () => {
      render(<ResizablePanel {...defaultProps} />);
      const container = screen.getByTestId('resizable-panel');
      expect(container).toHaveClass('resizable-panel--horizontal');
    });

    it('renders with vertical direction', () => {
      render(<ResizablePanel {...defaultProps} direction="vertical" />);
      const container = screen.getByTestId('resizable-panel');
      expect(container).toHaveClass('resizable-panel--vertical');
    });

    it('renders with custom className', () => {
      render(<ResizablePanel {...defaultProps} className="custom-class" />);
      const container = screen.getByTestId('resizable-panel');
      expect(container).toHaveClass('custom-class');
    });

    it('applies disabled class when disabled', () => {
      render(<ResizablePanel {...defaultProps} disabled />);
      const container = screen.getByTestId('resizable-panel');
      expect(container).toHaveClass('resizable-panel--disabled');
    });
  });

  describe('sizing', () => {
    it('applies default size to primary panel', () => {
      render(<ResizablePanel {...defaultProps} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.width).toBe('260px');
    });

    it('applies custom defaultSize to primary panel', () => {
      render(<ResizablePanel {...defaultProps} defaultSize={300} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.width).toBe('300px');
    });

    it('applies controlled size', () => {
      render(<ResizablePanel {...defaultProps} size={400} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.width).toBe('400px');
    });

    it('clamps size to minSize', () => {
      render(<ResizablePanel {...defaultProps} size={50} minSize={100} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.width).toBe('100px');
    });

    it('clamps size to maxSize', () => {
      render(<ResizablePanel {...defaultProps} size={1000} maxSize={500} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.width).toBe('500px');
    });

    it('applies minWidth/maxWidth constraints for horizontal', () => {
      render(<ResizablePanel {...defaultProps} minSize={150} maxSize={400} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.minWidth).toBe('150px');
      expect(primary.style.maxWidth).toBe('400px');
    });

    it('applies height for vertical direction', () => {
      render(<ResizablePanel {...defaultProps} direction="vertical" defaultSize={200} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.height).toBe('200px');
    });

    it('applies minHeight/maxHeight constraints for vertical', () => {
      render(<ResizablePanel {...defaultProps} direction="vertical" minSize={80} maxSize={300} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.minHeight).toBe('80px');
      expect(primary.style.maxHeight).toBe('300px');
    });
  });

  describe('accessibility', () => {
    it('handle has correct aria-orientation for horizontal', () => {
      render(<ResizablePanel {...defaultProps} />);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('handle has correct aria-orientation for vertical', () => {
      render(<ResizablePanel {...defaultProps} direction="vertical" />);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('handle has aria-valuenow reflecting current size', () => {
      render(<ResizablePanel {...defaultProps} defaultSize={300} />);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-valuenow', '300');
    });

    it('handle has aria-valuemin and aria-valuemax', () => {
      render(<ResizablePanel {...defaultProps} minSize={100} maxSize={500} />);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-valuemin', '100');
      expect(handle).toHaveAttribute('aria-valuemax', '500');
    });

    it('handle has default aria-label', () => {
      render(<ResizablePanel {...defaultProps} />);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-label', '패널 크기 조절');
    });

    it('handle has custom aria-label', () => {
      render(<ResizablePanel {...defaultProps} ariaLabel="사이드바 크기 조절" />);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-label', '사이드바 크기 조절');
    });

    it('handle is focusable when not disabled', () => {
      render(<ResizablePanel {...defaultProps} />);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('tabindex', '0');
    });

    it('handle is not focusable when disabled', () => {
      render(<ResizablePanel {...defaultProps} disabled />);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowRight increases size in horizontal mode', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={200} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(onResize).toHaveBeenCalledWith(210);
    });

    it('ArrowLeft decreases size in horizontal mode', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={200} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      expect(onResize).toHaveBeenCalledWith(190);
    });

    it('ArrowDown increases size in vertical mode', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} direction="vertical" defaultSize={200} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      expect(onResize).toHaveBeenCalledWith(210);
    });

    it('ArrowUp decreases size in vertical mode', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} direction="vertical" defaultSize={200} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowUp' });
      expect(onResize).toHaveBeenCalledWith(190);
    });

    it('Home key sets to minSize', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={300} minSize={100} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'Home' });
      expect(onResize).toHaveBeenCalledWith(100);
    });

    it('End key sets to maxSize', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={300} maxSize={500} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'End' });
      expect(onResize).toHaveBeenCalledWith(500);
    });

    it('does not respond to keyboard when disabled', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={200} onResize={onResize} disabled />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(onResize).not.toHaveBeenCalled();
    });

    it('clamps keyboard navigation to minSize', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={105} minSize={100} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      expect(onResize).toHaveBeenCalledWith(100);
    });

    it('clamps keyboard navigation to maxSize', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={795} maxSize={800} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(onResize).toHaveBeenCalledWith(800);
    });

    it('ignores unrelated keys', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={200} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'a' });
      expect(onResize).not.toHaveBeenCalled();
    });
  });

  describe('double-click reset', () => {
    it('resets to defaultSize on double-click', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={250} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      // First change size via keyboard
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(onResize).toHaveBeenCalledWith(260);
      // Then double-click to reset
      fireEvent.doubleClick(handle);
      expect(onResize).toHaveBeenCalledWith(250);
    });

    it('does not reset on double-click when disabled', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={250} onResize={onResize} disabled />);
      const handle = screen.getByRole('separator');
      fireEvent.doubleClick(handle);
      expect(onResize).not.toHaveBeenCalled();
    });
  });

  describe('mouse drag', () => {
    it('calls onResizeStart on mousedown', () => {
      const onResizeStart = vi.fn();
      render(<ResizablePanel {...defaultProps} onResizeStart={onResizeStart} />);
      const handle = screen.getByRole('separator');
      fireEvent.mouseDown(handle, { clientX: 260, clientY: 0 });
      expect(onResizeStart).toHaveBeenCalledTimes(1);
    });

    it('does not start drag when disabled', () => {
      const onResizeStart = vi.fn();
      render(<ResizablePanel {...defaultProps} onResizeStart={onResizeStart} disabled />);
      const handle = screen.getByRole('separator');
      fireEvent.mouseDown(handle, { clientX: 260, clientY: 0 });
      expect(onResizeStart).not.toHaveBeenCalled();
    });

    it('updates size during mouse drag', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={260} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.mouseDown(handle, { clientX: 260, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 300, clientY: 0 });
      expect(onResize).toHaveBeenCalledWith(300);
    });

    it('calls onResizeEnd on mouseup', () => {
      const onResizeEnd = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={260} onResizeEnd={onResizeEnd} />);
      const handle = screen.getByRole('separator');
      fireEvent.mouseDown(handle, { clientX: 260, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 300, clientY: 0 });
      fireEvent.mouseUp(document);
      expect(onResizeEnd).toHaveBeenCalledWith(300);
    });

    it('clamps drag to minSize', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={260} minSize={150} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.mouseDown(handle, { clientX: 260, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 50, clientY: 0 });
      expect(onResize).toHaveBeenCalledWith(150);
    });

    it('clamps drag to maxSize', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={260} maxSize={400} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.mouseDown(handle, { clientX: 260, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 500, clientY: 0 });
      expect(onResize).toHaveBeenCalledWith(400);
    });

    it('handles vertical drag', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} direction="vertical" defaultSize={200} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.mouseDown(handle, { clientX: 0, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 0, clientY: 250 });
      expect(onResize).toHaveBeenCalledWith(250);
    });
  });

  describe('localStorage persistence', () => {
    it('saves size to localStorage when storageKey is provided', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} defaultSize={260} storageKey="sidebar" onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(localStorage.getItem('resizable-panel-sidebar')).toBe('270');
    });

    it('restores size from localStorage', () => {
      localStorage.setItem('resizable-panel-sidebar', '350');
      render(<ResizablePanel {...defaultProps} defaultSize={260} storageKey="sidebar" />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.width).toBe('350px');
    });

    it('does not use localStorage when storageKey is not provided', () => {
      render(<ResizablePanel {...defaultProps} defaultSize={260} />);
      const handle = screen.getByRole('separator');
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(localStorage.getItem('resizable-panel-undefined')).toBeNull();
    });

    it('falls back to defaultSize when localStorage has invalid value', () => {
      localStorage.setItem('resizable-panel-sidebar', 'not-a-number');
      render(<ResizablePanel {...defaultProps} defaultSize={260} storageKey="sidebar" />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.width).toBe('260px');
    });
  });

  describe('handle customization', () => {
    it('applies custom handle size for horizontal', () => {
      render(<ResizablePanel {...defaultProps} handleSize={10} />);
      const handle = screen.getByTestId('resizable-panel-handle');
      expect(handle.style.width).toBe('10px');
    });

    it('applies custom handle size for vertical', () => {
      render(<ResizablePanel {...defaultProps} direction="vertical" handleSize={10} />);
      const handle = screen.getByTestId('resizable-panel-handle');
      expect(handle.style.height).toBe('10px');
    });
  });

  describe('controlled mode', () => {
    it('uses controlled size over internal state', () => {
      const { rerender } = render(<ResizablePanel {...defaultProps} size={300} />);
      const primary = screen.getByTestId('resizable-panel-primary');
      expect(primary.style.width).toBe('300px');

      rerender(<ResizablePanel {...defaultProps} size={400} />);
      expect(primary.style.width).toBe('400px');
    });

    it('calls onResize during controlled drag', () => {
      const onResize = vi.fn();
      render(<ResizablePanel {...defaultProps} size={260} onResize={onResize} />);
      const handle = screen.getByRole('separator');
      fireEvent.mouseDown(handle, { clientX: 260, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 300, clientY: 0 });
      expect(onResize).toHaveBeenCalledWith(300);
    });
  });
});
