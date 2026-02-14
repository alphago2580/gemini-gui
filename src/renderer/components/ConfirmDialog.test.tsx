import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: '삭제 확인',
    message: '이 항목을 삭제하시겠습니까?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} isOpen={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('삭제 확인')).toBeInTheDocument();
    expect(screen.getByText('이 항목을 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('renders default button labels', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('확인')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('renders custom button labels', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="삭제"
        cancelLabel="돌아가기"
      />
    );
    expect(screen.getByText('삭제')).toBeInTheDocument();
    expect(screen.getByText('돌아가기')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('확인'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('취소'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Escape key is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const overlay = screen.getByRole('dialog');
    fireEvent.keyDown(overlay, { key: 'Escape' });
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when overlay is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const overlay = document.querySelector('.confirm-dialog-overlay');
    fireEvent.click(overlay!);
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not call onCancel when dialog body is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = document.querySelector('.confirm-dialog');
    fireEvent.click(dialog!);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-message');
  });

  it('renders danger variant icon by default', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const icon = document.querySelector('.confirm-dialog-icon');
    expect(icon).toHaveClass('confirm-dialog-icon-danger');
    expect(icon?.textContent).toBe('⚠');
  });

  it('renders warning variant icon', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" />);
    const icon = document.querySelector('.confirm-dialog-icon');
    expect(icon).toHaveClass('confirm-dialog-icon-warning');
    expect(icon?.textContent).toBe('⚡');
  });

  it('renders info variant icon', () => {
    render(<ConfirmDialog {...defaultProps} variant="info" />);
    const icon = document.querySelector('.confirm-dialog-icon');
    expect(icon).toHaveClass('confirm-dialog-icon-info');
    expect(icon?.textContent).toBe('ℹ');
  });

  it('applies variant class to confirm button', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" />);
    const confirmBtn = screen.getByText('확인');
    expect(confirmBtn).toHaveClass('confirm-dialog-btn-warning');
  });

  it('focuses confirm button when dialog opens', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmBtn = screen.getByText('확인');
    expect(document.activeElement).toBe(confirmBtn);
  });

  it('has correct aria-labels on buttons', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="삭제"
        cancelLabel="돌아가기"
      />
    );
    expect(screen.getByLabelText('삭제')).toBeInTheDocument();
    expect(screen.getByLabelText('돌아가기')).toBeInTheDocument();
  });

  it('calls onConfirm when Enter key is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const overlay = screen.getByRole('dialog');
    fireEvent.keyDown(overlay, { key: 'Enter' });
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('does not call onCancel or onConfirm for other keys', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const overlay = screen.getByRole('dialog');
    fireEvent.keyDown(overlay, { key: 'Tab' });
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('renders with danger variant confirm button by default', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmBtn = screen.getByText('확인');
    expect(confirmBtn).toHaveClass('confirm-dialog-btn-danger');
  });

  it('applies info variant to confirm button', () => {
    render(<ConfirmDialog {...defaultProps} variant="info" />);
    const confirmBtn = screen.getByText('확인');
    expect(confirmBtn).toHaveClass('confirm-dialog-btn-info');
  });

  it('traps focus: Tab from confirm button wraps to cancel button', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmBtn = screen.getByText('확인');
    const cancelBtn = screen.getByText('취소');

    // Confirm button should be focused initially
    expect(document.activeElement).toBe(confirmBtn);

    // Dispatch native keydown on the dialog container where useFocusTrap listens
    const dialogEl = document.querySelector('.confirm-dialog')!;
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    dialogEl.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(cancelBtn);
  });

  it('traps focus: Shift+Tab from cancel button wraps to confirm button', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmBtn = screen.getByText('확인');
    const cancelBtn = screen.getByText('취소');

    // Move focus to cancel button first
    cancelBtn.focus();
    expect(document.activeElement).toBe(cancelBtn);

    // Dispatch native Shift+Tab on the dialog container
    const dialogEl = document.querySelector('.confirm-dialog')!;
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    dialogEl.dispatchEvent(shiftTabEvent);

    expect(document.activeElement).toBe(confirmBtn);
  });

  it('restores focus to previously active element when dialog closes', () => {
    const externalBtn = document.createElement('button');
    externalBtn.textContent = 'External';
    document.body.appendChild(externalBtn);
    externalBtn.focus();
    expect(document.activeElement).toBe(externalBtn);

    const { unmount } = render(<ConfirmDialog {...defaultProps} />);

    // Dialog should have taken focus to confirm button
    const confirmBtn = screen.getByText('확인');
    expect(document.activeElement).toBe(confirmBtn);

    // Unmounting should restore focus to the external button
    unmount();
    expect(document.activeElement).toBe(externalBtn);

    document.body.removeChild(externalBtn);
  });
});
