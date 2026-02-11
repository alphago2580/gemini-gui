export interface TreeNode<T = unknown> {
  id: string;
  data: T;
  children: TreeNode<T>[];
}

export function createNode<T>(id: string, data: T, children: TreeNode<T>[] = []): TreeNode<T> {
  return { id, data, children };
}

export function findNode<T>(root: TreeNode<T>, id: string): TreeNode<T> | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function findNodeBy<T>(root: TreeNode<T>, predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | null {
  if (predicate(root)) return root;
  for (const child of root.children) {
    const found = findNodeBy(child, predicate);
    if (found) return found;
  }
  return null;
}

export function flatten<T>(root: TreeNode<T>): TreeNode<T>[] {
  const result: TreeNode<T>[] = [root];
  for (const child of root.children) {
    result.push(...flatten(child));
  }
  return result;
}

export function getDepth<T>(root: TreeNode<T>): number {
  if (root.children.length === 0) return 0;
  return 1 + Math.max(...root.children.map(getDepth));
}

export function countNodes<T>(root: TreeNode<T>): number {
  return 1 + root.children.reduce((sum, child) => sum + countNodes(child), 0);
}

export function getPath<T>(root: TreeNode<T>, targetId: string): string[] | null {
  if (root.id === targetId) return [root.id];
  for (const child of root.children) {
    const childPath = getPath(child, targetId);
    if (childPath) return [root.id, ...childPath];
  }
  return null;
}

export function mapTree<T, U>(root: TreeNode<T>, fn: (data: T, id: string) => U): TreeNode<U> {
  return {
    id: root.id,
    data: fn(root.data, root.id),
    children: root.children.map(child => mapTree(child, fn)),
  };
}

export function filterTree<T>(root: TreeNode<T>, predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | null {
  if (!predicate(root)) return null;
  const filteredChildren: TreeNode<T>[] = [];
  for (const child of root.children) {
    const filtered = filterTree(child, predicate);
    if (filtered) filteredChildren.push(filtered);
  }
  return { ...root, children: filteredChildren };
}

export function getLeaves<T>(root: TreeNode<T>): TreeNode<T>[] {
  if (root.children.length === 0) return [root];
  return root.children.flatMap(child => getLeaves(child));
}

export function getAncestors<T>(root: TreeNode<T>, targetId: string): TreeNode<T>[] {
  const path = getPath(root, targetId);
  if (!path) return [];
  const ancestors: TreeNode<T>[] = [];
  let current: TreeNode<T> | null = root;
  for (const id of path.slice(0, -1)) {
    if (current && current.id === id) {
      ancestors.push(current);
      current = current.children.find(c => {
        const nextIdx = path.indexOf(id) + 1;
        return c.id === path[nextIdx];
      }) ?? null;
    }
  }
  return ancestors;
}

export function getSiblings<T>(root: TreeNode<T>, targetId: string): TreeNode<T>[] {
  if (root.id === targetId) return [];
  for (const child of root.children) {
    if (child.id === targetId) {
      return root.children.filter(c => c.id !== targetId);
    }
    const found = getSiblings(child, targetId);
    if (found.length > 0 || child.children.some(c => c.id === targetId)) {
      return found.length > 0 ? found : child.children.filter(c => c.id !== targetId);
    }
  }
  return [];
}

export function insertChild<T>(root: TreeNode<T>, parentId: string, newChild: TreeNode<T>): TreeNode<T> {
  if (root.id === parentId) {
    return { ...root, children: [...root.children, newChild] };
  }
  return {
    ...root,
    children: root.children.map(child => insertChild(child, parentId, newChild)),
  };
}

export function removeNode<T>(root: TreeNode<T>, targetId: string): TreeNode<T> | null {
  if (root.id === targetId) return null;
  return {
    ...root,
    children: root.children
      .map(child => removeNode(child, targetId))
      .filter((child): child is TreeNode<T> => child !== null),
  };
}

export function walkTree<T>(root: TreeNode<T>, callback: (node: TreeNode<T>, depth: number) => void, depth = 0): void {
  callback(root, depth);
  for (const child of root.children) {
    walkTree(child, callback, depth + 1);
  }
}
