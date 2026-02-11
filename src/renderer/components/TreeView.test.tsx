import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TreeView, { TreeNode } from './TreeView';

const sampleNodes: TreeNode[] = [
  {
    id: 'root-1',
    label: '폴더 1',
    icon: '📁',
    children: [
      { id: 'child-1', label: '파일 1.txt', icon: '📄' },
      { id: 'child-2', label: '파일 2.txt', icon: '📄' },
      {
        id: 'subfolder',
        label: '하위 폴더',
        icon: '📁',
        children: [
          { id: 'deep-child', label: '깊은 파일.txt', icon: '📄' },
        ],
      },
    ],
  },
  {
    id: 'root-2',
    label: '폴더 2',
    icon: '📁',
    children: [
      { id: 'child-3', label: '파일 3.txt' },
    ],
  },
  { id: 'root-3', label: '단일 파일', icon: '📝' },
];

describe('TreeView', () => {
  // -- Rendering --
  it('renders with role="tree"', () => {
    render(<TreeView nodes={sampleNodes} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(<TreeView nodes={sampleNodes} />);
    expect(screen.getByRole('tree')).toHaveAttribute('aria-label', '트리 보기');
  });

  it('uses custom label as aria-label', () => {
    render(<TreeView nodes={sampleNodes} label="파일 탐색기" />);
    expect(screen.getByRole('tree')).toHaveAttribute('aria-label', '파일 탐색기');
  });

  it('renders label text', () => {
    render(<TreeView nodes={sampleNodes} label="파일 탐색기" />);
    expect(screen.getByText('파일 탐색기')).toBeInTheDocument();
  });

  it('renders top-level nodes', () => {
    render(<TreeView nodes={sampleNodes} />);
    expect(screen.getByText('폴더 1')).toBeInTheDocument();
    expect(screen.getByText('폴더 2')).toBeInTheDocument();
    expect(screen.getByText('단일 파일')).toBeInTheDocument();
  });

  it('renders treeitems', () => {
    render(<TreeView nodes={sampleNodes} />);
    const items = screen.getAllByRole('treeitem');
    // Only top-level nodes rendered initially (children collapsed)
    expect(items).toHaveLength(3);
  });

  it('applies custom id', () => {
    const { container } = render(<TreeView nodes={sampleNodes} id="my-tree" />);
    expect(container.querySelector('#my-tree')).toBeInTheDocument();
  });

  it('renders icons', () => {
    render(<TreeView nodes={sampleNodes} />);
    const folderIcons = screen.getAllByText('📁');
    expect(folderIcons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  // -- Sizes --
  it('applies small size class', () => {
    render(<TreeView nodes={sampleNodes} size="small" />);
    expect(screen.getByRole('tree').className).toContain('tree-view--small');
  });

  it('applies medium size class by default', () => {
    render(<TreeView nodes={sampleNodes} />);
    expect(screen.getByRole('tree').className).toContain('tree-view--medium');
  });

  it('applies large size class', () => {
    render(<TreeView nodes={sampleNodes} size="large" />);
    expect(screen.getByRole('tree').className).toContain('tree-view--large');
  });

  // -- Lines --
  it('applies lines class when showLines is true', () => {
    render(<TreeView nodes={sampleNodes} showLines />);
    expect(screen.getByRole('tree').className).toContain('tree-view--lines');
  });

  it('does not apply lines class by default', () => {
    render(<TreeView nodes={sampleNodes} />);
    expect(screen.getByRole('tree').className).not.toContain('tree-view--lines');
  });

  // -- Expand/Collapse --
  it('shows children when node is expanded', () => {
    render(<TreeView nodes={sampleNodes} />);
    // Click on folder to expand
    fireEvent.click(screen.getByText('폴더 1'));
    expect(screen.getByText('파일 1.txt')).toBeInTheDocument();
    expect(screen.getByText('파일 2.txt')).toBeInTheDocument();
    expect(screen.getByText('하위 폴더')).toBeInTheDocument();
  });

  it('hides children when node is collapsed', () => {
    render(<TreeView nodes={sampleNodes} />);
    // Expand then collapse
    fireEvent.click(screen.getByText('폴더 1'));
    expect(screen.getByText('파일 1.txt')).toBeInTheDocument();
    fireEvent.click(screen.getByText('폴더 1'));
    expect(screen.queryByText('파일 1.txt')).not.toBeInTheDocument();
  });

  it('renders chevron ▶ for collapsed nodes', () => {
    render(<TreeView nodes={sampleNodes} />);
    const chevrons = screen.getAllByText('▶');
    expect(chevrons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders chevron ▼ for expanded nodes', () => {
    render(<TreeView nodes={sampleNodes} />);
    fireEvent.click(screen.getByText('폴더 1'));
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('expands by default with defaultExpandedIds', () => {
    render(<TreeView nodes={sampleNodes} defaultExpandedIds={['root-1']} />);
    expect(screen.getByText('파일 1.txt')).toBeInTheDocument();
  });

  it('calls onExpand when toggling', () => {
    const onExpand = vi.fn();
    render(<TreeView nodes={sampleNodes} onExpand={onExpand} />);
    fireEvent.click(screen.getByText('폴더 1'));
    expect(onExpand).toHaveBeenCalledWith('root-1', true);
  });

  it('calls onExpand with false when collapsing', () => {
    const onExpand = vi.fn();
    render(<TreeView nodes={sampleNodes} onExpand={onExpand} defaultExpandedIds={['root-1']} />);
    fireEvent.click(screen.getByText('폴더 1'));
    expect(onExpand).toHaveBeenCalledWith('root-1', false);
  });

  // -- Controlled expansion --
  it('uses controlled expandedIds', () => {
    render(<TreeView nodes={sampleNodes} expandedIds={['root-1']} />);
    expect(screen.getByText('파일 1.txt')).toBeInTheDocument();
  });

  it('does not show children when not in controlled expandedIds', () => {
    render(<TreeView nodes={sampleNodes} expandedIds={[]} />);
    expect(screen.queryByText('파일 1.txt')).not.toBeInTheDocument();
  });

  // -- Selection --
  it('calls onSelect when node clicked', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={sampleNodes} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('단일 파일'));
    expect(onSelect).toHaveBeenCalledWith('root-3');
  });

  it('applies selected class to selected node', () => {
    render(<TreeView nodes={sampleNodes} selectedId="root-3" />);
    const item = screen.getByText('단일 파일').closest('[role="treeitem"]');
    expect(item).toHaveAttribute('aria-selected', 'true');
  });

  it('marks non-selected nodes as aria-selected false', () => {
    render(<TreeView nodes={sampleNodes} selectedId="root-3" />);
    const item = screen.getByText('폴더 1').closest('[role="treeitem"]');
    expect(item).toHaveAttribute('aria-selected', 'false');
  });

  it('selects child nodes', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={sampleNodes} onSelect={onSelect} defaultExpandedIds={['root-1']} />);
    fireEvent.click(screen.getByText('파일 1.txt'));
    expect(onSelect).toHaveBeenCalledWith('child-1');
  });

  // -- Multi-select --
  it('supports multiSelect mode', () => {
    const onMultiSelect = vi.fn();
    render(<TreeView nodes={sampleNodes} multiSelect onMultiSelect={onMultiSelect} />);
    fireEvent.click(screen.getByText('단일 파일'));
    expect(onMultiSelect).toHaveBeenCalledWith(['root-3']);
  });

  it('toggles selection in multiSelect', () => {
    const onMultiSelect = vi.fn();
    render(<TreeView nodes={sampleNodes} multiSelect selectedIds={['root-3']} onMultiSelect={onMultiSelect} />);
    fireEvent.click(screen.getByText('단일 파일'));
    expect(onMultiSelect).toHaveBeenCalledWith([]);
  });

  it('adds to selection in multiSelect', () => {
    const onMultiSelect = vi.fn();
    render(<TreeView nodes={sampleNodes} multiSelect selectedIds={['root-1']} onMultiSelect={onMultiSelect} />);
    fireEvent.click(screen.getByText('단일 파일'));
    expect(onMultiSelect).toHaveBeenCalledWith(['root-1', 'root-3']);
  });

  // -- Keyboard navigation --
  it('expands node on ArrowRight', () => {
    render(<TreeView nodes={sampleNodes} />);
    const node = screen.getByLabelText('폴더 1');
    fireEvent.keyDown(node, { key: 'ArrowRight' });
    expect(screen.getByText('파일 1.txt')).toBeInTheDocument();
  });

  it('collapses node on ArrowLeft', () => {
    render(<TreeView nodes={sampleNodes} defaultExpandedIds={['root-1']} />);
    const node = screen.getByLabelText('폴더 1');
    fireEvent.keyDown(node, { key: 'ArrowLeft' });
    expect(screen.queryByText('파일 1.txt')).not.toBeInTheDocument();
  });

  it('selects on Enter', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={sampleNodes} onSelect={onSelect} />);
    const node = screen.getByLabelText('단일 파일');
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('root-3');
  });

  it('selects on Space', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={sampleNodes} onSelect={onSelect} />);
    const node = screen.getByLabelText('단일 파일');
    fireEvent.keyDown(node, { key: ' ' });
    expect(onSelect).toHaveBeenCalledWith('root-3');
  });

  it('ArrowRight does nothing on leaf node', () => {
    render(<TreeView nodes={sampleNodes} />);
    const node = screen.getByLabelText('단일 파일');
    fireEvent.keyDown(node, { key: 'ArrowRight' });
    // No error, no expansion
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('ArrowRight does nothing when already expanded', () => {
    const onExpand = vi.fn();
    render(<TreeView nodes={sampleNodes} defaultExpandedIds={['root-1']} onExpand={onExpand} />);
    const node = screen.getByLabelText('폴더 1');
    fireEvent.keyDown(node, { key: 'ArrowRight' });
    expect(onExpand).not.toHaveBeenCalled();
  });

  // -- Disabled --
  it('applies disabled class', () => {
    render(<TreeView nodes={sampleNodes} disabled />);
    expect(screen.getByRole('tree').className).toContain('tree-view--disabled');
  });

  it('does not call onSelect when disabled', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={sampleNodes} disabled onSelect={onSelect} />);
    fireEvent.click(screen.getByText('단일 파일'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('sets tabIndex -1 on disabled nodes', () => {
    render(<TreeView nodes={sampleNodes} disabled />);
    const node = screen.getByLabelText('폴더 1');
    expect(node).toHaveAttribute('tabindex', '-1');
  });

  // -- Disabled individual nodes --
  it('disables individual nodes', () => {
    const disabledNodes: TreeNode[] = [
      { id: 'n1', label: 'Active' },
      { id: 'n2', label: 'Disabled', disabled: true },
    ];
    render(<TreeView nodes={disabledNodes} />);
    const item = screen.getByText('Disabled').closest('[role="treeitem"]');
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });

  // -- Nested expansion --
  it('supports nested expand', () => {
    render(<TreeView nodes={sampleNodes} defaultExpandedIds={['root-1', 'subfolder']} />);
    expect(screen.getByText('깊은 파일.txt')).toBeInTheDocument();
  });

  // -- Deep tree rendering --
  it('renders deeply nested group roles', () => {
    render(<TreeView nodes={sampleNodes} defaultExpandedIds={['root-1', 'subfolder']} />);
    const groups = screen.getAllByRole('group');
    expect(groups.length).toBeGreaterThanOrEqual(2);
  });

  // -- aria-expanded --
  it('sets aria-expanded=true on expanded nodes', () => {
    render(<TreeView nodes={sampleNodes} defaultExpandedIds={['root-1']} />);
    const item = screen.getByText('폴더 1').closest('[role="treeitem"]');
    expect(item).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded=false on collapsed parent nodes', () => {
    render(<TreeView nodes={sampleNodes} />);
    const item = screen.getByText('폴더 1').closest('[role="treeitem"]');
    expect(item).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not set aria-expanded on leaf nodes', () => {
    render(<TreeView nodes={sampleNodes} />);
    const item = screen.getByText('단일 파일').closest('[role="treeitem"]');
    expect(item).not.toHaveAttribute('aria-expanded');
  });

  // -- Empty nodes --
  it('renders empty tree', () => {
    render(<TreeView nodes={[]} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.queryAllByRole('treeitem')).toHaveLength(0);
  });

  // -- Wrapper CSS --
  it('wrapper has correct CSS class', () => {
    const { container } = render(<TreeView nodes={sampleNodes} />);
    expect(container.firstChild).toHaveClass('tree-view-wrapper');
  });

  // -- Label CSS class --
  it('label has correct CSS class', () => {
    render(<TreeView nodes={sampleNodes} label="테스트" />);
    expect(screen.getByText('테스트').className).toContain('tree-view-title');
  });

  // -- Node without icon --
  it('renders node without icon correctly', () => {
    const nodes: TreeNode[] = [{ id: 'plain', label: 'Plain Node' }];
    render(<TreeView nodes={nodes} />);
    expect(screen.getByText('Plain Node')).toBeInTheDocument();
  });
});
