import React, { useState, useCallback, useMemo } from 'react';
import './TreeView.css';

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  disabled?: boolean;
}

export type TreeViewSize = 'small' | 'medium' | 'large';

export interface TreeViewProps {
  nodes: TreeNode[];
  selectedId?: string;
  expandedIds?: string[];
  onSelect?: (id: string) => void;
  onExpand?: (id: string, expanded: boolean) => void;
  defaultExpandedIds?: string[];
  multiSelect?: boolean;
  selectedIds?: string[];
  onMultiSelect?: (ids: string[]) => void;
  size?: TreeViewSize;
  showLines?: boolean;
  disabled?: boolean;
  label?: string;
  id?: string;
}

const TreeView: React.FC<TreeViewProps> = ({
  nodes,
  selectedId,
  expandedIds: controlledExpandedIds,
  onSelect,
  onExpand,
  defaultExpandedIds = [],
  multiSelect = false,
  selectedIds = [],
  onMultiSelect,
  size = 'medium',
  showLines = false,
  disabled = false,
  label,
  id,
}) => {
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds)
  );

  const expandedSet = useMemo(() => {
    if (controlledExpandedIds) {
      return new Set(controlledExpandedIds);
    }
    return internalExpandedIds;
  }, [controlledExpandedIds, internalExpandedIds]);

  const toggleExpand = useCallback((nodeId: string) => {
    const isExpanded = expandedSet.has(nodeId);
    if (controlledExpandedIds) {
      onExpand?.(nodeId, !isExpanded);
    } else {
      setInternalExpandedIds(prev => {
        const next = new Set(prev);
        if (isExpanded) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
      onExpand?.(nodeId, !isExpanded);
    }
  }, [expandedSet, controlledExpandedIds, onExpand]);

  const handleSelect = useCallback((nodeId: string) => {
    if (disabled) return;
    if (multiSelect) {
      const newIds = selectedIds.includes(nodeId)
        ? selectedIds.filter(id => id !== nodeId)
        : [...selectedIds, nodeId];
      onMultiSelect?.(newIds);
    } else {
      onSelect?.(nodeId);
    }
  }, [disabled, multiSelect, selectedIds, onSelect, onMultiSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, node: TreeNode) => {
    if (disabled || node.disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(node.id);
    }
    if (e.key === 'ArrowRight' && node.children && node.children.length > 0) {
      e.preventDefault();
      if (!expandedSet.has(node.id)) {
        toggleExpand(node.id);
      }
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (expandedSet.has(node.id)) {
        toggleExpand(node.id);
      }
    }
  }, [disabled, handleSelect, expandedSet, toggleExpand]);

  const isSelected = useCallback((nodeId: string) => {
    if (multiSelect) {
      return selectedIds.includes(nodeId);
    }
    return selectedId === nodeId;
  }, [multiSelect, selectedIds, selectedId]);

  const renderNode = useCallback((node: TreeNode, depth: number): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedSet.has(node.id);
    const nodeSelected = isSelected(node.id);
    const nodeDisabled = disabled || node.disabled;

    const nodeClassName = [
      'tree-view-node',
      nodeSelected ? 'tree-view-node--selected' : '',
      nodeDisabled ? 'tree-view-node--disabled' : '',
    ].filter(Boolean).join(' ');

    const chevron = hasChildren ? (isExpanded ? '▼' : '▶') : null;

    return (
      <li key={node.id} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={nodeSelected} aria-disabled={nodeDisabled || undefined}>
        <div
          className={nodeClassName}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => {
            if (!nodeDisabled) {
              if (hasChildren) {
                toggleExpand(node.id);
              }
              handleSelect(node.id);
            }
          }}
          onKeyDown={e => handleKeyDown(e, node)}
          tabIndex={nodeDisabled ? -1 : 0}
          aria-label={node.label}
        >
          {hasChildren ? (
            <span className="tree-view-chevron" aria-hidden="true">
              {chevron}
            </span>
          ) : (
            <span className="tree-view-spacer" aria-hidden="true" />
          )}
          {node.icon && (
            <span className="tree-view-icon" aria-hidden="true">{node.icon}</span>
          )}
          <span className="tree-view-label">{node.label}</span>
        </div>
        {hasChildren && isExpanded && (
          <ul role="group" className="tree-view-children">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  }, [expandedSet, isSelected, disabled, toggleExpand, handleSelect, handleKeyDown]);

  const className = [
    'tree-view',
    `tree-view--${size}`,
    showLines ? 'tree-view--lines' : '',
    disabled ? 'tree-view--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="tree-view-wrapper" id={id}>
      {label && <span className="tree-view-title">{label}</span>}
      <ul className={className} role="tree" aria-label={label || '트리 보기'}>
        {nodes.map(node => renderNode(node, 0))}
      </ul>
    </div>
  );
};

export default React.memo(TreeView);
