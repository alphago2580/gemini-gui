import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from './Tabs';
import type { Tab } from './Tabs';

const mockOnChange = vi.fn();

const defaultTabs: Tab[] = [
  { id: 'tab1', label: '일반' },
  { id: 'tab2', label: '고급' },
  { id: 'tab3', label: '정보' },
];

beforeEach(() => {
  mockOnChange.mockReset();
});

function renderTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return render(
    <Tabs tabs={defaultTabs} {...props}>
      <div data-testid="panel-1">일반 내용</div>
      <div data-testid="panel-2">고급 내용</div>
      <div data-testid="panel-3">정보 내용</div>
    </Tabs>
  );
}

describe('Tabs', () => {
  // --- Rendering ---

  it('renders all tab buttons', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: '일반' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '고급' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '정보' })).toBeInTheDocument();
  });

  it('renders tablist', () => {
    renderTabs();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders first tab as active by default', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: '일반' })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders first panel content by default', () => {
    renderTabs();
    expect(screen.getByText('일반 내용')).toBeInTheDocument();
  });

  it('does not render inactive panel content', () => {
    renderTabs();
    expect(screen.queryByText('고급 내용')).not.toBeInTheDocument();
  });

  // --- Tab switching ---

  it('switches tab on click', () => {
    renderTabs();
    fireEvent.click(screen.getByRole('tab', { name: '고급' }));
    expect(screen.getByRole('tab', { name: '고급' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('고급 내용')).toBeInTheDocument();
    expect(screen.queryByText('일반 내용')).not.toBeInTheDocument();
  });

  it('calls onChange when tab clicked', () => {
    renderTabs({ onChange: mockOnChange });
    fireEvent.click(screen.getByRole('tab', { name: '고급' }));
    expect(mockOnChange).toHaveBeenCalledWith('tab2');
  });

  // --- defaultTab ---

  it('uses defaultTab', () => {
    renderTabs({ defaultTab: 'tab2' });
    expect(screen.getByRole('tab', { name: '고급' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('고급 내용')).toBeInTheDocument();
  });

  // --- Controlled mode ---

  it('respects controlled activeTab', () => {
    const { rerender } = render(
      <Tabs tabs={defaultTabs} activeTab="tab1">
        <div>P1</div><div>P2</div><div>P3</div>
      </Tabs>
    );
    expect(screen.getByRole('tab', { name: '일반' })).toHaveAttribute('aria-selected', 'true');
    rerender(
      <Tabs tabs={defaultTabs} activeTab="tab3">
        <div>P1</div><div>P2</div><div>P3</div>
      </Tabs>
    );
    expect(screen.getByRole('tab', { name: '정보' })).toHaveAttribute('aria-selected', 'true');
  });

  // --- Disabled tabs ---

  it('does not select disabled tab on click', () => {
    const tabs: Tab[] = [
      { id: 'tab1', label: '일반' },
      { id: 'tab2', label: '고급', disabled: true },
    ];
    render(
      <Tabs tabs={tabs} onChange={mockOnChange}>
        <div>P1</div><div>P2</div>
      </Tabs>
    );
    fireEvent.click(screen.getByRole('tab', { name: '고급' }));
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('disabled tab has aria-disabled', () => {
    const tabs: Tab[] = [
      { id: 'tab1', label: '일반' },
      { id: 'tab2', label: '고급', disabled: true },
    ];
    render(
      <Tabs tabs={tabs}><div>P1</div><div>P2</div></Tabs>
    );
    expect(screen.getByRole('tab', { name: '고급' })).toHaveAttribute('aria-disabled', 'true');
  });

  // --- Keyboard navigation ---

  it('navigates with ArrowRight', () => {
    renderTabs({ onChange: mockOnChange });
    const tab1 = screen.getByRole('tab', { name: '일반' });
    fireEvent.keyDown(tab1, { key: 'ArrowRight' });
    expect(mockOnChange).toHaveBeenCalledWith('tab2');
  });

  it('navigates with ArrowLeft', () => {
    renderTabs({ defaultTab: 'tab2', onChange: mockOnChange });
    const tab2 = screen.getByRole('tab', { name: '고급' });
    fireEvent.keyDown(tab2, { key: 'ArrowLeft' });
    expect(mockOnChange).toHaveBeenCalledWith('tab1');
  });

  it('wraps around on ArrowRight from last', () => {
    renderTabs({ defaultTab: 'tab3', onChange: mockOnChange });
    const tab3 = screen.getByRole('tab', { name: '정보' });
    fireEvent.keyDown(tab3, { key: 'ArrowRight' });
    expect(mockOnChange).toHaveBeenCalledWith('tab1');
  });

  it('wraps around on ArrowLeft from first', () => {
    renderTabs({ onChange: mockOnChange });
    const tab1 = screen.getByRole('tab', { name: '일반' });
    fireEvent.keyDown(tab1, { key: 'ArrowLeft' });
    expect(mockOnChange).toHaveBeenCalledWith('tab3');
  });

  it('goes to first tab on Home', () => {
    renderTabs({ defaultTab: 'tab3', onChange: mockOnChange });
    const tab3 = screen.getByRole('tab', { name: '정보' });
    fireEvent.keyDown(tab3, { key: 'Home' });
    expect(mockOnChange).toHaveBeenCalledWith('tab1');
  });

  it('goes to last tab on End', () => {
    renderTabs({ onChange: mockOnChange });
    const tab1 = screen.getByRole('tab', { name: '일반' });
    fireEvent.keyDown(tab1, { key: 'End' });
    expect(mockOnChange).toHaveBeenCalledWith('tab3');
  });

  it('uses ArrowDown/ArrowUp for vertical orientation', () => {
    renderTabs({ orientation: 'vertical', onChange: mockOnChange });
    const tab1 = screen.getByRole('tab', { name: '일반' });
    fireEvent.keyDown(tab1, { key: 'ArrowDown' });
    expect(mockOnChange).toHaveBeenCalledWith('tab2');
  });

  it('skips disabled tabs in keyboard nav', () => {
    const tabs: Tab[] = [
      { id: 'tab1', label: '일반' },
      { id: 'tab2', label: '고급', disabled: true },
      { id: 'tab3', label: '정보' },
    ];
    render(
      <Tabs tabs={tabs} onChange={mockOnChange}>
        <div>P1</div><div>P2</div><div>P3</div>
      </Tabs>
    );
    const tab1 = screen.getByRole('tab', { name: '일반' });
    fireEvent.keyDown(tab1, { key: 'ArrowRight' });
    expect(mockOnChange).toHaveBeenCalledWith('tab3');
  });

  // --- Variants ---

  it('applies default variant', () => {
    const { container } = renderTabs();
    expect(container.querySelector('.tabs-default')).toBeInTheDocument();
  });

  it('applies pills variant', () => {
    const { container } = renderTabs({ variant: 'pills' });
    expect(container.querySelector('.tabs-pills')).toBeInTheDocument();
  });

  it('applies underline variant', () => {
    const { container } = renderTabs({ variant: 'underline' });
    expect(container.querySelector('.tabs-underline')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size', () => {
    const { container } = renderTabs({ size: 'small' });
    expect(container.querySelector('.tabs-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = renderTabs();
    expect(container.querySelector('.tabs-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = renderTabs({ size: 'large' });
    expect(container.querySelector('.tabs-large')).toBeInTheDocument();
  });

  // --- Full width ---

  it('applies full width class', () => {
    const { container } = renderTabs({ fullWidth: true });
    expect(container.querySelector('.tabs-full-width')).toBeInTheDocument();
  });

  // --- Orientation ---

  it('applies horizontal orientation by default', () => {
    const { container } = renderTabs();
    expect(container.querySelector('.tabs-horizontal')).toBeInTheDocument();
  });

  it('applies vertical orientation', () => {
    const { container } = renderTabs({ orientation: 'vertical' });
    expect(container.querySelector('.tabs-vertical')).toBeInTheDocument();
  });

  it('tablist has aria-orientation', () => {
    renderTabs({ orientation: 'vertical' });
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });

  // --- Tab features ---

  it('renders tab with icon', () => {
    const tabs: Tab[] = [
      { id: 'tab1', label: '일반', icon: <span data-testid="icon">⚙</span> },
    ];
    render(<Tabs tabs={tabs}><div>P1</div></Tabs>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders tab with badge', () => {
    const tabs: Tab[] = [
      { id: 'tab1', label: '일반', badge: <span data-testid="badge">5</span> },
    ];
    render(<Tabs tabs={tabs}><div>P1</div></Tabs>);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  // --- Accessibility ---

  it('tablist has aria-label', () => {
    renderTabs();
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', '탭');
  });

  it('accepts custom aria-label', () => {
    renderTabs({ ariaLabel: '설정 탭' });
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', '설정 탭');
  });

  it('active tab has tabIndex=0, others have tabIndex=-1', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: '일반' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: '고급' })).toHaveAttribute('tabindex', '-1');
  });

  it('tab has aria-controls pointing to panel', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: '일반' })).toHaveAttribute('aria-controls', 'tabpanel-tab1');
  });

  it('panel has aria-labelledby pointing to tab', () => {
    renderTabs();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-tab1');
  });

  // --- Custom className ---

  it('applies custom className', () => {
    const { container } = renderTabs({ className: 'my-tabs' });
    expect(container.querySelector('.tabs.my-tabs')).toBeInTheDocument();
  });
});
