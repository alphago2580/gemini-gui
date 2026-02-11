import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Popover from './Popover';

const defaultTrigger = <span>열기</span>;
const defaultContent = <div>팝오버 내용</div>;

function renderPopover(props: Partial<React.ComponentProps<typeof Popover>> = {}) {
  return render(
    <Popover trigger={defaultTrigger} {...props}>
      {props.children ?? defaultContent}
    </Popover>
  );
}

describe('Popover', () => {
  // --- Rendering ---

  it('renders trigger button', () => {
    renderPopover();
    expect(screen.getByRole('button', { name: '팝오버' })).toBeInTheDocument();
  });

  it('renders trigger content', () => {
    renderPopover();
    expect(screen.getByText('열기')).toBeInTheDocument();
  });

  it('popover content is hidden by default', () => {
    renderPopover();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with custom ariaLabel', () => {
    renderPopover({ ariaLabel: '설정 팝업' });
    expect(screen.getByRole('button', { name: '설정 팝업' })).toBeInTheDocument();
  });

  // --- Open/Close ---

  it('opens on trigger click', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows children content when open', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(screen.getByText('팝오버 내용')).toBeInTheDocument();
  });

  it('closes on second trigger click', () => {
    renderPopover();
    const trigger = screen.getByRole('button', { name: '팝오버' });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on outside click', () => {
    render(
      <div>
        <Popover trigger={defaultTrigger}>{defaultContent}</Popover>
        <button>Outside</button>
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('Outside'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close on outside click when closeOnClickOutside=false', () => {
    render(
      <div>
        <Popover trigger={defaultTrigger} closeOnClickOutside={false}>
          {defaultContent}
        </Popover>
        <button>Outside</button>
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    fireEvent.mouseDown(screen.getByText('Outside'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not close on Escape when closeOnEscape=false', () => {
    renderPopover({ closeOnEscape: false });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // --- Disabled ---

  it('does not open when disabled', () => {
    renderPopover({ disabled: true });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('trigger button is disabled when disabled', () => {
    renderPopover({ disabled: true });
    expect(screen.getByRole('button', { name: '팝오버' })).toBeDisabled();
  });

  // --- Controlled mode ---

  it('shows popover when isOpen=true (controlled)', () => {
    renderPopover({ isOpen: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('hides popover when isOpen=false (controlled)', () => {
    renderPopover({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when toggling', () => {
    const onOpenChange = vi.fn();
    renderPopover({ onOpenChange });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('calls onOpenChange(false) when closing', () => {
    const onOpenChange = vi.fn();
    renderPopover({ onOpenChange });
    const trigger = screen.getByRole('button', { name: '팝오버' });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // --- Position ---

  it('applies bottom position class by default', () => {
    const { container } = renderPopover();
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-bottom')).toBeInTheDocument();
  });

  it('applies top position class', () => {
    const { container } = renderPopover({ position: 'top' });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-top')).toBeInTheDocument();
  });

  it('applies left position class', () => {
    const { container } = renderPopover({ position: 'left' });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-left')).toBeInTheDocument();
  });

  it('applies right position class', () => {
    const { container } = renderPopover({ position: 'right' });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-right')).toBeInTheDocument();
  });

  // --- Alignment ---

  it('applies center alignment by default', () => {
    const { container } = renderPopover();
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-align-center')).toBeInTheDocument();
  });

  it('applies start alignment', () => {
    const { container } = renderPopover({ align: 'start' });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-align-start')).toBeInTheDocument();
  });

  it('applies end alignment', () => {
    const { container } = renderPopover({ align: 'end' });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-align-end')).toBeInTheDocument();
  });

  // --- Size ---

  it('applies medium size by default', () => {
    const { container } = renderPopover();
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-medium')).toBeInTheDocument();
  });

  it('applies small size', () => {
    const { container } = renderPopover({ size: 'small' });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-small')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = renderPopover({ size: 'large' });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-large')).toBeInTheDocument();
  });

  // --- Arrow ---

  it('shows arrow by default', () => {
    const { container } = renderPopover();
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-with-arrow')).toBeInTheDocument();
    expect(container.querySelector('.popover-arrow')).toBeInTheDocument();
  });

  it('hides arrow when showArrow=false', () => {
    const { container } = renderPopover({ showArrow: false });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(container.querySelector('.popover-with-arrow')).not.toBeInTheDocument();
  });

  // --- Offset ---

  it('applies custom offset to bottom position', () => {
    renderPopover({ position: 'bottom', offset: 16 });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.top).toBe('calc(100% + 16px)');
  });

  it('applies custom offset to top position', () => {
    renderPopover({ position: 'top', offset: 20 });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.bottom).toBe('calc(100% + 20px)');
  });

  it('applies custom offset to left position', () => {
    renderPopover({ position: 'left', offset: 12 });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.right).toBe('calc(100% + 12px)');
  });

  it('applies custom offset to right position', () => {
    renderPopover({ position: 'right', offset: 10 });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.left).toBe('calc(100% + 10px)');
  });

  it('uses default offset of 8px', () => {
    renderPopover({ position: 'bottom' });
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.top).toBe('calc(100% + 8px)');
  });

  // --- Accessibility ---

  it('trigger has aria-haspopup="dialog"', () => {
    renderPopover();
    expect(screen.getByRole('button', { name: '팝오버' })).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('trigger has aria-expanded=false when closed', () => {
    renderPopover();
    expect(screen.getByRole('button', { name: '팝오버' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('trigger has aria-expanded=true when open', () => {
    renderPopover();
    const trigger = screen.getByRole('button', { name: '팝오버' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('content has role="dialog"', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('content has aria-label', () => {
    renderPopover({ ariaLabel: '설정 메뉴' });
    fireEvent.click(screen.getByRole('button', { name: '설정 메뉴' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '설정 메뉴');
  });

  // --- Focus trap ---

  it('traps Tab focus within popover content', () => {
    render(
      <Popover trigger={defaultTrigger}>
        <button>First</button>
        <button>Last</button>
      </Popover>
    );
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    const last = screen.getByText('Last');
    last.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });
    // After tabbing past last, should wrap to first
    expect(document.activeElement).toBe(screen.getByText('First'));
  });

  it('traps Shift+Tab focus within popover content', () => {
    render(
      <Popover trigger={defaultTrigger}>
        <button>First</button>
        <button>Last</button>
      </Popover>
    );
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    const first = screen.getByText('First');
    first.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText('Last'));
  });

  // --- Custom children ---

  it('renders complex children', () => {
    render(
      <Popover trigger={defaultTrigger}>
        <h3>제목</h3>
        <p>설명 텍스트</p>
        <button>확인</button>
      </Popover>
    );
    fireEvent.click(screen.getByRole('button', { name: '팝오버' }));
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('설명 텍스트')).toBeInTheDocument();
    expect(screen.getByText('확인')).toBeInTheDocument();
  });
});
