export class Graph<T = string> {
  private adjacency: Map<T, Set<T>> = new Map();
  private directed: boolean;

  constructor(directed = false) {
    this.directed = directed;
  }

  addVertex(vertex: T): void {
    if (!this.adjacency.has(vertex)) {
      this.adjacency.set(vertex, new Set());
    }
  }

  removeVertex(vertex: T): void {
    this.adjacency.delete(vertex);
    for (const neighbors of this.adjacency.values()) {
      neighbors.delete(vertex);
    }
  }

  addEdge(from: T, to: T): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacency.get(from)!.add(to);
    if (!this.directed) {
      this.adjacency.get(to)!.add(from);
    }
  }

  removeEdge(from: T, to: T): void {
    this.adjacency.get(from)?.delete(to);
    if (!this.directed) {
      this.adjacency.get(to)?.delete(from);
    }
  }

  hasVertex(vertex: T): boolean {
    return this.adjacency.has(vertex);
  }

  hasEdge(from: T, to: T): boolean {
    return this.adjacency.get(from)?.has(to) ?? false;
  }

  getNeighbors(vertex: T): T[] {
    return [...(this.adjacency.get(vertex) ?? [])];
  }

  getVertices(): T[] {
    return [...this.adjacency.keys()];
  }

  getVertexCount(): number {
    return this.adjacency.size;
  }

  getEdgeCount(): number {
    let count = 0;
    for (const neighbors of this.adjacency.values()) {
      count += neighbors.size;
    }
    return this.directed ? count : count / 2;
  }

  getDegree(vertex: T): number {
    return this.adjacency.get(vertex)?.size ?? 0;
  }

  bfs(start: T): T[] {
    if (!this.adjacency.has(start)) return [];
    const visited = new Set<T>();
    const queue: T[] = [start];
    const result: T[] = [];
    visited.add(start);

    while (queue.length > 0) {
      const vertex = queue.shift()!;
      result.push(vertex);
      for (const neighbor of this.adjacency.get(vertex)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return result;
  }

  dfs(start: T): T[] {
    if (!this.adjacency.has(start)) return [];
    const visited = new Set<T>();
    const result: T[] = [];

    const visit = (vertex: T) => {
      visited.add(vertex);
      result.push(vertex);
      for (const neighbor of this.adjacency.get(vertex)!) {
        if (!visited.has(neighbor)) {
          visit(neighbor);
        }
      }
    };

    visit(start);
    return result;
  }

  shortestPath(start: T, end: T): T[] | null {
    if (!this.adjacency.has(start) || !this.adjacency.has(end)) return null;
    if (start === end) return [start];

    const visited = new Set<T>();
    const queue: T[] = [start];
    const parent = new Map<T, T>();
    visited.add(start);

    while (queue.length > 0) {
      const vertex = queue.shift()!;
      for (const neighbor of this.adjacency.get(vertex)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, vertex);
          if (neighbor === end) {
            const path: T[] = [];
            let current: T | undefined = end;
            while (current !== undefined) {
              path.unshift(current);
              current = parent.get(current);
            }
            return path;
          }
          queue.push(neighbor);
        }
      }
    }
    return null;
  }

  topologicalSort(): T[] | null {
    if (!this.directed) return null;

    const inDegree = new Map<T, number>();
    for (const vertex of this.adjacency.keys()) {
      inDegree.set(vertex, 0);
    }
    for (const neighbors of this.adjacency.values()) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1);
      }
    }

    const queue: T[] = [];
    for (const [vertex, degree] of inDegree) {
      if (degree === 0) queue.push(vertex);
    }

    const result: T[] = [];
    while (queue.length > 0) {
      const vertex = queue.shift()!;
      result.push(vertex);
      for (const neighbor of this.adjacency.get(vertex)!) {
        const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    return result.length === this.adjacency.size ? result : null;
  }

  hasCycle(): boolean {
    if (this.directed) {
      return this.topologicalSort() === null;
    }

    const visited = new Set<T>();

    const dfsCheck = (vertex: T, parent: T | null): boolean => {
      visited.add(vertex);
      for (const neighbor of this.adjacency.get(vertex)!) {
        if (!visited.has(neighbor)) {
          if (dfsCheck(neighbor, vertex)) return true;
        } else if (neighbor !== parent) {
          return true;
        }
      }
      return false;
    };

    for (const vertex of this.adjacency.keys()) {
      if (!visited.has(vertex)) {
        if (dfsCheck(vertex, null)) return true;
      }
    }
    return false;
  }

  isConnected(): boolean {
    const vertices = this.getVertices();
    if (vertices.length === 0) return true;
    const visited = this.bfs(vertices[0]);
    return visited.length === vertices.length;
  }

  clone(): Graph<T> {
    const copy = new Graph<T>(this.directed);
    for (const [vertex, neighbors] of this.adjacency) {
      copy.adjacency.set(vertex, new Set(neighbors));
    }
    return copy;
  }
}
