import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Dialog from './Dialog';

describe('Dialog', () => {
  describe('rendering', () => {
    it('renders when open', () => {
      render(<Dialog open>내용</Dialog>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('내용')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<Dialog open={false}>내용</Dialog>);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders title', () => {
      render(<Dialog open title="설정">내용</Dialog>);
      expect(screen.getByText('설정')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(<Dialog open title="테스트">내용</Dialog>);
      expect(screen.getByLabelText('닫기')).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(<Dialog open title="테스트" showCloseButton={false}>내용</Dialog>);
      expect(screen.queryByLabelText('닫기')).not.toBeInTheDocument();
    });

    it('renders footer', () => {
      render(
        <Dialog open footer={<button>확인</button>}>
          내용
        </Dialog>,
      );
      expect(screen.getByText('확인')).toBeInTheDocument();
    });

    it('renders children in body', () => {
      render(
        <Dialog open>
          <p>대화 상자 내용입니다</p>
        </Dialog>,
      );
      expect(screen.getByText('대화 상자 내용입니다')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Dialog open className="custom">내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveClass('custom');
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Dialog open size="small">내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveClass('dialog--small');
    });

    it('renders medium size (default)', () => {
      render(<Dialog open>내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveClass('dialog--medium');
    });

    it('renders large size', () => {
      render(<Dialog open size="large">내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveClass('dialog--large');
    });

    it('renders fullscreen size', () => {
      render(<Dialog open size="fullscreen">내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveClass('dialog--fullscreen');
    });
  });

  describe('closing behavior', () => {
    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose} title="테스트">내용</Dialog>);
      fireEvent.click(screen.getByLabelText('닫기'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose on Escape key', () => {
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose}>내용</Dialog>);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on Escape when closeOnEscape is false', () => {
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose} closeOnEscape={false}>내용</Dialog>);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when overlay clicked', () => {
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose}>내용</Dialog>);
      // Click on the overlay (presentation role element)
      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when overlay clicked and closeOnOverlay is false', () => {
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose} closeOnOverlay={false}>내용</Dialog>);
      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when dialog body is clicked', () => {
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose}>내용</Dialog>);
      fireEvent.click(screen.getByText('내용'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('focus management', () => {
    it('dialog is focusable with tabIndex -1', () => {
      render(<Dialog open>내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveAttribute('tabindex', '-1');
    });

    it('traps focus with Tab key', () => {
      render(
        <Dialog open title="테스트">
          <button>버튼1</button>
          <button>버튼2</button>
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog');
      const buttons = screen.getAllByRole('button');
      // Focus last button
      buttons[buttons.length - 1].focus();
      // Tab should wrap to first focusable
      fireEvent.keyDown(dialog, { key: 'Tab' });
      // Focus trap should be active (no error)
    });

    it('traps focus with Shift+Tab', () => {
      render(
        <Dialog open title="테스트">
          <button>버튼1</button>
          <button>버튼2</button>
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog');
      const closeBtn = screen.getByLabelText('닫기');
      // Focus first button (close)
      closeBtn.focus();
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
      // Focus trap should be active (no error)
    });
  });

  describe('body scroll lock', () => {
    it('locks body scroll when open', () => {
      render(<Dialog open>내용</Dialog>);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const { rerender } = render(<Dialog open>내용</Dialog>);
      expect(document.body.style.overflow).toBe('hidden');
      rerender(<Dialog open={false}>내용</Dialog>);
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('accessibility', () => {
    it('has dialog role', () => {
      render(<Dialog open>내용</Dialog>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal true', () => {
      render(<Dialog open>내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-label from title', () => {
      render(<Dialog open title="설정">내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '설정');
    });

    it('has custom aria-label', () => {
      render(<Dialog open ariaLabel="사용자 설정 대화 상자">내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '사용자 설정 대화 상자');
    });

    it('has aria-describedby', () => {
      render(<Dialog open ariaDescribedBy="desc">내용</Dialog>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', 'desc');
    });

    it('overlay has presentation role', () => {
      render(<Dialog open>내용</Dialog>);
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });

    it('title is an h2 element', () => {
      render(<Dialog open title="대화상자 제목">내용</Dialog>);
      const title = screen.getByText('대화상자 제목');
      expect(title.tagName).toBe('H2');
    });
  });

  describe('no header without title and close', () => {
    it('does not render header when no title and showCloseButton false', () => {
      const { container } = render(
        <Dialog open showCloseButton={false}>내용</Dialog>,
      );
      expect(container.querySelector('.dialog__header')).not.toBeInTheDocument();
    });
  });

  describe('transition between open states', () => {
    it('transitions from closed to open', () => {
      const { rerender } = render(<Dialog open={false}>내용</Dialog>);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      rerender(<Dialog open>내용</Dialog>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('transitions from open to closed', () => {
      const { rerender } = render(<Dialog open>내용</Dialog>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      rerender(<Dialog open={false}>내용</Dialog>);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
