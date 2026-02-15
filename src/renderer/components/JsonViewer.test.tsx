import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import JsonViewer from './JsonViewer';
import type { JsonValue } from './JsonViewer';

// Mock clipboard API
const mockWriteText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);

beforeEach(() => {
  mockWriteText.mockClear();
  Object.assign(navigator, {
    clipboard: { writeText: mockWriteText },
  });
});

describe('JsonViewer', () => {
  // --- Basic rendering ---

  it('renders with role="tree"', () => {
    render(<JsonViewer data={{ key: 'value' }} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<JsonViewer data={null} />);
    expect(screen.getByRole('tree')).toHaveAttribute('aria-label', 'JSON 뷰어');
  });

  it('renders json-viewer class', () => {
    const { container } = render(<JsonViewer data="hello" />);
    expect(container.querySelector('.json-viewer')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<JsonViewer data={42} className="custom-class" />);
    const viewer = container.querySelector('.json-viewer');
    expect(viewer?.className).toContain('custom-class');
  });

  // --- Primitive values ---

  it('renders string value with quotes', () => {
    render(<JsonViewer data="hello world" rootName="str" />);
    expect(screen.getByText('"hello world"')).toBeInTheDocument();
  });

  it('renders number value', () => {
    render(<JsonViewer data={42} rootName="num" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders boolean true', () => {
    render(<JsonViewer data={true} rootName="bool" />);
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('renders boolean false', () => {
    render(<JsonViewer data={false} rootName="bool" />);
    expect(screen.getByText('false')).toBeInTheDocument();
  });

  it('renders null', () => {
    render(<JsonViewer data={null} rootName="val" />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  // --- Type classes ---

  it('applies string type class', () => {
    const { container } = render(<JsonViewer data="hi" />);
    expect(container.querySelector('.json-viewer-value--string')).toBeInTheDocument();
  });

  it('applies number type class', () => {
    const { container } = render(<JsonViewer data={99} />);
    expect(container.querySelector('.json-viewer-value--number')).toBeInTheDocument();
  });

  it('applies boolean type class', () => {
    const { container } = render(<JsonViewer data={true} />);
    expect(container.querySelector('.json-viewer-value--boolean')).toBeInTheDocument();
  });

  it('applies null type class', () => {
    const { container } = render(<JsonViewer data={null} />);
    expect(container.querySelector('.json-viewer-value--null')).toBeInTheDocument();
  });

  // --- Object rendering ---

  it('renders object keys', () => {
    render(<JsonViewer data={{ name: 'Alice', age: 30 }} />);
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
  });

  it('renders object values', () => {
    render(<JsonViewer data={{ name: 'Alice' }} />);
    expect(screen.getByText('"Alice"')).toBeInTheDocument();
  });

  it('renders nested objects', () => {
    const data = { user: { name: 'Bob' } };
    render(<JsonViewer data={data} />);
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('"Bob"')).toBeInTheDocument();
  });

  // --- Array rendering ---

  it('renders array elements', () => {
    const { container } = render(<JsonViewer data={[10, 20, 30]} />);
    expect(container.querySelector('.json-viewer-value--number')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders array indices as keys', () => {
    render(<JsonViewer data={['a', 'b']} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  // --- Expand/collapse ---

  it('renders expanded by default', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    expect(container.querySelector('.json-viewer-children')).toBeInTheDocument();
  });

  it('collapses when defaultExpanded is false', () => {
    const { container } = render(
      <JsonViewer data={{ key: 'val' }} defaultExpanded={false} />
    );
    expect(container.querySelector('.json-viewer-children')).not.toBeInTheDocument();
  });

  it('shows preview when collapsed', () => {
    render(<JsonViewer data={{ a: 1, b: 2 }} defaultExpanded={false} />);
    expect(screen.getByText('{2}')).toBeInTheDocument();
  });

  it('shows array preview when collapsed', () => {
    render(<JsonViewer data={[1, 2, 3]} defaultExpanded={false} />);
    expect(screen.getByText('Array(3)')).toBeInTheDocument();
  });

  it('toggles expand/collapse on click', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    // Initially expanded
    expect(container.querySelector('.json-viewer-children')).toBeInTheDocument();
    // Click to collapse
    const row = container.querySelector('.json-viewer-row')!;
    fireEvent.click(row);
    expect(container.querySelector('.json-viewer-children')).not.toBeInTheDocument();
    // Click to expand again
    fireEvent.click(row);
    expect(container.querySelector('.json-viewer-children')).toBeInTheDocument();
  });

  it('toggles on Enter key', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    const row = container.querySelector('.json-viewer-row')!;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(container.querySelector('.json-viewer-children')).not.toBeInTheDocument();
  });

  it('toggles on Space key', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    const row = container.querySelector('.json-viewer-row')!;
    fireEvent.keyDown(row, { key: ' ' });
    expect(container.querySelector('.json-viewer-children')).not.toBeInTheDocument();
  });

  // --- Chevron ---

  it('renders chevron for expandable nodes', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    expect(container.querySelector('.json-viewer-chevron')).toBeInTheDocument();
  });

  it('chevron has open class when expanded', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    expect(container.querySelector('.json-viewer-chevron--open')).toBeInTheDocument();
  });

  it('chevron loses open class when collapsed', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    const row = container.querySelector('.json-viewer-row')!;
    fireEvent.click(row);
    expect(container.querySelector('.json-viewer-chevron--open')).not.toBeInTheDocument();
  });

  // --- aria-expanded ---

  it('has aria-expanded=true when expanded', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    const row = container.querySelector('.json-viewer-row')!;
    expect(row).toHaveAttribute('aria-expanded', 'true');
  });

  it('has aria-expanded=false when collapsed', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} defaultExpanded={false} />);
    const row = container.querySelector('.json-viewer-row')!;
    expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  // --- Root name ---

  it('uses default root name', () => {
    render(<JsonViewer data={{ a: 1 }} />);
    expect(screen.getByText('root')).toBeInTheDocument();
  });

  it('uses custom root name', () => {
    render(<JsonViewer data={{ a: 1 }} rootName="response" />);
    expect(screen.getByText('response')).toBeInTheDocument();
  });

  // --- maxDepth ---

  it('respects maxDepth for auto-collapse', () => {
    const data = { level1: { level2: { level3: 'deep' } } };
    const { container } = render(<JsonViewer data={data} maxDepth={1} />);
    // Root (depth 0) is expanded, level1 (depth 1) should be collapsed
    const childrenGroups = container.querySelectorAll('.json-viewer-children');
    // Only root children visible
    expect(childrenGroups.length).toBe(1);
  });

  // --- Copy button ---

  it('renders copy buttons when enableCopy is true (default)', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    const copyBtns = container.querySelectorAll('.json-viewer-copy-btn');
    expect(copyBtns.length).toBeGreaterThan(0);
  });

  it('hides copy buttons when enableCopy is false', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} enableCopy={false} />);
    expect(container.querySelector('.json-viewer-copy-btn')).not.toBeInTheDocument();
  });

  it('copies value to clipboard on copy button click', async () => {
    const { container } = render(<JsonViewer data="test" />);
    const copyBtn = container.querySelector('.json-viewer-copy-btn')!;
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(mockWriteText).toHaveBeenCalledWith('"test"');
  });

  it('copies object as formatted JSON', async () => {
    const data = { a: 1 };
    const { container } = render(<JsonViewer data={data} />);
    // The first copy button is on the root node
    const copyBtn = container.querySelector('.json-viewer-copy-btn')!;
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(mockWriteText).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
  });

  it('calls onCopy callback on copy', async () => {
    const onCopy = vi.fn();
    const { container } = render(<JsonViewer data="value" onCopy={onCopy} rootName="key" />);
    const copyBtn = container.querySelector('.json-viewer-copy-btn')!;
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(onCopy).toHaveBeenCalledWith('key', 'value');
  });

  it('copy button has aria-label', () => {
    const { container } = render(<JsonViewer data="val" rootName="myKey" />);
    const copyBtn = container.querySelector('.json-viewer-copy-btn')!;
    expect(copyBtn).toHaveAttribute('aria-label', 'myKey 복사');
  });

  // --- Brackets ---

  it('shows opening bracket when expanded', () => {
    const { container } = render(<JsonViewer data={{ a: 1 }} />);
    expect(container.querySelector('.json-viewer-bracket')).toBeInTheDocument();
  });

  it('shows closing bracket when expanded', () => {
    const { container } = render(<JsonViewer data={{ a: 1 }} />);
    expect(container.querySelector('.json-viewer-close-bracket')).toBeInTheDocument();
  });

  // --- Commas ---

  it('shows commas between sibling entries', () => {
    const { container } = render(<JsonViewer data={{ a: 1, b: 2, c: 3 }} />);
    const commas = container.querySelectorAll('.json-viewer-comma');
    // a and b get commas, c does not (isLast)
    expect(commas.length).toBe(2);
  });

  it('does not show comma on last entry', () => {
    const { container } = render(<JsonViewer data={{ only: 'one' }} />);
    // Only the single entry — no comma on the leaf itself (it is last)
    const leafs = container.querySelectorAll('.json-viewer-leaf');
    expect(leafs.length).toBe(1);
    // The leaf should have no comma
    const commasInLeaf = leafs[0].querySelectorAll('.json-viewer-comma');
    expect(commasInLeaf.length).toBe(0);
  });

  // --- Empty objects/arrays ---

  it('renders empty object', () => {
    const { container } = render(<JsonViewer data={{}} />);
    expect(container.querySelector('.json-viewer')).toBeInTheDocument();
  });

  it('renders empty array', () => {
    const { container } = render(<JsonViewer data={[]} />);
    expect(container.querySelector('.json-viewer')).toBeInTheDocument();
  });

  it('shows preview for empty object when collapsed', () => {
    render(<JsonViewer data={{}} defaultExpanded={false} />);
    expect(screen.getByText('{0}')).toBeInTheDocument();
  });

  it('shows preview for empty array when collapsed', () => {
    render(<JsonViewer data={[]} defaultExpanded={false} />);
    expect(screen.getByText('Array(0)')).toBeInTheDocument();
  });

  // --- Complex nested data ---

  it('renders deeply nested data', () => {
    const data = {
      users: [
        { name: 'Alice', scores: [100, 95] },
        { name: 'Bob', scores: [80, 90] },
      ],
    };
    render(<JsonViewer data={data} />);
    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.getByText('"Alice"')).toBeInTheDocument();
    expect(screen.getByText('"Bob"')).toBeInTheDocument();
  });

  it('renders mixed types in array', () => {
    const data: JsonValue = [42, 'two', true, null];
    const { container } = render(<JsonViewer data={data} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('"two"')).toBeInTheDocument();
    // true appears both as value and possibly as index text, so check via class
    expect(container.querySelector('.json-viewer-value--boolean')).toBeInTheDocument();
    expect(container.querySelector('.json-viewer-value--null')).toBeInTheDocument();
  });

  // --- Expandable node has role="button" ---

  it('expandable rows have role="button"', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    const row = container.querySelector('.json-viewer-row')!;
    expect(row).toHaveAttribute('role', 'button');
  });

  it('expandable rows have tabIndex=0', () => {
    const { container } = render(<JsonViewer data={{ key: 'val' }} />);
    const row = container.querySelector('.json-viewer-row')!;
    expect(row).toHaveAttribute('tabindex', '0');
  });

  // --- Children group ---

  it('children have role="group"', () => {
    const { container } = render(<JsonViewer data={{ a: 1, b: 2 }} />);
    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
  });

  // --- Indentation ---

  it('applies indent to nested nodes', () => {
    const { container } = render(<JsonViewer data={{ nested: { deep: 'val' } }} indentSize={20} />);
    const rows = container.querySelectorAll('.json-viewer-row');
    // Root at depth 0: paddingLeft = 0
    // nested at depth 1: paddingLeft = 20px
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows[1].getAttribute('style')).toContain('padding-left: 20px');
  });

  // --- defaultExpanded=false with nested objects ---

  it('collapsed nested objects show preview', () => {
    const data = { info: { a: 1, b: 2 } };
    const { container } = render(<JsonViewer data={data} />);
    // Root is expanded, but inner object is also expanded by default
    // Click root to collapse
    const row = container.querySelector('.json-viewer-row')!;
    fireEvent.click(row);
    expect(screen.getByText('{1}')).toBeInTheDocument();
  });
});
