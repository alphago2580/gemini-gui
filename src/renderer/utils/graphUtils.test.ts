import { describe, it, expect } from 'vitest';
import { Graph } from './graphUtils';

describe('graphUtils', () => {
  describe('undirected graph', () => {
    function createTestGraph(): Graph<string> {
      const g = new Graph<string>();
      g.addEdge('A', 'B');
      g.addEdge('A', 'C');
      g.addEdge('B', 'D');
      g.addEdge('C', 'D');
      return g;
    }

    it('adds vertices', () => {
      const g = new Graph<string>();
      g.addVertex('X');
      expect(g.hasVertex('X')).toBe(true);
      expect(g.getVertexCount()).toBe(1);
    });

    it('adds edges and creates vertices', () => {
      const g = createTestGraph();
      expect(g.hasEdge('A', 'B')).toBe(true);
      expect(g.hasEdge('B', 'A')).toBe(true);
      expect(g.getVertexCount()).toBe(4);
    });

    it('removes vertex', () => {
      const g = createTestGraph();
      g.removeVertex('B');
      expect(g.hasVertex('B')).toBe(false);
      expect(g.hasEdge('A', 'B')).toBe(false);
      expect(g.getVertexCount()).toBe(3);
    });

    it('removes edge', () => {
      const g = createTestGraph();
      g.removeEdge('A', 'B');
      expect(g.hasEdge('A', 'B')).toBe(false);
      expect(g.hasEdge('B', 'A')).toBe(false);
    });

    it('returns neighbors', () => {
      const g = createTestGraph();
      const neighbors = g.getNeighbors('A');
      expect(neighbors.sort()).toEqual(['B', 'C']);
    });

    it('returns empty neighbors for unknown vertex', () => {
      const g = new Graph<string>();
      expect(g.getNeighbors('X')).toEqual([]);
    });

    it('counts edges', () => {
      const g = createTestGraph();
      expect(g.getEdgeCount()).toBe(4);
    });

    it('calculates degree', () => {
      const g = createTestGraph();
      expect(g.getDegree('A')).toBe(2);
      expect(g.getDegree('D')).toBe(2);
    });

    it('returns 0 degree for unknown vertex', () => {
      const g = new Graph<string>();
      expect(g.getDegree('X')).toBe(0);
    });

    it('performs BFS', () => {
      const g = createTestGraph();
      const result = g.bfs('A');
      expect(result[0]).toBe('A');
      expect(result).toHaveLength(4);
      expect(new Set(result)).toEqual(new Set(['A', 'B', 'C', 'D']));
    });

    it('returns empty BFS for unknown vertex', () => {
      const g = new Graph<string>();
      expect(g.bfs('X')).toEqual([]);
    });

    it('performs DFS', () => {
      const g = createTestGraph();
      const result = g.dfs('A');
      expect(result[0]).toBe('A');
      expect(result).toHaveLength(4);
      expect(new Set(result)).toEqual(new Set(['A', 'B', 'C', 'D']));
    });

    it('returns empty DFS for unknown vertex', () => {
      const g = new Graph<string>();
      expect(g.dfs('X')).toEqual([]);
    });

    it('finds shortest path', () => {
      const g = new Graph<string>();
      g.addEdge('A', 'B');
      g.addEdge('B', 'C');
      g.addEdge('A', 'C');
      const path = g.shortestPath('A', 'C');
      expect(path).toEqual(['A', 'C']);
    });

    it('returns null for unreachable path', () => {
      const g = new Graph<string>();
      g.addVertex('A');
      g.addVertex('Z');
      expect(g.shortestPath('A', 'Z')).toBeNull();
    });

    it('returns single vertex path for same start/end', () => {
      const g = new Graph<string>();
      g.addVertex('A');
      expect(g.shortestPath('A', 'A')).toEqual(['A']);
    });

    it('returns null for unknown vertices in path', () => {
      const g = new Graph<string>();
      expect(g.shortestPath('X', 'Y')).toBeNull();
    });

    it('detects cycle', () => {
      const g = createTestGraph();
      expect(g.hasCycle()).toBe(true);
    });

    it('detects no cycle in tree', () => {
      const g = new Graph<string>();
      g.addEdge('A', 'B');
      g.addEdge('A', 'C');
      expect(g.hasCycle()).toBe(false);
    });

    it('checks connectivity', () => {
      const g = createTestGraph();
      expect(g.isConnected()).toBe(true);
    });

    it('detects disconnected graph', () => {
      const g = new Graph<string>();
      g.addEdge('A', 'B');
      g.addVertex('C');
      expect(g.isConnected()).toBe(false);
    });

    it('empty graph is connected', () => {
      const g = new Graph<string>();
      expect(g.isConnected()).toBe(true);
    });

    it('returns null for topological sort on undirected', () => {
      const g = createTestGraph();
      expect(g.topologicalSort()).toBeNull();
    });

    it('does not add duplicate vertex', () => {
      const g = new Graph<string>();
      g.addVertex('A');
      g.addVertex('A');
      expect(g.getVertexCount()).toBe(1);
    });

    it('clones graph', () => {
      const g = createTestGraph();
      const c = g.clone();
      expect(c.getVertexCount()).toBe(g.getVertexCount());
      expect(c.getEdgeCount()).toBe(g.getEdgeCount());
      c.removeVertex('A');
      expect(g.hasVertex('A')).toBe(true);
    });
  });

  describe('directed graph', () => {
    function createDAG(): Graph<string> {
      const g = new Graph<string>(true);
      g.addEdge('A', 'B');
      g.addEdge('A', 'C');
      g.addEdge('B', 'D');
      g.addEdge('C', 'D');
      return g;
    }

    it('creates directed edges', () => {
      const g = new Graph<string>(true);
      g.addEdge('A', 'B');
      expect(g.hasEdge('A', 'B')).toBe(true);
      expect(g.hasEdge('B', 'A')).toBe(false);
    });

    it('counts directed edges', () => {
      const g = createDAG();
      expect(g.getEdgeCount()).toBe(4);
    });

    it('removes directed edge', () => {
      const g = new Graph<string>(true);
      g.addEdge('A', 'B');
      g.removeEdge('A', 'B');
      expect(g.hasEdge('A', 'B')).toBe(false);
    });

    it('performs topological sort on DAG', () => {
      const g = createDAG();
      const sorted = g.topologicalSort();
      expect(sorted).not.toBeNull();
      expect(sorted).toHaveLength(4);
      const indexOf = (v: string) => sorted!.indexOf(v);
      expect(indexOf('A')).toBeLessThan(indexOf('B'));
      expect(indexOf('A')).toBeLessThan(indexOf('C'));
      expect(indexOf('B')).toBeLessThan(indexOf('D'));
      expect(indexOf('C')).toBeLessThan(indexOf('D'));
    });

    it('returns null for cyclic directed graph', () => {
      const g = new Graph<string>(true);
      g.addEdge('A', 'B');
      g.addEdge('B', 'C');
      g.addEdge('C', 'A');
      expect(g.topologicalSort()).toBeNull();
    });

    it('detects cycle in directed graph', () => {
      const g = new Graph<string>(true);
      g.addEdge('A', 'B');
      g.addEdge('B', 'C');
      g.addEdge('C', 'A');
      expect(g.hasCycle()).toBe(true);
    });

    it('detects no cycle in DAG', () => {
      const g = createDAG();
      expect(g.hasCycle()).toBe(false);
    });

    it('finds shortest path in directed graph', () => {
      const g = createDAG();
      expect(g.shortestPath('A', 'D')).toEqual(['A', 'B', 'D']);
    });

    it('returns null for path in wrong direction', () => {
      const g = new Graph<string>(true);
      g.addEdge('A', 'B');
      expect(g.shortestPath('B', 'A')).toBeNull();
    });

    it('clones directed graph', () => {
      const g = createDAG();
      const c = g.clone();
      expect(c.hasEdge('A', 'B')).toBe(true);
      expect(c.hasEdge('B', 'A')).toBe(false);
    });
  });

  describe('numeric vertices', () => {
    it('works with numbers', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.shortestPath(1, 3)).toEqual([1, 2, 3]);
      expect(g.bfs(1)).toEqual([1, 2, 3]);
    });
  });
});
