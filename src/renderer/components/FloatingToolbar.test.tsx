import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { useRef } from 'react';
import FloatingToolbar from './FloatingToolbar';
import type { FloatingToolbarAction } from './FloatingToolbar';

// Helper to fire selectionchange
function fireSelectionChange() {
  document.dispatchEvent(new Event('selectionchange'));
}

// Helper wrapper that provides a containerRef
const TestWrapper: React.FC<{
  actions: FloatingToolbarAction[];
  minSelectionLength?: number;
  offset?: number;
  preferPosition?: 'above' | 'below';
  disabled?: boolean;
  ariaLabel?: string;
}> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} data-testid="container">
      <p>Some text to select</p>
      <FloatingToolbar containerRef={ref} {...props} />
    </div>
  );
};

function mockSelection(
  text: string,
  container: Node,
  rect: Partial<DOMRect> = {}
) {
  const defaultRect = {
    top: 100,
    bottom: 120,
    left: 50,
    right: 150,
    width: 100,
    height: 20,
    x: 50,
    y: 100,
    toJSON: () => ({}),
    ...rect,
  };

  const range = {
    getBoundingClientRect: () => defaultRect as DOMRect,
    startOffset: 0,
    endOffset: text.length,
    commonAncestorContainer: container,
  };

  vi.spyOn(window, 'getSelection').mockReturnValue({
    toString: () => text,
    isCollapsed: false,
    rangeCount: 1,
    getRangeAt: () => range,
    anchorNode: container.firstChild ?? container,
    focusNode: container.firstChild ?? container,
    removeAllRanges: vi.fn(),
  } as unknown as Selection);
}

function mockCollapsedSelection() {
  vi.spyOn(window, 'getSelection').mockReturnValue({
    toString: () => '',
    isCollapsed: true,
    rangeCount: 0,
    getRangeAt: () => { throw new Error('no range'); },
    anchorNode: null,
    focusNode: null,
    removeAllRanges: vi.fn(),
  } as unknown as Selection);
}

function mockNullSelection() {
  vi.spyOn(window, 'getSelection').mockReturnValue(null as unknown as Selection);
}

