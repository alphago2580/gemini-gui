import { describe, it, expect, vi } from 'vitest';
import {
  createNode,
  findNode,
  findNodeBy,
  flatten,
  getDepth,
  countNodes,
  getPath,
  mapTree,
  filterTree,
  getLeaves,
  getAncestors,
  getSiblings,
  insertChild,
  removeNode,
  walkTree,
  TreeNode,
} from './treeUtils';

/*
  Test tree structure:
       A
      / \
     B   C
    / \   \
   D   E   F
*/
function createTestTree(): TreeNode<string> {
  return createNode('A', 'root', [
    createNode('B', 'b-val', [
      createNode('D', 'd-val'),
      createNode('E', 'e-val'),
    ]),
    createNode('C', 'c-val', [
      createNode('F', 'f-val'),
    ]),
  ]);
}

describe('treeUtils', () => {
  describe('createNode', () => {
    it('creates a leaf node', () => {
      const node = createNode('x', 42);
      expect(node.id).toBe('x');
      expect(node.data).toBe(42);
      expect(node.children).toEqual([]);
    });

    it('creates a node with children', () => {
      const child = createNode('c1', 'child');
      const parent = createNode('p', 'parent', [child]);
      expect(parent.children).toHaveLength(1);
      expect(parent.children[0].id).toBe('c1');
    });
  });

  describe('findNode', () => {
    it('finds root node', () => {
      const tree = createTestTree();
      expect(findNode(tree, 'A')?.data).toBe('root');
    });

    it('finds a deep node', () => {
      const tree = createTestTree();
      expect(findNode(tree, 'E')?.data).toBe('e-val');
    });

    it('returns null for non-existent id', () => {
      const tree = createTestTree();
      expect(findNode(tree, 'Z')).toBeNull();
    });
  });

  describe('findNodeBy', () => {
    it('finds node by predicate', () => {
      const tree = createTestTree();
      const found = findNodeBy(tree, n => n.data === 'f-val');
      expect(found?.id).toBe('F');
    });

    it('returns null if no match', () => {
      const tree = createTestTree();
      expect(findNodeBy(tree, n => n.data === 'missing')).toBeNull();
    });
  });

  describe('flatten', () => {
    it('returns all nodes in pre-order', () => {
      const tree = createTestTree();
      const ids = flatten(tree).map(n => n.id);
      expect(ids).toEqual(['A', 'B', 'D', 'E', 'C', 'F']);
    });

    it('returns single node for leaf', () => {
      const leaf = createNode('x', 1);
      expect(flatten(leaf)).toHaveLength(1);
    });
  });

  describe('getDepth', () => {
    it('returns 0 for leaf', () => {
      expect(getDepth(createNode('x', 1))).toBe(0);
    });

    it('returns correct depth for tree', () => {
      const tree = createTestTree();
      expect(getDepth(tree)).toBe(2);
    });
  });

  describe('countNodes', () => {
    it('counts all nodes', () => {
      const tree = createTestTree();
      expect(countNodes(tree)).toBe(6);
    });

    it('counts single node', () => {
      expect(countNodes(createNode('x', 1))).toBe(1);
    });
  });

  describe('getPath', () => {
    it('returns path to deep node', () => {
      const tree = createTestTree();
      expect(getPath(tree, 'E')).toEqual(['A', 'B', 'E']);
    });

    it('returns path to root', () => {
      const tree = createTestTree();
      expect(getPath(tree, 'A')).toEqual(['A']);
    });

    it('returns null for non-existent node', () => {
      const tree = createTestTree();
      expect(getPath(tree, 'Z')).toBeNull();
    });

    it('returns path through right branch', () => {
      const tree = createTestTree();
      expect(getPath(tree, 'F')).toEqual(['A', 'C', 'F']);
    });
  });

  describe('mapTree', () => {
    it('transforms all data values', () => {
      const tree = createTestTree();
      const mapped = mapTree(tree, (data) => data.toUpperCase());
      expect(mapped.data).toBe('ROOT');
      expect(findNode(mapped, 'D')?.data).toBe('D-VAL');
    });

    it('receives id in callback', () => {
      const tree = createNode('x', 10);
      const mapped = mapTree(tree, (data, id) => `${id}:${data}`);
      expect(mapped.data).toBe('x:10');
    });

    it('preserves tree structure', () => {
      const tree = createTestTree();
      const mapped = mapTree(tree, d => d);
      expect(flatten(mapped).map(n => n.id)).toEqual(flatten(tree).map(n => n.id));
    });
  });

  describe('filterTree', () => {
    it('removes nodes that do not match', () => {
      const tree = createTestTree();
      const filtered = filterTree(tree, n => n.id !== 'B');
      expect(filtered).not.toBeNull();
      expect(flatten(filtered!).map(n => n.id)).toEqual(['A', 'C', 'F']);
    });

    it('returns null if root does not match', () => {
      const tree = createTestTree();
      expect(filterTree(tree, n => n.id !== 'A')).toBeNull();
    });

    it('keeps whole tree when all match', () => {
      const tree = createTestTree();
      const filtered = filterTree(tree, () => true);
      expect(countNodes(filtered!)).toBe(6);
    });
  });

  describe('getLeaves', () => {
    it('returns leaf nodes', () => {
      const tree = createTestTree();
      const leafIds = getLeaves(tree).map(n => n.id);
      expect(leafIds).toEqual(['D', 'E', 'F']);
    });

    it('returns root if it is a leaf', () => {
      const leaf = createNode('x', 1);
      expect(getLeaves(leaf)).toHaveLength(1);
      expect(getLeaves(leaf)[0].id).toBe('x');
    });
  });

  describe('getAncestors', () => {
    it('returns ancestors of deep node', () => {
      const tree = createTestTree();
      const ancestorIds = getAncestors(tree, 'E').map(n => n.id);
      expect(ancestorIds).toEqual(['A', 'B']);
    });

    it('returns empty for root', () => {
      const tree = createTestTree();
      expect(getAncestors(tree, 'A')).toEqual([]);
    });

    it('returns empty for non-existent node', () => {
      const tree = createTestTree();
      expect(getAncestors(tree, 'Z')).toEqual([]);
    });
  });

  describe('getSiblings', () => {
    it('returns siblings of a node', () => {
      const tree = createTestTree();
      const siblingIds = getSiblings(tree, 'D').map(n => n.id);
      expect(siblingIds).toEqual(['E']);
    });

    it('returns empty for root', () => {
      const tree = createTestTree();
      expect(getSiblings(tree, 'A')).toEqual([]);
    });

    it('returns siblings at second level', () => {
      const tree = createTestTree();
      const siblingIds = getSiblings(tree, 'B').map(n => n.id);
      expect(siblingIds).toEqual(['C']);
    });
  });

  describe('insertChild', () => {
    it('inserts child under specified parent', () => {
      const tree = createTestTree();
      const newChild = createNode('G', 'g-val');
      const updated = insertChild(tree, 'C', newChild);
      const cNode = findNode(updated, 'C')!;
      expect(cNode.children).toHaveLength(2);
      expect(cNode.children[1].id).toBe('G');
    });

    it('does not mutate original tree', () => {
      const tree = createTestTree();
      const newChild = createNode('G', 'g-val');
      insertChild(tree, 'C', newChild);
      expect(findNode(tree, 'C')!.children).toHaveLength(1);
    });
  });

  describe('removeNode', () => {
    it('removes a leaf node', () => {
      const tree = createTestTree();
      const updated = removeNode(tree, 'D');
      expect(updated).not.toBeNull();
      expect(findNode(updated!, 'D')).toBeNull();
      expect(countNodes(updated!)).toBe(5);
    });

    it('removes a subtree', () => {
      const tree = createTestTree();
      const updated = removeNode(tree, 'B');
      expect(updated).not.toBeNull();
      expect(findNode(updated!, 'B')).toBeNull();
      expect(findNode(updated!, 'D')).toBeNull();
      expect(findNode(updated!, 'E')).toBeNull();
      expect(countNodes(updated!)).toBe(3);
    });

    it('returns null when removing root', () => {
      const tree = createTestTree();
      expect(removeNode(tree, 'A')).toBeNull();
    });

    it('does not mutate original tree', () => {
      const tree = createTestTree();
      removeNode(tree, 'B');
      expect(countNodes(tree)).toBe(6);
    });
  });

  describe('walkTree', () => {
    it('visits all nodes with correct depth', () => {
      const tree = createTestTree();
      const visited: Array<{ id: string; depth: number }> = [];
      walkTree(tree, (node, depth) => visited.push({ id: node.id, depth }));
      expect(visited).toEqual([
        { id: 'A', depth: 0 },
        { id: 'B', depth: 1 },
        { id: 'D', depth: 2 },
        { id: 'E', depth: 2 },
        { id: 'C', depth: 1 },
        { id: 'F', depth: 2 },
      ]);
    });

    it('calls callback for single node', () => {
      const leaf = createNode('x', 1);
      const fn = vi.fn();
      walkTree(leaf, fn);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith(leaf, 0);
    });
  });
});
