export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

export interface PlannerTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dependencies: string[];
  estimatedDuration?: number;
  assignedAgent?: string;
}

export interface ExecutionPlan {
  phases: PlanPhase[];
  totalTasks: number;
  estimatedDuration: number;
  criticalPath: string[];
}

export interface PlanPhase {
  phase: number;
  tasks: PlannerTask[];
  parallelizable: boolean;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export class Planner {
  private tasks: Map<string, PlannerTask> = new Map();

  addTask(task: PlannerTask): void {
    this.tasks.set(task.id, { ...task });
  }

  removeTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  getTask(id: string): PlannerTask | undefined {
    const task = this.tasks.get(id);
    return task ? { ...task } : undefined;
  }

  getAllTasks(): PlannerTask[] {
    return [...this.tasks.values()].map((t) => ({ ...t }));
  }

  getReadyTasks(completedIds: Set<string> = new Set()): PlannerTask[] {
    return [...this.tasks.values()]
      .filter((task) => {
        if (completedIds.has(task.id)) return false;
        return task.dependencies.every((depId) => completedIds.has(depId));
      })
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  buildPlan(completedIds: Set<string> = new Set()): ExecutionPlan {
    const phases: PlanPhase[] = [];
    const done = new Set(completedIds);
    const remaining = new Set(
      [...this.tasks.keys()].filter((id) => !done.has(id))
    );
    let phaseNum = 1;

    while (remaining.size > 0) {
      const ready = [...remaining].filter((id) => {
        const task = this.tasks.get(id)!;
        return task.dependencies.every((depId) => done.has(depId));
      });

      if (ready.length === 0) {
        break;
      }

      const phaseTasks = ready
        .map((id) => ({ ...this.tasks.get(id)! }))
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

      phases.push({
        phase: phaseNum++,
        tasks: phaseTasks,
        parallelizable: phaseTasks.length > 1,
      });

      for (const id of ready) {
        done.add(id);
        remaining.delete(id);
      }
    }

    const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
    const estimatedDuration = phases.reduce((sum, p) => {
      const maxInPhase = Math.max(
        ...p.tasks.map((t) => t.estimatedDuration ?? 0),
        0
      );
      return sum + maxInPhase;
    }, 0);

    const criticalPath = this.computeCriticalPath(completedIds);

    return { phases, totalTasks, estimatedDuration, criticalPath };
  }

  hasCycle(): boolean {
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const dfs = (id: string): boolean => {
      if (inStack.has(id)) return true;
      if (visited.has(id)) return false;

      visited.add(id);
      inStack.add(id);

      const task = this.tasks.get(id);
      if (task) {
        for (const depId of task.dependencies) {
          if (this.tasks.has(depId) && dfs(depId)) return true;
        }
      }

      inStack.delete(id);
      return false;
    };

    for (const id of this.tasks.keys()) {
      if (dfs(id)) return true;
    }
    return false;
  }

  private computeCriticalPath(completedIds: Set<string>): string[] {
    const memo = new Map<string, number>();

    const longestPath = (id: string): number => {
      if (completedIds.has(id)) return 0;
      if (memo.has(id)) return memo.get(id)!;

      const task = this.tasks.get(id);
      if (!task) return 0;

      const ownDuration = task.estimatedDuration ?? 0;
      let maxDep = 0;
      for (const depId of task.dependencies) {
        maxDep = Math.max(maxDep, longestPath(depId));
      }

      const total = ownDuration + maxDep;
      memo.set(id, total);
      return total;
    };

    const remaining = [...this.tasks.keys()].filter((id) => !completedIds.has(id));
    if (remaining.length === 0) return [];

    let maxLen = 0;
    let endNode = remaining[0];
    for (const id of remaining) {
      const len = longestPath(id);
      if (len > maxLen) {
        maxLen = len;
        endNode = id;
      }
    }

    const path: string[] = [];
    const buildPath = (id: string): void => {
      if (completedIds.has(id)) return;
      const task = this.tasks.get(id);
      if (!task) return;

      let bestDep = '';
      let bestLen = -1;
      for (const depId of task.dependencies) {
        const len = longestPath(depId);
        if (len > bestLen) {
          bestLen = len;
          bestDep = depId;
        }
      }

      if (bestDep && bestLen > 0) {
        buildPath(bestDep);
      }
      path.push(id);
    };

    buildPath(endNode);
    return path;
  }

  clear(): void {
    this.tasks.clear();
  }
}