describe('FloatingToolbar', () => {
  let defaultActions: FloatingToolbarAction[];

  beforeEach(() => {
    defaultActions = [
      { id: 'copy', label: '복사', icon: '📋', onClick: vi.fn() },
      { id: 'search', label: '검색', icon: '🔍', onClick: vi.fn() },
    ];
    vi.spyOn(window, 'getSelection');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when there is no text selection', () => {
    mockCollapsedSelection();
    const { container } = render(<TestWrapper actions={defaultActions} />);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('renders nothing when selection is null', () => {
    mockNullSelection();
    const { container } = render(<TestWrapper actions={defaultActions} />);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('renders toolbar when text is selected within container', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('hello world', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('selected text', containerEl);
    act(() => { fireSelectionChange(); });
    expect(screen.getByRole('button', { name: '복사' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
  });

  it('has role="toolbar" with correct aria-label', () => {
    render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', '선택 텍스트 도구');
  });

  it('accepts custom ariaLabel', () => {
    render(<TestWrapper actions={defaultActions} ariaLabel="커스텀 도구" />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', '커스텀 도구');
  });

  it('calls action onClick with selected text when button is clicked', () => {
    render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('hello world', containerEl);
    act(() => { fireSelectionChange(); });
    fireEvent.click(screen.getByRole('button', { name: '복사' }));
    expect(defaultActions[0].onClick).toHaveBeenCalledWith('hello world');
  });

  it('does not call onClick for disabled actions', () => {
    const actions: FloatingToolbarAction[] = [
      { id: 'copy', label: '복사', onClick: vi.fn(), disabled: true },
    ];
    render(<TestWrapper actions={actions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    // All actions are disabled, so toolbar should not render
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('renders disabled buttons with disabled attribute when some actions are disabled', () => {
    const actions: FloatingToolbarAction[] = [
      { id: 'copy', label: '복사', onClick: vi.fn() },
      { id: 'search', label: '검색', onClick: vi.fn(), disabled: true },
    ];
    render(<TestWrapper actions={actions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const searchBtn = screen.getByRole('button', { name: '검색' });
    expect(searchBtn).toBeDisabled();
  });

  it('renders icon when action has icon', () => {
    render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelector('.floating-toolbar-icon')).toBeInTheDocument();
    expect(toolbar.querySelector('.floating-toolbar-icon')!.textContent).toBe('📋');
  });

  it('renders label text', () => {
    render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelector('.floating-toolbar-label')!.textContent).toBe('복사');
  });

  it('does not render when disabled prop is true', () => {
    const { container } = render(<TestWrapper actions={defaultActions} disabled={true} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('hides toolbar when selection is cleared', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');

    // Show toolbar
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).toBeInTheDocument();

    // Clear selection
    mockCollapsedSelection();
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('does not show when selection is shorter than minSelectionLength', () => {
    const { container } = render(
      <TestWrapper actions={defaultActions} minSelectionLength={5} />
    );
    const containerEl = screen.getByTestId('container');
    mockSelection('hi', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('shows when selection meets minSelectionLength', () => {
    const { container } = render(
      <TestWrapper actions={defaultActions} minSelectionLength={5} />
    );
    const containerEl = screen.getByTestId('container');
    mockSelection('hello', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).toBeInTheDocument();
  });

  it('hides toolbar on Escape key press', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');

    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).toBeInTheDocument();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('does not hide on non-Escape key press', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');

    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).toBeInTheDocument();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    });
    expect(container.querySelector('.floating-toolbar')).toBeInTheDocument();
  });

  it('does not show when selection is outside container', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const outsideNode = document.createElement('div');
    document.body.appendChild(outsideNode);

    mockSelection('outside text', outsideNode);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();

    document.body.removeChild(outsideNode);
  });

  it('positions toolbar using fixed positioning with style', () => {
    render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl, { top: 200, bottom: 220, left: 100, right: 200, width: 100, height: 20 });
    act(() => { fireSelectionChange(); });

    const toolbar = screen.getByRole('toolbar');
    // Left should be centered on selection: 100 + 100/2 = 150
    expect(toolbar.style.left).toBe('150px');
  });

  it('renders with empty actions array — shows nothing', () => {
    const { container } = render(<TestWrapper actions={[]} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('buttons have title attribute for tooltip', () => {
    render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const btn = screen.getByRole('button', { name: '복사' });
    expect(btn).toHaveAttribute('title', '복사');
  });

  it('buttons have type="button"', () => {
    render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const btn = screen.getByRole('button', { name: '복사' });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('action without icon does not render icon span', () => {
    const actions: FloatingToolbarAction[] = [
      { id: 'plain', label: '일반', onClick: vi.fn() },
    ];
    render(<TestWrapper actions={actions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelector('.floating-toolbar-icon')).not.toBeInTheDocument();
  });

  it('renders actions without icon alongside actions with icon', () => {
    const actions: FloatingToolbarAction[] = [
      { id: 'with-icon', label: '아이콘 있음', icon: '⭐', onClick: vi.fn() },
      { id: 'no-icon', label: '아이콘 없음', onClick: vi.fn() },
    ];
    render(<TestWrapper actions={actions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const icons = screen.getByRole('toolbar').querySelectorAll('.floating-toolbar-icon');
    expect(icons).toHaveLength(1);
  });

  it('hides toolbar on container scroll', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');

    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).toBeInTheDocument();

    act(() => {
      containerEl.dispatchEvent(new Event('scroll'));
    });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('does not show for whitespace-only selection', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('   ', containerEl);
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('cleans up selectionchange listener on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(<TestWrapper actions={defaultActions} />);

    const selectionCallCount = addSpy.mock.calls.filter(
      ([event]) => event === 'selectionchange'
    ).length;
    expect(selectionCallCount).toBeGreaterThan(0);

    unmount();

    const removeCallCount = removeSpy.mock.calls.filter(
      ([event]) => event === 'selectionchange'
    ).length;
    expect(removeCallCount).toBeGreaterThan(0);
  });

  it('does not show toolbar when selection rect has zero dimensions', () => {
    const { container } = render(<TestWrapper actions={defaultActions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl, { width: 0, height: 0 });
    act(() => { fireSelectionChange(); });
    expect(container.querySelector('.floating-toolbar')).not.toBeInTheDocument();
  });

  it('applies floating-toolbar-btn--disabled class to disabled buttons', () => {
    const actions: FloatingToolbarAction[] = [
      { id: 'enabled', label: '활성', onClick: vi.fn() },
      { id: 'disabled', label: '비활성', onClick: vi.fn(), disabled: true },
    ];
    render(<TestWrapper actions={actions} />);
    const containerEl = screen.getByTestId('container');
    mockSelection('test', containerEl);
    act(() => { fireSelectionChange(); });
    const disabledBtn = screen.getByRole('button', { name: '비활성' });
    expect(disabledBtn.className).toContain('floating-toolbar-btn--disabled');
  });
});
